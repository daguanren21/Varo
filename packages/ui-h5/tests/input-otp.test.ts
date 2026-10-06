import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VInputOtp } from '../src/input-otp'

describe('ui-h5 input otp', () => {
  it('renders visual cells and supports masked uncontrolled input', async () => {
    const onComplete = vi.fn()
    const wrapper = mount(VInputOtp, {
      props: {
        length: 4,
        mask: true,
        onComplete,
      },
    })

    expect(wrapper.findAll('.varo-input-otp__cell')).toHaveLength(4)
    await wrapper.get('input').setValue('1234')

    expect(wrapper.findAll('.varo-input-otp__cell').map(cell => cell.text())).toEqual(['•', '•', '•', '•'])
    expect(onComplete).toHaveBeenCalledWith('1234')
  })
})
