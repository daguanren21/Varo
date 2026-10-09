// @vitest-environment jsdom

import type { template } from 'glass-easel'
import type { NativeArtifactBundle, NativeGlobals } from '../src/runtime/artifacts.ts'
import { compileFunction } from 'node:vm'
import { TmplGroup } from 'glass-easel-template-compiler'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { mountWeappWebPreview } from '../src/runtime/mount.ts'
import { nativeTemplates } from '../src/runtime/native-templates.ts'

type Definition = Record<string, unknown>
interface Instance {
  data: Record<string, unknown>
  setData: (data: Record<string, unknown>) => void
}
interface FormEvent {
  detail: unknown
}
interface ObservedFormEvent {
  type: 'submit' | 'reset'
  form: unknown
  detail: unknown
}

function compileTemplates(sources: Record<string, string>): NativeArtifactBundle['builtinTemplates'] {
  const group = new TmplGroup()
  try {
    for (const [path, source] of Object.entries(sources)) { group.addTmpl(path, source) }
    const groupList = compileFunction(`return ${group.getTmplGenObjectGroups()}`)() as NonNullable<template.ComponentTemplate['groupList']>
    return Object.fromEntries(Object.keys(sources).map(path => [path, { groupList, content: groupList[path] }]))
  }
  finally {
    group.free()
  }
}

function register(globals: NativeGlobals, kind: 'App' | 'Component' | 'Behavior' | 'Page', definition: Definition) {
  const constructor = globals[kind] as (definition: Definition) => unknown
  return constructor(definition)
}

let builtinTemplates: NativeArtifactBundle['builtinTemplates']
const cleanups: Array<() => void> = []

beforeAll(() => {
  builtinTemplates = compileTemplates(nativeTemplates)
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) { cleanup() }
  document.body.replaceChildren()
})

async function mountFormFixture(behaviorLocation: 'component' | 'behavior' = 'component', insideForm = true) {
  const events: ObservedFormEvent[] = []
  const lifetimes: string[] = []
  const errors: unknown[] = []
  let taps = 0
  const instances: { page?: Instance } = {}
  const action = '<form-action action="{{action}}" disabled="{{disabled}}" cancel="{{cancel}}" target="{{target}}" />'
  const templates = compileTemplates({
    'pages/form': `
      <form-shell form-id="profile" prevent-reset="{{preventReset}}">
        <input name="customer" value="Ada" />
        <textarea name="note" value="Hello" />
        <input name="ignored" value="secret" disabled="{{true}}" />
        <input value="unnamed" />
        ${insideForm ? action : ''}
        <button
          class="ordinary"
          role="{{buttonSemantics.role}}"
          aria-label="{{buttonSemantics.label}}"
          aria-busy="{{buttonSemantics.busy}}"
          aria-checked="{{buttonSemantics.checked}}"
          aria-disabled="{{buttonSemantics.disabled}}"
          aria-pressed="{{buttonSemantics.pressed}}"
          aria-readonly="{{buttonSemantics.readonly}}"
          tabindex="{{buttonSemantics.tabindex}}"
          hidden="{{buttonHidden}}"
        >Ordinary</button>
      </form-shell>
      <form-shell form-id="other"><input name="other" value="Elsewhere" /></form-shell>
      ${insideForm ? '' : action}
    `,
    'components/form-shell': '<form id="{{formId}}" bindsubmit="submitted" bindreset="reset"><slot /></form>',
    'components/form-action': '<view><button class="action" form-type="{{action}}" form="{{target}}" disabled="{{disabled}}" bindtap="tap">{{caption}}</button></view>',
  })
  const artifacts: NativeArtifactBundle = {
    digest: 'native-form-behavior',
    pages: { form: 'pages/form' },
    builtinTemplates,
    styles: {},
    assets: {},
    components: {
      'pages/form': {
        config: { usingComponents: { 'form-shell': '/components/form-shell', 'form-action': '/components/form-action' } },
        template: templates['pages/form'],
        styleScope: '',
      },
      'components/form-shell': {
        config: { component: true },
        template: templates['components/form-shell'],
        styleScope: '',
      },
      'components/form-action': {
        config: { component: true },
        template: templates['components/form-action'],
        styleScope: '',
      },
    },
    modules: {
      'app.js': (_require, _module, _exports, globals) => { register(globals, 'App', {}) },
      'pages/form.js': (_require, _module, _exports, globals) => {
        register(globals, 'Component', {
          data: {
            action: 'submit',
            disabled: false,
            cancel: false,
            target: '',
            preventReset: false,
            buttonHidden: false,
            buttonSemantics: {
              role: null,
              label: null,
              busy: null,
              checked: null,
              disabled: null,
              pressed: null,
              readonly: null,
              tabindex: null,
            },
          },
          lifetimes: { created(this: Instance) { instances.page = this } },
        })
      },
      'components/form-shell.js': (_require, _module, _exports, globals) => {
        register(globals, 'Component', {
          properties: { formId: String, preventReset: Boolean },
          methods: {
            submitted(this: Instance, event: FormEvent) {
              events.push({ type: 'submit', form: this.data.formId, detail: event.detail })
            },
            reset(this: Instance, event: FormEvent) {
              if (this.data.preventReset) { return false }
              events.push({ type: 'reset', form: this.data.formId, detail: event.detail })
            },
          },
        })
      },
      'components/form-action.js': (_require, _module, _exports, globals) => {
        const shared = register(globals, 'Behavior', {
          properties: { caption: String },
          methods: {
            tap(this: Instance) {
              taps += 1
              if (this.data.cancel) { return false }
            },
          },
          lifetimes: {
            created() { lifetimes.push('behavior:created') },
            attached() { lifetimes.push('behavior:attached') },
            ready(this: Instance) {
              lifetimes.push('behavior:ready')
              this.setData({ caption: 'Ready to send' })
            },
            detached() { lifetimes.push('behavior:detached') },
          },
        })
        const supported = behaviorLocation === 'behavior'
          ? register(globals, 'Behavior', { behaviors: [shared, 'wx://form-field-button'] })
          : 'wx://form-field-button'
        register(globals, 'Component', {
          behaviors: [shared, supported, shared],
          properties: { action: String, disabled: Boolean, cancel: Boolean, target: String },
          lifetimes: {
            created() { lifetimes.push('component:created') },
            attached() { lifetimes.push('component:attached') },
            ready() { lifetimes.push('component:ready') },
            detached() { lifetimes.push('component:detached') },
          },
        })
      },
    },
  }
  const mount = document.createElement('div')
  document.body.append(mount)
  const abort = new AbortController()
  cleanups.push(() => abort.abort())
  const close = await mountWeappWebPreview({
    artifacts,
    mount,
    session: { pagePath: 'pages/form', signal: abort.signal, ready() {}, fail(error) { errors.push(error) } },
  })
  const instance = instances.page
  if (!instance) { throw new Error('The native page did not initialize') }
  const button = mount.querySelector<HTMLButtonElement>('button[type="submit"]')
  const forms = mount.querySelectorAll('form')
  const input = mount.querySelector<HTMLInputElement>('input[name="customer"]')
  const textarea = mount.querySelector<HTMLTextAreaElement>('textarea[name="note"]')
  if (!button || forms.length !== 2 || !input || !textarea) {
    throw new Error(`Native form fixture missing controls: ${JSON.stringify({
      button: Boolean(button),
      forms: forms.length,
      inputs: [...mount.querySelectorAll('input, textarea')].map(control => control.outerHTML),
      errors: errors.map(String),
    })}`)
  }
  return { button, forms, input, textarea, mount, events, errors, lifetimes, close, instance, getTaps: () => taps }
}

function pointerActivate(button: HTMLElement, click = true) {
  const options = { bubbles: true, cancelable: true, button: 0, detail: 1 }
  button.dispatchEvent(new MouseEvent('mousedown', options))
  button.dispatchEvent(new MouseEvent('mouseup', options))
  if (click) { button.dispatchEvent(new MouseEvent('click', options)) }
}

function touchActivate(button: HTMLButtonElement) {
  const touch: Touch = {
    identifier: 1,
    target: button,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    screenX: 0,
    screenY: 0,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  }
  button.dispatchEvent(new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [touch],
    changedTouches: [touch],
  }))
  button.dispatchEvent(new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    touches: [],
    changedTouches: [touch],
  }))
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }))
}

describe('native form-field-button behavior', () => {
  it.each(['component', 'behavior'] as const)('submits real form values through a %s declaration without replacing ordinary behaviors', async (location) => {
    const fixture = await mountFormFixture(location)
    expect(fixture.button.textContent).toBe('Ready to send')
    expect(fixture.button.form).toBe(fixture.forms[0])
    expect(fixture.lifetimes).toEqual([
      'behavior:created',
      'component:created',
      'behavior:attached',
      'component:attached',
      'behavior:ready',
      'component:ready',
    ])
    fixture.input.value = 'Grace'
    fixture.input.dispatchEvent(new Event('input', { bubbles: true }))
    fixture.textarea.value = 'Updated note'
    fixture.textarea.dispatchEvent(new Event('input', { bubbles: true }))
    fixture.button.click()
    expect(fixture.events).toEqual([
      { type: 'submit', form: 'profile', detail: { value: { customer: 'Grace', note: 'Updated note' }, formId: '' } },
    ])
    expect(fixture.getTaps()).toBe(1)
    expect(fixture.errors).toEqual([])
    fixture.close()
    expect(fixture.lifetimes.slice(-2)).toEqual(['behavior:detached', 'component:detached'])
  })

  it('keeps button semantics on the control and removes absent states without inventing a toggle', async () => {
    const fixture = await mountFormFixture()
    const button = fixture.mount.querySelector<HTMLButtonElement>('wx-button.ordinary > button')
    const host = button?.parentElement
    if (!button || !host) { throw new Error('Missing ordinary native button') }
    const attributes = ['role', 'aria-label', 'aria-busy', 'aria-checked', 'aria-disabled', 'aria-pressed', 'aria-readonly', 'tabindex']
    for (const element of [host, button]) {
      for (const name of attributes) { expect(element.getAttribute(name)).toBeNull() }
    }
    expect(button.textContent).toBe('Ordinary')

    fixture.instance.setData({
      buttonSemantics: {
        role: 'switch',
        label: 'Notifications',
        busy: false,
        checked: false,
        disabled: false,
        readonly: false,
        tabindex: 0,
      },
    })
    expect(button.getAttribute('role')).toBe('switch')
    expect(button.getAttribute('aria-label')).toBe('Notifications')
    expect(button.getAttribute('tabindex')).toBe('0')
    for (const name of ['aria-busy', 'aria-checked', 'aria-disabled', 'aria-readonly']) {
      expect(button.getAttribute(name)).toBe('false')
    }
    expect(button.hasAttribute('aria-pressed')).toBe(false)
    for (const name of attributes) { expect(host.getAttribute(name)).toBeNull() }
    fixture.instance.setData({ 'buttonSemantics.checked': true })
    expect(button.getAttribute('aria-checked')).toBe('true')

    fixture.instance.setData({ buttonSemantics: { role: 'button', label: 'Pin', pressed: false } })
    expect(button.getAttribute('aria-pressed')).toBe('false')
    expect(button.hasAttribute('aria-checked')).toBe(false)
    fixture.instance.setData({ 'buttonSemantics.pressed': true })
    expect(button.getAttribute('aria-pressed')).toBe('true')

    for (const absent of [null, undefined, '']) {
      fixture.instance.setData({
        buttonSemantics: {
          role: absent,
          label: absent,
          busy: absent,
          checked: absent,
          disabled: absent,
          pressed: absent,
          readonly: absent,
          tabindex: absent,
        },
      })
      for (const element of [host, button]) {
        for (const name of attributes) { expect(element.getAttribute(name)).toBeNull() }
      }
    }

    fixture.instance.setData({ buttonHidden: true })
    expect(host.hidden).toBe(true)
    expect(button.hidden).toBe(true)
    fixture.instance.setData({ buttonHidden: false })
    expect(host.hidden).toBe(false)
    expect(button.hidden).toBe(false)
    expect(fixture.errors).toEqual([])
  })

  it('honors disabled controls, canceled taps and non-submit actions before invoking the form', async () => {
    const fixture = await mountFormFixture()
    const host = fixture.button.closest('wx-button')
    if (!(host instanceof HTMLElement)) { throw new TypeError('Missing native button host') }
    fixture.instance.setData({ disabled: true })
    expect(fixture.button.disabled).toBe(true)
    expect(host.hasAttribute('disabled')).toBe(true)
    pointerActivate(fixture.button)
    touchActivate(fixture.button)
    pointerActivate(host)
    host.click()
    fixture.button.click()
    expect(fixture.getTaps()).toBe(0)
    expect(fixture.events).toEqual([])

    fixture.instance.setData({ disabled: false, cancel: true })
    expect(fixture.button.disabled).toBe(false)
    expect(host.hasAttribute('disabled')).toBe(false)
    fixture.button.click()
    expect(fixture.getTaps()).toBe(1)
    expect(fixture.events).toEqual([])

    fixture.instance.setData({ cancel: false, action: '' })
    fixture.button.click()
    const ordinary = [...fixture.mount.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Ordinary')
    if (!ordinary) { throw new Error('Missing ordinary form button') }
    ordinary.click()
    expect(fixture.events).toEqual([])

    fixture.instance.setData({ action: 'submit' })
    fixture.button.click()
    expect(fixture.events).toEqual([
      { type: 'submit', form: 'profile', detail: { value: { customer: 'Ada', note: 'Hello' }, formId: '' } },
    ])
    expect(fixture.errors).toEqual([])
  })

  it.each(['submit', 'reset'] as const)('carries pointer tap cancellation through the following %s click', async (action) => {
    const fixture = await mountFormFixture('behavior')
    fixture.instance.setData({ action, cancel: true })
    fixture.input.value = 'Edited customer'
    fixture.button.addEventListener('click', event => event.stopPropagation())
    pointerActivate(fixture.button)
    expect(fixture.getTaps()).toBe(1)
    expect(fixture.events).toEqual([])
    expect(fixture.input.value).toBe('Edited customer')

    fixture.instance.setData({ cancel: false })
    pointerActivate(fixture.button)
    expect(fixture.getTaps()).toBe(2)
    expect(fixture.events).toEqual([action === 'submit'
      ? { type: 'submit', form: 'profile', detail: { value: { customer: 'Edited customer', note: 'Hello' }, formId: '' } }
      : { type: 'reset', form: 'profile', detail: {} }])
    expect(fixture.input.value).toBe(action === 'reset' ? '' : 'Edited customer')
  })

  it('does not carry a missing canceled click into a later pointer or keyboard activation', async () => {
    const fixture = await mountFormFixture()
    fixture.instance.setData({ cancel: true })
    pointerActivate(fixture.button, false)
    fixture.instance.setData({ cancel: false })
    pointerActivate(fixture.button)
    expect(fixture.events).toHaveLength(1)

    fixture.instance.setData({ cancel: true })
    pointerActivate(fixture.button, false)
    fixture.instance.setData({ cancel: false })
    fixture.button.click()
    expect(fixture.events).toEqual([
      { type: 'submit', form: 'profile', detail: { value: { customer: 'Ada', note: 'Hello' }, formId: '' } },
      { type: 'submit', form: 'profile', detail: { value: { customer: 'Ada', note: 'Hello' }, formId: '' } },
    ])
    expect(fixture.getTaps()).toBe(4)
  })

  it('does not dispatch a new mount through a disposed backend', async () => {
    const previous = await mountFormFixture()
    previous.close()
    const current = await mountFormFixture()
    pointerActivate(current.button)
    expect(previous.getTaps()).toBe(0)
    expect(current.getTaps()).toBe(1)
    expect(current.events).toEqual([
      { type: 'submit', form: 'profile', detail: { value: { customer: 'Ada', note: 'Hello' }, formId: '' } },
    ])
  })

  it.each(['submit', 'reset'] as const)('routes touch %s activation to the live mount after disposal', async (action) => {
    const previous = await mountFormFixture()
    previous.close()
    const current = await mountFormFixture()
    current.instance.setData({ action, cancel: true })
    current.input.value = 'Keep edited value'
    touchActivate(current.button)
    expect({ taps: current.getTaps(), events: current.events, value: current.input.value }).toEqual({
      taps: 1,
      events: [],
      value: 'Keep edited value',
    })

    current.instance.setData({ cancel: false })
    touchActivate(current.button)
    expect(previous.getTaps()).toBe(0)
    expect(current.getTaps()).toBe(2)
    expect(current.events).toEqual([action === 'submit'
      ? { type: 'submit', form: 'profile', detail: { value: { customer: 'Keep edited value', note: 'Hello' }, formId: '' } }
      : { type: 'reset', form: 'profile', detail: {} }])
    expect(current.input.value).toBe(action === 'reset' ? '' : 'Keep edited value')
  })

  it('resets the associated DOM fields once and retains reset cancellation', async () => {
    const fixture = await mountFormFixture()
    fixture.input.value = 'Edited customer'
    fixture.textarea.value = 'Edited note'
    fixture.instance.setData({ action: 'reset', disabled: true })
    fixture.button.click()
    expect(fixture.input.value).toBe('Edited customer')
    expect(fixture.events).toEqual([])

    fixture.instance.setData({ disabled: false, preventReset: true })
    fixture.button.click()
    expect(fixture.input.value).toBe('Edited customer')
    expect(fixture.events).toEqual([])

    fixture.instance.setData({ preventReset: false })
    fixture.button.click()
    expect(fixture.input.value).toBe('')
    expect(fixture.textarea.value).toBe('')
    expect(fixture.events).toEqual([{ type: 'reset', form: 'profile', detail: {} }])
    fixture.instance.setData({ action: 'submit' })
    fixture.button.click()
    expect(fixture.events[1]).toEqual({ type: 'submit', form: 'profile', detail: { value: { customer: '', note: '' }, formId: '' } })
    expect(fixture.errors).toEqual([])
  })

  it('uses the real explicit form owner instead of submitting an unrelated ancestor', async () => {
    const fixture = await mountFormFixture()
    // Native IDs are logical/scoped; this browser-only association needs a DOM ID.
    fixture.forms[1].id = 'explicit-form-owner'
    fixture.instance.setData({ target: fixture.forms[1].id })
    expect(fixture.button.form).toBe(fixture.forms[1])
    fixture.button.click()
    expect(fixture.events).toEqual([
      { type: 'submit', form: 'other', detail: { value: { other: 'Elsewhere' }, formId: '' } },
    ])
    fixture.instance.setData({ target: '' })
    expect(fixture.button.form).toBe(fixture.forms[0])
    fixture.button.click()
    expect(fixture.events[1]).toEqual({ type: 'submit', form: 'profile', detail: { value: { customer: 'Ada', note: 'Hello' }, formId: '' } })
    expect(fixture.errors).toEqual([])
  })

  it('does not invent an association for a custom button outside any form', async () => {
    const fixture = await mountFormFixture('behavior', false)
    expect(fixture.button.form).toBeNull()
    fixture.button.click()
    fixture.instance.setData({ action: 'reset' })
    fixture.button.click()
    expect(fixture.events).toEqual([])
    expect(fixture.input.value).toBe('Ada')
    expect(fixture.errors).toEqual([])
  })

  it.each(['Component', 'Behavior', 'Page'] as const)('rejects an unsupported built-in declaration at the %s boundary', async (kind) => {
    const path = 'pages/unsupported'
    const templates = compileTemplates({ [path]: '<view />' })
    const abort = new AbortController()
    cleanups.push(() => abort.abort())
    const mount = document.createElement('div')
    document.body.append(mount)
    const artifacts: NativeArtifactBundle = {
      digest: 'unsupported-behavior',
      pages: { unsupported: path },
      builtinTemplates,
      styles: {},
      assets: {},
      components: { [path]: { config: {}, template: templates[path], styleScope: '' } },
      modules: {
        'app.js': (_require, _module, _exports, globals) => { register(globals, 'App', {}) },
        [`${path}.js`]: (_require, _module, _exports, globals) => {
          register(globals, kind, { behaviors: ['wx://unsupported-behavior'] })
        },
      },
    }
    await expect(mountWeappWebPreview({
      artifacts,
      mount,
      session: { pagePath: path, signal: abort.signal, ready() {}, fail(error) { throw error } },
    })).rejects.toThrow(/wx:\/\/unsupported-behavior/)
  })
})
