import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { CellGroupRoot, CellRoot } from '../src/cell'

describe('primitives-weapp cell', () => {
  it('renders NutUI-style title, subtitle, desc, icon, link, and state attrs', () => {
    const wrapper = mount(CellRoot, {
      props: {
        title: '订单状态',
        subTitle: '最近更新',
        desc: '已完成',
        descTextAlign: 'left',
        icon: '◎',
        isLink: true,
        center: true,
        size: 'large',
        titleWidth: '120px',
        roundRadius: '12px'
      }
    })

    expect(wrapper.attributes('data-center')).toBe('true')
    expect(wrapper.attributes('data-clickable')).toBe('true')
    expect(wrapper.attributes('data-desc-align')).toBe('left')
    expect(wrapper.attributes('data-link')).toBe('true')
    expect(wrapper.attributes('data-size')).toBe('large')
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('style')).toContain('--varo-cell-round-radius: 12px')
    expect(wrapper.get('.varo-cell__icon').text()).toBe('◎')
    expect(wrapper.get('.varo-cell__title').text()).toBe('订单状态')
    expect(wrapper.get('.varo-cell__title').attributes('style')).toContain('flex-basis: 120px')
    expect(wrapper.get('.varo-cell__subtitle').text()).toBe('最近更新')
    expect(wrapper.get('.varo-cell__desc').text()).toBe('已完成')
    expect(wrapper.get('.varo-cell__link').attributes('aria-hidden')).toBe('true')
  })

  it('emits click from pointer and keyboard interactions when clickable', async () => {
    const onClick = vi.fn()
    const wrapper = mount(CellRoot, {
      props: {
        title: '设置',
        clickable: true,
        onClick
      }
    })

    await wrapper.trigger('click')
    await wrapper.trigger('keydown', { key: 'Enter' })
    await wrapper.trigger('keydown', { key: ' ' })

    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('renders an anchor when to is provided', () => {
    const wrapper = mount(CellRoot, {
      props: {
        title: '跳转',
        to: '/orders'
      }
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/orders')
    expect(wrapper.attributes('data-clickable')).toBe('true')
  })

  it('renders a grouped cell header', () => {
    const wrapper = mount(CellGroupRoot, {
      props: {
        title: '基础用法',
        desc: '分组描述'
      },
      slots: {
        default: () => 'Cell content'
      }
    })

    expect(wrapper.get('.varo-cell-group__title').text()).toBe('基础用法')
    expect(wrapper.get('.varo-cell-group__desc').text()).toBe('分组描述')
    expect(wrapper.text()).toContain('Cell content')
  })
})
