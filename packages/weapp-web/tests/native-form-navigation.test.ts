// @vitest-environment jsdom

import type { Root } from 'glass-easel-miniprogram-adapter'
import { compileFunction } from 'node:vm'
import * as glassEasel from 'glass-easel'
import { MiniProgramEnv } from 'glass-easel-miniprogram-adapter'
import { TmplGroup } from 'glass-easel-template-compiler'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PreviewBackend } from '../src/runtime/backend.ts'
import { registerNativeElements } from '../src/runtime/native-elements.ts'
import { nativeTemplates } from '../src/runtime/native-templates.ts'

function compileTemplates(sources: Record<string, string>): Record<string, glassEasel.template.ComponentTemplate> {
  const group = new TmplGroup()
  try {
    for (const [name, source] of Object.entries(sources)) { group.addTmpl(name, source) }
    const groupList = compileFunction(`return ${group.getTmplGenObjectGroups()}`)() as NonNullable<glassEasel.template.ComponentTemplate['groupList']>
    return Object.fromEntries(Object.keys(sources).map(name => [name, { groupList, content: groupList[name]! }]))
  }
  finally {
    group.free()
  }
}

const templates = compileTemplates(nativeTemplates)
let active: { backend: PreviewBackend, root: Root } | undefined

afterEach(() => {
  active?.root.release()
  active?.backend.destroy()
  active = undefined
  document.body.replaceChildren()
})

function mountNative(source: string, methods: Record<string, (...args: unknown[]) => unknown>, data: Record<string, unknown> = {}) {
  const env = new MiniProgramEnv()
  const reportError = vi.fn()
  const definitions = registerNativeElements(env, templates, { reportError, resolveAssetUrl: path => path })
  const space = env.createCodeSpace('native-controls-test', true)
  for (const [name, definition] of Object.entries(definitions)) { space.getComponentSpace().setGlobalUsingComponent(name, definition) }
  space.addComponentStaticConfig('page', {})
  space.addCompiledTemplate('page', compileTemplates({ page: source }).page!)
  space.componentEnv('page', ({ Component }) => { Component({ data, methods }) })
  const backend = new PreviewBackend()
  backend.onEvent(glassEasel.Event.triggerBackendEvent)
  const root = env.associateBackend(backend).createRoot('wx-page', space, 'page')
  const placeholder = document.createElement('span')
  document.body.append(placeholder)
  // The adapter's DOM backend represents real DOM elements through its backend interface.
  const parent = document.body as unknown as glassEasel.GeneralBackendElement
  const mountPoint = placeholder as unknown as glassEasel.GeneralBackendElement
  root.attach(parent, mountPoint)
  active = { backend, root }
  return { root, reportError }
}

const formTemplate = `
  <form bindsubmit="submit" bindreset="reset">
    <input name="name" value="initial" />
    <input name="excluded" value="disabled" disabled="{{true}}" />
    <textarea name="note" value="original note" />
    <button form-type="submit">Submit</button>
    <button form-type="reset">Reset</button>
  </form>
`

describe('native browser forms', () => {
  it('submits current successful controls once and prevents document navigation', () => {
    const submit = vi.fn()
    const reset = vi.fn()
    const { reportError } = mountNative(formTemplate, { submit, reset })
    const form = document.querySelector<HTMLFormElement>('form')!
    document.querySelector<HTMLInputElement>('input[name="name"]')!.value = 'changed'
    document.querySelector<HTMLTextAreaElement>('textarea')!.value = 'new note'
    const domSubmit = new Event('submit', { bubbles: true, cancelable: true })
    expect(form.dispatchEvent(domSubmit)).toBe(false)
    expect(submit).toHaveBeenCalledTimes(1)
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: { name: 'changed', note: 'new note' }, formId: '' } }))
    submit.mockClear()
    document.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    expect(submit).toHaveBeenCalledTimes(1)
    expect(reset).not.toHaveBeenCalled()
    expect(reportError).not.toHaveBeenCalled()
  })

  it.each(['submit', 'reset'])('retains pointer tap cancellation through the %s default action', (action) => {
    let cancel = true
    const tap = vi.fn(() => cancel ? false : undefined)
    const handler = vi.fn()
    mountNative(`<form bind${action}="handler"><button form-type="${action}" bindtap="tap"><text>Action</text></button></form>`, { tap, handler })
    const button = document.querySelector<HTMLButtonElement>('wx-button > button')!
    function activate() {
      button.querySelector('wx-text')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: 10 }))
      button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: 12 }))
      return button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, detail: 1 }))
    }
    expect(activate()).toBe(false)
    expect(handler).not.toHaveBeenCalled()
    cancel = false
    expect(activate()).toBe(true)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(tap).toHaveBeenCalledTimes(2)
  })

  it('performs a browser reset once and allows native handlers to cancel it', () => {
    let cancel = true
    const reset = vi.fn(() => cancel ? false : undefined)
    const submit = vi.fn()
    mountNative(formTemplate, { submit, reset })
    const input = document.querySelector<HTMLInputElement>('input[name="name"]')!
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea')!
    const button = document.querySelector<HTMLButtonElement>('button[type="reset"]')!
    input.value = 'dirty'
    textarea.value = 'dirty note'
    button.click()
    expect(reset).toHaveBeenCalledTimes(1)
    expect(input.value).toBe('dirty')
    expect(textarea.value).toBe('dirty note')
    cancel = false
    button.click()
    expect(reset).toHaveBeenCalledTimes(2)
    expect(reset).toHaveBeenLastCalledWith(expect.objectContaining({ detail: {} }))
    expect(input.value).toBe('')
    expect(textarea.value).toBe('')
    expect(submit).not.toHaveBeenCalled()
  })

  it('removes managed form callbacks on detach', () => {
    const submit = vi.fn()
    const reset = vi.fn()
    const { root } = mountNative(formTemplate, { submit, reset })
    const form = document.querySelector<HTMLFormElement>('form')!
    root.release()
    active!.backend.destroy()
    active = undefined
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    form.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }))
    expect(submit).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
  })
})

const navigatorTemplate = '<navigator url="{{url}}" open-type="{{openType}}" target="{{target}}" bindtap="tap" bindsuccess="success" bindfail="fail" bindcomplete="complete">Destination</navigator>'

describe('native browser navigators', () => {
  it('retains safe anchor navigation and respects native tap cancellation', () => {
    let cancel = true
    const tap = vi.fn(() => cancel ? false : undefined)
    const success = vi.fn()
    const fail = vi.fn()
    const complete = vi.fn()
    const { reportError } = mountNative(navigatorTemplate, { tap, success, fail, complete }, { url: '#destination', openType: 'navigate', target: 'self' })
    const anchor = document.querySelector<HTMLAnchorElement>('wx-navigator > a')!
    expect(new URL(anchor.href).hash).toBe('#destination')
    const canceledClick = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, detail: 0 })
    expect(anchor.dispatchEvent(canceledClick)).toBe(false)
    expect(success).not.toHaveBeenCalled()
    cancel = false
    const acceptedClick = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, detail: 0 })
    expect(anchor.dispatchEvent(acceptedClick)).toBe(true)
    expect(tap).toHaveBeenCalledTimes(2)
    expect(success).toHaveBeenCalledTimes(1)
    expect(complete).toHaveBeenCalledTimes(1)
    expect(fail).not.toHaveBeenCalled()
    expect(reportError).not.toHaveBeenCalled()
  })

  it('retains pointer tap cancellation through anchor navigation', () => {
    const success = vi.fn()
    const tap = vi.fn(() => false)
    mountNative(navigatorTemplate.replace('Destination', '<text>Destination</text>'), { tap, success, fail: vi.fn(), complete: vi.fn() }, { url: '#destination', openType: 'navigate', target: 'self' })
    const anchor = document.querySelector<HTMLAnchorElement>('wx-navigator > a')!
    anchor.querySelector('wx-text')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: 10 }))
    anchor.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: 12 }))
    expect(anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, detail: 1 }))).toBe(false)
    expect(tap).toHaveBeenCalledTimes(1)
    expect(success).not.toHaveBeenCalled()
  })

  it.each([
    ['javascript:alert(1)', 'navigate', 'self'],
    ['data:text/html,unsafe', 'navigate', 'self'],
    ['/pages/details/index', 'navigate', 'self'],
    ['https://user:secret@example.com/', 'navigate', 'self'],
    ['https://example.com/', 'switchTab', 'self'],
    ['https://example.com/', 'navigate', 'miniProgram'],
  ])('rejects unsupported navigation only on activation: %s / %s / %s', (url, openType, target) => {
    const tap = vi.fn()
    const success = vi.fn()
    const fail = vi.fn()
    const complete = vi.fn()
    const { reportError } = mountNative(navigatorTemplate, { tap, success, fail, complete }, { url, openType, target })
    const anchor = document.querySelector<HTMLAnchorElement>('wx-navigator > a')!
    expect(anchor.hasAttribute('href')).toBe(false)
    expect(reportError).not.toHaveBeenCalled()
    expect(anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, detail: 0 }))).toBe(false)
    expect(fail).toHaveBeenCalledTimes(1)
    expect(complete).toHaveBeenCalledTimes(1)
    expect(success).not.toHaveBeenCalled()
    expect(reportError).toHaveBeenCalledTimes(1)
  })

  it('removes document navigation callbacks on detach', () => {
    const success = vi.fn()
    const fail = vi.fn()
    const complete = vi.fn()
    const { root, reportError } = mountNative(navigatorTemplate, { tap: vi.fn(), success, fail, complete }, { url: '/pages/details/index', openType: 'navigate', target: 'self' })
    const anchor = document.querySelector<HTMLAnchorElement>('wx-navigator > a')!
    root.release()
    active!.backend.destroy()
    active = undefined
    document.body.append(anchor)
    anchor.click()
    expect(success).not.toHaveBeenCalled()
    expect(fail).not.toHaveBeenCalled()
    expect(complete).not.toHaveBeenCalled()
    expect(reportError).not.toHaveBeenCalled()
  })
})
