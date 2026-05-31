import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import { VCol, VRow } from '../src/layout'

describe('ui-h5 layout', () => {
  it('wraps row and col primitives', () => {
    const wrapper = mount(VRow, {
      props: {
        gutter: 10,
        justify: 'center'
      },
      slots: {
        default: () => [h(VCol, { span: 12 }, { default: () => '列' })]
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-row')
    expect(wrapper.attributes('data-justify')).toBe('center')
    expect(wrapper.get('.varo-col').classes().join(' ')).toContain('varo-col')
  })
})
