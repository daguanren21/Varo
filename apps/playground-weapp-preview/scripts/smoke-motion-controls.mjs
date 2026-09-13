import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium, expect } from '@playwright/test'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4182/'
const artifacts = await mkdtemp(join(tmpdir(), 'varo-motion-smoke-'))
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const checks = []

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const runtimeErrors = []
  const runtimeWarnings = []
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'warn') {
      runtimeWarnings.push(message.text())
    }
  })
  page.on('pageerror', error => runtimeErrors.push(error.message))
  await page.goto(baseUrl)
  await expect(page.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  const runtime = page.frameLocator('iframe')
  const state = runtime.locator('[data-preview-field="motion-state"]')
  await expect.poll(() => page.evaluate(() => document.querySelector('iframe').contentWindow.innerWidth)).toBe(390)

  const switchHost = runtime.locator('wx-button.varo-switch')
  const switchControl = switchHost.locator('> button')
  await switchControl.scrollIntoViewIfNeeded()
  const switchBox = await switchControl.boundingBox()
  assert.ok(switchBox)
  await page.mouse.move(switchBox.x + switchBox.width / 2, switchBox.y + switchBox.height / 2)
  await page.mouse.down()
  await expect(switchHost).toHaveClass(/varo-switch--pressed/)
  await expect.poll(() => switchHost.locator('.varo-switch__thumb').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform)
    return matrix.a
  })).toBeCloseTo(1.16, 2)
  await expect(switchHost.locator('.varo-switch__thumb')).toHaveCSS('transition-duration', '0.18s')
  await page.mouse.up()
  await expect(switchHost).not.toHaveClass(/varo-switch--pressed/)
  await expect(state).toHaveAttribute('data-preview-value', /switch=true/)
  await expect(switchControl).toHaveAttribute('aria-checked', 'true')
  checks.push('switch stretch, release and controlled toggle')

  const radios = runtime.locator('.varo-radio-group').filter({ hasText: '站内信' }).locator('wx-button.varo-radio')
  const radioControls = radios.locator('> button')
  await expect(radios.locator('.varo-radio__dot')).toHaveCount(3)
  await expect(radios.nth(1).locator('.varo-radio__dot')).toHaveCSS('opacity', '0')
  await radioControls.nth(1).click()
  await expect(state).toHaveAttribute('data-preview-value', /radio=email/)
  await expect(radioControls.nth(0)).toHaveAttribute('aria-checked', 'false')
  await expect(radioControls.nth(1)).toHaveAttribute('aria-checked', 'true')
  await expect(radios.nth(1).locator('.varo-radio__dot')).toHaveCSS('opacity', '1')
  await expect(radios.nth(1).locator('.varo-radio__dot')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await expect(radios.nth(0).locator('.varo-radio__dot')).toHaveCount(1)
  checks.push('radio persistent-dot selection')

  const inputGeometry = await runtime.locator('.varo-input-number').evaluate((element) => {
    const host = element.parentElement
    const row = host?.parentElement
    const copy = host?.previousElementSibling
    return {
      copyWidth: copy?.getBoundingClientRect().width ?? 0,
      rowClientWidth: row?.clientWidth ?? 0,
      rowScrollWidth: row?.scrollWidth ?? 0,
      width: element.getBoundingClientRect().width,
    }
  })
  assert.ok(inputGeometry.width >= 128 && inputGeometry.width <= 132)
  assert.ok(inputGeometry.copyWidth > 0)
  assert.ok(inputGeometry.rowScrollWidth <= inputGeometry.rowClientWidth)
  const decrementButton = runtime.getByRole('button', { name: 'Decrease value', exact: true })
  const incrementButton = runtime.getByRole('button', { name: 'Increase value', exact: true })
  await expect(runtime.locator('wx-input:has(input[aria-label="Hidden native input"])')).toHaveAttribute('hidden', '')
  await expect(decrementButton).toHaveCount(1)
  await expect(incrementButton).toHaveCount(1)
  await expect(runtime.getByRole('textbox', { name: 'Numeric value', exact: true })).toHaveCount(1)
  await incrementButton.click()
  await expect(state).toHaveAttribute('data-preview-value', /quantity=3/)
  checks.push('compact InputNumber geometry and increment')

  const ghostHost = runtime.locator('wx-button.varo-button').filter({ hasText: 'Ghost 操作' })
  await expect(ghostHost).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  const ghostControl = ghostHost.locator('> button')
  await ghostControl.scrollIntoViewIfNeeded()
  const ghostBox = await ghostControl.boundingBox()
  assert.ok(ghostBox)
  await page.mouse.move(ghostBox.x + ghostBox.width / 2, ghostBox.y + ghostBox.height / 2)
  await page.mouse.down()
  await expect.poll(() => ghostHost.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a)).toBeCloseTo(0.98, 2)
  const pressedGhostBackground = await ghostHost.evaluate(element => getComputedStyle(element).backgroundColor)
  assert.notEqual(pressedGhostBackground, 'rgba(0, 0, 0, 0)')
  await page.mouse.up()
  await expect(ghostHost).not.toHaveClass(/varo-button--pressed/)
  await expect(state).toHaveAttribute('data-preview-value', /actions=1/)
  checks.push('button transparent ghost and press scale')

  const toastRegion = runtime.locator('.varo-toast-region')
  await expect(toastRegion).toHaveAttribute('data-inline', 'true')
  await expect(toastRegion).toHaveCSS('flex-direction', 'column')
  await expect(toastRegion).toHaveCSS('gap', '8px')
  await expect(toastRegion.locator('.varo-toast')).toHaveCount(2)
  await expect(toastRegion.locator('.varo-toast').first()).toHaveCSS('flex-direction', 'row')
  const toastRects = await toastRegion.locator('.varo-toast').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON()))
  assert.ok(toastRects[1].top >= toastRects[0].bottom)
  assert.ok(Math.abs(toastRects[0].left - toastRects[1].left) < 1)
  assert.ok(Math.abs(toastRects[0].width - toastRects[1].width) < 1)
  await expect(toastRegion.locator('.varo-toast').first()).toHaveAttribute('aria-busy', 'true')
  await expect(toastRegion.locator('.varo-toast').first().locator('.varo-toast__spinner')).toHaveCSS('width', '20px')
  await expect(toastRegion.locator('.varo-toast').first().locator('.varo-toast__spinner')).toHaveCSS('height', '20px')
  await toastRegion.locator('.varo-toast').first().evaluate((element) => { element.dataset.probe = 'same-node' })
  await runtime.getByRole('button', { name: '状态切换', exact: true }).click()
  await expect(state).toHaveAttribute('data-preview-value', /toast=success/)
  await expect(toastRegion.locator('.varo-toast').first()).toHaveAttribute('data-probe', 'same-node')
  await expect(toastRegion.locator('.varo-toast').first()).not.toHaveAttribute('aria-busy')
  await expect(toastRegion.locator('.varo-toast').first().locator('.varo-toast__icon .varo-icon')).toHaveCSS('width', '20px')
  await expect(toastRegion.locator('.varo-toast').first().locator('.varo-toast__icon .varo-icon')).toHaveCSS('height', '20px')
  await runtime.getByRole('button', { name: '查看同步结果', exact: true }).click()
  await expect(state).toHaveAttribute('data-preview-value', /actions=2/)
  await toastRegion.getByRole('button', { name: '关闭通知', exact: true }).click()
  await expect(state).toHaveAttribute('data-preview-value', /warning=false/)
  await expect(toastRegion.locator('.varo-toast')).toHaveCount(1)
  checks.push('toast stack, in-place status morph, action and transition-owned dismissal')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await switchControl.scrollIntoViewIfNeeded()
  const reducedSwitchBox = await switchControl.boundingBox()
  assert.ok(reducedSwitchBox)
  await page.mouse.move(reducedSwitchBox.x + reducedSwitchBox.width / 2, reducedSwitchBox.y + reducedSwitchBox.height / 2)
  await page.mouse.down()
  await expect(switchHost).toHaveClass(/varo-switch--pressed/)
  const reducedScale = await switchHost.locator('.varo-switch__thumb').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform)
    return matrix.a
  })
  await page.mouse.up()
  await expect(switchHost).not.toHaveClass(/varo-switch--pressed/)
  assert.ok(Math.abs(reducedScale - 1) < 0.01)
  checks.push('reduced-motion switch feedback')

  const surface = await runtime.locator('html').evaluate((element) => {
    element.ownerDocument.defaultView?.scrollTo(0, 0)
    const themedControl = element.ownerDocument.querySelector('.varo-switch')
    const motionCard = element.ownerDocument.querySelector('[data-preview-field="motion-state"]')?.closest('.varo-card')
    return {
      clientWidth: element.clientWidth,
      invalidAriaAttributes: [...element.ownerDocument.querySelectorAll('*')].flatMap(node =>
        [...node.attributes]
          .filter(attribute => attribute.name.startsWith('aria-') && /^(?:null|undefined)$/u.test(attribute.value))
          .map(attribute => `${node.tagName.toLowerCase()}[${attribute.name}=${attribute.value}]`),
      ),
      motionCardClientWidth: motionCard?.clientWidth ?? 0,
      motionCardScrollWidth: motionCard?.scrollWidth ?? 0,
      primary: themedControl ? getComputedStyle(themedControl).getPropertyValue('--varo-ui-primary').trim() : '',
      scrollWidth: element.scrollWidth,
    }
  })
  assert.equal(surface.primary, '#0f766e')
  assert.deepEqual(surface.invalidAriaAttributes, [])
  assert.ok(surface.scrollWidth <= surface.clientWidth)
  assert.ok(surface.motionCardScrollWidth <= surface.motionCardClientWidth)
  checks.push('Varo primary palette and horizontal fit')
  assert.deepEqual(runtimeWarnings, [])
  assert.deepEqual(runtimeErrors, [])
  checks.push('warning-free Varo runtime console')
  await page.evaluate(() => window.scrollTo(0, 0))

  await page.screenshot({ path: join(artifacts, 'motion-controls.png'), fullPage: true })
  console.log(JSON.stringify({ runtimeUrl: page.frames().find(frame => frame.url().includes('runtime.html'))?.url(), artifacts, checks }))
}
finally {
  await browser.close()
}
