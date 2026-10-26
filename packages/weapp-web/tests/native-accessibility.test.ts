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

function mountNative(source: string, data: Record<string, unknown> = {}, methods: Record<string, (...args: unknown[]) => unknown> = {}) {
  const env = new MiniProgramEnv()
  const reportError = vi.fn()
  const definitions = registerNativeElements(env, templates, { reportError, resolveAssetUrl: path => path })
  const space = env.createCodeSpace('native-accessibility-test', true)
  for (const [name, definition] of Object.entries(definitions)) { space.getComponentSpace().setGlobalUsingComponent(name, definition) }
  space.addComponentStaticConfig('page', {})
  space.addCompiledTemplate('page', compileTemplates({ page: source }).page!)
  space.componentEnv('page', ({ Component }) => { Component({ data, methods }) })
  const backend = new PreviewBackend()
  backend.onEvent(glassEasel.Event.triggerBackendEvent)
  const root = env.associateBackend(backend).createRoot('wx-page', space, 'page')
  const placeholder = document.createElement('span')
  document.body.append(placeholder)
  root.attach(
    document.body as unknown as glassEasel.GeneralBackendElement,
    placeholder as unknown as glassEasel.GeneralBackendElement,
  )
  active = { backend, root }
  return { page: root.getComponent(), reportError }
}

function expectWrapperWithoutSemantics(host: HTMLElement) {
  expect(host.hasAttribute('role')).toBe(false)
  expect(host.hasAttribute('tabindex')).toBe(false)
  expect(host.hasAttribute('title')).toBe(false)
  expect(host.getAttributeNames().filter(name => name.startsWith('aria-'))).toEqual([])
}

describe('native control semantic ownership', () => {
  it('delivers one pointer activation after disposing and remounting a backend', () => {
    mountNative('<button bindtap="tap">Old</button>', {}, { tap: vi.fn() })
    active!.root.release()
    active!.backend.destroy()
    document.body.replaceChildren()
    const tap = vi.fn()
    mountNative('<button bindtap="tap">Current</button>', {}, { tap })
    const button = document.querySelector<HTMLButtonElement>('wx-button > button')!
    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
      const options = { bubbles: true, cancelable: true, button: 0, clientX: 10, clientY: 10, detail: 1 }
      button.dispatchEvent(type.startsWith('pointer')
        ? new PointerEvent(type, { ...options, pointerId: 1, pointerType: 'mouse' })
        : new MouseEvent(type, options))
    }
    expect(tap).toHaveBeenCalledTimes(1)
    active!.backend.destroy()
    button.click()
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 2 }))
    button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 2 }))
    expect(tap).toHaveBeenCalledTimes(1)
  })

  it('isolates concurrent backends and keeps the remaining mount active after disposal', () => {
    const firstTap = vi.fn()
    const secondTap = vi.fn()
    mountNative('<view role="button" tabindex="0" bindtap="tap">First</view>', {}, { tap: firstTap })
    const first = active!
    const firstControl = document.querySelector<HTMLElement>('[role="button"]')!
    mountNative('<view role="button" tabindex="0" bindtap="tap">Second</view>', {}, { tap: secondTap })
    const secondControl = document.querySelectorAll<HTMLElement>('[role="button"]')[1]!
    try {
      for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        const options = { bubbles: true, cancelable: true, button: 0, clientX: 10, clientY: 10, detail: 1 }
        firstControl.dispatchEvent(type.startsWith('pointer')
          ? new PointerEvent(type, { ...options, pointerId: 1, pointerType: 'mouse' })
          : new MouseEvent(type, options))
      }
      expect(firstTap).toHaveBeenCalledTimes(1)
      expect(secondTap).not.toHaveBeenCalled()
      secondControl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      expect(secondTap).toHaveBeenCalledTimes(1)
      expect(firstTap).toHaveBeenCalledTimes(1)
    }
    finally {
      first.root.release()
      first.backend.destroy()
    }
    secondControl.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
    expect(secondTap).toHaveBeenCalledTimes(2)
    expect(firstTap).toHaveBeenCalledTimes(1)
  })

  it.each(['checkbox', 'radio', 'switch'])('activates a native %s view with uncanceled Space only', (role) => {
    let checked = false
    const { page } = mountNative(`
      <view role="${role}" aria-checked="{{checked}}" aria-disabled="{{disabled}}"
        tabindex="0" bindtap="toggle">Choice</view>
    `, { checked, disabled: false }, {
      toggle: () => {
        checked = !checked
        page.setData({ checked })
      },
    })
    const host = document.querySelector<HTMLElement>(`[role="${role}"]`)!
    host.focus()
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    host.dispatchEvent(space)
    expect(space.defaultPrevented).toBe(true)
    expect(host.getAttribute('aria-checked')).toBe('true')

    host.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true, bubbles: true, cancelable: true }))
    expect(host.getAttribute('aria-checked')).toBe('true')
    const canceled = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    canceled.preventDefault()
    host.dispatchEvent(canceled)
    expect(host.getAttribute('aria-checked')).toBe('true')
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    expect(host.getAttribute('aria-checked')).toBe('true')

    page.setData({ disabled: true })
    host.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
    expect(host.getAttribute('aria-checked')).toBe('true')
    page.setData({ disabled: false })
    host.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
    expect(host.getAttribute('aria-checked')).toBe('false')
  })

  it.each(['pointer', 'touch'])('delivers native drag coordinates and cancels %s scrolling without a tap', (source) => {
    let startX = 0
    const tap = vi.fn()
    function touchX(event: unknown, list: 'touches' | 'changedTouches') {
      // The fixture erases Glass-Easel's native event type at the method boundary.
      const nativeEvent = event as { touches: Array<{ clientX: number }>, changedTouches: Array<{ clientX: number }> }
      return nativeEvent[list][0]!.clientX
    }
    const { page } = mountNative('<view bindtouchstart="start" catchtouchmove="move" bindtouchend="end" bindtap="tap">{{position}}</view>', { position: 0 }, {
      start: (event) => { startX = touchX(event, 'touches') },
      move: (event) => {
        page.setData({ position: touchX(event, 'touches') - startX })
        return false
      },
      end: (event) => { page.setData({ position: touchX(event, 'changedTouches') - startX }) },
      tap,
    })
    const target = document.querySelector<HTMLElement>('wx-view')!
    function dispatch(phase: 'start' | 'move' | 'end', x: number) {
      const point: Touch = { identifier: 1, target, clientX: x, clientY: 10, pageX: x, pageY: 10, screenX: x, screenY: 10, force: 1, radiusX: 1, radiusY: 1, rotationAngle: 0 }
      const options = { bubbles: true, cancelable: true }
      return target.dispatchEvent(source === 'pointer'
        ? new PointerEvent({ start: 'pointerdown', move: 'pointermove', end: 'pointerup' }[phase], { ...options, pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: 10 })
        : new TouchEvent(`touch${phase}`, { ...options, touches: phase === 'end' ? [] : [point], changedTouches: [point] }))
    }
    dispatch('start', 100)
    expect(dispatch('move', 40)).toBe(false)
    expect(target.textContent).toBe('-60')
    dispatch('end', 30)
    expect(target.textContent).toBe('-70')
    expect(tap).not.toHaveBeenCalled()
  })

  it('does not leak raw input into ancestor capture handlers', () => {
    const capture = vi.fn()
    const input = vi.fn()
    mountNative('<view capture-bind:input="capture"><input bindinput="input" /></view>', {}, { capture, input })
    const control = document.querySelector<HTMLInputElement>('wx-input > input')!
    control.value = 'normalized'
    control.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'normalized', inputType: 'insertText' }))
    expect(capture).not.toHaveBeenCalled()
    expect(input).toHaveBeenCalledTimes(1)
    expect(input).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({ value: 'normalized' }) }))
  })

  it.each(['pointercancel', 'pointerleave'])('cancels activation when a gesture ends with %s', (type) => {
    const tap = vi.fn()
    const cancel = vi.fn()
    mountNative('<view bindtap="tap" bindcanceltap="cancel">Target</view>', {}, { tap, cancel })
    const target = document.querySelector<HTMLElement>('wx-view')!
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse' }))
    const cancelTarget = type === 'pointerleave' ? document.body : target
    cancelTarget.dispatchEvent(new PointerEvent(type, { pointerId: 1, bubbles: true, pointerType: 'mouse' }))
    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, pointerType: 'mouse' }))
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(tap).not.toHaveBeenCalled()
  })

  it('rejects aria-disabled submit, reset and navigation default actions', () => {
    const submit = vi.fn()
    const reset = vi.fn()
    const { page, reportError } = mountNative(`
      <form bindsubmit="submit" bindreset="reset">
        <button form-type="submit" aria-disabled="{{blocked}}">Submit</button>
        <button form-type="reset" aria-disabled="{{blocked}}">Reset</button>
        <navigator url="/pages/next/index" aria-disabled="{{blocked}}">Next</navigator>
      </form>
    `, { blocked: true }, { submit, reset })
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('wx-button > button'))
    for (const button of buttons) {
      button.focus()
      expect(document.activeElement).toBe(button)
      button.click()
    }
    document.querySelector<HTMLAnchorElement>('wx-navigator > a')!.click()
    expect(submit).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
    expect(reportError).not.toHaveBeenCalled()
    page.setData({ blocked: false })
    buttons[0]!.click()
    buttons[1]!.click()
    expect(submit).toHaveBeenCalledTimes(1)
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['checkbox', 'aria-checked'],
    ['combobox', 'aria-expanded'],
    ['option', 'aria-selected'],
  ])('renders one %s and updates its state, name and focus without restoring host semantics', async (role, stateAttribute) => {
    const tap = vi.fn()
    const { page, reportError } = mountNative(`
      <button role="${role}" ${stateAttribute}="{{state}}" aria-label="{{label}}"
        aria-disabled="{{disabled}}" disabled="{{disabled}}" tabindex="{{tabindex}}"
        title="{{title}}" bindtap="tap"><text>{{text}}</text></button>
    `, { state: false, label: 'Initial name', text: 'Visible name', disabled: false, tabindex: 0, title: 'Hint' }, { tap })
    const host = document.querySelector<HTMLElement>('wx-button')!
    const control = document.querySelector<HTMLButtonElement>('wx-button > button')!
    const expectSingleControl = () => {
      expect(Array.from(document.querySelectorAll(`[role="${role}"]`))).toEqual([control])
      expectWrapperWithoutSemantics(host)
      expect(control.closest('[aria-hidden="true"]')).toBeNull()
    }

    expectSingleControl()
    expect(control.getAttribute(stateAttribute)).toBe('false')
    expect(control.getAttribute('aria-label')).toBe('Initial name')
    expect(control.getAttribute('title')).toBe('Hint')
    expect(control.tabIndex).toBe(0)
    host.focus()
    expect(document.activeElement).not.toBe(host)
    control.focus()
    expect(document.activeElement).toBe(control)
    control.click()
    expect(tap).toHaveBeenCalledTimes(1)

    page.setData({ state: true, label: 'Updated name', title: 'Updated hint', tabindex: -1 })
    expectSingleControl()
    expect(control.getAttribute(stateAttribute)).toBe('true')
    expect(control.getAttribute('aria-label')).toBe('Updated name')
    expect(control.getAttribute('title')).toBe('Updated hint')
    expect(control.tabIndex).toBe(-1)

    page.setData({ disabled: true, tabindex: 0 })
    expectSingleControl()
    expect(control.disabled).toBe(true)
    expect(control.getAttribute('aria-disabled')).toBe('true')
    control.click()
    host.click()
    expect(tap).toHaveBeenCalledTimes(1)

    page.setData({ disabled: false, state: false, label: null, title: null, tabindex: null, text: 'Name from content' })
    expectSingleControl()
    expect(control.getAttribute(stateAttribute)).toBe('false')
    expect(control.hasAttribute('aria-label')).toBe(false)
    expect(control.hasAttribute('title')).toBe(false)
    expect(control.hasAttribute('tabindex')).toBe(false)
    expect(control.textContent).toBe('Name from content')
    expect(control.disabled).toBe(false)
    control.focus()
    expect(document.activeElement).toBe(control)
    control.click()
    expect(tap).toHaveBeenCalledTimes(2)

    // Flush DOM observers as well as the synchronous native property observers.
    await Promise.resolve()
    expectSingleControl()
    expect(reportError).not.toHaveBeenCalled()
  })

  it('preserves mixed checkbox state, required state and popup semantics on the real controls', () => {
    const { page, reportError } = mountNative(`
      <button role="checkbox" aria-checked="{{checked}}" aria-required="{{required}}">Notifications</button>
      <button role="combobox" aria-expanded="{{expanded}}" aria-haspopup="listbox">Destination</button>
      <input role="combobox" aria-label="Search destinations" aria-expanded="{{expanded}}"
        aria-haspopup="listbox" aria-autocomplete="list" />
    `, { checked: 'mixed', required: true, expanded: false })
    const checkbox = document.querySelector('button[role="checkbox"]')!
    const combo = document.querySelector('button[role="combobox"]')!
    const search = document.querySelector('input[role="combobox"]')!
    expect(checkbox.getAttribute('aria-checked')).toBe('mixed')
    expect(checkbox.getAttribute('aria-required')).toBe('true')
    for (const control of [combo, search]) {
      expect(control.getAttribute('aria-haspopup')).toBe('listbox')
      expect(control.getAttribute('aria-expanded')).toBe('false')
    }
    expect(search.getAttribute('aria-autocomplete')).toBe('list')
    page.setData({ checked: false, required: false, expanded: true })
    expect(checkbox.getAttribute('aria-checked')).toBe('false')
    expect(checkbox.getAttribute('aria-required')).toBe('false')
    expect(combo.getAttribute('aria-expanded')).toBe('true')
    expect(search.getAttribute('aria-expanded')).toBe('true')
    for (const host of document.querySelectorAll<HTMLElement>('wx-button, wx-input')) { expectWrapperWithoutSemantics(host) }
    expect(reportError).not.toHaveBeenCalled()
  })

  it.each([
    ['navigator', 'a', 'link', 'url="#destination"'],
    ['image', 'img', 'img', ''],
    ['form', 'form', 'form', ''],
    ['label', 'label', 'group', ''],
    ['rich-text', 'span', 'region', ''],
    ['textarea', 'textarea', 'textbox', ''],
  ])('keeps %s semantics on its rendered %s', (tag, controlTag, role, attributes) => {
    const { page, reportError } = mountNative(`
      <${tag} ${attributes} role="${role}" aria-label="{{label}}" tabindex="{{tabindex}}" />
    `, { label: 'Initial name', tabindex: 0 })
    const hosts = document.querySelectorAll<HTMLElement>(`wx-${tag}`)
    const control = document.querySelector(controlTag)!
    expect(Array.from(document.querySelectorAll(`[role="${role}"]`))).toEqual([control])
    expect(control.getAttribute('aria-label')).toBe('Initial name')
    hosts.forEach(expectWrapperWithoutSemantics)
    page.setData({ label: 'Updated name', tabindex: -1 })
    expect(Array.from(document.querySelectorAll(`[role="${role}"]`))).toEqual([control])
    expect(control.getAttribute('aria-label')).toBe('Updated name')
    expect(control.getAttribute('tabindex')).toBe('-1')
    hosts.forEach(expectWrapperWithoutSemantics)
    expect(reportError).not.toHaveBeenCalled()
  })

  it('retains semantics and keyboard activation on native views', () => {
    const tap = vi.fn()
    const { page, reportError } = mountNative(`
      <view role="button" aria-label="{{label}}" aria-expanded="{{expanded}}"
        aria-disabled="{{disabled}}" tabindex="0" bindtap="tap">Open panel</view>
    `, { label: 'Open', expanded: false, disabled: false }, { tap })
    const host = document.querySelector<HTMLElement>('wx-view')!
    expect(Array.from(document.querySelectorAll('[role="button"]'))).toEqual([host])
    expect(host.getAttribute('aria-expanded')).toBe('false')
    expect(host.getAttribute('aria-label')).toBe('Open')
    host.focus()
    expect(document.activeElement).toBe(host)
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    expect(tap).toHaveBeenCalledTimes(1)
    page.setData({ label: 'Close', expanded: true, disabled: true })
    expect(host.getAttribute('aria-expanded')).toBe('true')
    expect(host.getAttribute('aria-disabled')).toBe('true')
    expect(host.getAttribute('aria-label')).toBe('Close')
    host.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
    expect(tap).toHaveBeenCalledTimes(1)
    expect(reportError).not.toHaveBeenCalled()
  })

  it('keeps aria-disabled buttons focusable while rejecting control and wrapper taps', () => {
    const tap = vi.fn()
    const { page, reportError } = mountNative(`
      <button role="option" aria-disabled="{{disabled}}" bindtap="tap">Unavailable region</button>
    `, { disabled: 'true' }, { tap })
    const host = document.querySelector<HTMLElement>('wx-button')!
    const control = document.querySelector<HTMLButtonElement>('button[role="option"]')!
    expectWrapperWithoutSemantics(host)
    expect(control.disabled).toBe(false)
    expect(control.getAttribute('aria-disabled')).toBe('true')
    control.focus()
    expect(document.activeElement).toBe(control)
    control.click()
    host.click()
    expect(tap).not.toHaveBeenCalled()
    page.setData({ disabled: 'false' })
    expect(control.getAttribute('aria-disabled')).toBe('false')
    control.click()
    host.click()
    expect(tap).toHaveBeenCalledTimes(2)
    expectWrapperWithoutSemantics(host)
    expect(reportError).not.toHaveBeenCalled()
  })

  it('keeps DOM label, description and controlled-panel references on the semantic control', () => {
    document.body.innerHTML = `
      <span id="destination-label">Destination</span><span id="destination-help">Choose a region</span>
      <div id="destinations" role="listbox"></div><div id="regions" role="listbox"></div>
    `
    const { page, reportError } = mountNative(`
      <button role="combobox" aria-labelledby="{{labelledby}}" aria-describedby="{{describedby}}"
        aria-controls="{{controls}}" aria-expanded="{{expanded}}">Choose</button>
    `, { labelledby: 'destination-label', describedby: 'destination-help', controls: 'destinations', expanded: false })
    const control = document.querySelector<HTMLButtonElement>('button[role="combobox"]')!
    const host = document.querySelector<HTMLElement>('wx-button')!
    expect(document.getElementById(control.getAttribute('aria-labelledby')!)?.textContent).toBe('Destination')
    expect(document.getElementById(control.getAttribute('aria-describedby')!)?.textContent).toBe('Choose a region')
    expect(document.getElementById(control.getAttribute('aria-controls')!)?.getAttribute('role')).toBe('listbox')
    expectWrapperWithoutSemantics(host)
    page.setData({ controls: 'regions', expanded: true })
    expect(document.getElementById(control.getAttribute('aria-controls')!)).toBe(document.getElementById('regions'))
    expect(control.getAttribute('aria-expanded')).toBe('true')
    expectWrapperWithoutSemantics(host)
    page.setData({ labelledby: null, describedby: null, controls: null })
    expect(control.hasAttribute('aria-labelledby')).toBe(false)
    expect(control.hasAttribute('aria-describedby')).toBe(false)
    expect(control.hasAttribute('aria-controls')).toBe(false)
    expectWrapperWithoutSemantics(host)
    expect(reportError).not.toHaveBeenCalled()
  })

  it('keeps implicit labels associated with the real nested inputs', () => {
    const { page, reportError } = mountNative(`
      <label><text>{{label}}</text><input value="" /></label>
      <label><text>Notes</text><textarea /></label>
    `, { label: 'Name' })
    const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('wx-label > label'))
    const input = document.querySelector<HTMLInputElement>('wx-input > input')!
    const textarea = document.querySelector<HTMLTextAreaElement>('wx-textarea > textarea')!
    expect(labels[0]!.control).toBe(input)
    expect(labels[1]!.control).toBe(textarea)
    expect(Array.from(input.labels ?? [])).toEqual([labels[0]])
    expect(Array.from(textarea.labels ?? [])).toEqual([labels[1]])
    page.setData({ label: 'Contact name' })
    expect(labels[0]!.textContent).toBe('Contact name')
    expect(labels[0]!.control).toBe(input)
    expect(reportError).not.toHaveBeenCalled()
  })
  it('moves requested button focus without stealing it on unrelated updates', () => {
    const { page } = mountNative(`
      <button focus="{{first}}">{{label}}</button>
      <button focus="{{second}}" disabled="{{disabled}}">Second</button>
    `, { first: false, second: false, disabled: false, label: 'First' })
    const [first, second] = Array.from(document.querySelectorAll<HTMLButtonElement>('wx-button > button'))
    expect(document.activeElement).toBe(document.body)
    page.setData({ first: true })
    expect(document.activeElement).toBe(first)
    second!.focus()
    page.setData({ label: 'Renamed' })
    expect(document.activeElement).toBe(second)
    first!.focus()
    page.setData({ first: false, second: true })
    expect(document.activeElement).toBe(second)
    page.setData({ second: false, disabled: true })
    first!.focus()
    page.setData({ second: true })
    expect(document.activeElement).toBe(first)
  })
})
