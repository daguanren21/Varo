import type { Browser, FrameScreen } from '@e2e-dev/web'
import type { JsonValue } from 'e2e'
import type { WebRuntime } from '../../engines/web'
import { expect } from 'e2e'

export function field(root: Browser | FrameScreen, name: string) {
  return root.locator(`[data-preview-field="${name}"]`)
}

export async function selectRadio(browser: Browser, name: RegExp) {
  const choice = browser.locator('label').filter({ hasText: name })
  await choice.click()
  await expect(choice.getByRole('radio')).toBeChecked()
}

/** Trusted same-origin preview DOM probes; all calls remain browser.evaluate steps. */
export function readRuntime<T extends JsonValue>(browser: Browser, read: (document: Document) => T): Promise<T> {
  return browser.evaluate<T>(`(${read.toString()})(document.querySelector('iframe').contentDocument)`)
}

export function runtimeStyle(browser: Browser, selector: string, property: string, index = 0): Promise<string> {
  return browser.evaluate(({ selector, property, index }) => {
    const document = window.document.querySelector('iframe')!.contentDocument!
    const element = document.querySelectorAll(selector)[index]
    if (!element) { throw new Error(`Missing runtime element: ${selector}`) }
    return getComputedStyle(element).getPropertyValue(property)
  }, { selector, property, index })
}

export function runtimeScale(browser: Browser, selector: string): Promise<number> {
  return browser.evaluate((selector) => {
    const element = document.querySelector('iframe')!.contentDocument!.querySelector(selector)
    if (!element) { throw new Error(`Missing runtime element: ${selector}`) }
    return new DOMMatrix(getComputedStyle(element).transform).a
  }, selector)
}

export async function expectPreviewDiagnostics(webRuntime: WebRuntime, intentionalError = false) {
  const diagnostics = await webRuntime.diagnostics()
  expect(diagnostics.pageErrors.filter(message => !(intentionalError && message.includes('preview-smoke-intentional')))).toEqual([])
  expect(diagnostics.console.filter(message => /keys .*not unique/i.test(message.text)), 'Native Markdown must reconcile without duplicate item keys').toEqual([])
}
