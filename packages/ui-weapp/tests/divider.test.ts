import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { VDivider } from '../src/divider'

describe('ui-weapp divider', () => {
  it('renders divider metadata and content', () => {
    const wrapper = mount(VDivider, {
      props: {
        contentPosition: 'left',
        dashed: true,
        lineColor: '#e5e7eb'
      },
      slots: {
        default: () => '分割线'
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-divider')
    expect(wrapper.attributes('data-content-position')).toBe('left')
    expect(wrapper.attributes('data-dashed')).toBe('true')
    expect(wrapper.attributes('style')).toContain('--varo-divider-line-color: #e5e7eb')
    expect(wrapper.text()).toBe('分割线')
  })
})
