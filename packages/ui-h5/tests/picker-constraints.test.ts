import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { VPicker } from '../src/picker'

enableAutoUnmount(afterEach)

describe('VPicker constrained confirmation', () => {
  it.each([
    { columns: [] },
    { columns: [{ label: 'Unavailable', value: 'x', disabled: true }] },
    { columns: [[{ label: 'Available', value: 'a' }], []] },
    { columns: [[{ label: 'Available', value: 'a' }], [{ label: 'Unavailable', value: 'x', disabled: true }]] },
  ])('does not publish absent or disabled choices for %j', async ({ columns }) => {
    const wrapper = mount(VPicker, { props: { columns, visible: true } })
    const confirm = wrapper.get<HTMLButtonElement>('.varo-picker__confirm')
    expect(confirm.element.disabled).toBe(true)
    confirm.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('update:visible')).toBeUndefined()
    expect(wrapper.find('.varo-picker__option[disabled][data-active="true"]').exists()).toBe(false)
  })
  it('re-evaluates replaced columns and permits valid confirmation', async () => {
    const wrapper = mount(VPicker, { props: { columns: [{ label: 'A', value: 'a' }], value: 'a', visible: true } })
    await wrapper.setProps({ columns: [{ label: 'A', value: 'a', disabled: true }] })
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

  it('supports a dependent-domain guard without changing cancel', async () => {
    const wrapper = mount(VPicker, { props: { columns: [{ label: 'A', value: 'a' }], visible: true, confirmDisabled: true } })
    wrapper.get('.varo-picker__confirm').element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('confirm')).toBeUndefined()
    await wrapper.get('.varo-picker__cancel').trigger('click')
    expect(wrapper.emitted('cancel')).toEqual([[]])
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
  })

  it('discards a draft on externally controlled close and reopen', async () => {
    const wrapper = mount(VPicker, { props: { columns: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }], value: 'a', visible: true } })
    await wrapper.findAll('.varo-picker__option')[1].trigger('click')
    await wrapper.setProps({ visible: false })
    await wrapper.setProps({ visible: true })
    await wrapper.get('.varo-picker__confirm').trigger('click')
    expect(wrapper.emitted('confirm')?.[0]?.[0]).toMatchObject({ value: 'a' })
  })

  it('centers the selected option relative to a scrolled column rather than its page offset parent', async () => {
    const wrapper = mount(VPicker, {
      props: { columns: Array.from({ length: 10 }, (_, value) => ({ label: String(value), value })), value: 0, visible: true },
    })
    await nextTick()
    const column = wrapper.get<HTMLElement>('.varo-picker__column').element
    const selected = wrapper.findAll<HTMLElement>('.varo-picker__option')[5].element
    Object.defineProperties(column, {
      clientHeight: { configurable: true, value: 220 },
      clientTop: { configurable: true, value: 2 },
    })
    Object.defineProperties(selected, {
      offsetTop: { configurable: true, value: 720 },
      offsetHeight: { configurable: true, value: 44 },
    })
    column.scrollTop = 55
    const columnRect = vi.spyOn(column, 'getBoundingClientRect').mockReturnValue({ top: 500 } as DOMRect)
    const selectedRect = vi.spyOn(selected, 'getBoundingClientRect').mockReturnValue({ top: 667 } as DOMRect)
    await wrapper.setProps({ value: 5 })
    await nextTick()
    expect(column.scrollTop).toBe(132)
    columnRect.mockRestore()
    selectedRect.mockRestore()
  })
})
