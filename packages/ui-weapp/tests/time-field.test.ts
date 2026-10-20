import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, reactive } from 'vue'
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

  it.each(['b', 0, ''])('resolves parent value %j when columns arrive before editing and after cancellation', async (value) => {
    const columns = [{ label: 'A', value: 'a' }, { label: 'B', value }]
    const wrapper = mount(VPicker, { props: { columns: [], value, visible: true } })
    await wrapper.setProps({ columns })
    expect(wrapper.get('.varo-picker__option[data-active="true"]').text()).toBe('B')
    await wrapper.findAll('.varo-picker__option')[0].trigger('click')
    await wrapper.setProps({ columns: [] })
    await wrapper.setProps({ columns })
    expect(wrapper.get('.varo-picker__option[data-active="true"]').text()).toBe('A')
    await wrapper.get('.varo-picker__cancel').trigger('click')
    expect(wrapper.get('.varo-picker__option[data-active="true"]').text()).toBe('B')
    await wrapper.setProps({ columns: [columns[0]] })
    await wrapper.setProps({ columns })
    expect(wrapper.get('.varo-picker__option[data-active="true"]').text()).toBe('B')
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })

  it.each(['b', 0, ''])('retains the valid draft %j through unrelated mutations and column replacement', async (draft) => {
    const columns = reactive([
      { label: 'A', value: 'a', disabled: false },
      { label: 'B', value: draft, disabled: false },
      { label: 'C', value: 'c', disabled: false },
    ])
    const wrapper = mount(VPicker, { props: { columns, value: 'a', visible: true } })
    await wrapper.findAll('.varo-picker__option')[1].trigger('click')
    columns[2].disabled = true
    await nextTick()
    expect(wrapper.get('.varo-picker__option[data-active="true"]').text()).toBe('B')
    const replacement = [columns[2], { label: 'B updated', value: draft }, columns[0]]
    await wrapper.setProps({ columns: replacement })
    expect(wrapper.get('.varo-picker__option[data-active="true"]').text()).toBe('B updated')
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('update:value')).toBeUndefined()
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([[draft]])
    expect(wrapper.emitted('confirm')).toEqual([[{ option: replacement[1], value: draft }]])
  })

  it.each(['disabled', 'removed'])('reconciles a %s draft without resetting other columns', async (invalidity) => {
    const columns = reactive([
      [{ label: 'A', value: 'a', disabled: false }, { label: 'B', value: 'b', disabled: false }],
      [{ label: 'One', value: 1, disabled: false }, { label: 'Empty', value: '', disabled: false }],
    ])
    const wrapper = mount(VPicker, { props: { columns, value: ['a', 1], visible: true } })
    await wrapper.findAll('.varo-picker__column')[0].findAll('button')[1].trigger('click')
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[1].trigger('click')
    if (invalidity === 'disabled') {
      columns[0][1].disabled = true
    }
    else {
      columns[0].splice(1, 1)
    }
    await nextTick()
    expect(wrapper.findAll('.varo-picker__option[data-active="true"]').map(option => option.text())).toEqual(['A', 'Empty'])
    await wrapper.setProps({ columns: [[], columns[1]] })
    const confirm = wrapper.get<HTMLButtonElement>('.varo-picker__confirm')
    expect(confirm.element.disabled).toBe(true)
    confirm.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('update:value')).toBeUndefined()
    await wrapper.setProps({ columns: [[{ label: 'Zero', value: 0 }], columns[1]] })
    await confirm.trigger('click')
    expect(wrapper.emitted('update:value')).toEqual([[[0, '']]])
    expect(wrapper.emitted('change')).toHaveLength(2)
  })

  it('resets drafts on parent array mutation, replacement, cancellation, and reopening', async () => {
    const value = reactive(['a', 1])
    const columns = [
      [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }],
      [{ label: 'One', value: 1 }, { label: 'Empty', value: '' }],
    ]
    const wrapper = mount(VPicker, { props: { columns, value, visible: true } })
    await wrapper.findAll('.varo-picker__column')[0].findAll('button')[1].trigger('click')
    await wrapper.findAll('.varo-picker__column')[1].findAll('button')[1].trigger('click')
    value[0] = 'c'
    await nextTick()
    expect(wrapper.findAll('.varo-picker__option[data-active="true"]').map(option => option.text())).toEqual(['C', 'One'])
    await wrapper.setProps({ value: ['b', ''], columns: columns.map(column => [...column]) })
    expect(wrapper.findAll('.varo-picker__option[data-active="true"]').map(option => option.text())).toEqual(['B', 'Empty'])
    await wrapper.findAll('.varo-picker__column')[0].findAll('button')[0].trigger('click')
    await wrapper.get('.varo-picker__cancel').trigger('click')
    expect(wrapper.findAll('.varo-picker__option[data-active="true"]').map(option => option.text())).toEqual(['B', 'Empty'])
    expect(wrapper.emitted('cancel')).toEqual([[]])
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
    await wrapper.findAll('.varo-picker__column')[0].findAll('button')[0].trigger('click')
    await wrapper.setProps({ visible: false })
    await wrapper.setProps({ visible: true })
    expect(wrapper.findAll('.varo-picker__option[data-active="true"]').map(option => option.text())).toEqual(['B', 'Empty'])
    expect(wrapper.emitted('update:value')).toBeUndefined()
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
