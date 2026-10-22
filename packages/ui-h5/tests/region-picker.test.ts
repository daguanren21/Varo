import type { VaroRegionOption } from '../src/region-picker'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, reactive } from 'vue'
import { VRegionPicker } from '../src/region-picker'

enableAutoUnmount(afterEach)

describe('VRegionPicker option reconciliation', () => {
  it.each(['b', 0, ''])('retains draft %j when an unrelated option changes or the tree is replaced', async (draft) => {
    const options = reactive([
      { label: 'A', value: 'a', disabled: false },
      { label: 'B', value: draft, disabled: false },
      { label: 'C', value: 'c', disabled: false },
    ])
    const wrapper = mount(VRegionPicker, { props: { options, modelValue: ['a'], visible: true } })
    await wrapper.findAll('.varo-region-picker__option')[1].trigger('click')
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    options[2].disabled = true
    await nextTick()
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    await wrapper.setProps({ options: [options[2], { label: 'B updated', value: draft }, options[0]] })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B updated')
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[[draft]]])
    expect(wrapper.emitted('confirm')?.[0]?.[0]).toMatchObject({ labels: ['B updated'], path: [draft] })
  })

  it('preserves breadcrumb navigation and truncates removed draft nodes at the missing level', async () => {
    const options = reactive<VaroRegionOption[]>([
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', children: [{ label: 'One', value: 1 }, { label: 'Two', value: 2 }] },
      { label: 'C', value: 'c', disabled: false },
    ])
    const wrapper = mount(VRegionPicker, { props: { options, modelValue: ['a'], visible: true } })
    await wrapper.findAll('.varo-region-picker__option')[1].trigger('click')
    await wrapper.findAll('.varo-region-picker__option')[0].trigger('click')
    await wrapper.get('.varo-region-picker__breadcrumbs button').trigger('click')
    options[2].disabled = true
    await nextTick()
    expect(wrapper.findAll('.varo-region-picker__option').map(option => option.text())).toEqual(['A', 'B', 'C'])
    expect(wrapper.findAll('.varo-region-picker__breadcrumbs button').map(button => button.text())).toEqual(['B', 'One'])
    options[1].children!.splice(0, 1)
    await nextTick()
    const breadcrumbs = wrapper.findAll('.varo-region-picker__breadcrumbs button')
    expect(breadcrumbs[0].text()).toBe('B')
    expect(breadcrumbs).toHaveLength(2)
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(true)
    await breadcrumbs[1].trigger('click')
    expect(wrapper.get('.varo-region-picker__option').text()).toBe('Two')
    await wrapper.get('.varo-region-picker__option').trigger('click')
    options.splice(1, 1)
    await nextTick()
    expect(wrapper.find('.varo-region-picker__option[data-selected="true"]').exists()).toBe(false)
    const confirm = wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm')
    expect(confirm.element.disabled).toBe(true)
    confirm.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('change')).toHaveLength(3)
  })

  it('resets on parent changes and reopening while cancellation never commits', async () => {
    const modelValue = reactive(['a'])
    const options = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }]
    const wrapper = mount(VRegionPicker, { props: { options, modelValue, visible: true } })
    await wrapper.findAll('.varo-region-picker__option')[1].trigger('click')
    modelValue[0] = 'c'
    await nextTick()
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('C')
    await wrapper.setProps({ modelValue: ['a'], options: [...options] })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('A')
    await wrapper.findAll('.varo-region-picker__option')[1].trigger('click')
    await wrapper.get('.varo-region-picker__cancel').trigger('click')
    expect(wrapper.emitted('close')).toEqual([[]])
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ visible: false })
    await wrapper.setProps({ visible: true })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('A')
    await wrapper.setProps({ modelValue: [] })
    expect(wrapper.find('.varo-region-picker__option[data-selected="true"]').exists()).toBe(false)
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(true)
  })

  it('resolves late parent options until the user edits without resurrecting an invalidated draft', async () => {
    const options = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]
    const wrapper = mount(VRegionPicker, { props: { options: [], modelValue: ['b'], visible: true } })
    await wrapper.setProps({ options })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    await wrapper.findAll('.varo-region-picker__option')[0].trigger('click')
    await wrapper.setProps({ options: [] })
    await wrapper.setProps({ options })
    expect(wrapper.find('.varo-region-picker__option[data-selected="true"]').exists()).toBe(false)
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('retains shortcut drafts through option mutation', async () => {
    const options = reactive([
      { label: 'A', value: 'a', disabled: false },
      { label: 'B', value: 'b', disabled: false },
    ])
    const wrapper = mount(VRegionPicker, {
      props: { options, modelValue: ['a'], shortcuts: [{ label: 'Choose B', path: ['b'] }], visible: true },
    })
    await wrapper.get('.varo-region-picker__shortcuts button').trigger('click')
    options[0].disabled = true
    await nextTick()
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['b']]])
    expect(wrapper.emitted('change')).toHaveLength(1)
  })
})
