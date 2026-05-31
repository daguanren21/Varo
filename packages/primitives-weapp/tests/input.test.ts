import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { InputRoot } from '../src/input'

describe('primitives-weapp input', () => {
  it('updates local value in uncontrolled mode', async () => {
    const wrapper = mount(InputRoot, {
      props: {
        defaultValue: 'hello'
      }
    })
    const input = wrapper.find('input')

    expect((wrapper.element as HTMLInputElement).value).toBe('hello')
    await input.setValue('world')
    expect((wrapper.element as HTMLInputElement).value).toBe('world')
  })

  it('emits value update in controlled mode without mutating visual state', async () => {
    const onUpdateValue = vi.fn()
    const wrapper = mount(InputRoot, {
      props: {
        value: 'hello',
        'onUpdate:value': onUpdateValue
      }
    })
    const input = wrapper.find('input')

    await input.setValue('world')
    expect(onUpdateValue).toHaveBeenCalledWith('world')
    expect((wrapper.element as HTMLInputElement).value).toBe('hello')
  })

  it('keeps invalid and disabled attrs in sync', () => {
    const wrapper = mount(InputRoot, {
      props: {
        disabled: true,
        invalid: true
      }
    })

    expect(wrapper.attributes('aria-invalid')).toBe('true')
    expect(wrapper.attributes('data-disabled')).toBe('true')
  })

  it('formats and limits values before emitting changes', async () => {
    const onValueChange = vi.fn()
    const wrapper = mount(InputRoot, {
      props: {
        formatter: (value: string) => value.trim(),
        maxLength: 4,
        onValueChange
      }
    })
    const input = wrapper.find('input')

    await input.setValue('  varo  ')

    expect(onValueChange).toHaveBeenCalledWith('varo')
    expect((wrapper.element as HTMLInputElement).value).toBe('varo')
    expect(wrapper.attributes('maxlength')).toBe('4')
  })

  it('does not update while readonly', async () => {
    const onValueChange = vi.fn()
    const wrapper = mount(InputRoot, {
      props: {
        defaultValue: 'locked',
        readonly: true,
        onValueChange
      }
    })
    const input = wrapper.find('input')

    await input.setValue('changed')

    expect(onValueChange).not.toHaveBeenCalled()
    expect((wrapper.element as HTMLInputElement).value).toBe('locked')
    expect(wrapper.attributes('readonly')).toBeDefined()
    expect(wrapper.attributes('data-readonly')).toBe('true')
  })

  it('renders textarea controls with autosize metadata', () => {
    const wrapper = mount(InputRoot, {
      props: {
        type: 'textarea',
        rows: 3,
        autosize: true
      }
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.attributes('rows')).toBe('3')
    expect(wrapper.attributes('data-autosize')).toBe('true')
  })
})
