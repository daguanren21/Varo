import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { StickyRoot } from '../src/sticky'

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value
  })
}

describe('primitives-weapp sticky', () => {
  it('renders sticky offset and emits state changes while scrolling', async () => {
    const onChange = vi.fn()
    setScrollY(0)

    const wrapper = mount(StickyRoot, {
      props: {
        offsetTop: 12,
        zIndex: 99,
        onChange
      },
      slots: {
        default: () => '吸顶内容'
      }
    })

    expect(wrapper.attributes('data-fixed')).toBe('false')

    setScrollY(24)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('data-fixed')).toBe('true')
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
