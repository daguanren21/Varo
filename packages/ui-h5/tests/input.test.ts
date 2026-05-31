import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VInput } from '../src/input'

describe('ui-h5 input', () => {
  it('wraps the primitive input with theme classes', async () => {
    const wrapper = mount(VInput, {
      global: {
        config: {
          warnHandler() {}
        }
      },
      props: {
        size: 'lg',
        invalid: true,
        defaultValue: 'hello'
      }
    })

    expect(wrapper.find('input').attributes('data-invalid')).toBe('true')
    expect(wrapper.attributes('data-invalid')).toBe('true')
    expect(wrapper.attributes('data-size')).toBe('lg')
    expect(wrapper.classes().join(' ')).toContain('varo-input')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('hello')
  })

  it('renders label, affixes, alignment, and word limit state', () => {
    const wrapper = mount(VInput, {
      props: {
        label: 'Name',
        modelValue: undefined,
        value: 'Varo',
        maxLength: 8,
        showWordLimit: true,
        align: 'right',
        prefixIcon: '🔎',
        suffixIcon: '✓'
      }
    })

    expect(wrapper.get('.varo-input__label').text()).toBe('Name')
    expect(wrapper.get('.varo-input__prefix').text()).toBe('🔎')
    expect(wrapper.get('.varo-input__suffix').text()).toBe('✓')
    expect(wrapper.get('.varo-input__word-limit').text()).toBe('4/8')
    expect(wrapper.attributes('data-align')).toBe('right')
    expect(wrapper.find('input').attributes('style')).toContain('text-align: right')
  })

  it('clears the current value with a clearable control', async () => {
    const onUpdateValue = vi.fn()
    const onValueChange = vi.fn()
    const onClear = vi.fn()
    const wrapper = mount(VInput, {
      props: {
        defaultValue: 'Varo',
        clearable: true,
        clearTrigger: 'always',
        'onUpdate:value': onUpdateValue,
        onValueChange,
        onClear
      }
    })

    expect(wrapper.find('.varo-input__clear').exists()).toBe(true)

    await wrapper.get('.varo-input__clear').trigger('click')

    expect(onUpdateValue).toHaveBeenCalledWith('')
    expect(onValueChange).toHaveBeenCalledWith('')
    expect(onClear).toHaveBeenCalledTimes(1)
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })

  it('passes formatter, readonly, textarea, and error state to the primitive control', async () => {
    const wrapper = mount(VInput, {
      props: {
        type: 'textarea',
        defaultValue: ' varo ',
        formatter: (value: string) => value.trim(),
        formatTrigger: 'onBlur',
        rows: 2,
        autosize: true,
        readonly: true,
        invalid: true,
        errorMessage: 'Required'
      }
    })

    const textarea = wrapper.get('textarea')
    await textarea.trigger('blur')

    expect(textarea.attributes('readonly')).toBeDefined()
    expect(textarea.attributes('rows')).toBe('2')
    expect(textarea.attributes('data-autosize')).toBe('true')
    expect(wrapper.attributes('data-readonly')).toBe('true')
    expect(wrapper.get('.varo-input__error').text()).toBe('Required')
  })
})
