import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { InputOtpRoot } from '../src/input-otp'

describe('primitives-h5 input otp', () => {
  it('renders slots, normalizes input, and emits completion', async () => {
    const onUpdate = vi.fn()
    const onComplete = vi.fn()
    const onInput = vi.fn()
    const wrapper = mount(InputOtpRoot, {
      props: {
        'length': 4,
        'pattern': '[0-9]',
        'onUpdate:value': onUpdate,
        onComplete,
        onInput,
      },
      slots: {
        default: ({ value, length }: { value: string, length: number }) =>
          Array.from({ length }, (_, index) => value[index] ?? '·').join(''),
      },
    })

    expect(wrapper.findAll('.varo-input-otp__input')).toHaveLength(1)
    expect(wrapper.text()).toContain('····')
    await wrapper.get('input').setValue('12a34')

    expect(onUpdate).toHaveBeenCalledWith('1234')
    expect(onComplete).toHaveBeenCalledWith('1234')
    expect(wrapper.text()).toContain('1234')
    expect(onInput).toHaveBeenCalledOnce()
    await wrapper.setProps({ readonly: true })
    await wrapper.get('input').setValue('5678')
    expect(wrapper.text()).toContain('1234')
    expect(onInput).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
})
