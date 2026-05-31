import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VSticky } from '../src/sticky'

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value
  })
}

describe('ui-weapp sticky', () => {
  it('wraps StickyRoot and forwards change events', async () => {
    const onChange = vi.fn()
    setScrollY(0)
    const wrapper = mount(VSticky, {
      props: {
        offsetTop: 8,
        onChange
      },
      slots: {
        default: () => 'Sticky'
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-sticky')
    setScrollY(10)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    expect(onChange).toHaveBeenCalledWith(true)
  })
})
