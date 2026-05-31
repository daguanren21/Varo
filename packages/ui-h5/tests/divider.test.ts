import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { VDivider } from '../src/divider'

describe('ui-h5 divider', () => {
  it('wraps DividerRoot with Varo classes', () => {
    const wrapper = mount(VDivider, {
      props: {
        contentPosition: 'right',
        dashed: true
      },
      slots: {
        default: () => '分割线'
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-divider')
    expect(wrapper.attributes('data-content-position')).toBe('right')
    expect(wrapper.text()).toBe('分割线')
  })
})
