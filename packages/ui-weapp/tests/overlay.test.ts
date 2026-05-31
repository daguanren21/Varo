import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VOverlay } from '../src/overlay'

describe('ui-weapp overlay', () => {
  it('wraps OverlayRoot and forwards close events', async () => {
    const onUpdateVisible = vi.fn()
    const wrapper = mount(VOverlay, {
      props: {
        visible: true,
        zIndex: 2001,
        'onUpdate:visible': onUpdateVisible
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-overlay')
    expect(wrapper.attributes('style')).toContain('z-index: 2001')

    await wrapper.trigger('click')

    expect(onUpdateVisible).toHaveBeenCalledWith(false)
  })
})
