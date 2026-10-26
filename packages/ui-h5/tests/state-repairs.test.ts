import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import { VDateField } from '../src/date-field'
import { VForm, VFormItem } from '../src/form'
import { VGridItem } from '../src/grid'
import { VList } from '../src/list'
import { VMenu, VMenuItem } from '../src/menu'
import { VPicker } from '../src/picker'
import { VRate } from '../src/rate'
import { VSearchbar } from '../src/searchbar'
import { VSteps } from '../src/steps'
import { VSwipeCell } from '../src/swipe-cell'
import { VTabbar, VTabbarItem } from '../src/tabbar'

enableAutoUnmount(afterEach)

describe('state transition repair variants', () => {
  it.each(['disabled', 'readonly'] as const)('blocks an already-open date field when %s changes', async (flag) => {
    const wrapper = mount(VDateField, { props: { visible: true, value: '2025-01-01' } })
    await wrapper.setProps({ [flag]: true })
    const picker = wrapper.getComponent(VPicker)
    expect(picker.get<HTMLButtonElement>('.varo-picker__confirm').element.disabled).toBe(true)
    expect(picker.findAll('.varo-picker__option').every(option => option.attributes('disabled') !== undefined)).toBe(true)
    picker.vm.$emit('change', { value: [2026, 2, 3] })
    picker.vm.$emit('confirm', { value: [2026, 2, 3] })
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })

  it.each(['cancel', 'disabled', 'stationary'])('restores a %s gesture without publishing a transition', async (mode) => {
    const wrapper = mount(VSwipeCell, { props: { leftWidth: 100 } })
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

  it('guards slot callbacks, retains resting open state after cancellation and allows a real close', async () => {
    const wrapper = mount(VSwipeCell, {
      props: { leftWidth: 100 },
      slots: { default: ({ open, close }: { open: (side: 'left') => void, close: () => void }) => [
        h('button', { class: 'open', onClick: () => open('left') }),
        h('button', { class: 'close', onClick: close }),
      ] },
    })
    await wrapper.get('.open').trigger('click')
    await wrapper.get('.open').trigger('click')
    expect(wrapper.emitted('open')).toHaveLength(1)
    const content = wrapper.get('.varo-swipe-cell__content')
    await content.trigger('touchstart', { touches: [{ clientX: 100 }] })
    await content.trigger('touchmove', { touches: [{ clientX: 0 }] })
    await content.trigger('touchcancel')
    expect(wrapper.attributes('data-open')).toBe('left')
    await wrapper.setProps({ disabled: true })
    await wrapper.get('.close').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.setProps({ disabled: false })
    await wrapper.get('.close').trigger('click')
    expect(wrapper.attributes('data-open')).toBe('none')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('updates inherited form errors when showError changes without overriding item false', async () => {
    const wrapper = mount(VForm, {
      props: { model: { inherited: '', hidden: '' }, showError: false },
      slots: { default: () => [
        h(VFormItem, { name: 'inherited', rules: 'required' }),
        h(VFormItem, { name: 'hidden', rules: 'required', showError: false }),
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

  it('suppresses repeated rating changes while permitting clear', async () => {
    const wrapper = mount(VRate, { props: { value: 1, allowClear: false } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.setProps({ allowClear: true })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([[0]])
  })

  it.each([0, ''])('suppresses tab changes for controlled %j', async (modelValue) => {
    const wrapper = mount(VTabbar, {
      props: { modelValue },
      slots: { default: () => h(VTabbarItem, { name: modelValue }) },
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it.each([0, ''])('preserves menu reselect action for %j and closes', async (value) => {
    const wrapper = mount(VMenu, {
      props: { defaultActiveName: 'menu' },
      slots: { default: () => h(VMenuItem, { name: 'menu', modelValue: value, options: [{ text: 'Option', value }] }) },
    })
    const item = wrapper.getComponent(VMenuItem)
    await item.get('.varo-menu__option').trigger('click')
    expect(item.emitted('update:modelValue')).toBeUndefined()
    expect(item.emitted('select')).toHaveLength(1)
    expect(item.find('.varo-menu__option').exists()).toBe(false)
  })

  it.each([0, '', [0, '']])('preserves picker confirmation with unchanged %j', async (value) => {
    const columns = Array.isArray(value)
      ? value.map(item => [{ label: String(item), value: item }])
      : [{ label: 'Option', value }]
    const wrapper = mount(VPicker, { props: { value, columns, visible: true } })
    await wrapper.get('.varo-picker__option').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
  })

  it('preserves step activation, destination fallback, and cancel while blocking disabled work', async () => {
    const steps = mount(VSteps, { props: { current: 0, clickable: true, items: ['First'] } })
    await steps.get('button').trigger('click')
    expect(steps.emitted('update:current')).toBeUndefined()
    expect(steps.emitted('select')).toHaveLength(1)
    expect(mount(VGridItem, { props: { url: '', to: '/page' } }).get('a').attributes('href')).toBe('/page')
    const list = mount(VList, { props: { disabled: true, errorText: 'Retry', immediate: false } })
    list.get('button').element.dispatchEvent(new MouseEvent('click'))
    expect(list.emitted('retry')).toBeUndefined()
    const search = mount(VSearchbar, { props: { disabled: true, actionText: 'Cancel' } })
    await search.get('form').trigger('submit')
    expect(search.emitted('search')).toBeUndefined()
    await search.get('.varo-searchbar__action').trigger('click')
    expect(search.emitted('cancel')).toHaveLength(1)
  })
})
