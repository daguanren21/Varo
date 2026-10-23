import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { VGrid, VGridItem } from '../src/grid'

describe('ui-h5 grid', () => {
  it('keeps single-digit badges circular and marks wider values', async () => {
    const item = mount(VGridItem, { props: { badge: 2, icon: '□', text: '订单' } })
    const badge = item.get('.varo-grid__badge')
    expect(badge.attributes('data-wide')).toBe('false')

    await item.setProps({ badge: '12' })
    expect(badge.attributes('data-wide')).toBe('true')
  })

  it('renders an explicit zero badge without an icon and removes an absent badge', async () => {
    const item = mount(VGridItem, { props: { text: '订单' } })
    expect(item.find('.varo-grid__badge').exists()).toBe(false)

    await item.setProps({ badge: 0 })
    expect(item.get('.varo-grid__badge').text()).toBe('0')

    await item.setProps({ badge: undefined })
    expect(item.find('.varo-grid__badge').exists()).toBe(false)
  })

  it('activates clickable items with Enter and Space', async () => {
    const onClick = vi.fn()
    const wrapper = mount(VGrid, {
      props: { clickable: true },
      slots: {
        default: () => [h(VGridItem, { text: '订单', onClick })],
      },
    })
    const item = wrapper.get('.varo-grid__item')

    await item.trigger('keydown', { key: 'Enter' })
    await item.trigger('keydown', { key: ' ' })
    await item.trigger('keydown', { key: 'Escape' })

    expect(item.attributes('role')).toBe('button')
    expect(item.attributes('tabindex')).toBe('0')
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
