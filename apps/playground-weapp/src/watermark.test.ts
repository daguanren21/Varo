// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VWatermark from './components/ui/v-watermark.vue'

describe('native weapp watermark', () => {
  it('renders a decorative repeated layer without replacing slot content', () => {
    const wrapper = mount(VWatermark, {
      props: {
        content: 'INTERNAL',
        gapX: 120,
        gapY: 72,
        offsetX: 500,
        offsetY: -500,
        opacity: 0.18,
      },
      slots: {
        default: '<button type="button">Approve</button>',
      },
    })

    expect(wrapper.get('button').text()).toBe('Approve')
    expect(wrapper.get('.varo-watermark__overlay').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.varo-watermark__item').text()).toBe('INTERNAL')
    expect(wrapper.attributes('style')).toContain('--varo-watermark-opacity: 0.18')
    expect(wrapper.attributes('style')).toContain('--varo-watermark-offset-x: 20px')
    expect(wrapper.attributes('style')).toContain('--varo-watermark-offset-y: 4px')
  })

  it('omits the repeated layer for empty content', () => {
    const wrapper = mount(VWatermark, {
      props: { content: '' },
      slots: { default: 'Visible content' },
    })

    expect(wrapper.text()).toBe('Visible content')
    expect(wrapper.find('.varo-watermark__overlay').exists()).toBe(false)
  })
})
