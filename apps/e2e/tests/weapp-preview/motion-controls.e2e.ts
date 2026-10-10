import { expect } from 'e2e'
import { test } from '../../engines/web'
import { field, readRuntime, runtimeScale, runtimeStyle } from './support'

test('preview motion controls, toast transitions, reduced motion and layout', { platforms: ['weapp-preview'], timeout: 60_000 }, async ({ app, browser, webRuntime }) => {
  await browser.setViewport({ width: 1280, height: 900 })
  await app.open('/')
  await webRuntime.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(browser.locator('.preview-frame')).toHaveAttribute('data-state', 'ready')
  const runtime = browser.frameLocator('iframe')
  const state = field(runtime, 'motion-state')
  await expect.poll(() => readRuntime(browser, document => document.defaultView!.innerWidth)).toBe(390)

  const switchHost = runtime.locator('wx-button.varo-switch')
  const switchControl = runtime.locator('wx-button.varo-switch > button')
  await switchControl.scrollIntoView()
  const switchBox = await switchControl.boundingBox()
  expect(switchBox).not.toBeNull()
  expect(switchBox!.width >= 44 && switchBox!.height >= 44).toBe(true)
  // Frame-scoped semantic bounds are document-local; hover performs the real
  // browser hit-test without interpreting them as top-level mouse coordinates.
  await switchControl.hover()
  await browser.mouse.down()
  await expect(switchHost).toHaveAttribute('class', /varo-switch--pressed/)
  await expect.poll(() => runtimeScale(browser, 'wx-button.varo-switch .varo-switch__thumb')).toBeCloseTo(1.16, 2)
  await expect.poll(() => runtimeStyle(browser, 'wx-button.varo-switch .varo-switch__thumb', 'transition-duration')).toBe('0.18s')
  await browser.mouse.up()
  await expect(switchHost).not.toHaveAttribute('class', /varo-switch--pressed/)
  await expect(state).toHaveAttribute('data-preview-value', /switch=true/)
  await expect(switchControl).toHaveAttribute('aria-checked', 'true')

  const radioControls = runtime.locator('.varo-radio-group:has-text("站内信") wx-button.varo-radio > button')
  const radioDots = runtime.locator('.varo-radio-group:has-text("站内信") .varo-radio__dot')
  await expect(radioDots).toHaveCount(3)
  await expect.poll(() => runtimeStyle(browser, '.varo-radio-group .varo-radio__dot', 'opacity', 1)).toBe('0')
  await radioControls.nth(1).click()
  await expect(state).toHaveAttribute('data-preview-value', /radio=email/)
  await expect(radioControls.nth(0)).toHaveAttribute('aria-checked', 'false')
  await expect(radioControls.nth(1)).toHaveAttribute('aria-checked', 'true')
  await expect.poll(() => runtimeStyle(browser, '.varo-radio-group .varo-radio__dot', 'opacity', 1)).toBe('1')
  await expect.poll(() => runtimeStyle(browser, '.varo-radio-group .varo-radio__dot', 'transform', 1)).toBe('matrix(1, 0, 0, 1, 0, 0)')
  expect(await readRuntime(browser, document => document.querySelectorAll('.varo-radio-group wx-button.varo-radio')[0]!.querySelectorAll('.varo-radio__dot').length)).toBe(1)

  const inputGeometry = await readRuntime(browser, (document) => {
    const element = document.querySelector('.varo-input-number')!
    const host = element.parentElement
    const row = host?.parentElement
    const copy = host?.previousElementSibling
    return { copyWidth: copy?.getBoundingClientRect().width ?? 0, rowClientWidth: row?.clientWidth ?? 0, rowScrollWidth: row?.scrollWidth ?? 0 }
  })
  expect(inputGeometry.copyWidth).toBeGreaterThan(0)
  expect(inputGeometry.rowScrollWidth).toBeLessThanOrEqual(inputGeometry.rowClientWidth)
  const decrement = runtime.getByRole('button', { name: 'Decrease value', exact: true })
  const increment = runtime.getByRole('button', { name: 'Increase value', exact: true })
  const numeric = runtime.getByRole('textbox', { name: 'Numeric value', exact: true })
  await expect(runtime.locator('wx-input:has(input[aria-label="Hidden native input"])')).toHaveAttribute('hidden', '')
  for (const control of [decrement, numeric, increment]) {
    await expect(control).toHaveCount(1)
    const box = await control.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width >= 44 && box!.height >= 44).toBe(true)
  }
  await increment.click()
  await expect(state).toHaveAttribute('data-preview-value', /quantity=3/)

  const ghostHost = runtime.locator('wx-button.varo-button').filter({ hasText: 'Ghost 操作' })
  const ghostControl = ghostHost.getByRole('button', { name: /Ghost 操作/ })
  const ghostBackground = () => readRuntime(browser, (document) => {
    const ghost = [...document.querySelectorAll('wx-button.varo-button')].find(node => node.textContent!.includes('Ghost 操作'))!
    return getComputedStyle(ghost).backgroundColor
  })
  await expect.poll(ghostBackground).toBe('rgba(0, 0, 0, 0)')
  await ghostControl.scrollIntoView()
  const ghostBox = await ghostControl.boundingBox()
  expect(ghostBox).not.toBeNull()
  await ghostControl.hover()
  await browser.mouse.down()
  await expect.poll(() => readRuntime(browser, (document) => {
    const ghost = [...document.querySelectorAll('wx-button.varo-button')].find(node => node.textContent!.includes('Ghost 操作'))!
    return new DOMMatrix(getComputedStyle(ghost).transform).a
  })).toBeCloseTo(0.98, 2)
  expect(await ghostBackground()).not.toBe('rgba(0, 0, 0, 0)')
  await browser.mouse.up()
  await expect(ghostHost).not.toHaveAttribute('class', /varo-button--pressed/)
  await expect(state).toHaveAttribute('data-preview-value', /actions=1/)

  const toastRegion = runtime.locator('.varo-toast-region')
  const toasts = runtime.locator('.varo-toast-region .varo-toast')
  const firstToast = toasts.first()
  await expect(toastRegion).toHaveAttribute('data-inline', 'true')
  await expect.poll(() => runtimeStyle(browser, '.varo-toast-region', 'flex-direction')).toBe('column')
  await expect.poll(() => runtimeStyle(browser, '.varo-toast-region', 'gap')).toBe('8px')
  await expect(toasts).toHaveCount(2)
  await expect.poll(() => runtimeStyle(browser, '.varo-toast-region .varo-toast', 'flex-direction')).toBe('row')
  const toastRects = await readRuntime(browser, document => [...document.querySelectorAll('.varo-toast-region .varo-toast')].map((element) => {
    const { top, bottom, left, width } = element.getBoundingClientRect()
    return { top, bottom, left, width }
  }))
  expect(toastRects[1]!.top).toBeGreaterThanOrEqual(toastRects[0]!.bottom)
  expect(Math.abs(toastRects[0]!.left - toastRects[1]!.left)).toBeLessThan(1)
  expect(Math.abs(toastRects[0]!.width - toastRects[1]!.width)).toBeLessThan(1)
  await expect(firstToast).toHaveAttribute('aria-busy', 'true')
  await expect.poll(() => runtimeStyle(browser, '.varo-toast-region .varo-toast .varo-toast__spinner', 'width')).toBe('20px')
  await expect.poll(() => runtimeStyle(browser, '.varo-toast-region .varo-toast .varo-toast__spinner', 'height')).toBe('20px')
  await readRuntime(browser, (document) => {
    document.querySelector<HTMLElement>('.varo-toast-region .varo-toast')!.dataset.probe = 'same-node'
    return null
  })
  await runtime.getByRole('button', { name: '状态切换', exact: true }).click()
  await expect(state).toHaveAttribute('data-preview-value', /toast=success/)
  await expect(firstToast).toHaveAttribute('data-probe', 'same-node')
  await expect(firstToast).not.toHaveAttribute('aria-busy')
  await expect.poll(() => runtimeStyle(browser, '.varo-toast-region .varo-toast .varo-toast__icon .varo-icon', 'width')).toBe('20px')
  await expect.poll(() => runtimeStyle(browser, '.varo-toast-region .varo-toast .varo-toast__icon .varo-icon', 'height')).toBe('20px')
  await runtime.getByRole('button', { name: '查看同步结果', exact: true }).click()
  await expect(state).toHaveAttribute('data-preview-value', /actions=2/)
  await toastRegion.getByRole('button', { name: '关闭通知', exact: true }).click()
  await expect(state).toHaveAttribute('data-preview-value', /warning=false/)
  await expect(toasts).toHaveCount(1)

  await webRuntime.emulateMedia({ reducedMotion: 'reduce' })
  // Prove the real browser preference reached the child document as well.
  expect(await readRuntime(browser, document => document.defaultView!.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  await switchControl.scrollIntoView()
  const reducedBox = await switchControl.boundingBox()
  expect(reducedBox).not.toBeNull()
  await switchControl.hover()
  await browser.mouse.down()
  await expect(switchHost).toHaveAttribute('class', /varo-switch--pressed/)
  const reducedScale = await runtimeScale(browser, 'wx-button.varo-switch .varo-switch__thumb')
  await browser.mouse.up()
  await expect(switchHost).not.toHaveAttribute('class', /varo-switch--pressed/)
  expect(Math.abs(reducedScale - 1)).toBeLessThan(0.01)

  const surface = await readRuntime(browser, (document) => {
    const element = document.documentElement
    document.defaultView!.scrollTo(0, 0)
    const themedControl = document.querySelector('.varo-switch')!
    const motionCard = document.querySelector('[data-preview-field="motion-state"]')!.closest('.varo-card')!
    return {
      clientWidth: element.clientWidth,
      invalidAriaAttributes: [...document.querySelectorAll('*')].flatMap(node => [...node.attributes]
        .filter(attribute => attribute.name.startsWith('aria-') && /^(?:null|undefined)$/u.test(attribute.value))
        .map(attribute => `${node.tagName.toLowerCase()}[${attribute.name}=${attribute.value}]`)),
      motionCardClientWidth: motionCard.clientWidth,
      motionCardScrollWidth: motionCard.scrollWidth,
      primary: getComputedStyle(themedControl).getPropertyValue('--varo-ui-primary').trim(),
      scrollWidth: element.scrollWidth,
    }
  })
  expect(surface.primary).toBe('#0f766e')
  expect(surface.invalidAriaAttributes).toEqual([])
  expect(surface.scrollWidth).toBeLessThanOrEqual(surface.clientWidth)
  expect(surface.motionCardScrollWidth).toBeLessThanOrEqual(surface.motionCardClientWidth)
  const diagnostics = await webRuntime.diagnostics()
  expect(diagnostics.console.filter(message => message.type === 'warning' || message.type === 'warn')).toEqual([])
  expect(diagnostics.pageErrors).toEqual([])
  await browser.evaluate(() => { window.scrollTo(0, 0); return null })
  await app.screenshot('motion-controls')
})
