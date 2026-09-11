import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium, expect } from '@playwright/test'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4182/'
const artifacts = await mkdtemp(join(tmpdir(), 'varo-preview-smoke-'))
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []
const checks = []
const field = (root, name) => root.locator(`[data-preview-field="${name}"]`)
async function selectRadio(page, name) {
  const radio = page.getByRole('radio', { name })
  await page.locator('label').filter({ has: radio }).click()
  await expect(radio).toBeChecked()
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(baseUrl)
  await expect(page.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  let runtime = page.frameLocator('iframe')

  const testButton = runtime.getByRole('button', { name: /^测试按钮：/ })
  await testButton.click()
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=enabled;clicks=1;events=1')
  await testButton.focus()
  await page.keyboard.press('Enter')
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=enabled;clicks=2;events=2')
  await runtime.getByRole('button', { name: '禁用测试按钮', exact: true }).click()
  await expect(testButton).toBeDisabled()
  const disabledPoint = await page.evaluate(() => {
    const frame = document.querySelector('iframe')
    const button = [...frame.contentDocument.querySelectorAll('wx-button > button')].find(node => node.textContent.includes('测试按钮：'))
    const child = button.getBoundingClientRect()
    const bounds = frame.getBoundingClientRect()
    const scale = bounds.width / frame.contentWindow.innerWidth
    return { x: bounds.left + (child.left + child.width / 2) * scale, y: bounds.top + (child.top + child.height / 2) * scale }
  })
  await page.mouse.click(disabledPoint.x, disabledPoint.y)
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=disabled;clicks=2;events=2')
  await expect(field(runtime, 'disabled-button-event-count')).toHaveText(/：0$/)
  await runtime.getByRole('button', { name: '启用测试按钮', exact: true }).click()
  checks.push('button pointer, keyboard, disabled state and single emitted events')

  const input = runtime.getByRole('textbox', { name: 'Web 预览受控输入' })
  await input.fill('Preview')
  await input.pressSequentially('123')
  await expect(input).toHaveValue('Preview123')
  await expect(field(runtime, 'input-value')).toHaveText('受控值：Preview123')
  await expect(field(runtime, 'input-state')).toContainText('focus / blur 事件：1 / 0')
  await runtime.getByRole('button', { name: '外部重置值', exact: true }).click()
  await expect(input).toHaveValue('外部重置值 #1')
  await expect(field(runtime, 'input-state')).toContainText('focus / blur 事件：1 / 1')
  await runtime.getByRole('button', { name: '请求聚焦', exact: true }).click()
  await expect(input).toBeFocused()
  await runtime.getByRole('button', { name: '移除焦点', exact: true }).click()
  await expect(input).not.toBeFocused()
  await expect(field(runtime, 'input-state')).toContainText('focus / blur 事件：2 / 2')
  checks.push('controlled typing, external replacement and exact focus/blur delivery')

  await expect(field(runtime, 'context-lifecycle')).toHaveAttribute('data-preview-value', 'tree=mounted;provider=1/0;consumer=1/0')
  await runtime.getByRole('button', { name: '更新注入值', exact: true }).click()
  await expect(field(runtime, 'injected-context')).toHaveAttribute('data-preview-value', 'revision=2;value=来自 Provider 的值 #2')
  await runtime.getByRole('button', { name: '卸载 Provider / Consumer', exact: true }).click()
  await expect(field(runtime, 'injected-context')).toHaveCount(0)
  await expect(field(runtime, 'context-lifecycle')).toHaveAttribute('data-preview-value', 'tree=unmounted;provider=1/1;consumer=1/1')
  await runtime.getByRole('button', { name: '重新挂载 Provider / Consumer', exact: true }).click()
  await expect(field(runtime, 'context-lifecycle')).toHaveAttribute('data-preview-value', 'tree=mounted;provider=2/1;consumer=2/1')
  await expect(field(runtime, 'injected-context')).toHaveAttribute('data-preview-value', 'revision=2;value=来自 Provider 的值 #2')
  checks.push('slot context propagation and exact detach/remount lifetimes')
  await page.screenshot({ path: join(artifacts, 'desktop.png'), fullPage: true })

  await page.setViewportSize({ width: 320, height: 844 })
  await selectRadio(page, /宽屏.*430 px/)
  await expect.poll(() => page.evaluate(() => document.querySelector('iframe').contentWindow.innerWidth)).toBe(430)
  const fit = await page.evaluate(() => {
    const frame = document.querySelector('iframe').getBoundingClientRect()
    const stage = document.querySelector('.preview-frame__stage').getBoundingClientRect()
    return { width: innerWidth, scroll: document.documentElement.scrollWidth, frameLeft: frame.left, frameRight: frame.right, stageLeft: stage.left, stageRight: stage.right }
  })
  assert.ok(fit.scroll <= fit.width && fit.frameLeft >= fit.stageLeft - 1 && fit.frameRight <= fit.stageRight + 1)
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=enabled;clicks=2;events=2')
  await page.screenshot({ path: join(artifacts, 'mobile.png'), fullPage: true })
  checks.push('narrow layout fits while device width changes preserve native state')

  await page.evaluate(() => {
    const frame = document.querySelector('iframe')
    const query = new URL(frame.src).searchParams
    window.postMessage({ channel: 'varo-weapp-preview', type: 'error', scenario: 'controls', session: query.get('session'), message: 'foreign-window-message' }, location.origin)
  })
  const currentFrame = page.frames().find(frame => frame.url().includes('runtime.html'))
  assert.ok(currentFrame)
  await currentFrame.evaluate(() => window.parent.postMessage({ channel: 'varo-weapp-preview', type: 'error', scenario: 'controls', session: 'stale-session', message: 'stale-message' }, location.origin))
  await expect(page.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  await currentFrame.evaluate(() => window.dispatchEvent(new ErrorEvent('error', { message: 'preview-smoke-intentional', error: new Error('preview-smoke-intentional') })))
  await expect(page.locator('.preview-frame')).toHaveAttribute('data-state', 'error')
  await page.getByRole('button', { name: '重置并重试', exact: true }).click()
  await expect(page.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  runtime = page.frameLocator('iframe')
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=enabled;clicks=0;events=0')
  checks.push('foreign/stale messages rejected and real runtime error boundary recovers on reset')

  await page.setViewportSize({ width: 1440, height: 1000 })
  await selectRadio(page, /^Agent 内容/)
  await expect(page.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  runtime = page.frameLocator('iframe')
  await runtime.getByRole('link', { name: 'Varo 预览链接', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(field(runtime, 'markdown-link-output')).toContainText('https://example.com/varo-preview')
  await expect(field(runtime, 'markdown-link-count')).toHaveText(/：1$/)
  await runtime.getByRole('button', { name: '开始流式内容', exact: true }).click()
  await expect(field(runtime, 'stream-phase')).toHaveText(/streaming/)
  await runtime.getByRole('button', { name: '停止', exact: true }).click()
  await expect(field(runtime, 'stream-phase')).toHaveText(/stopped/)
  const stopped = await runtime.locator('.agent-stream').textContent()
  await new Promise(resolve => setTimeout(resolve, 350))
  assert.equal(await runtime.locator('.agent-stream').textContent(), stopped)
  await runtime.getByRole('button', { name: '继续流式内容', exact: true }).click()
  await expect(field(runtime, 'stream-state')).toHaveAttribute('data-preview-value', 'phase=completed;chunks=14/14;pending=0;final=true')
  await expect(runtime.locator('.agent-stream')).toContainText('controller.finish()')
  await runtime.getByRole('button', { name: '从头重播', exact: true }).click()
  await expect(field(runtime, 'stream-state')).toHaveAttribute('data-preview-value', 'phase=completed;chunks=14/14;pending=0;final=true')
  checks.push('native Markdown link, stream stop/continue/replay and final Markdown content')

  const native = await context.newPage()
  native.on('pageerror', error => errors.push(error.message))
  await native.setViewportSize({ width: 390, height: 844 })
  await native.goto(new URL('runtime.html?scenario=agent', baseUrl).href)
  await expect(native.locator('#runtime-status')).toBeHidden()
  const presentation = await native.evaluate(() => {
    const cards = [...document.querySelectorAll('wx-view.varo-card')].map(node => ({ width: node.clientWidth, scroll: node.scrollWidth }))
    const headers = [...document.querySelectorAll('wx-view')].filter(node => ['Surface', 'Runtime'].includes(node.textContent.trim())).map(node => ({ color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor }))
    return { cards, headers, width: innerWidth, scroll: document.documentElement.scrollWidth }
  })
  assert.ok(presentation.cards.length === 2 && presentation.cards.every(card => card.scroll <= card.width + 1))
  assert.ok(presentation.headers.length === 2 && presentation.headers.every(header => header.color !== header.background))
  assert.ok(presentation.scroll <= presentation.width)
  await expect(native.getByText('Surface', { exact: true })).toBeVisible()
  await expect(native.getByText('Wevu 原生组件树', { exact: true })).toBeVisible()
  await native.screenshot({ path: join(artifacts, 'native-agent.png'), fullPage: true })
  checks.push('native Markdown table contrast and contained horizontal scrolling')

  await selectRadio(page, /^原生地图/)
  await expect(page.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  runtime = page.frameLocator('iframe')
  await expect(runtime.locator('wx-map img.varo-native-map__tile').first()).toBeVisible({ timeout: 15000 })
  await expect(runtime.locator('wx-map img.varo-native-map__tile').first()).toHaveAttribute('src', /rt\d\.map\.gtimg\.com\/tile/)
  await expect(field(runtime, 'map-center')).toContainText('杭州西湖')
  await runtime.locator('wx-map').click()
  await expect(field(runtime, 'map-region-count')).toContainText('1')
  await runtime.getByRole('button', { name: '切换到上海' }).click()
  await expect(field(runtime, 'map-center')).toContainText('上海外滩')
  await page.screenshot({ path: join(artifacts, 'native-map.png'), fullPage: true })
  checks.push('native map Tencent raster tiles, GL controls, marker center and regionchange')

  await selectRadio(page, /^机器人对话/)
  await expect(page.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  runtime = page.frameLocator('iframe')
  await expect(runtime.locator('wx-wechat-robot-chat .varo-native-robot-chat__message--assistant').first()).toContainText('你好')
  await expect(field(runtime, 'robot-status')).toContainText('机器人已连接')
  await runtime.getByRole('textbox', { name: '对话内容' }).fill('查订单')
  await runtime.getByRole('button', { name: '发送', exact: true }).click()
  await expect(runtime.locator('wx-wechat-robot-chat .varo-native-robot-chat__message--user')).toContainText('查订单')
  await expect(field(runtime, 'robot-last-query')).toContainText('查订单')
  await expect(field(runtime, 'robot-query-count')).toContainText('1')
  await page.screenshot({ path: join(artifacts, 'native-robot-chat.png'), fullPage: true })
  checks.push('native robot chat welcome, operateCard send and queryCallback')

  assert.deepEqual(errors.filter(message => !message.includes('preview-smoke-intentional')), [])
  console.log(JSON.stringify({ status: 'passed', url: baseUrl, browser: browser.version(), checks, artifacts }, null, 2))
  await context.close()
}
finally {
  await browser.close()
}
