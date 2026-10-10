import { expect } from 'e2e'
import { test } from '../../engines/web'
import { expectPreviewDiagnostics, field, readRuntime, selectRadio } from './support'

test('preview controls, lifecycle, responsive frame, recovery, streaming and plugins', { platforms: ['weapp-preview'], timeout: 90_000 }, async ({ app, browser, screen, webRuntime }) => {
  await browser.setViewport({ width: 1440, height: 1000 })
  await app.open('/')
  await expect(browser.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  const runtime = browser.frameLocator('iframe')
  const testButton = runtime.getByRole('button', { name: /^测试按钮：/ })
  await testButton.click()
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=enabled;clicks=1;events=1')
  await testButton.focus()
  await browser.keyboard.press('Enter')
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=enabled;clicks=2;events=2')
  await runtime.getByRole('button', { name: '禁用测试按钮', exact: true }).click()
  await expect(testButton).toBeDisabled()
  const disabledPoint = await browser.evaluate(() => {
    const frame = document.querySelector('iframe')!
    const button = [...frame.contentDocument!.querySelectorAll('wx-button > button')].find(node => node.textContent!.includes('测试按钮：'))!
    const child = button.getBoundingClientRect()
    const bounds = frame.getBoundingClientRect()
    const scale = bounds.width / frame.contentWindow!.innerWidth
    return { x: bounds.left + (child.left + child.width / 2) * scale, y: bounds.top + (child.top + child.height / 2) * scale }
  })
  // Physical input deliberately bypasses the locator's disabled-action guard.
  await browser.mouse.move(disabledPoint.x, disabledPoint.y)
  await browser.mouse.down()
  await browser.mouse.up()
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=disabled;clicks=2;events=2')
  await expect(field(runtime, 'disabled-button-event-count')).toHaveText(/：0$/)
  await runtime.getByRole('button', { name: '启用测试按钮', exact: true }).click()

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

  await expect(field(runtime, 'context-lifecycle')).toHaveAttribute('data-preview-value', 'tree=mounted;provider=1/0;consumer=1/0')
  await runtime.getByRole('button', { name: '更新注入值', exact: true }).click()
  await expect(field(runtime, 'injected-context')).toHaveAttribute('data-preview-value', 'revision=2;value=来自 Provider 的值 #2')
  await runtime.getByRole('button', { name: '卸载 Provider / Consumer', exact: true }).click()
  await expect(field(runtime, 'injected-context')).toHaveCount(0)
  await expect(field(runtime, 'context-lifecycle')).toHaveAttribute('data-preview-value', 'tree=unmounted;provider=1/1;consumer=1/1')
  await runtime.getByRole('button', { name: '重新挂载 Provider / Consumer', exact: true }).click()
  await expect(field(runtime, 'context-lifecycle')).toHaveAttribute('data-preview-value', 'tree=mounted;provider=2/1;consumer=2/1')
  await expect(field(runtime, 'injected-context')).toHaveAttribute('data-preview-value', 'revision=2;value=来自 Provider 的值 #2')
  await app.screenshot('desktop')

  await browser.setViewport({ width: 320, height: 844 })
  await selectRadio(browser, /宽屏.*430 px/)
  await expect.poll(() => readRuntime(browser, document => document.defaultView!.innerWidth)).toBe(430)
  const fit = await browser.evaluate(() => {
    const frame = document.querySelector('iframe')!.getBoundingClientRect()
    const stage = document.querySelector('.preview-frame__stage')!.getBoundingClientRect()
    return { width: innerWidth, scroll: document.documentElement.scrollWidth, frameLeft: frame.left, frameRight: frame.right, stageLeft: stage.left, stageRight: stage.right }
  })
  expect(fit.scroll <= fit.width && fit.frameLeft >= fit.stageLeft - 1 && fit.frameRight <= fit.stageRight + 1).toBe(true)
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=enabled;clicks=2;events=2')
  await app.screenshot('mobile')

  await browser.evaluate(() => {
    const query = new URL(document.querySelector('iframe')!.src).searchParams
    window.postMessage({ channel: 'varo-weapp-preview', type: 'error', scenario: 'controls', session: query.get('session'), message: 'foreign-window-message' }, location.origin)
    return null
  })
  expect(await browser.evaluate(() => document.querySelector('iframe')!.src.includes('runtime.html'))).toBe(true)
  // Run in the iframe's realm so MessageEvent.source is the actual child window.
  await browser.evaluate(`document.querySelector('iframe').contentWindow.eval(${JSON.stringify(`window.parent.postMessage({ channel: 'varo-weapp-preview', type: 'error', scenario: 'controls', session: 'stale-session', message: 'stale-message' }, location.origin); null`)})`)
  await expect(browser.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  await browser.evaluate(`document.querySelector('iframe').contentWindow.eval(${JSON.stringify(`window.dispatchEvent(new ErrorEvent('error', { message: 'preview-smoke-intentional', error: new Error('preview-smoke-intentional') })); null`)})`)
  await expect(browser.locator('.preview-frame')).toHaveAttribute('data-state', 'error')
  await screen.getByRole('button', { name: '重置并重试', exact: true }).click()
  await expect(browser.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  await expect(field(runtime, 'button-state')).toHaveAttribute('data-preview-value', 'state=enabled;clicks=0;events=0')
  await browser.setViewport({ width: 1440, height: 1000 })

  await selectRadio(browser, /^Agent 内容/)
  await expect(browser.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  await expect.poll(() => readRuntime(browser, document => document.defaultView!.innerWidth)).toBe(430)
  await runtime.getByRole('link', { name: 'Varo 预览链接', exact: true }).focus()
  await browser.keyboard.press('Enter')
  await expect(field(runtime, 'markdown-link-output')).toContainText('https://example.com/varo-preview')
  await expect(field(runtime, 'markdown-link-count')).toHaveText(/：1$/)
  await runtime.getByRole('button', { name: '开始流式内容', exact: true }).click()
  await expect(field(runtime, 'stream-phase')).toHaveText(/streaming/)
  await runtime.getByRole('button', { name: '停止', exact: true }).click()
  await expect(field(runtime, 'stream-phase')).toHaveText(/stopped/)
  const stopped = await runtime.locator('.agent-stream').textContent()
  // This is an intentional no-change observation window, not a readiness sleep.
  await browser.evaluate(() => new Promise<null>(resolve => setTimeout(resolve, 350, null)))
  expect(await runtime.locator('.agent-stream').textContent()).toBe(stopped)
  await runtime.getByRole('button', { name: '继续流式内容', exact: true }).click()
  await expect(field(runtime, 'stream-state')).toHaveAttribute('data-preview-value', 'phase=completed;chunks=14/14;pending=0;final=true')
  await expect(runtime.locator('.agent-stream')).toContainText('controller.finish()')
  await runtime.getByRole('button', { name: '从头重播', exact: true }).click()
  await expect(field(runtime, 'stream-phase')).toHaveText(/streaming/)
  await expect(runtime.locator('.agent-stream')).not.toContainText('controller.finish()')
  await expect(field(runtime, 'stream-state')).toHaveAttribute('data-preview-value', 'phase=completed;chunks=14/14;pending=0;final=true')

  await selectRadio(browser, /^原生地图/)
  await expect(browser.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  const tile = runtime.locator('wx-map img.varo-native-map__tile').first()
  await expect(tile).toBeVisible({ timeout: 15_000 })
  await expect(tile).toHaveAttribute('src', /rt\d\.map\.gtimg\.com\/tile/)
  await expect(field(runtime, 'map-center')).toContainText('杭州西湖')
  await runtime.locator('wx-map').click()
  await expect(field(runtime, 'map-region-count')).toContainText('1')
  await runtime.getByRole('button', { name: '切换到上海' }).click()
  await expect(field(runtime, 'map-center')).toContainText('上海外滩')
  await app.screenshot('native-map')

  await selectRadio(browser, /^机器人对话/)
  await expect(browser.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  await expect(runtime.locator('wx-wechat-robot-chat .varo-native-robot-chat__message--assistant').first()).toContainText('你好')
  await expect(field(runtime, 'robot-status')).toContainText('机器人已连接')
  await runtime.getByRole('textbox', { name: '对话内容' }).fill('查订单')
  await runtime.getByRole('button', { name: '发送', exact: true }).click()
  await expect(runtime.locator('wx-wechat-robot-chat .varo-native-robot-chat__message--user')).toContainText('查订单')
  await expect(field(runtime, 'robot-last-query')).toContainText('查订单')
  await expect(field(runtime, 'robot-query-count')).toContainText('1')
  await app.screenshot('native-robot-chat')
  await expectPreviewDiagnostics(webRuntime, true)
})
test('preview native Markdown table contrast and contained horizontal scrolling', { platforms: ['weapp-preview'] }, async ({ app, browser, screen, webRuntime }) => {
  await browser.setViewport({ width: 390, height: 844 })
  await app.open('/runtime.html?scenario=agent')
  await expect(browser.locator('#runtime-status')).toBeHidden()
  await expect(screen.getByText('Surface', { exact: true })).toBeVisible()
  await expect(screen.getByText('Wevu 原生组件树', { exact: true })).toBeVisible()
  const presentation = await browser.evaluate(() => {
    const cards = [...document.querySelectorAll('wx-view.varo-card')].map(node => ({ width: node.clientWidth, scroll: node.scrollWidth }))
    const headers = [...document.querySelectorAll('wx-view')].filter(node => ['Surface', 'Runtime'].includes(node.textContent!.trim())).map(node => ({ color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor }))
    return { cards, headers, width: innerWidth, scroll: document.documentElement.scrollWidth }
  })
  for (const card of presentation.cards) { expect(card.scroll).toBeLessThanOrEqual(card.width + 1) }
  expect(presentation.headers.length).toBe(2)
  for (const header of presentation.headers) { expect(header.color).not.toBe(header.background) }
  expect(presentation.scroll).toBeLessThanOrEqual(presentation.width)
  await app.screenshot('native-agent')
  await expectPreviewDiagnostics(webRuntime)
})
