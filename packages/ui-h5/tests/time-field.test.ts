import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { VPicker } from '../src/picker'
import { VTimeField } from '../src/time-field'
import { isTimeFieldValueValid, parseTimeFieldValue, timeFieldConstraints } from '../src/time-field-utils'

enableAutoUnmount(afterEach)

describe('VTimeField minute domain', () => {
  it.each(['9:00', '24:00', '12:60', '12:30:00', ' 12:30', '12:30Z', ''])('rejects non-HH:mm value %j', (value) => {
    expect(parseTimeFieldValue(value)).toBeUndefined()
  })

  it.each([0, 60, -1, 1.5, Number.NaN])('rejects invalid step %s', (step) => {
    expect(() => timeFieldConstraints(undefined, undefined, step)).toThrow(RangeError)
  })

  it('applies inclusive bounds, overnight windows and minute steps within each hour', () => {
    const overnight = timeFieldConstraints('22:30', '02:15', 15)
    for (const value of ['22:30', '23:45', '00:00', '02:15']) {
      expect(isTimeFieldValueValid(value, overnight)).toBe(true)
    }
    for (const value of ['22:15', '02:30', '12:00', '23:07']) {
      expect(isTimeFieldValueValid(value, overnight)).toBe(false)
    }
    expect(isTimeFieldValueValid('10:00', timeFieldConstraints('10:00', '10:00'))).toBe(true)
    expect(isTimeFieldValueValid('10:01', timeFieldConstraints('10:00', '10:00'))).toBe(false)
    expect(isTimeFieldValueValid('01:59', timeFieldConstraints(undefined, undefined, 59))).toBe(true)
    expect(isTimeFieldValueValid('01:07', timeFieldConstraints(undefined, undefined, 7))).toBe(true)
    expect(() => timeFieldConstraints('9:00')).toThrow(RangeError)
  })
})

describe('VTimeField controlled drafts', () => {
  it('keeps edits as drafts, cancels, and commits only after a valid confirmation', async () => {
    const wrapper = mount(VTimeField, { props: { value: '09:30', visible: true, minuteStep: 15 } })
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[3].trigger('click')
    expect(wrapper.emitted('change')).toEqual([['09:45']])
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.get('.varo-time-field__control').text()).toContain('09:30')
    await wrapper.get('.varo-picker__cancel').trigger('click')
    expect(wrapper.emitted('cancel')).toEqual([[]])
    expect(wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').text()).toBe('30')
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[3].trigger('click')
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([['09:45']])
    expect(wrapper.emitted('confirm')).toEqual([['09:45']])
    expect(wrapper.emitted('update:visible')).toEqual([[false], [false]])
    // The parent has accepted neither value nor visibility yet.
    expect(wrapper.get('.varo-time-field__control').text()).toContain('09:30')
    expect(wrapper.find('.varo-picker').exists()).toBe(true)
    expect(wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').text()).toBe('30')
    await wrapper.setProps({ value: '09:45', visible: false })
    expect(wrapper.get('.varo-time-field__control').text()).toContain('09:45')
    expect(wrapper.find('.varo-picker').exists()).toBe(false)
  })

  it('suppresses no-op changes and updates while retaining confirm intent', async () => {
    const wrapper = mount(VTimeField, { props: { value: '09:30', visible: true, minuteStep: 15 } })
    await wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').trigger('click')
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toEqual([['09:30']])
  })

  it.each(['09:07', 'not a time'])('preserves external %j on mount/open until explicitly confirmed', async (value) => {
    const wrapper = mount(VTimeField, { props: { value, minuteStep: 15 } })
    await wrapper.get('.varo-time-field__control').trigger('click')
    expect(wrapper.emitted('update:visible')).toEqual([[true]])
    expect(wrapper.find('.varo-picker').exists()).toBe(false)
    await wrapper.setProps({ visible: true })
    expect(wrapper.get('.varo-time-field__control').text()).toContain(value)
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.get('.varo-picker__cancel').trigger('click')
    expect(wrapper.get('.varo-time-field__control').text()).toContain(value)
  })

  it('discards drafts on external replacement and on close/reopen', async () => {
    const wrapper = mount(VTimeField, { props: { value: '09:30', visible: true, minuteStep: 15 } })
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[3].trigger('click')
    await wrapper.setProps({ value: '12:15' })
    expect(wrapper.findAll('.varo-picker__column')[0].get('[data-active="true"]').text()).toBe('12')
    expect(wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').text()).toBe('15')
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[3].trigger('click')
    await wrapper.setProps({ visible: false })
    await wrapper.setProps({ visible: true })
    expect(wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').text()).toBe('15')
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })

  it('reconciles dependent minutes while validating the complete value at commit', async () => {
    const wrapper = mount(VTimeField, { props: { value: '09:45', visible: true, min: '09:30', max: '10:15', minuteStep: 15 } })
    await wrapper.findAll('.varo-picker__column')[0].findAll('button')[10].trigger('click')
    expect(wrapper.emitted('change')).toEqual([['10:00']])
    expect(wrapper.findAll('.varo-picker__column')[1].get('[data-active="true"]').text()).toBe('00')
    const picker = wrapper.getComponent(VPicker)
    picker.vm.$emit('confirm', { value: [10, 30] })
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('update:visible')).toBeUndefined()
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([['10:00']])
  })

  it('renders and commits an overnight choice', async () => {
    const wrapper = mount(VTimeField, { props: { value: '23:45', visible: true, min: '22:30', max: '02:15', minuteStep: 15 } })
    expect(wrapper.findAll('.varo-picker__column')[0].findAll('button')[12].attributes('disabled')).toBeDefined()
    await wrapper.findAll('.varo-picker__column')[0].findAll('button')[1].trigger('click')
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[1].trigger('click')
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([['01:15']])
  })

  it('disables confirmation when constraints become unavailable, then recovers', async () => {
    const wrapper = mount(VTimeField, { props: { value: '10:00', visible: true, minuteStep: 15 } })
    await wrapper.setProps({ min: '10:01', max: '10:14' })
    expect(wrapper.get<HTMLButtonElement>('.varo-picker__confirm').element.disabled).toBe(true)
    wrapper.getComponent(VPicker).vm.$emit('confirm', { value: [10, 0] })
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('update:visible')).toBeUndefined()
    expect(wrapper.get('.varo-time-field__control').text()).toContain('10:00')
    await wrapper.setProps({ max: '10:15' })
    expect(wrapper.get<HTMLButtonElement>('.varo-picker__confirm').element.disabled).toBe(false)
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([['10:15']])
  })

  it.each(['disabled', 'readonly'] as const)('guards %s even when the parent forces visibility', async (state) => {
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
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
    await wrapper.setProps({ visible: false })
    wrapper.get('.varo-time-field__control').element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
  })

  it('clears through parent acceptance and does not clear an already empty value', async () => {
    const wrapper = mount(VTimeField, { props: { value: '09:30', clearable: true } })
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
