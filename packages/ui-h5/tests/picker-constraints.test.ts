import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
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
    expect(wrapper.emitted('update:value')).toEqual([['a']])
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
