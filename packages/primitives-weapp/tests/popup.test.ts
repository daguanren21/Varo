import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { PopupRoot } from '../src/popup'

describe('primitives-weapp popup', () => {
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
    const onClose = vi.fn()
    const wrapper = mount(PopupRoot, {
      props: {
        visible: true,
        closeable: true,
        'onUpdate:visible': onUpdateVisible,
        onClose
      }
    })

    await wrapper.get('.varo-popup__overlay').trigger('click')

    expect(onUpdateVisible).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalledTimes(1)

    await wrapper.get('.varo-popup__close').trigger('click')

    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
