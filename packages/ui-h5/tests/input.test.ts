import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
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

    expect(wrapper.attributes('data-invalid')).toBe('true')
    expect(wrapper.classes().join(' ')).toContain('varo-input')
    expect((wrapper.element as HTMLInputElement).value).toBe('hello')
  })
})
