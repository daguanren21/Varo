import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VPopup } from '../src/popup'

describe('ui-weapp popup', () => {
  it('wraps PopupRoot with position, close button, and Varo classes', async () => {
    const onClose = vi.fn()
    const wrapper = mount(VPopup, {
      props: {
        visible: true,
        position: 'top',
        closeable: true,
        round: true,
        onClose
      },
      slots: {
        default: () => 'Popup body'
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-popup')
    expect(wrapper.get('.varo-popup__content').attributes('data-position')).toBe('top')
    expect(wrapper.find('.varo-popup__close').exists()).toBe(true)
    expect(wrapper.text()).toContain('Popup body')

    await wrapper.get('.varo-popup__close').trigger('click')

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
