import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import { VGrid, VGridItem } from '../src/grid'

describe('ui-h5 grid', () => {
  it('wraps grid root and item with Varo classes', () => {
    const wrapper = mount(VGrid, {
      props: {
        columnNum: 4,
        gutter: 6
      },
      slots: {
        default: () => [h(VGridItem, { icon: '□', text: '宫格' })]
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-grid')
    expect(wrapper.attributes('data-columns')).toBe('4')
    expect(wrapper.get('.varo-grid__item').text()).toContain('宫格')
  })
})
