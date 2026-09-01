import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { VElevator } from '../src/elevator'
import { VFixedNav } from '../src/fixed-nav'
import { VIndicator } from '../src/indicator'
import { VMenu, VMenuItem } from '../src/menu'
import { VNavbar } from '../src/navbar'
import { VPagination } from '../src/pagination'
import { VSideNavbar, VSideNavbarItem } from '../src/side-navbar'
import { VTabbar, VTabbarItem } from '../src/tabbar'
import { VTab, VTabs } from '../src/tabs'

describe('ui-h5 navigation components', () => {
  it('renders elevator groups and changes active index', async () => {
    const onUpdate = vi.fn()
    const scrollIntoView = vi.fn()
    const originalScrollIntoView = Element.prototype.scrollIntoView
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    const wrapper = mount(VElevator, {
      props: {
        'activeIndex': 'A',
        'indexes': [
          { title: 'A', items: ['Apple'] },
          { title: 'B', items: ['Banana'] },
        ],
        'onUpdate:activeIndex': onUpdate,
      },
    })

    try {
      expect(wrapper.findAll('.varo-elevator__group')).toHaveLength(2)
      expect(wrapper.findAll('.varo-elevator__index')[0].attributes('aria-pressed')).toBe('true')
      expect(wrapper.findAll('.varo-elevator__index')[1].attributes('aria-pressed')).toBe('false')
      await wrapper.findAll('.varo-elevator__index')[1].trigger('click')

      expect(onUpdate).toHaveBeenCalledWith('B')
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' })
    }
    finally {
      if (originalScrollIntoView) {
        Object.defineProperty(Element.prototype, 'scrollIntoView', {
          configurable: true,
          value: originalScrollIntoView,
        })
      }
      else {
        delete (Element.prototype as { scrollIntoView?: Element['scrollIntoView'] }).scrollIntoView
      }
    }
  })

  it('toggles fixed nav and emits selected item', async () => {
    const onUpdate = vi.fn()
    const onSelect = vi.fn()
    const wrapper = mount(VFixedNav, {
      props: {
        'visible': false,
        'navList': [{ id: 1, text: '首页', icon: '⌂', num: 2 }],
        'onUpdate:visible': onUpdate,
        onSelect,
      },
    })
    const trigger = wrapper.get('.varo-fixed-nav__trigger')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-controls')).toBeTruthy()

    await wrapper.get('.varo-fixed-nav__trigger').trigger('click')
    expect(onUpdate).toHaveBeenCalledWith(true)

    await wrapper.setProps({ visible: true })
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('.varo-fixed-nav__list').attributes('id')).toBe(trigger.attributes('aria-controls'))
    expect(wrapper.get('.varo-fixed-nav__icon').attributes('aria-hidden')).toBe('true')
    await wrapper.get('.varo-fixed-nav__item').trigger('click')

    expect(onSelect).toHaveBeenCalledWith({ id: 1, text: '首页', icon: '⌂', num: 2 }, 0)
  })

  it('renders indicator dots and active state', () => {
    const wrapper = mount(VIndicator, {
      props: {
        total: 4,
        current: 2,
        type: 'line',
      },
    })
    const items = wrapper.findAll('.varo-indicator__item')

    expect(items).toHaveLength(4)
    expect(items[2].attributes('data-active')).toBe('true')
    expect(items[2].attributes('aria-label')).toBe('第 3 项，共 4 项')
    expect(wrapper.attributes('data-type')).toBe('line')
    expect(wrapper.attributes('role')).toBe('navigation')
    expect(wrapper.attributes('aria-label')).toBe('轮播进度')
  })

  it('emits indicator changes when clicking a target item', async () => {
    const onUpdate = vi.fn()
    const onChange = vi.fn()
    const wrapper = mount(VIndicator, {
      props: {
        'total': 4,
        'current': 1,
        'onUpdate:current': onUpdate,
        onChange,
      },
    })

    await wrapper.findAll('.varo-indicator__item')[3].trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(3)
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('opens menu item and selects an option', async () => {
    const onSelect = vi.fn()
    const wrapper = mount(VMenu, {
      slots: {
        default: () =>
          h(VMenuItem, {
            name: 'sort',
            title: '排序',
            options: [{ text: '默认', value: 'default' }],
            onSelect,
          }),
      },
    })

    await wrapper.get('.varo-menu__title').trigger('click')
    expect(wrapper.find('.varo-menu__popup').exists()).toBe(true)
    const title = wrapper.get('.varo-menu__title')
    const popup = wrapper.get('.varo-menu__popup')
    const option = wrapper.get('.varo-menu__option')
    expect(title.attributes('aria-controls')).toBe(popup.attributes('id'))
    expect(title.attributes('aria-haspopup')).toBe('listbox')
    expect(popup.attributes('role')).toBe('listbox')
    expect(option.attributes('role')).toBe('option')
    expect(option.attributes('aria-selected')).toBe('false')

    await wrapper.get('.varo-menu__option').trigger('click')
    expect(onSelect).toHaveBeenCalledWith('default', { text: '默认', value: 'default' })
  })

  it('closes menu after option selection', async () => {
    const wrapper = mount(VMenu, {
      slots: {
        default: () =>
          h(VMenuItem, {
            name: 'sort',
            title: '排序',
            options: [{ text: '默认', value: 'default' }],
          }),
      },
    })

    await wrapper.get('.varo-menu__title').trigger('click')
    expect(wrapper.find('.varo-menu__popup').exists()).toBe(true)

    await wrapper.get('.varo-menu__option').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.varo-menu__popup').exists()).toBe(false)
  })

  it('emits navbar side clicks', async () => {
    const onClickLeft = vi.fn()
    const onClickRight = vi.fn()
    const wrapper = mount(VNavbar, {
      props: {
        title: '标题',
        leftText: '返回',
        rightText: '更多',
        leftArrow: true,
        onClickLeft,
        onClickRight,
      },
    })
    expect(wrapper.get('.varo-navbar__left').attributes('aria-label')).toBe('返回')
    expect(wrapper.get('.varo-navbar__right').attributes('aria-label')).toBe('更多')
    expect(wrapper.get('.varo-navbar__arrow').attributes('aria-hidden')).toBe('true')

    await wrapper.get('.varo-navbar__left').trigger('click')
    await wrapper.get('.varo-navbar__right').trigger('click')

    expect(onClickLeft).toHaveBeenCalledTimes(1)
    expect(onClickRight).toHaveBeenCalledTimes(1)
  })

  it('changes pagination page', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VPagination, {
      props: {
        'modelValue': 1,
        'pageCount': 3,
        'onUpdate:modelValue': onUpdate,
      },
    })
    expect(wrapper.attributes('aria-label')).toBe('分页')
    expect(wrapper.findAll('.varo-pagination__page')[0].attributes('aria-current')).toBe('page')
    expect(wrapper.findAll('.varo-pagination__page')[0].attributes('aria-label')).toBe('第 1 页，共 3 页')

    await wrapper.get('.varo-pagination__next').trigger('click')
    expect(onUpdate).toHaveBeenCalledWith(2)
  })

  it('changes side navbar item', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSideNavbar, {
      props: {
        'modelValue': 'home',
        'onUpdate:modelValue': onUpdate,
      },
      slots: {
        default: () => [
          h(VSideNavbarItem, { name: 'home', title: '首页' }),
          h(VSideNavbarItem, { name: 'mine', title: '我的' }),
        ],
      },
    })

    await wrapper.findAll('.varo-side-navbar__item')[1].trigger('click')
    expect(onUpdate).toHaveBeenCalledWith('mine')
  })

  it('changes tabbar item', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VTabbar, {
      props: {
        'modelValue': 'home',
        'onUpdate:modelValue': onUpdate,
      },
      slots: {
        default: () => [
          h(VTabbarItem, { name: 'home', icon: '⌂' }, { default: () => '首页' }),
          h(VTabbarItem, { name: 'cart', icon: '□', badge: '2' }, { default: () => '购物车' }),
        ],
      },
    })

    await wrapper.findAll('.varo-tabbar__item')[1].trigger('click')
    expect(onUpdate).toHaveBeenCalledWith('cart')
  })

  it('changes tabs by tab title', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VTabs, {
      props: {
        'active': 'a',
        'onUpdate:active': onUpdate,
      },
      slots: {
        default: () => [
          h(VTab, { name: 'a', title: '标签 A' }, { default: () => '内容 A' }),
          h(VTab, { name: 'b', title: '标签 B' }, { default: () => '内容 B' }),
        ],
      },
    })

    await wrapper.vm.$nextTick()
    await wrapper.findAll('.varo-tabs__tab')[1].trigger('click')

    expect(onUpdate).toHaveBeenCalledWith('b')
  })
})
