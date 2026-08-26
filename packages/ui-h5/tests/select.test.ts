import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VSelect } from '../src/select'

const options = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Hangzhou', value: 'hangzhou' },
  { label: 'Suzhou', value: 'suzhou', disabled: true }
]

describe('ui-h5 select', () => {
  it('uses picker mode by default and commits single values immediately', async () => {
    const onUpdate = vi.fn()
    const onValueChange = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        options,
        'onUpdate:value': onUpdate,
        onValueChange
      }
    })

    expect(wrapper.classes()).toContain('varo-select--picker')
    expect(wrapper.get('.varo-select__value').text()).toBe('请选择')
    expect(wrapper.find('.varo-select__arrow').exists()).toBe(true)

    await wrapper.get('.varo-select__trigger').trigger('click')
    expect(wrapper.attributes('data-open')).toBe('true')
    expect(wrapper.get('.varo-select__panel').classes().length).toBeGreaterThanOrEqual(0)
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onUpdate).toHaveBeenCalledWith('hangzhou')
    expect(onValueChange).toHaveBeenCalledWith('hangzhou')
    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
  })

  it('closes when selecting the already-selected single value', async () => {
    const wrapper = mount(VSelect, {
      props: {
        value: 'shanghai',
        options
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    expect(wrapper.find('.varo-select__panel').exists()).toBe(true)

    await wrapper.findAll('.varo-select__option')[0].trigger('click')

    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
  })

  it('keeps a draft for confirmable multiple selection', async () => {
    const onUpdate = vi.fn()
    const onValueChange = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        value: ['shanghai'],
        multiple: true,
        options,
        'onUpdate:value': onUpdate,
        onValueChange
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onUpdate).not.toHaveBeenCalled()

    await wrapper.get('.varo-select__confirm').trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(['shanghai', 'hangzhou'])
    expect(onValueChange).toHaveBeenCalledWith(['shanghai', 'hangzhou'])
  })

  it('can emit every multiple toggle immediately', async () => {
    const onUpdate = vi.fn()
    const onValueChange = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        confirmable: false,
        value: ['shanghai'],
        multiple: true,
        options,
        'onUpdate:value': onUpdate,
        onValueChange
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(['shanghai', 'hangzhou'])
    expect(onValueChange).toHaveBeenCalledWith(['shanghai', 'hangzhou'])
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
    const onValueChange = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        clearable: true,
        max: 1,
        mode: 'dropdown',
        value: ['shanghai'],
        multiple: true,
        options,
        onClear,
        onLimit,
        'onUpdate:value': onUpdate,
        onValueChange
      }
    })

    expect(wrapper.classes()).toContain('varo-select--dropdown')

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')

    expect(onLimit).toHaveBeenCalledWith({ max: 1 })

    await wrapper.get('.varo-select__clear').trigger('click')

    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith([])
    expect(onValueChange).toHaveBeenCalledWith([])
  })

  it('clears the open confirmable multiple draft before confirm', async () => {
    const onConfirm = vi.fn()
    const onUpdate = vi.fn()
    const onValueChange = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        clearable: true,
        confirmable: true,
        value: ['shanghai'],
        multiple: true,
        options,
        onConfirm,
        'onUpdate:value': onUpdate,
        onValueChange
      }
    })

    await wrapper.get('.varo-select__trigger').trigger('click')
    await wrapper.get('.varo-select__clear').trigger('click')
    await wrapper.get('.varo-select__confirm').trigger('click')

    expect(onUpdate).toHaveBeenCalledWith([])
    expect(onUpdate).not.toHaveBeenCalledWith(['shanghai'])
    expect(onValueChange).toHaveBeenCalledWith([])
    expect(onValueChange).not.toHaveBeenCalledWith(['shanghai'])
    expect(onConfirm).toHaveBeenCalledWith([])
    expect(onConfirm).not.toHaveBeenCalledWith(['shanghai'])
  })
})
