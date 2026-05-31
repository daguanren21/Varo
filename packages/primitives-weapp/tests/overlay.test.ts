import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { OverlayRoot } from '../src/overlay'

describe('primitives-weapp overlay', () => {
  it('renders visible overlay with z-index and duration tokens', () => {
    const wrapper = mount(OverlayRoot, {
      props: {
        visible: true,
        zIndex: 3000,
        duration: 0.2
      }
    })

    expect(wrapper.attributes('data-state')).toBe('open')
    expect(wrapper.attributes('style')).toContain('z-index: 3000')
    expect(wrapper.attributes('style')).toContain('--varo-overlay-duration: 0.2s')
  })

  it('requests close when the overlay is clicked', async () => {
    const onUpdateVisible = vi.fn()
    const wrapper = mount(OverlayRoot, {
      props: {
        visible: true,
        'onUpdate:visible': onUpdateVisible
      }
    })

    await wrapper.trigger('click')

    expect(onUpdateVisible).toHaveBeenCalledWith(false)
  })
})
