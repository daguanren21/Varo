import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { OverlayRoot } from '../src/overlay'

describe('primitives-h5 overlay', () => {
  it('renders visible overlay with z-index and duration tokens', () => {
    const wrapper = mount(OverlayRoot, {
      props: {
        visible: true,
        zIndex: 3000,
        duration: 0.2
      },
      slots: {
        default: () => '遮罩内容'
      }
    })

    expect(wrapper.attributes('data-state')).toBe('open')
    expect(wrapper.attributes('style')).toContain('z-index: 3000')
    expect(wrapper.attributes('style')).toContain('--varo-overlay-duration: 0.2s')
    expect(wrapper.text()).toBe('遮罩内容')
  })

  it('requests close when the overlay is clicked', async () => {
    const onUpdateVisible = vi.fn()
    const onClose = vi.fn()
    const wrapper = mount(OverlayRoot, {
      props: {
        visible: true,
        'onUpdate:visible': onUpdateVisible,
        onClose
      }
    })

    await wrapper.trigger('click')

    expect(onUpdateVisible).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('can keep visible state when overlay click close is disabled', async () => {
    const onUpdateVisible = vi.fn()
    const onClick = vi.fn()
    const wrapper = mount(OverlayRoot, {
      props: {
        defaultVisible: true,
        closeOnClickOverlay: false,
        'onUpdate:visible': onUpdateVisible,
        onClick
      }
    })

    await wrapper.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onUpdateVisible).not.toHaveBeenCalled()
    expect(wrapper.attributes('data-state')).toBe('open')
  })

  it('locks body scroll while visible', async () => {
    document.body.style.overflow = ''
    const wrapper = mount(OverlayRoot, {
      props: {
        visible: true,
        lockScroll: true
      }
    })

    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ visible: false })

    expect(document.body.style.overflow).toBe('')
  })
})
