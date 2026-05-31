import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VCell, VCellGroup } from '../src/cell'

describe('ui-h5 cell', () => {
  it('wraps CellRoot with Varo classes and NutUI-style props', () => {
    const wrapper = mount(VCell, {
      props: {
        title: '标题',
        subTitle: '副标题',
        desc: '描述',
        descTextAlign: 'left',
        isLink: true,
        center: true,
        size: 'large',
        roundRadius: '16px'
      },
      slots: {
        icon: () => 'I'
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-cell')
    expect(wrapper.attributes('data-size')).toBe('large')
    expect(wrapper.attributes('data-link')).toBe('true')
    expect(wrapper.attributes('style')).toContain('--varo-cell-round-radius: 16px')
    expect(wrapper.get('.varo-cell__icon').text()).toBe('I')
    expect(wrapper.get('.varo-cell__title').text()).toBe('标题')
    expect(wrapper.get('.varo-cell__subtitle').text()).toBe('副标题')
    expect(wrapper.get('.varo-cell__desc').text()).toBe('描述')
  })

  it('emits click events and renders group wrappers', async () => {
    const onClick = vi.fn()
    const cell = mount(VCell, {
      props: {
        title: '可点击',
        clickable: true,
        onClick
      }
    })

    await cell.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)

    const group = mount(VCellGroup, {
      props: {
        title: '分组',
        desc: '描述'
      },
      slots: {
        default: () => '列表项'
      }
    })

    expect(group.classes().join(' ')).toContain('varo-cell-group')
    expect(group.get('.varo-cell-group__title').text()).toBe('分组')
    expect(group.text()).toContain('列表项')
  })
})
