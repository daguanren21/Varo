// @vitest-environment jsdom

import type { Component } from 'vue'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick, shallowRef } from 'vue'
import InputNumber from './components/ui/input-number.vue'
import DateField from './components/ui/v-date-field.vue'
import Divider from './components/ui/v-divider.vue'
import Drawer from './components/ui/v-drawer.vue'
import FormItem from './components/ui/v-form-item.vue'
import Form from './components/ui/v-form.vue'
import GridItem from './components/ui/v-grid-item.vue'
import List from './components/ui/v-list.vue'
import MenuItem from './components/ui/v-menu-item.vue'
import Menu from './components/ui/v-menu.vue'
import Picker from './components/ui/v-picker.vue'
import RadioGroup from './components/ui/v-radio-group.vue'
import Radio from './components/ui/v-radio.vue'
import Rate from './components/ui/v-rate.vue'
import Searchbar from './components/ui/v-searchbar.vue'
import Steps from './components/ui/v-steps.vue'
import SwipeCell from './components/ui/v-swipe-cell.vue'
import TabbarItem from './components/ui/v-tabbar-item.vue'
import Tabbar from './components/ui/v-tabbar.vue'

const { createWevuComponentDefinition } = createRequire(import.meta.url)(fileURLToPath(import.meta.resolve('wevu/internal-runtime')))

enableAutoUnmount(afterEach)

// Use Wevu's actual metadata conversion, including native properties overrides.
// Vue mounting alone leaves optional primitive props undefined, unlike WeChat.
function nativeProps(component: Component, supplied: Record<string, unknown> = {}) {
  const metadata = component as Component & { props?: unknown, properties?: unknown }
  const normalized = createWevuComponentDefinition({ ...metadata, allowNullPropInput: true }).__wevu_options.mpOptions
  const initial: Record<string, unknown> = {}
  for (const [name, definition] of Object.entries(normalized.properties ?? {})) {
    const property = definition as { type?: unknown, value?: unknown }
    if ('value' in property) { initial[name] = property.value }
    else if (property.type === String) { initial[name] = '' }
    else if (property.type === Number) { initial[name] = 0 }
    else if (property.type === Boolean) { initial[name] = false }
    else if (property.type === Array) { initial[name] = [] }
    else { initial[name] = null }
  }
  return { ...initial, ...supplied }
}

function nativeComponent(component: Component) {
  const metadata = component as Component & { props?: unknown, properties?: unknown }
  const normalized = createWevuComponentDefinition({ ...metadata, allowNullPropInput: true }).__wevu_options.mpOptions
  return { ...component, props: normalized.properties } as Component
}

function nativeMount(component: Component, supplied: Record<string, unknown> = {}) {
  return mount(nativeComponent(component), { props: nativeProps(component, supplied) })
}

describe('native initialization and state repairs', () => {
  it('retains decimals with omitted precision and preserves explicit zero precision', async () => {
    const decimal = nativeMount(InputNumber, { value: 1.25, step: 0.1 })
    expect(decimal.get<HTMLInputElement>('input').element.value).toBe('1.25')
    await decimal.get('.varo-input-number__plus').trigger('tap')
    expect(decimal.emitted('update:value')).toEqual([[1.35]])
    const integer = nativeMount(InputNumber, { value: 1.25, precision: 0 })
    expect(integer.get<HTMLInputElement>('input').element.value).toBe('1')
  })

  it.each([false, 0, ''])('distinguishes absent radio selection from %j', async (value) => {
    const wrapper = mount(nativeComponent(RadioGroup), {
      props: nativeProps(RadioGroup),
      slots: { default: () => h(nativeComponent(Radio), { value }) },
    })
    expect(wrapper.get('button').attributes('aria-checked')).toBe('false')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([[value]])
    await wrapper.setProps({ value })
    expect(wrapper.get('button').attributes('aria-checked')).toBe('true')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:value')).toHaveLength(1)
  })

  it.each([0, ''])('distinguishes absent tab selection from %j and suppresses reselect changes', async (name) => {
    const wrapper = mount(Tabbar, {
      props: nativeProps(Tabbar),
      slots: { default: () => h(TabbarItem, { name }) },
    })
    expect(wrapper.get('button').attributes('aria-current')).toBeUndefined()
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[name]])
    await wrapper.setProps({ modelValue: name })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  it.each([0, ''])('keeps menu selection actions while suppressing unchanged model %j', async (value) => {
    const selection = shallowRef<Record<string, unknown>>({})
    const wrapper = mount(Menu, {
      props: { activeName: 'menu' },
      slots: { default: () => h(MenuItem as Component, nativeProps(MenuItem, { name: 'menu', options: [{ text: 'Option', value }], ...selection.value })) },
    })
    const item = wrapper.getComponent(MenuItem)
    expect(item.get('.varo-menu__option').attributes('aria-selected')).toBe('false')
    await item.get('.varo-menu__option').trigger('click')
    expect(item.emitted('update:modelValue')).toEqual([[value]])
    selection.value = { modelValue: value }
    await nextTick()
    await item.get('.varo-menu__option').trigger('click')
    expect(item.emitted('update:modelValue')).toHaveLength(1)
    expect(item.emitted('select')).toHaveLength(2)
  })

  it('uses destination and color fallbacks and preserves explicit empty color and zero stacking', () => {
    for (const supplied of [{ to: '/page' }, { to: '/page', url: '' }]) {
      expect(nativeMount(GridItem, supplied).get('navigator').attributes('url')).toBe('/page')
    }
    expect(nativeMount(Divider, { borderColor: 'red' }).attributes('style')).toContain('--varo-divider-line-color: red')
    expect(nativeMount(Divider, { borderColor: 'red', lineColor: '' }).attributes('style') ?? '').not.toContain('red')
    expect(nativeMount(Drawer, { open: true }).get('.varo-drawer__overlay').attributes('style') ?? '').not.toContain('z-index')
    const zero = nativeMount(Drawer, { open: true, zIndex: 0 })
    expect(zero.get('.varo-drawer__overlay').attributes('style')).toContain('z-index: 0')
    expect(zero.get('.varo-drawer__content').attributes('style')).toContain('z-index: 1')
  })

  it.each(['disabled', 'readonly'])('blocks date changes after %s is enabled while open', async (flag) => {
    const wrapper = nativeMount(DateField, { value: '2025-01-01', visible: true })
    await wrapper.setProps({ [flag]: true })
    const picker = wrapper.getComponent(Picker)
    expect(picker.get<HTMLButtonElement>('.varo-picker__confirm').element.disabled).toBe(true)
    expect(picker.findAll('.varo-picker__option').every(option => option.attributes('disabled') !== undefined)).toBe(true)
    picker.vm.$emit('change', { value: [2026, 2, 3] })
    picker.vm.$emit('confirm', { value: [2026, 2, 3] })
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it.each(['cancel', 'disabled', 'stationary'])('does not commit a %s swipe', async (mode) => {
    const wrapper = nativeMount(SwipeCell, { leftWidth: 100 })
    const content = wrapper.get('.varo-swipe-cell__content')
    await content.trigger('touchstart', { touches: [{ clientX: 0 }] })
    if (mode !== 'stationary') { await content.trigger('touchmove', { touches: [{ clientX: 80 }] }) }
    if (mode === 'disabled') { await wrapper.setProps({ disabled: true }) }
    await content.trigger(mode === 'cancel' ? 'touchcancel' : 'touchend')
    expect(wrapper.attributes('data-open')).toBe('none')
    expect(content.attributes('style')).toContain('translate3d(0px, 0, 0)')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('guards disabled slot callbacks and suppresses redundant swipe transitions', async () => {
    const wrapper = mount(SwipeCell, {
      props: nativeProps(SwipeCell, { leftWidth: 100 }),
      slots: { default: ({ open, close }: { open: (side: 'left') => void, close: () => void }) => [
        h('button', { class: 'open', onClick: () => open('left') }),
        h('button', { class: 'close', onClick: close }),
      ] },
    })
    await wrapper.get('.close').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.get('.open').trigger('click')
    await wrapper.get('.open').trigger('click')
    expect(wrapper.emitted('open')).toHaveLength(1)
    await wrapper.setProps({ disabled: true })
    await wrapper.get('.close').trigger('click')
    expect(wrapper.attributes('data-open')).toBe('left')
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('updates inherited form error visibility reactively while keeping explicit overrides', async () => {
    const wrapper = mount(Form, {
      props: nativeProps(Form, { model: { inherited: '', hidden: '' }, showError: false }),
      slots: { default: () => [
        h(FormItem as Component, nativeProps(FormItem, { name: 'inherited', rules: 'required' })),
        h(FormItem as Component, nativeProps(FormItem, { name: 'hidden', rules: 'required', showError: false })),
      ] },
    })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.findAll('.varo-form-item__error')).toHaveLength(0)
    await wrapper.setProps({ showError: true })
    expect(wrapper.findAll('.varo-form-item__error')).toHaveLength(1)
    await wrapper.setProps({ showError: false })
    expect(wrapper.findAll('.varo-form-item__error')).toHaveLength(0)
  })

  it('suppresses repeated rating and standalone radio changes but permits clear', async () => {
    const rate = nativeMount(Rate, { value: 1, allowClear: false })
    await rate.get('button').trigger('click')
    expect(rate.emitted('change')).toBeUndefined()
    await rate.setProps({ allowClear: true })
    await rate.get('button').trigger('click')
    expect(rate.emitted('update:value')).toEqual([[0]])
    const radio = nativeMount(Radio, { checked: true, value: false })
    await radio.get('button').trigger('click')
    expect(radio.emitted('change')).toBeUndefined()
  })

  it.each([0, '', [0, '']])('keeps picker confirmation while suppressing unchanged value %j', async (value) => {
    const columns = Array.isArray(value)
      ? value.map(item => [{ label: String(item), value: item }])
      : [{ label: 'Option', value }]
    const wrapper = nativeMount(Picker, { value, columns, visible: true })
    await wrapper.get('.varo-picker__option').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('preserves step select and search cancel actions but guards disabled retry and search', async () => {
    const steps = nativeMount(Steps, { current: 0, clickable: true, items: ['First'] })
    await steps.get('button').trigger('click')
    expect(steps.emitted('update:current')).toBeUndefined()
    expect(steps.emitted('select')).toHaveLength(1)
    const list = nativeMount(List, { disabled: true, errorText: 'Retry', immediate: false })
    list.get('button').element.dispatchEvent(new MouseEvent('click'))
    expect(list.emitted('retry')).toBeUndefined()
    const search = nativeMount(Searchbar, { disabled: true, actionText: 'Cancel' })
    await search.get('form').trigger('submit')
    expect(search.emitted('search')).toBeUndefined()
    await search.get('.varo-searchbar__action').trigger('click')
    expect(search.emitted('cancel')).toHaveLength(1)
  })
})
