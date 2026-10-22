import type { VaroRegionOption } from '../../ui-h5/src/region-picker'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { VRegionPicker } from '../../ui-h5/src/region-picker'
import NativeRegionPicker from '../native/src/components/ui/v-region-picker.vue'

enableAutoUnmount(afterEach)

describe.each([['H5', VRegionPicker], ['native', NativeRegionPicker]] as const)('%s RegionPicker acceptance and requests', (_renderer, Component) => {
  function pendingRegions() {
    let resolve!: (options: VaroRegionOption[]) => void
    let reject!: (error: Error) => void
    const promise = new Promise<VaroRegionOption[]>((yes, no) => { resolve = yes; reject = no })
    return { promise, resolve, reject }
  }

  it.each(['parent', 'leaf'])('preserves disabled %s history but rejects confirmation, shortcuts and automatic acceptance', async (disabled) => {
    const options = reactive([{ label: 'Parent', value: 0, disabled: disabled === 'parent', children: [{ label: 'Leaf', value: '', disabled: disabled === 'leaf' }] }])
    const wrapper = mount(Component, { props: {
      options,
      modelValue: [0, ''],
      visible: true,
      confirmOnLeaf: true,
      shortcuts: [{ label: 'Saved', path: [0, ''] }],
    } })
    expect(wrapper.get('.varo-region-picker__breadcrumbs').text()).toContain('Parent')
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('Leaf')
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(true)
    wrapper.get('.varo-region-picker__confirm').element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.get('.varo-region-picker__shortcuts button').trigger('click')
    await wrapper.get('.varo-region-picker__option').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    options[0].disabled = false
    options[0].children[0].disabled = false
    await nextTick()
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[[0, '']]])
  })

  it('rejects a draft disabled after editing without clearing its displayed path', async () => {
    const options = reactive([{ label: 'A', value: 'a', disabled: false }, { label: 'B', value: 'b', disabled: false }])
    const wrapper = mount(Component, { props: { options, modelValue: ['a'], visible: true, allowIntermediate: true } })
    await wrapper.findAll('.varo-region-picker__option')[1].trigger('click')
    options[1].disabled = true
    await nextTick()
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(true)
    wrapper.get('.varo-region-picker__confirm').element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('resolves the latest untouched parent path from a complete asynchronous root result', async () => {
    const pending = pendingRegions()
    const wrapper = mount(Component, { props: { visible: true, modelValue: ['old'], loadChildren: () => pending.promise } })
    await wrapper.setProps({ modelValue: [0, ''] })
    pending.resolve([{ label: 'Parent', value: 0, children: [{ label: 'Leaf', value: '' }] }])
    await flushPromises()
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('Leaf')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[[0, '']]])
  })

  it.each(['pending', 'rejected', 'empty'])('keeps a newer parent selection usable after an abandoned %s branch request', async (outcome) => {
    const pending = pendingRegions()
    const options = [
      { label: 'A', value: 'a', hasChildren: true },
      { label: 'B', value: 'b', children: [{ label: 'Bee', value: 'bee' }] },
    ]
    const wrapper = mount(Component, { props: { options, visible: true, loadChildren: () => pending.promise } })
    await wrapper.findAll('.varo-region-picker__option')[0].trigger('click')
    if (outcome === 'rejected') {
      pending.reject(new Error('A unavailable'))
      await flushPromises()
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    }
    await wrapper.setProps({ modelValue: ['b', 'bee'] })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(false)
    if (outcome === 'pending') { pending.reject(new Error('A unavailable')) }
    if (outcome === 'empty') { pending.resolve([]) }
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('.varo-region-picker__breadcrumbs [data-active="true"]').text()).toBe('Bee')
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('Bee')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['b', 'bee']]])
  })

  it.each(['loading', 'loader'])('starts root loading when %s becomes eligible', async (transition) => {
    const loadChildren = vi.fn(async () => [{ label: 'B', value: 'b' }])
    const wrapper = mount(Component, { props: {
      visible: true,
      modelValue: ['b'],
      loading: transition === 'loading',
      loadChildren: transition === 'loader' ? undefined : loadChildren,
    } })
    expect(loadChildren).not.toHaveBeenCalled()
    await wrapper.setProps(transition === 'loading' ? { loading: false } : { loadChildren })
    await flushPromises()
    expect(loadChildren).toHaveBeenCalledExactlyOnceWith({ level: 0, path: [] })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['b']]])
  })

  it('caches root completion after dismissal and does not loop on an empty root result', async () => {
    const pending = pendingRegions()
    const loadChildren = vi.fn(() => pending.promise)
    const wrapper = mount(Component, { props: { visible: true, modelValue: ['b'], loadChildren } })
    await wrapper.get('.varo-region-picker__cancel').trigger('click')
    await wrapper.setProps({ visible: false })
    pending.resolve([{ label: 'B', value: 'b' }])
    await flushPromises()
    expect(wrapper.emitted('loadSuccess')?.[0]?.[0]).toMatchObject({ options: [{ label: 'B', value: 'b' }] })
    await wrapper.setProps({ visible: true })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    expect(loadChildren).toHaveBeenCalledTimes(1)
    const emptyLoader = vi.fn(async () => [])
    await wrapper.setProps({ options: [], modelValue: [], loadChildren: emptyLoader })
    await flushPromises()
    await nextTick()
    expect(emptyLoader).toHaveBeenCalledTimes(1)
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(true)
  })
})
