import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { VWatermark } from '../src/watermark'

describe('VWatermark', () => {
  it('covers slotted content with an inaccessible non-interactive text pattern', () => {
    const wrapper = mount(VWatermark, {
      props: {
        color: '#123456',
        content: 'ACME CONFIDENTIAL',
        gapX: 120,
        offsetX: 500,
        offsetY: -500,
        opacity: 0.2,
        rotate: -18,
      },
      slots: {
        default: () => h('button', { type: 'button' }, 'Continue'),
      },
    })

    expect(wrapper.get('button').text()).toBe('Continue')
    expect(wrapper.get('.varo-watermark__overlay').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.varo-watermark__item').text()).toBe('ACME CONFIDENTIAL')
    expect(wrapper.attributes('style')).toContain('--varo-watermark-gap-x: 120px')
    expect(wrapper.attributes('style')).toContain('--varo-watermark-opacity: 0.2')
    expect(wrapper.attributes('style')).toContain('--varo-watermark-offset-x: 20px')
    expect(wrapper.attributes('style')).toContain('--varo-watermark-offset-y: -20px')
  })

  it('removes the decorative overlay for empty content', () => {
    const wrapper = mount(VWatermark, {
      props: { content: '' },
      slots: { default: 'Protected content' },
    })

    expect(wrapper.text()).toBe('Protected content')
    expect(wrapper.find('.varo-watermark__overlay').exists()).toBe(false)
  })
})
