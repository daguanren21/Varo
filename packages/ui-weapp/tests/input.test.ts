import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VInput } from '../src/input'

describe('ui-weapp input', () => {
  it('wraps the primitive input with theme classes and state attrs', () => {
    const wrapper = mount(VInput, {
      props: {
        size: 'sm',
        invalid: true,
        defaultValue: 'hello'
      }
    })

    expect(wrapper.attributes('data-invalid')).toBe('true')
    expect(wrapper.attributes('data-size')).toBe('sm')
    expect(wrapper.classes().join(' ')).toContain('varo-input')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('hello')
  })

  it('renders clearable, word limit, and affix controls', async () => {
    const onUpdateValue = vi.fn()
    const wrapper = mount(VInput, {
      props: {
        defaultValue: 'Varo',
        maxLength: 6,
        showWordLimit: true,
        clearable: true,
        clearTrigger: 'always',
        prefixIcon: '#',
        suffixIcon: 'ok',
        'onUpdate:value': onUpdateValue
      }
    })

    expect(wrapper.get('.varo-input__prefix').text()).toBe('#')
    expect(wrapper.get('.varo-input__suffix').text()).toBe('ok')
    expect(wrapper.get('.varo-input__word-limit').text()).toBe('4/6')

    await wrapper.get('.varo-input__clear').trigger('click')

    expect(onUpdateValue).toHaveBeenCalledWith('')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })
})
