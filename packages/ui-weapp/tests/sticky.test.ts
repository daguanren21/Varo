import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VSticky } from '../src/sticky'

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value,
  })
}

function mockStickyTop(initial = 100) {
  let top = initial
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    bottom: top + 20,
    height: 20,
    left: 0,
    right: 100,
    top,
    width: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }))
  return (value: number) => {
    top = value
  }
}

describe('ui-weapp sticky', () => {
  it('wraps StickyRoot and forwards change events', async () => {
    const onChange = vi.fn()
    setScrollY(0)
    const setStickyTop = mockStickyTop()
    const wrapper = mount(VSticky, {
      props: {
        offsetTop: 8,
        onChange,
      },
      slots: {
        default: () => 'Sticky',
      },
    })

    expect(wrapper.classes().join(' ')).toContain('varo-sticky')
    setStickyTop(8)
    setScrollY(10)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    expect(onChange).toHaveBeenCalledWith(true)
    vi.restoreAllMocks()
  })
})
