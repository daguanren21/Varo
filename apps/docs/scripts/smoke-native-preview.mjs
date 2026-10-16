import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium, expect } from '@playwright/test'
import { docsPreviewScenarios } from '@varo/playground-weapp-preview/docs-scenarios'

const baseUrl = process.env.DOCS_PREVIEW_URL ?? 'http://localhost:4173/'
// Comma-separated report case names, e.g. docs-list,list-pagination; unset runs every case.
const selectedCases = new Set((process.env.DOCS_PREVIEW_CASES ?? '').split(',').map(name => name.trim()).filter(Boolean))
const artifacts = await mkdtemp(join(tmpdir(), 'varo-docs-native-'))
const reportPath = join(artifacts, 'report.json')
const results = []
// These are minimum example contracts, not an inventory parsed from source files.
// Actual mounted components, cases and headings are collected from the browser.
const requiredCases = {
  'button': 'hierarchy tones sizes states layout',
  'badge': 'anchors counts statuses variants',
  'avatar': 'image-fallback shapes sizes',
  'card': 'composition variants interactive padding',
  'empty': 'basic action image sizes',
  'icon': 'builtins tones sizes-color spin',
  'image': 'cover fit brand error',
  'progress': 'statuses stroke-width text',
  'tag': 'tones variants sizes-shape checkable closeable',
  'watermark': 'document',
  'overview': 'invalid-state controlled-input actions dialog',
  'breadcrumb': 'basic clickable-ancestors custom-slots disabled-ancestor',
  'cell': 'account-security preferences',
  'divider': 'order-summary delivery-progress vertical-actions',
  'grid': 'quick-services',
  'layout': 'business-overview',
  'list': 'incremental-loading',
  'safe-area': 'bottom-actions all-edges',
  'space': 'order-filters wrapping-tags vertical-actions',
  'sticky': 'month-summary order-feed',
  'indicator': 'indicator-carousel indicator-dots indicator-lines',
  'menu': 'menu-catalog menu-filters',
  'navbar': 'navbar-order',
  'pagination': 'pagination-orders',
  'steps': 'steps-basic steps-clickable steps-vertical',
  'tabbar': 'tabbar-navigation tabbar-content',
  'tabs': 'tabs-sections',
  'input': 'required affixes states textarea',
  'input-number': 'purchase-seats',
  'input-otp': 'basic mask-separator validation states',
  'searchbar': 'component-search',
  'textarea': 'issue-details',
  'date-field': 'invoice-date states',
  'region-picker': 'activity-location',
  'picker': 'delivery-window',
  'checkbox': 'notification-channels checkbox-states',
  'radio': 'payment-method radio-disabled-group',
  'select': 'default-fulfillment-center select-multiple select-search select-states',
  'switch': 'notification-settings switch-readonly',
  'rate': 'service-rating rate-states',
  'form': 'project-brief business-contact project-needs confirmation-files supporting-files project-submit',
  'form-array': 'company-toolbar company-row company-submit',
  'collapse': 'disclosure accordion multiple-panels',
  'action-sheet': 'basic states persistent',
  'dialog': 'composition',
  'drawer': 'basic placement',
  'overlay': 'visibility',
  'popover': 'context placement',
  'popup': 'bottom',
  'toast': 'deployment warning danger',
  'loading': 'loading-text loading-small-primary loading-large-success',
  'skeleton': 'skeleton-article',
  'pull-refresh': 'pull-refresh-list',
  'swipe-cell': 'swipe-delete swipe-both-sides swipe-disabled',
  'signature': 'signature-draw-clear',
  'notice-bar': 'notice-tones notice-dismiss notice-scroll notice-wrap',
  'map': 'center-markers',
  'robot-chat': 'conversation',
}
const section = (root, name) => root.locator(`[data-docs-case="${name}"]`)
const state = (root, name) => root.locator(`[data-docs-state="${name}"]`)
const scenarioById = new Map(docsPreviewScenarios.map(scenario => [scenario.id, scenario]))
let browser

async function ready(root) {
  const preview = root.locator('.preview-frame')
  await expect(preview).toHaveAttribute('data-state', /^(ready|error)$/, { timeout: 20000 })
  if (await preview.getAttribute('data-state') === 'error') {
    throw new Error(`Native mount failed: ${await preview.locator('[role="alert"]').textContent()}`)
  }
}

function nativeFrame(page, id) {
  const frames = page.frames().filter((frame) => {
    const url = new URL(frame.url())
    return url.pathname.endsWith('/runtime.html') && url.searchParams.get('scenario') === id
  })
  assert.equal(frames.length, 1, `Expected one live runtime for ${id}; frames: ${page.frames().map(frame => frame.url()).join(', ')}`)
  return frames[0]
}

async function mounted(page, id, root, locale = 'zh', theme = 'light') {
  await expect(root.locator('.preview-frame__iframe')).toHaveAttribute('src', new RegExp(`[?&]theme=${theme}(?:&|$)`))
  await ready(root)
  const runtime = nativeFrame(page, id)
  const scenario = scenarioById.get(id)
  assert.ok(scenario, `Scenario missing from registry: ${id}`)
  await expect(runtime.locator('[data-docs-component]')).toHaveCount(1)
  await expect(runtime.locator('[data-docs-component]')).toHaveAttribute('data-docs-component', scenario.query.component)
  await expect(runtime.locator('html')).toHaveAttribute('lang', locale === 'en' ? 'en' : 'zh-CN')
  await expect(runtime.locator('html')).toHaveCSS('color-scheme', theme)
  const url = new URL(runtime.url())
  assert.equal(url.searchParams.get('docs'), '1')
  assert.equal(url.searchParams.get('locale'), locale)
  assert.equal(url.searchParams.get('theme'), theme)
  const expected = id.startsWith('primitive-') ? [scenario.query.component] : requiredCases[scenario.query.component]?.split(' ')
  assert.ok(expected, `Add an explicit case contract for registered scene ${id}`)
  for (const marker of expected) {
    await expect(section(runtime, marker).first(), `${id}: missing real example ${marker}`).toBeVisible()
  }
  return runtime
}

async function openScene(page, id, locale = 'zh', theme = 'light') {
  const query = new URLSearchParams({ scenario: id, docs: '1', locale, theme, session: `smoke-${crypto.randomUUID()}` })
  await page.goto(new URL(`weapp-preview/index.html?${query}`, baseUrl).href)
  return mounted(page, id, page, locale, theme)
}

async function openDocs(page, component, locale = 'zh', platform = 'weapp', primitive = false) {
  const route = `${locale === 'en' ? 'en/' : ''}${primitive ? 'primitives' : 'components'}/${component}?platform=${platform}`
  await page.goto(new URL(route, baseUrl).href)
  if (primitive && platform === 'weapp') {
    await page.locator('.primitive-example__toolbar .primitive-example__tabs').first().getByRole('tab').nth(1).click()
  }
}

async function setTheme(page, theme) {
  const dark = theme === 'dark'
  if (await page.locator('html').evaluate(element => element.classList.contains('dark')) !== dark) {
    await page.locator('.VPSwitchAppearance:visible').first().click()
  }
  await expect.poll(() => page.locator('html').evaluate(element => element.classList.contains('dark'))).toBe(dark)
}

async function noOverflow(page) {
  const geometry = []
  for (const frame of page.frames()) {
    const sizes = await frame.evaluate(() => ({
      width: innerWidth,
      scroll: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth ?? 0),
    }))
    geometry.push({ url: frame.url(), ...sizes })
    assert.ok(sizes.scroll <= sizes.width + 1, `Horizontal overflow in ${frame.url()}: ${JSON.stringify(sizes)}`)
  }
  return geometry
}

async function phoneGeometry(page) {
  const values = {}
  for (const part of ['bezel', 'screen', 'content']) {
    const node = page.locator(`.docs-device-frame__${part}`)
    await expect(node).toHaveCount(1)
    values[part] = await node.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return { width: rect.width, padding: style.padding, radius: style.borderRadius, minHeight: style.minHeight }
    })
  }
  return values
}

function samePhone(h5, native) {
  for (const part of Object.keys(h5)) {
    assert.ok(Math.abs(h5[part].width - native[part].width) <= 1, `${part} width differs: ${JSON.stringify({ h5, native })}`)
    for (const property of ['padding', 'radius', 'minHeight']) {
      assert.equal(native[part][property], h5[part][property], `${part}.${property}`)
    }
  }
}

async function runtimeEvidence(page) {
  const frames = []
  for (const frame of page.frames()) {
    try {
      frames.push(await frame.evaluate(() => ({
        url: location.href,
        states: [...document.querySelectorAll('.preview-frame')].map(node => node.getAttribute('data-state')),
        errors: [...document.querySelectorAll('.preview-frame [role="alert"], #runtime-status:not([hidden])')].map(node => node.textContent.trim()),
        components: [...document.querySelectorAll('[data-docs-component]')].map(node => node.getAttribute('data-docs-component')),
        cases: [...document.querySelectorAll('[data-docs-case]')].map(node => node.getAttribute('data-docs-case')),
        headings: [...document.querySelectorAll('.docs-demo__heading')].map(node => node.textContent.trim()),
      })))
    }
    catch (error) {
      frames.push({ url: frame.url(), diagnosticError: String(error) })
    }
  }
  return frames
}

async function run(name, kind, action, viewport = { width: 1440, height: 1000 }) {
  if (selectedCases.size && !selectedCases.has(name)) { return }
  const result = { name, kind, status: 'failed' }
  const errors = []
  const expectedErrors = new Set()
  let context
  let page
  try {
    context = await browser.newContext({ viewport, colorScheme: 'light', deviceScaleFactor: 1 })
    page = await context.newPage()
    page.setDefaultTimeout(10000)
    page.on('pageerror', (error) => {
      if (!expectedErrors.has(error.message)) { errors.push({ message: error.message, stack: error.stack }) }
    })
    result.evidence = await action(page, expectedErrors)
    for (const frame of page.frames()) {
      for (const preview of await frame.locator('.preview-frame').all()) {
        await expect(preview).toHaveAttribute('data-state', 'ready')
      }
    }
    assert.deepEqual(errors, [], 'Unexpected browser exception(s)')
    result.status = 'passed'
  }
  catch (error) {
    result.error = { message: error.message ?? String(error), stack: error.stack }
  }
  finally {
    if (page) {
      result.runtime = await runtimeEvidence(page)
      result.browserErrors = errors
      result.screenshot = join(artifacts, `${name.replace(/[^a-z0-9-]+/gi, '-')}.png`)
      try { await page.screenshot({ path: result.screenshot }) }
      catch (error) { result.screenshotError = String(error) }
    }
    if (context) {
      try { await context.close() }
      catch (error) {
        result.status = 'failed'
        result.cleanupError = String(error)
      }
    }
    if (errors.length && result.status === 'passed') {
      result.status = 'failed'
      result.error = { message: 'Unexpected browser exception(s) during evidence capture', errors }
    }
    results.push(result)
    await writeFile(reportPath, JSON.stringify({ baseUrl, artifacts, selectedCases: [...selectedCases], results }, null, 2))
  }
}

async function styledButton(page, locale) {
  const en = locale === 'en'
  await openDocs(page, 'button', locale, 'h5')
  const h5 = page.locator('.platform-demo__preview-content')
  const headings = en ? ['Hierarchy', 'Semantic tones', 'Sizes', 'States', 'Shape and layout'] : ['操作层级', '语义色', '尺寸', '状态', '形状与布局']
  for (const heading of headings) { await expect(h5.getByRole('heading', { name: heading, exact: true })).toBeVisible() }
  const geometry = await phoneGeometry(page)
  const mini = page.locator('.platform-demo__platform-tab[data-platform="weapp"]')
  await mini.click()
  const embed = page.frameLocator('.native-component-preview__frame')
  let runtime = await mounted(page, 'docs-button', embed, locale)
  samePhone(geometry, await phoneGeometry(page))
  assert.deepEqual(await runtime.locator('.docs-demo__heading').allTextContents(), headings)
  await expect(embed.locator('.preview-frame__header')).toHaveCount(0)
  const action = section(runtime, 'hierarchy').getByRole('button', { name: en ? 'Save changes' : '保存更改', exact: true })
  await expect(action).toBeEnabled()
  await action.click()
  const loading = section(runtime, 'states').getByRole('button', { name: en ? 'Saving…' : '保存中…', exact: true })
  const disabled = section(runtime, 'states').getByRole('button', { name: en ? 'Unavailable' : '不可用', exact: true })
  await expect(loading).toBeDisabled()
  await expect(disabled).toBeDisabled()
  await disabled.click({ force: true })
  await loading.click({ force: true })
  await expect(disabled).toBeDisabled()
  await expect(loading).toBeDisabled()
  // The styled sample has no counter; its contract is presentation/inert states.
  const colors = {}
  const narrow = []
  for (const theme of ['dark', 'light']) {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await setTheme(page, theme)
    runtime = await mounted(page, 'docs-button', embed, locale, theme)
    colors[theme] = await runtime.locator('[data-docs-component="button"]').evaluate(element => getComputedStyle(element).color)
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      await page.locator('.platform-demo__platform-tab[data-platform="h5"]').click()
      await expect(page.locator('.native-component-preview__frame')).toHaveCount(0)
      assert.equal(runtime.isDetached(), true, 'H5 switch must detach the native page')
      const h5Geometry = await phoneGeometry(page)
      await noOverflow(page)
      await mini.click()
      runtime = await mounted(page, 'docs-button', embed, locale, theme)
      samePhone(h5Geometry, await phoneGeometry(page))
      narrow.push({ width, theme, geometry: await noOverflow(page) })
      const summary = page.locator('.native-component-preview__source > summary')
      await summary.click()
      const source = page.locator('.native-source-preview')
      await expect(source.locator('summary')).toContainText('src/components/ui/v-button.vue')
      const profile = source.getByRole('combobox', { name: en ? 'Install profile' : '安装 profile' })
      await expect(profile).toHaveAccessibleName(en ? 'Install profile' : '安装 profile')
      await profile.focus()
      await profile.press('ArrowDown')
      await profile.press('ArrowDown')
      await profile.press('Enter')
      await expect(source).toContainText('pnpm dlx @varo-ui/cli add button --target alipay')
      await expect(profile).toBeFocused()
      await expect(profile).toHaveAttribute('aria-expanded', 'false')
      await profile.click()
      const panel = source.locator('.varo-select__panel')
      await expect(panel).toBeVisible()
      const bounds = await panel.boundingBox()
      assert.ok(bounds && bounds.x >= -1 && bounds.x + bounds.width <= width + 1, `Profile menu overflow at ${width}: ${JSON.stringify(bounds)}`)
      await noOverflow(page)
      await source.screenshot({ path: join(artifacts, `profile-${locale}-${theme}-${width}.png`) })
      await page.getByRole('option', { name: 'weapp', exact: true }).click()
      await expect(source).toContainText('pnpm dlx @varo-ui/cli add button --target weapp')
      await expect(profile).toBeFocused()
      await profile.click()
      await profile.press('Escape')
      await expect(profile).toHaveAttribute('aria-expanded', 'false')
      await expect(profile).toBeFocused()
      await profile.click()
      await source.locator('h3').click()
      await expect(profile).toHaveAttribute('aria-expanded', 'false')
      await summary.click()
    }
  }
  assert.notEqual(colors.dark, colors.light, 'Theme switch must change rendered native text color')
  return { headings, geometry, colors, narrow, behavior: 'Styled enabled/disabled/loading states; profile pointer and keyboard; H5/native teardown and shared phone geometry' }
}

async function primitiveButton(page, locale, theme) {
  await openDocs(page, 'button', locale, 'weapp', true)
  await setTheme(page, theme)
  const embed = page.frameLocator('.native-component-preview__frame')
  let runtime = await mounted(page, 'primitive-button', embed, locale, theme)
  let button = runtime.getByRole('button', { name: 'Pressed 0 times', exact: true })
  await button.click()
  button = runtime.getByRole('button', { name: 'Pressed 1 times', exact: true })
  await button.focus()
  await button.press('Enter')
  await expect(runtime.getByRole('button', { name: 'Pressed 2 times', exact: true })).toBeVisible()
  const oldUrl = runtime.url()
  const tabs = page.locator('.primitive-example__toolbar .primitive-example__tabs').nth(1).getByRole('tab')
  await tabs.nth(1).click()
  await expect(page.locator('.native-component-preview__frame')).toHaveCount(0)
  assert.equal(runtime.isDetached(), true, 'Code must detach the native runtime')
  await expect(page.locator('.native-source-preview summary')).toContainText('src/components/ui/v-button.vue')
  await tabs.nth(0).click()
  runtime = await mounted(page, 'primitive-button', embed, locale, theme)
  assert.notEqual(runtime.url(), oldUrl, 'Preview remount must have a fresh session')
  await expect(runtime.getByRole('button', { name: 'Pressed 0 times', exact: true })).toBeVisible()
  await runtime.getByRole('button', { name: 'Pressed 0 times', exact: true }).click()
  await expect(runtime.getByRole('button', { name: 'Pressed 1 times', exact: true })).toBeVisible()
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    await noOverflow(page)
  }
  return { locale, theme, behavior: 'Primitive counter advances exactly once per pointer/Enter activation and resets after Code/Preview remount' }
}

async function inputBehavior(page, locale, theme) {
  const en = locale === 'en'
  const runtime = await openScene(page, 'docs-input', locale, theme)
  const required = section(runtime, 'required')
  const input = required.getByRole('textbox')
  await expect(input).toHaveValue(en ? 'Avery Lin' : '林默')
  await input.fill('Varo')
  await input.pressSequentially(' QA')
  await expect(input).toHaveValue('Varo QA')
  await expect(required.locator('.varo-input__word-limit')).toHaveText('7/16')
  await expect(required).toHaveAttribute('data-invalid', 'false')
  await required.getByRole('button', { name: 'Clear input', exact: true }).click()
  await expect(input).toHaveValue('')
  await expect(required).toHaveAttribute('data-invalid', 'true')
  await expect(required).toContainText(en ? 'Enter a display name.' : '请输入显示名称。')
  await input.fill('Repaired')
  await expect(required).toHaveAttribute('data-invalid', 'false')
  const readonly = state(runtime, 'readonly').getByRole('textbox')
  const disabled = state(runtime, 'disabled').getByRole('textbox')
  await expect(readonly).not.toBeEditable()
  await expect(readonly).toHaveValue('INV-2026-042')
  await expect(disabled).toBeDisabled()
  await expect(disabled).toHaveValue(en ? 'Unavailable' : '不可编辑')
  return { behavior: 'Typing updates count, clear produces required error, replacement clears error; readonly/disabled retain values' }
}

async function numberBehavior(page) {
  const runtime = await openScene(page, 'docs-input-number')
  const input = runtime.locator('input')
  const increase = runtime.getByRole('button', { name: '增加席位', exact: true })
  const decrease = runtime.getByRole('button', { name: '减少席位', exact: true })
  await expect(input).toHaveValue('2')
  await expect(state(runtime, 'subtotal')).toContainText('¥78')
  await increase.click()
  await expect(input).toHaveValue('3')
  await expect(state(runtime, 'subtotal')).toContainText('¥117')
  await increase.click()
  await increase.click()
  await expect(input).toHaveValue('5')
  await expect(increase).toBeDisabled()
  await increase.click({ force: true })
  await expect(state(runtime, 'subtotal')).toContainText('¥195')
  for (let index = 0; index < 4; index += 1) { await decrease.click() }
  await expect(input).toHaveValue('1')
  await expect(decrease).toBeDisabled()
  await expect(state(runtime, 'subtotal')).toContainText('¥39')
  return { behavior: 'Quantity changes subtotal and both 1/5 bounds disable their controls' }
}

async function checkboxBehavior(page) {
  const runtime = await openScene(page, 'docs-checkbox')
  const channels = section(runtime, 'notification-channels')
  const wechat = channels.getByRole('checkbox', { name: '微信通知', exact: true })
  const sms = channels.getByRole('checkbox', { name: '短信', exact: true })
  const email = channels.getByRole('checkbox', { name: '邮件', exact: true })
  await expect(wechat).toBeChecked()
  await sms.click()
  await expect(sms).toBeChecked()
  await expect(channels.getByRole('status')).toHaveText('已选择 2/2')
  await email.click({ force: true })
  await expect(email).not.toBeChecked()
  await expect(channels.getByRole('status')).toHaveText('已选择 2/2')
  await wechat.click()
  await email.click()
  await expect(wechat).not.toBeChecked()
  await expect(email).toBeChecked()
  const disabled = section(runtime, 'checkbox-states').getByRole('checkbox', { name: '微信通知', exact: true })
  await expect(disabled).toBeDisabled()
  await disabled.click({ force: true })
  await expect(disabled).toBeChecked()
  const readonly = section(runtime, 'checkbox-states').getByRole('checkbox', { name: '只读', exact: true })
  await readonly.click({ force: true })
  await expect(readonly).toBeChecked()
  return { behavior: 'Two-channel limit rejects third selection, deselection frees capacity, disabled/readonly stay checked' }
}

async function selectBehavior(page) {
  const runtime = await openScene(page, 'docs-select', 'en', 'dark')
  const single = section(runtime, 'default-fulfillment-center')
  await expect(single.getByRole('status')).toHaveText('Current center：Hangzhou center')
  await single.getByRole('combobox').click()
  await single.getByRole('option', { name: 'Shanghai center', exact: true }).click()
  await expect(single.getByRole('status')).toHaveText('Current center：Shanghai center')
  await single.getByRole('combobox').click()
  await single.getByRole('button', { name: 'Clear selection', exact: true }).click()
  await expect(single.getByRole('status')).toHaveText('Current center：None')
  await single.getByRole('combobox').click()
  const multiple = section(runtime, 'select-multiple')
  await multiple.getByRole('combobox').click()
  await multiple.getByRole('option', { name: 'Shanghai center', exact: true }).click()
  await expect(multiple.getByRole('status')).toHaveText('Selected：Shanghai center, Hangzhou center')
  await multiple.getByRole('option', { name: 'Hangzhou center', exact: true }).click()
  await expect(multiple.getByRole('status')).toHaveText('Selected：Shanghai center')
  await multiple.locator('.varo-select__confirm').getByRole('button').click()
  const search = section(runtime, 'select-search')
  await search.getByRole('combobox').fill('Shenzhen')
  await expect(search.getByRole('option')).toHaveCount(1)
  const unavailable = search.getByRole('option', { name: 'Shenzhen center', exact: true })
  await expect(unavailable).toBeDisabled()
  await unavailable.click({ force: true })
  await expect(search.getByRole('status')).toHaveText('Selected：Hangzhou center')
  await search.getByRole('combobox').fill('Shanghai')
  await search.getByRole('option', { name: 'Shanghai center', exact: true }).click()
  await expect(search.getByRole('status')).toHaveText('Selected：Shanghai center')
  const states = section(runtime, 'select-states').getByRole('combobox')
  await states.nth(0).click()
  const readonly = section(runtime, 'select-states')
  await expect(readonly.getByRole('listbox')).toHaveAttribute('aria-readonly', 'true')
  await readonly.getByRole('option', { name: 'Shanghai center', exact: true }).click()
  await expect(states.nth(0)).toContainText('Hangzhou center')
  await expect(readonly.getByRole('option', { name: 'Hangzhou center', exact: true })).toHaveAttribute('aria-selected', 'true')
  await states.nth(0).click()
  await expect(readonly.getByRole('option')).toHaveCount(0)
  await expect(states.nth(1)).toBeDisabled()
  return { behavior: 'Single/clear, multiple toggle, filtered options and disabled/readonly rejection update real selected-center outputs' }
}

async function listBehavior(page) {
  const runtime = await openScene(page, 'docs-list')
  const rows = runtime.locator('[data-docs-list-row]')
  const scroll = section(runtime, 'incremental-loading').locator('wx-scroll-view[data-native-scroll-y="true"]')
  await expect(rows).toHaveCount(8)
  await expect(scroll).toHaveCount(1)
  await expect(scroll).toHaveCSS('overflow-y', 'auto')
  assert.ok(await scroll.evaluate(element => element.scrollHeight > element.clientHeight), 'The record list must be scrollable')
  for (const count of [13, 18]) {
    await scroll.hover()
    await page.mouse.wheel(0, 1000)
    await expect(rows).toHaveCount(count)
    await expect(rows.last()).toHaveText(`记录 ${count}`)
  }
  await expect(runtime.locator('.varo-list')).toHaveAttribute('data-finished', 'true')
  await expect(runtime.locator('.varo-list__footer')).toHaveText('没有更多了')
  await page.mouse.wheel(0, 1000)
  await expect(rows).toHaveCount(18)
  return { behavior: 'Real scrolling appends 8→13→18 records and reaches the terminal state' }
}

async function tabsBehavior(page, locale, theme) {
  const en = locale === 'en'
  const runtime = await openScene(page, 'docs-tabs', locale, theme)
  const example = section(runtime, 'tabs-sections')
  const tablist = example.getByRole('tablist', { name: en ? 'Product detail sections' : '产品详情分区', exact: true })
  const labels = en ? ['Overview', 'Details', 'Config'] : ['概览', '明细', '配置']
  const bodies = en
    ? ['Key metrics and recent activity', 'Lists, filters, and status switching', 'Basic settings and rules']
    : ['核心数据和最近动态', '列表、筛选和状态切换', '基础设置与策略']
  const tabs = labels.map(name => tablist.getByRole('tab', { name, exact: true }))
  const panel = example.getByRole('tabpanel')
  await expect(tablist.getByRole('tab')).toHaveCount(3)
  async function expectActive(index) {
    for (let tabIndex = 0; tabIndex < tabs.length; tabIndex += 1) {
      await expect(tabs[tabIndex]).toHaveAttribute('aria-selected', String(tabIndex === index))
      await expect(tabs[tabIndex]).toHaveAttribute('tabindex', tabIndex === index ? '0' : '-1')
    }
    await expect(panel).toHaveCount(1)
    await expect(panel).toBeVisible()
    await expect(panel).toContainText(bodies[index])
  }
  await expectActive(0)
  await tabs[1].click()
  await expectActive(1)
  await tabs[1].press('ArrowRight')
  await expectActive(2)
  await expect(tabs[2]).toBeFocused()
  await tabs[2].press('Home')
  await expectActive(0)
  await expect(tabs[0]).toBeFocused()
  await tabs[0].press('End')
  await expectActive(2)
  await expect(tabs[2]).toBeFocused()
  return { behavior: 'Click, ArrowRight, Home and End update selected tabs, roving focus and the visible consumer panel', locale, theme }
}

async function regionBehavior(page, locale, theme) {
  const en = locale === 'en'
  const runtime = await openScene(page, 'docs-region-picker', locale, theme)
  const request = state(runtime, 'region-request')
  await runtime.getByRole('button', { name: en ? 'Select region dynamically' : '动态选择地区', exact: true }).click()
  await expect(request).toHaveAttribute('data-state', 'success')
  const panel = runtime.getByRole('dialog')
  await panel.getByRole('option', { name: en ? 'China' : '中国', exact: true }).click()
  await panel.getByRole('option', { name: en ? 'Zhejiang' : '浙江省', exact: true }).click()
  await expect(request).toHaveAttribute('data-state', 'error')
  await expect(panel.getByRole('alert')).toContainText(en ? 'Region service is temporarily unavailable' : '地区服务暂时不可用')
  await panel.getByRole('button', { name: en ? 'Try again' : '重新请求', exact: true }).click()
  await panel.getByRole('option', { name: en ? 'Hangzhou' : '杭州市', exact: true }).click()
  await panel.getByRole('option', { name: en ? 'Xihu' : '西湖区', exact: true }).click()
  await panel.getByRole('button', { name: en ? 'Confirm' : '确定', exact: true }).click()
  await expect(panel).toHaveCount(0)
  await expect(state(runtime, 'region')).toHaveText(en ? 'China / Zhejiang / Hangzhou / Xihu' : '中国 / 浙江省 / 杭州市 / 西湖区')
  await expect(state(runtime, 'region-coordinates')).toHaveText('30.259, 120.13')
  await expect(request).toHaveAttribute('data-state', 'success')
  return { behavior: 'Region hierarchy loads, designed Zhejiang request fails, retry recovers, confirm commits path and coordinates' }
}

async function formArrayBehavior(page) {
  const runtime = await openScene(page, 'docs-form-array', 'en', 'dark')
  const rows = section(runtime, 'company-row')
  const submit = section(runtime, 'company-submit')
  await expect(rows).toHaveCount(1)
  await submit.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(submit.getByRole('status')).toContainText('Save failed')
  await expect(submit.getByRole('status')).toContainText('Use at least 2 characters')
  await rows.nth(0).getByPlaceholder('Company Name', { exact: true }).fill('First company')
  await runtime.getByRole('button', { name: 'Add Company', exact: true }).click()
  await expect(rows).toHaveCount(2)
  const second = rows.nth(1)
  await second.getByPlaceholder('Company Name', { exact: true }).fill('Retained company')
  await second.getByPlaceholder('Contact', { exact: true }).fill('Avery')
  await second.getByPlaceholder('Mobile number', { exact: true }).fill('13800138000')
  await second.getByRole('radio', { name: 'Branch', exact: true }).click()
  await second.getByRole('button', { name: 'Set Primary', exact: true }).click()
  await expect(second.locator('.docs-demo__value')).toHaveText('Primary')
  await rows.nth(0).getByRole('button', { name: 'Remove', exact: true }).click()
  await expect(rows).toHaveCount(1)
  await expect(rows.getByPlaceholder('Company Name', { exact: true })).toHaveValue('Retained company')
  await expect(rows.getByPlaceholder('Contact', { exact: true })).toHaveValue('Avery')
  await expect(rows.getByPlaceholder('Mobile number', { exact: true })).toHaveValue('13800138000')
  await expect(rows.getByRole('radio', { name: 'Branch', exact: true })).toBeChecked()
  await expect(rows.locator('.docs-demo__value')).toHaveText('Primary')
  await expect(rows.getByRole('button', { name: 'Remove', exact: true })).toHaveCount(0)
  await submit.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(submit.getByRole('status')).toHaveText('Saved')
  const settledInputs = await settledValidForm(runtime)
  return { behavior: 'Invalid submit reports field errors; add, edit, choose primary and remove retain reindexed values; valid remaining row saves with cleared invalid presentation', settledInputs }
}

async function fileBehavior(page) {
  const runtime = await openScene(page, 'docs-form', 'en')
  const files = section(runtime, 'supporting-files')
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    files.getByRole('button', { name: 'Choose files', exact: true }).click(),
  ])
  await expect(runtime.locator('[data-weapp-web-file-picker]')).toHaveCount(1)
  await chooser.setFiles({ name: 'brief.txt', mimeType: 'text/plain', buffer: Buffer.from('Varo documentation supporting file\n') })
  await expect(runtime.locator('[data-weapp-web-file-picker]')).toHaveCount(0)
  await expect(files.locator('[data-file-index]')).toHaveCount(1)
  await expect(files.locator('[data-file-index]')).toContainText('brief.txt')
  await files.getByRole('button', { name: 'Remove', exact: true }).click()
  await expect(files.locator('[data-file-index]')).toHaveCount(0)
  const [cancelChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    files.getByRole('button', { name: 'Choose files', exact: true }).click(),
  ])
  await cancelChooser.setFiles([])
  await expect(files.getByRole('alert')).toContainText('chooseMessageFile:fail cancel')
  await expect(runtime.locator('[data-weapp-web-file-picker]')).toHaveCount(0)
  const [retryChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    files.getByRole('button', { name: 'Try again', exact: true }).click(),
  ])
  await retryChooser.setFiles({ name: 'retry.txt', mimeType: 'text/plain', buffer: Buffer.from('Retried real browser file selection\n') })
  await expect(files.getByRole('alert')).toHaveCount(0)
  await expect(files.locator('[data-file-index]')).toContainText('retry.txt')
  const field = name => runtime.locator(`.varo-form-item[data-name="${name}"]`)
  await field('account').locator('input').fill('AB')
  await expect(field('account')).toHaveAttribute('data-invalid', 'true')
  await expect(field('account')).toContainText('Use at least 3 characters')
  await field('account').locator('input').fill('Varo Labs')
  await expect(field('account')).toHaveAttribute('data-invalid', 'false')
  await field('contact').locator('input').fill('123')
  await field('email').locator('input').focus()
  await expect(field('contact')).toContainText('Enter an 11-digit phone number')
  await field('contact').locator('input').fill('13800138000')
  await field('email').locator('input').fill('invalid')
  await field('account').locator('input').focus()
  await expect(field('email')).toContainText('Enter a valid email address')
  await field('email').locator('input').fill('avery@example.com')
  await field('gender').getByRole('radio', { name: 'Company', exact: true }).click()
  await field('interests').getByRole('checkbox', { name: 'Product design', exact: true }).click()
  await field('quantity').getByRole('button', { name: 'Increase value', exact: true }).click()
  await field('budget').getByRole('button', { name: 'Increase value', exact: true }).click()
  await field('score').getByRole('radio', { name: '4', exact: true }).click()
  await field('password').locator('input').fill('012345')
  await field('remark').locator('textarea').fill('Build a shared mobile component catalog.')
  await section(runtime, 'project-submit').getByRole('button', { name: 'Save', exact: true }).click()
  await expect(section(runtime, 'project-submit').getByRole('status')).toHaveText('Saved')
  const settledInputs = await settledValidForm(runtime)
  return { behavior: 'Real chooser add/remove/cancel/retry; change and blur field errors recover; complete model passes native form submission with cleared invalid presentation', settledInputs }
}

async function settledValidForm(runtime) {
  await expect(runtime.locator('.varo-form-item[data-invalid="true"]')).toHaveCount(0)
  await expect(runtime.locator('.varo-input[data-invalid="true"]')).toHaveCount(0)
  await expect(runtime.locator('.varo-form-item__error')).toHaveCount(0)
  return runtime.locator('.varo-input__body').evaluateAll(async (inputs) => {
    await Promise.all(inputs.flatMap(input => input.getAnimations().map(animation => animation.finished.catch(() => {}))))
    return inputs.map(input => ({
      borderColor: getComputedStyle(input).borderColor,
      invalid: input.closest('.varo-input').getAttribute('data-invalid'),
    }))
  })
}

async function primitivePanel(page, component, width) {
  await openDocs(page, component, 'en', 'weapp', true)
  await page.setViewportSize({ width, height: 844 })
  const embed = page.frameLocator('.native-component-preview__frame')
  const runtime = await mounted(page, `primitive-${component}`, embed, 'en')
  if (component === 'select') {
    await runtime.getByRole('combobox').click()
    await noOverflow(page)
    await page.locator('.native-component-preview').screenshot({ path: join(artifacts, `primitive-select-open-${width}.png`) })
    // Clicking the last option must work inside the real auto-sized docs iframe.
    await runtime.getByRole('option', { name: 'Base Kit', exact: true }).click()
    await expect(runtime.getByRole('combobox')).toContainText('Base Kit')
    await expect(runtime.getByRole('option')).toHaveCount(0)
  }
  else {
    await runtime.getByRole('button', { name: 'Open', exact: true }).click()
    await expect(runtime.getByText('Lightweight floating content', { exact: true })).toBeVisible()
    await noOverflow(page)
    await page.locator('.native-component-preview').screenshot({ path: join(artifacts, `primitive-popover-open-${width}.png`) })
    await runtime.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(runtime.getByText('Lightweight floating content', { exact: true })).not.toBeVisible()
  }
  await noOverflow(page)
  return { width, behavior: `${component} floating content remains pointer-reachable in the narrow embedded preview` }
}

async function mapBehavior(page) {
  const runtime = await openScene(page, 'docs-map')
  const map = runtime.locator('wx-map')
  await expect(state(runtime, 'map-center')).toHaveText('中心：杭州西湖')
  await expect(state(runtime, 'map-coordinates')).toHaveText('坐标：30.274, 120.155')
  await expect(state(runtime, 'map-markers')).toHaveText('标记数：1')
  await expect(map.locator('img.varo-native-map__tile').first()).toHaveAttribute('src', /rt\d\.map\.gtimg\.com\/tile/)
  await map.click()
  await expect(state(runtime, 'map-region')).toHaveText('收到 regionchange #1')
  await runtime.getByRole('button', { name: '切换到上海', exact: true }).click()
  await expect(state(runtime, 'map-center')).toHaveText('中心：上海外滩')
  await expect(state(runtime, 'map-coordinates')).toHaveText('坐标：31.23, 121.47')
  await expect(map).toHaveAttribute('data-native-latitude', '31.23')
  await expect(map).toHaveAttribute('data-native-longitude', '121.47')
  return { behavior: 'Native-only map center/marker coordinates change and a real map tap emits regionchange; external tile availability is not certified' }
}

async function robotBehavior(page) {
  const runtime = await openScene(page, 'docs-robot-chat')
  await expect(runtime.locator('.varo-native-robot-chat__message--assistant').first()).toContainText('你好，请问需要什么帮助？')
  await expect(state(runtime, 'robot-status')).toHaveText('机器人已连接')
  await runtime.getByRole('textbox', { name: '对话内容', exact: true }).fill('查订单')
  await runtime.getByRole('button', { name: '发送', exact: true }).click()
  await expect(runtime.locator('.varo-native-robot-chat__message--user')).toHaveText('查订单')
  await expect(state(runtime, 'robot-last-query')).toHaveText('最近查询：查订单')
  await expect(state(runtime, 'robot-query-count')).toHaveText('queryCallback：1')
  await expect(state(runtime, 'robot-status')).toHaveText('已收到查询回调 #1')
  return { behavior: 'Native-only robot welcome, real operate-card send, rendered user message and exactly one query callback' }
}

async function errorRecovery(page, expectedErrors) {
  await openDocs(page, 'button', 'zh', 'weapp', true)
  const embed = page.frameLocator('.native-component-preview__frame')
  const runtime = await mounted(page, 'primitive-button', embed)
  await expect.poll(() => page.locator('.native-component-preview__frame').evaluate(element => element.getBoundingClientRect().height)).toBeLessThanOrEqual(180)
  const initialHeight = await page.locator('.native-component-preview__frame').evaluate(element => element.getBoundingClientRect().height)
  assert.ok(initialHeight <= 180, `Expected the short primitive preview, received ${initialHeight}px`)
  await runtime.getByRole('button', { name: 'Pressed 0 times', exact: true }).click()
  const oldUrl = runtime.url()
  const message = `docs-smoke-intentional-${crypto.randomUUID()}\n${'Long runtime error detail requiring a reachable recovery action.\n'.repeat(16)}`
  expectedErrors.add(message)
  await runtime.evaluate((value) => {
    window.dispatchEvent(new ErrorEvent('error', { message: value, error: new Error(value) }))
  }, message)
  await expect(embed.locator('.preview-frame')).toHaveAttribute('data-state', 'error')
  await expect(embed.getByRole('alert')).toContainText(message)
  await page.locator('.native-component-preview').screenshot({ path: join(artifacts, 'short-preview-long-error.png') })
  await embed.getByRole('button', { name: '重置并重试', exact: true }).click()
  const recovered = await mounted(page, 'primitive-button', embed)
  expectedErrors.delete(message)
  assert.notEqual(recovered.url(), oldUrl)
  assert.equal(runtime.isDetached(), true)
  await recovered.getByRole('button', { name: 'Pressed 0 times', exact: true }).click()
  await expect(recovered.getByRole('button', { name: 'Pressed 1 times', exact: true })).toBeVisible()
  return { initialHeight, behavior: 'Long runtime error in a short embedded primitive keeps retry reachable; retry replaces the failed session and restores interactive initial state' }
}

try {
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  assert.equal(scenarioById.size, docsPreviewScenarios.length, 'Registry scenario ids must be unique')
  for (const scenario of docsPreviewScenarios) {
    if (selectedCases.size && !selectedCases.has(scenario.id)) { continue }
    await run(scenario.id, 'route-mount', async (page) => {
      await openScene(page, scenario.id)
      const geometry = []
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 })
        geometry.push({ width, frames: await noOverflow(page) })
      }
      return { requestedComponent: scenario.query.component, nativePage: scenario.page, locale: 'zh', theme: 'light', geometry }
    }, { width: 390, height: 844 })
  }
  for (const locale of ['zh', 'en']) {
    await run(`button-docs-${locale}`, 'behavior-and-layout', page => styledButton(page, locale))
    for (const theme of ['light', 'dark']) {
      await run(`primitive-button-${locale}-${theme}`, 'behavior', page => primitiveButton(page, locale, theme))
    }
  }
  await run('input-zh-light', 'behavior', page => inputBehavior(page, 'zh', 'light'), { width: 390, height: 844 })
  await run('input-en-dark', 'behavior', page => inputBehavior(page, 'en', 'dark'), { width: 320, height: 844 })
  await run('input-number-bounds', 'behavior', numberBehavior, { width: 390, height: 844 })
  await run('checkbox-limit', 'behavior', checkboxBehavior, { width: 390, height: 844 })
  await run('select-en-dark', 'behavior', selectBehavior, { width: 390, height: 844 })
  await run('list-pagination', 'behavior', listBehavior, { width: 390, height: 844 })
  await run('tabs-zh-light', 'behavior', page => tabsBehavior(page, 'zh', 'light'), { width: 390, height: 844 })
  await run('tabs-en-dark', 'behavior', page => tabsBehavior(page, 'en', 'dark'), { width: 320, height: 844 })
  await run('region-zh-light', 'behavior', page => regionBehavior(page, 'zh', 'light'), { width: 390, height: 844 })
  await run('region-en-dark', 'behavior', page => regionBehavior(page, 'en', 'dark'), { width: 390, height: 844 })
  await run('form-array-en-dark', 'behavior', formArrayBehavior, { width: 390, height: 844 })
  await run('form-file-picker', 'behavior', fileBehavior, { width: 390, height: 844 })
  await run('native-map', 'behavior', mapBehavior, { width: 390, height: 844 })
  await run('native-robot-chat', 'behavior', robotBehavior, { width: 390, height: 844 })
  for (const component of ['select', 'popover']) {
    for (const width of [390, 320]) {
      await run(`primitive-${component}-panel-${width}`, 'behavior-and-layout', page => primitivePanel(page, component, width))
    }
  }
  await run('native-error-retry', 'behavior', errorRecovery, { width: 320, height: 844 })
  const unknownCases = [...selectedCases].filter(name => !results.some(result => result.name === name))
  assert.deepEqual(unknownCases, [], 'Unknown DOCS_PREVIEW_CASES report case name(s)')
}
catch (error) {
  results.push({ name: 'smoke-harness', kind: 'infrastructure', status: 'failed', error: { message: error.message ?? String(error), stack: error.stack } })
}
finally {
  if (browser) { await browser.close() }
  const counts = { passed: 0, failed: 0 }
  for (const result of results) { counts[result.status] += 1 }
  const status = counts.failed ? 'failed' : 'passed'
  const report = { status, baseUrl, artifacts, selectedCases: [...selectedCases], counts, results }
  await writeFile(reportPath, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({
    status: report.status,
    baseUrl,
    selectedCases: report.selectedCases,
    counts,
    artifacts,
    report: reportPath,
    failures: results.filter(result => result.status === 'failed').map(({ name, kind, error, cleanupError }) => ({ name, kind, error: error?.message, cleanupError })),
  }, null, 2))
  if (counts.failed) { process.exitCode = 1 }
}
