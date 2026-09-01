import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { VGrid, VGridItem } from '../src/grid'

describe('ui-weapp grid', () => {
  it('renders grid root and keyboard-activatable item structure', async () => {
    const onClick = vi.fn()
    const wrapper = mount(VGrid, {
      props: {
        columnNum: 4,
        gutter: 6,
        clickable: true,
      },
      slots: {
        default: () => [h(VGridItem, { icon: '□', text: '宫格', badge: '1', onClick })],
      },
    })

    expect(wrapper.classes().join(' ')).toContain('varo-grid')
    expect(wrapper.attributes('data-columns')).toBe('4')
    expect(wrapper.get('.varo-grid__item').attributes('data-clickable')).toBe('true')
    expect(wrapper.get('.varo-grid__badge').text()).toBe('1')
    await wrapper.get('.varo-grid__item').trigger('keydown', { key: 'Enter' })
    await wrapper.get('.varo-grid__item').trigger('keydown', { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
