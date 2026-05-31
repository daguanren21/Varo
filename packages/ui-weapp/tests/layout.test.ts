import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import { VCol, VRow } from '../src/layout'

describe('ui-weapp layout', () => {
  it('renders row and col metadata', () => {
    const wrapper = mount(VRow, {
      props: {
        gutter: [10, 6],
        justify: 'center'
      },
      slots: {
        default: () => [h(VCol, { span: 12, offset: 2 }, { default: () => '列' })]
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-row')
    expect(wrapper.attributes('data-justify')).toBe('center')
    expect(wrapper.attributes('style')).toContain('--varo-row-gutter-x: 10px')
    expect(wrapper.get('.varo-col').attributes('data-span')).toBe('12')
  })
})
