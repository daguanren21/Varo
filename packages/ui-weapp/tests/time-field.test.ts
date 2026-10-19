import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import VPicker from '../native/src/components/ui/v-picker.vue'
import VTimeField from '../native/src/components/ui/v-time-field.vue'

enableAutoUnmount(afterEach)

describe('native picker confirmation constraints', () => {
  it.each([
    { columns: [] },
    { columns: [{ label: 'Disabled', value: 0, disabled: true }] },
    { columns: [[{ label: 'A', value: 'a' }], []] },
  ])('never confirms an absent or disabled option for %j', ({ columns }) => {
    const wrapper = mount(VPicker, { props: { columns, visible: true } })
    const button = wrapper.get<HTMLButtonElement>('.varo-picker__confirm')
    expect(button.element.disabled).toBe(true)
    button.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('update:visible')).toBeUndefined()
  })

  it('updates confirmation availability as columns and the domain guard change', async () => {
    const wrapper = mount(VPicker, { props: { columns: [{ label: 'A', value: 'a' }], visible: true, confirmDisabled: true } })
    expect(wrapper.get<HTMLButtonElement>('.varo-picker__confirm').element.disabled).toBe(true)
    await wrapper.setProps({ confirmDisabled: false, columns: [{ label: 'A', value: 'a', disabled: true }] })
    expect(wrapper.get<HTMLButtonElement>('.varo-picker__confirm').element.disabled).toBe(true)
    await wrapper.setProps({ columns: [{ label: 'B', value: 'b' }] })
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('confirm')).toEqual([[{ option: { label: 'B', value: 'b' }, value: 'b' }]])
    expect(wrapper.emitted('update:value')).toEqual([['b']])
  })
})

describe('native VTimeField controlled drafts', () => {
  it('uses a single scalar event payload and retains parent-owned values', async () => {
    const wrapper = mount(VTimeField, { props: { value: '09:30', visible: true, minuteStep: 15 } })
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[3].trigger('click')
    expect(wrapper.emitted('change')).toEqual([['09:45']])
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.get('.varo-time-field__control').text()).toContain('09:30')
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([['09:45']])
    expect(wrapper.emitted('confirm')).toEqual([['09:45']])
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
    expect(wrapper.get('.varo-time-field__control').text()).toContain('09:30')
    expect(wrapper.find('.varo-picker').exists()).toBe(true)
    expect(wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').text()).toBe('30')
    await wrapper.setProps({ value: '09:45', visible: false })
    expect(wrapper.get('.varo-time-field__control').text()).toContain('09:45')
    expect(wrapper.find('.varo-picker').exists()).toBe(false)
  })

  it('cancels and follows parent replacement without leaking drafts', async () => {
    const wrapper = mount(VTimeField, { props: { value: '09:30', visible: true, minuteStep: 15 } })
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[3].trigger('click')
    await wrapper.get('.varo-picker__cancel').trigger('click')
    expect(wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').text()).toBe('30')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    await wrapper.setProps({ value: '12:15' })
    expect(wrapper.findAll('.varo-picker__column')[0].get('[data-active="true"]').text()).toBe('12')
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[3].trigger('click')
    await wrapper.setProps({ visible: false })
    await wrapper.setProps({ visible: true })
    expect(wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').text()).toBe('15')
  })

  it('suppresses no-op selection and commit mutations', async () => {
    const wrapper = mount(VTimeField, { props: { value: '09:30', visible: true, minuteStep: 15 } })
    await wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').trigger('click')
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toEqual([['09:30']])
  })

  it.each(['09:07', 'invalid'])('preserves external %j on open and cancel', async (value) => {
    const wrapper = mount(VTimeField, { props: { value, minuteStep: 15 } })
    await wrapper.get('.varo-time-field__control').trigger('click')
    expect(wrapper.emitted('update:visible')).toEqual([[true]])
    expect(wrapper.find('.varo-picker').exists()).toBe(false)
    await wrapper.setProps({ visible: true })
    expect(wrapper.get('.varo-time-field__control').text()).toContain(value)
    await wrapper.get('.varo-picker__cancel').trigger('click')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('selects wrapping midnight choices and rejects a complete out-of-range value', async () => {
    const wrapper = mount(VTimeField, { props: { value: '23:45', visible: true, min: '22:30', max: '02:15', minuteStep: 15 } })
    wrapper.getComponent(VPicker).vm.$emit('confirm', { value: [22, 0] })
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('update:visible')).toBeUndefined()
    expect(wrapper.findAll('.varo-picker__column')[0].findAll('button')[12].attributes('disabled')).toBeDefined()
    await wrapper.findAll('.varo-picker__column')[0].findAll('button')[2].trigger('click')
    expect(wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').text()).toBe('00')
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[1].trigger('click')
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([['02:15']])
  })

  it('handles an unavailable step window and re-evaluates new bounds', async () => {
    const wrapper = mount(VTimeField, { props: { value: '10:07', visible: true, min: '10:01', max: '10:14', minuteStep: 15 } })
    expect(wrapper.get<HTMLButtonElement>('.varo-picker__confirm').element.disabled).toBe(true)
    expect(wrapper.get('.varo-time-field__control').text()).toContain('10:07')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    await wrapper.setProps({ max: '10:15' })
    expect(wrapper.get<HTMLButtonElement>('.varo-picker__confirm').element.disabled).toBe(false)
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([['10:15']])
  })

  it.each(['disabled', 'readonly'] as const)('keeps a forced-open %s field inert', async (state) => {
    const wrapper = mount(VTimeField, { props: { value: '09:30', visible: true, clearable: true, [state]: true } })
    const picker = wrapper.getComponent(VPicker)
    picker.vm.$emit('change', { value: [10, 0] })
    picker.vm.$emit('confirm', { value: [10, 0] })
    wrapper.get('.varo-time-field__clear').element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.get<HTMLButtonElement>('.varo-picker__confirm').element.disabled).toBe(true)
    expect(wrapper.findAll('.varo-picker__option').every(option => option.attributes('disabled') !== undefined)).toBe(true)
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toBeUndefined()
    await wrapper.get('.varo-picker__cancel').trigger('click')
    expect(wrapper.emitted('cancel')).toEqual([[]])
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
    await wrapper.setProps({ visible: false })
    wrapper.get('.varo-time-field__control').element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
  })

  it('preserves empty and null controlled props and clears through parent acceptance', async () => {
    const wrapper = mount(VTimeField, { props: { value: null, visible: null, min: null, max: null, clearable: true } })
    expect(wrapper.get('.varo-time-field__control').text()).toContain('Select time')
    expect(wrapper.find('.varo-picker').exists()).toBe(false)
    await wrapper.setProps({ value: '09:30', visible: false })
    await wrapper.get('.varo-time-field__clear').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([['']])
    expect(wrapper.emitted('change')).toEqual([['']])
    expect(wrapper.emitted('clear')).toEqual([[]])
    expect(wrapper.get('.varo-time-field__control').text()).toContain('09:30')
    await wrapper.setProps({ value: '' })
    expect(wrapper.find('.varo-time-field__clear').exists()).toBe(false)
    expect(wrapper.get('.varo-time-field__control').text()).toContain('Select time')
  })
})
