import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VSelect } from '../src/select'

const options = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Hangzhou', value: 'hangzhou' },
  { label: 'Suzhou', value: 'suzhou', disabled: true },
]

describe('ui-h5 select', () => {
  it('uses picker mode by default and commits single values immediately', async () => {
    const onUpdate = vi.fn()
    const onValueChange = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        options,
        'onUpdate:value': onUpdate,
        onValueChange,
      },
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
        options,
      },
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
        'value': ['shanghai'],
        'multiple': true,
        options,
        'onUpdate:value': onUpdate,
        onValueChange,
      },
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
        'confirmable': false,
        'value': ['shanghai'],
        'multiple': true,
        options,
        'onUpdate:value': onUpdate,
        onValueChange,
      },
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
        clearable: true,
        filterable: true,
        options,
        onSearch,
        value: 'shanghai',
      },
    })

    const filterInput = wrapper.get('.varo-select__filter-input')
    expect(filterInput.attributes('value')).toBe('Shanghai')
    await filterInput.trigger('focus')
    expect(wrapper.get('.varo-select__trigger').element.tagName).toBe('DIV')
    expect(wrapper.find('.varo-select__panel .varo-select__filter-input').exists()).toBe(false)
    await filterInput.setValue('zhou')

    expect(onSearch).toHaveBeenCalledWith('zhou')
    expect(wrapper.findAll('.varo-select__option').map(item => item.text())).toEqual(['Hangzhou', 'Suzhou'])

    await filterInput.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
    await filterInput.setValue('shang')
    expect(wrapper.find('.varo-select__panel').exists()).toBe(true)
    expect(wrapper.findAll('.varo-select__option').map(item => item.text())).toEqual(['Shanghai'])
    expect(wrapper.get('.varo-select__check').find('svg').exists()).toBe(true)
    await filterInput.trigger('keydown', { key: 'Escape' })
    await wrapper.get('.varo-select__clear').trigger('click')
    expect(wrapper.attributes('data-open')).toBe('false')
  })

  it('supports dropdown mode, clearable state, and max limits', async () => {
    const onClear = vi.fn()
    const onLimit = vi.fn()
    const onUpdate = vi.fn()
    const onValueChange = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        'clearable': true,
        'max': 1,
        'mode': 'dropdown',
        'value': ['shanghai'],
        'multiple': true,
        options,
        onClear,
        onLimit,
        'onUpdate:value': onUpdate,
        onValueChange,
      },
    })

    expect(wrapper.classes()).toContain('varo-select--dropdown')
    expect(wrapper.get('.varo-select__trigger').element.tagName).toBe('DIV')
    expect(wrapper.get('.varo-select__control').element.tagName).toBe('BUTTON')
    expect(wrapper.get('.varo-select__control').find('.varo-select__clear').exists()).toBe(false)
    expect(wrapper.get('.varo-select__clear').element.tagName).toBe('BUTTON')

    await wrapper.get('.varo-select__trigger').trigger('click')
    expect(wrapper.findAll('.varo-select__option').every(option => option.attributes('role') === 'option')).toBe(true)
    expect(wrapper.findAll('.varo-select__option')[0]?.attributes('aria-selected')).toBe('true')
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
        'clearable': true,
        'confirmable': true,
        'value': ['shanghai'],
        'multiple': true,
        options,
        onConfirm,
        'onUpdate:value': onUpdate,
        onValueChange,
      },
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

  it('supports keyboard navigation, disabled skipping, selection, and focus restoration', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      attachTo: document.body,
      props: {
        options,
        'onUpdate:value': onUpdate,
      },
    })
    const trigger = wrapper.get('.varo-select__control')
    ;(trigger.element as HTMLElement).focus()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(trigger.attributes('aria-activedescendant')).toContain('option-0')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toContain('option-1')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toContain('option-1')
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(onUpdate).toHaveBeenCalledWith('hangzhou')
    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('browses a readonly filterable select by keyboard without treating it as disabled', async () => {
    const onSearch = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        'clearable': true,
        'filterable': true,
        options,
        'readonly': true,
        'value': 'shanghai',
        onSearch,
        'onUpdate:value': onUpdate,
      },
    })
    const trigger = wrapper.get('.varo-select__filter-input')

    expect(trigger.attributes('disabled')).toBeUndefined()
    expect(trigger.attributes('readonly')).toBeDefined()
    expect(trigger.attributes('aria-disabled')).toBeUndefined()
    expect(trigger.attributes('aria-readonly')).toBe('true')
    expect(wrapper.find('.varo-select__clear').exists()).toBe(false)

    await trigger.setValue('zhou')
    expect(onSearch).not.toHaveBeenCalled()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-activedescendant')).toContain('option-1')
    expect(trigger.attributes('value')).toBe('Shanghai')
    expect(wrapper.get('[role="listbox"]').attributes('aria-readonly')).toBe('true')
    expect(wrapper.findAll('.varo-select__option')).toHaveLength(options.length)

    await trigger.trigger('keydown', { key: 'Enter' })
    expect(onUpdate).not.toHaveBeenCalled()
    expect(wrapper.find('.varo-select__panel').exists()).toBe(true)

    await trigger.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
  })

  it('closes on the first Escape after clicking a readonly filterable option', async () => {
    const wrapper = mount(VSelect, {
      attachTo: document.body,
      props: { options, readonly: true, filterable: true, value: 'shanghai' },
    })
    try {
      const trigger = wrapper.get('[role="combobox"]')
      ;(trigger.element as HTMLElement).focus()
      await trigger.trigger('click')
      const option = wrapper.findAll('[role="option"]')[1]
      ;(option.element as HTMLElement).focus()
      await option.trigger('click')

      await option.trigger('keydown', { key: 'Escape' })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
      expect(document.activeElement).toBe(trigger.element)
      expect(wrapper.emitted('update:value')).toBeUndefined()
    }
    finally {
      wrapper.unmount()
    }
  })

  it('discards a multiple draft when readonly is enabled before confirmation', async () => {
    const onConfirm = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(VSelect, {
      props: {
        'clearable': true,
        'confirmable': true,
        'multiple': true,
        options,
        'value': ['shanghai'],
        onConfirm,
        'onUpdate:value': onUpdate,
      },
    })

    await wrapper.get('.varo-select__control').trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')
    expect(wrapper.findAll('.varo-select__option')[1].attributes('data-selected')).toBe('true')

    await wrapper.setProps({ readonly: true })
    expect(wrapper.findAll('.varo-select__option')[0].attributes('data-selected')).toBe('true')
    expect(wrapper.findAll('.varo-select__option')[1].attributes('data-selected')).toBe('false')
    expect(wrapper.find('.varo-select__clear').exists()).toBe(false)

    await wrapper.findAll('.varo-select__option')[0].trigger('click')
    await wrapper.get('.varo-select__confirm').trigger('click')
    expect(onUpdate).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(wrapper.find('.varo-select__panel').exists()).toBe(true)

    await wrapper.get('.varo-select__cancel').trigger('click')
    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
  })

  it('keeps a disabled select closed', async () => {
    const wrapper = mount(VSelect, {
      props: {
        disabled: true,
        options,
      },
    })

    expect(wrapper.get('.varo-select__control').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.varo-select__control').attributes('aria-disabled')).toBe('true')
    await wrapper.get('.varo-select__trigger').trigger('click')
    expect(wrapper.attributes('data-open')).toBe('false')
  })

  it('closes on Tab without stealing focus from the next control', async () => {
    const nextControl = document.createElement('button')
    document.body.append(nextControl)
    const wrapper = mount(VSelect, {
      attachTo: document.body,
      props: { options },
    })
    const trigger = wrapper.get('.varo-select__control')
    ;(trigger.element as HTMLElement).focus()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await trigger.trigger('keydown', { key: 'Tab' })
    nextControl.focus()

    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
    expect(document.activeElement).toBe(nextControl)
    wrapper.unmount()
    nextControl.remove()
  })

  it('handles Escape from a confirmable panel footer', async () => {
    const wrapper = mount(VSelect, {
      attachTo: document.body,
      props: {
        confirmable: true,
        multiple: true,
        options,
      },
    })
    const trigger = wrapper.get('.varo-select__control')
    await trigger.trigger('click')
    const cancelButton = wrapper.get('.varo-select__cancel')
    ;(cancelButton.element as HTMLElement).focus()
    await cancelButton.trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })
})
