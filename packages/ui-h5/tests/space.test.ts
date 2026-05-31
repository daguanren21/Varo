import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { VSpace } from '../src/space'

describe('ui-h5 space', () => {
  it('wraps SpaceRoot with Varo classes', () => {
    const wrapper = mount(VSpace, {
      props: {
        size: 12,
        wrap: true
      },
      slots: {
        default: () => '间距'
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-space')
    expect(wrapper.attributes('data-wrap')).toBe('true')
    expect(wrapper.attributes('style')).toContain('--varo-space-gap-x: 12px')
  })
})
