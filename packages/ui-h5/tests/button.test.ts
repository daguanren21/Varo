import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { VButton } from '../src/button'

describe('ui-h5 button', () => {
  it('exports a themed primitive button', () => {
    const wrapper = mount(VButton, {
      global: {
        config: {
          warnHandler() {}
        }
      },
      props: {
        variant: 'outline',
        size: 'lg'
      },
      slots: {
        default: () => 'Action'
      }
    })

    expect(wrapper.attributes('data-variant')).toBe('outline')
    expect(wrapper.attributes('data-size')).toBe('lg')
    expect(wrapper.classes().join(' ')).toContain('varo-button')
  })
})
