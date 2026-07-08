import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VSelect } from '../src/select'

const options = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Hangzhou', value: 'hangzhou' },
  { label: 'Suzhou', value: 'suzhou', disabled: true }
]

describe('ui-weapp select', () => {
  it('uses picker mode by default and commits single values immediately', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        options,
        'onUpdate:modelValue': onUpdate
      }
    })

    expect(wrapper.classes()).toContain('varo-select--picker')
    expect(wrapper.get('.varo-select__value').text()).toBe('请选择')

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onUpdate).toHaveBeenCalledWith('hangzhou')
    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
  })

  it('keeps a draft for confirmable multiple selection', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        modelValue: ['shanghai'],
        multiple: true,
        options,
        'onUpdate:modelValue': onUpdate
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onUpdate).not.toHaveBeenCalled()

    await wrapper.get('.varo-select__confirm').trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(['shanghai', 'hangzhou'])
  })

  it('can emit every multiple toggle immediately', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        confirmable: false,
        modelValue: ['shanghai'],
        multiple: true,
        options,
        'onUpdate:modelValue': onUpdate
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(['shanghai', 'hangzhou'])
  })

  it('filters options locally and emits search input', async () => {
    const onSearch = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        searchable: true,
        options,
        onSearch
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.get('.varo-select__search').setValue('zhou')

    expect(onSearch).toHaveBeenCalledWith('zhou')
    expect(wrapper.findAll('.varo-select__option').map((item) => item.text())).toEqual(['Hangzhou', 'Suzhou'])
  })

  it('supports dropdown mode, clearable state, and max limits', async () => {
    const onClear = vi.fn()
    const onLimit = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        clearable: true,
        max: 1,
        mode: 'dropdown',
        modelValue: ['shanghai'],
        multiple: true,
        options,
        onClear,
        onLimit,
        'onUpdate:modelValue': onUpdate
      }
    })

    expect(wrapper.classes()).toContain('varo-select--dropdown')

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onLimit).toHaveBeenCalledWith({ max: 1 })

    await wrapper.get('.varo-select__clear').trigger('click')

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith([])
  })
})
