import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import { VGrid, VGridItem } from '../src/grid'

describe('ui-weapp grid', () => {
  it('renders grid root and item structure', () => {
    const wrapper = mount(VGrid, {
      props: {
        columnNum: 4,
        gutter: 6,
        clickable: true
      },
      slots: {
        default: () => [h(VGridItem, { icon: '□', text: '宫格', badge: '1' })]
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-grid')
    expect(wrapper.attributes('data-columns')).toBe('4')
    expect(wrapper.get('.varo-grid__item').attributes('data-clickable')).toBe('true')
    expect(wrapper.get('.varo-grid__badge').text()).toBe('1')
  })
})
