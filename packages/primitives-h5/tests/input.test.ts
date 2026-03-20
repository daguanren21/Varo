import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { InputRoot } from '../src/input'

describe('primitives-h5 input', () => {
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
})