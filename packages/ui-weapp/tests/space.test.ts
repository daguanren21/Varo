import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { VSpace } from '../src/space'

describe('ui-weapp space', () => {
  it('renders space metadata and content', () => {
    const wrapper = mount(VSpace, {
      props: {
        direction: 'vertical',
        size: [8, 12],
        wrap: true
      },
      slots: {
        default: () => '间距'
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-space')
    expect(wrapper.attributes('data-direction')).toBe('vertical')
    expect(wrapper.attributes('data-wrap')).toBe('true')
    expect(wrapper.attributes('style')).toContain('--varo-space-gap-y: 12px')
  })
})
