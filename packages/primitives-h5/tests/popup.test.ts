import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { PopupRoot } from '../src/popup'

describe('primitives-h5 popup', () => {
  it('renders overlay and positioned content', () => {
    const wrapper = mount(PopupRoot, {
      props: {
        visible: true,
        position: 'bottom',
        round: true,
        zIndex: 3100
      },
      slots: {
        default: () => '弹出内容'
      }
    })

    expect(wrapper.attributes('data-state')).toBe('open')
    expect(wrapper.get('.varo-popup__overlay').attributes('style')).toContain('z-index: 3100')
    expect(wrapper.get('.varo-popup__content').attributes('data-position')).toBe('bottom')
    expect(wrapper.get('.varo-popup__content').attributes('data-round')).toBe('true')
    expect(wrapper.text()).toContain('弹出内容')
  })

  it('requests close from overlay click and close button', async () => {
    const onUpdateVisible = vi.fn()
    const onClickOverlay = vi.fn()
    const onClose = vi.fn()
    const wrapper = mount(PopupRoot, {
      props: {
        visible: true,
        closeable: true,
        'onUpdate:visible': onUpdateVisible,
        onClickOverlay,
        onClose
      }
    })

    await wrapper.get('.varo-popup__overlay').trigger('click')

    expect(onClickOverlay).toHaveBeenCalledTimes(1)
    expect(onUpdateVisible).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalledTimes(1)

    await wrapper.get('.varo-popup__close').trigger('click')

    expect(onUpdateVisible).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('supports overlay-free and persistent rendering modes', async () => {
    const wrapper = mount(PopupRoot, {
      props: {
        visible: false,
        overlay: false,
        destroyOnClose: false,
        position: 'right'
      },
      slots: {
        default: () => '保留内容'
      }
    })

    expect(wrapper.find('.varo-popup__overlay').exists()).toBe(false)
    expect(wrapper.get('.varo-popup__content').attributes('data-position')).toBe('right')
    expect(wrapper.get('.varo-popup__content').attributes('data-state')).toBe('closed')
    expect(wrapper.text()).toContain('保留内容')
  })
})
