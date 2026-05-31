import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { VElevator } from '../src/elevator'
import { VFixedNav } from '../src/fixed-nav'
import { VIndicator } from '../src/indicator'
import { VMenu, VMenuItem } from '../src/menu'
import { VNavbar } from '../src/navbar'
import { VPagination } from '../src/pagination'
import { VSideNavbar, VSideNavbarItem } from '../src/side-navbar'
import { VTab, VTabs } from '../src/tabs'
import { VTabbar, VTabbarItem } from '../src/tabbar'

describe('ui-weapp navigation components', () => {
  it('renders elevator and changes active index', async () => {
    const onUpdate = vi.fn()
    const scrollIntoView = vi.fn()
    const originalScrollIntoView = Element.prototype.scrollIntoView
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView
    })
    const wrapper = mount(VElevator, {
      props: {
        activeIndex: 'A',
        indexes: [
          { title: 'A', items: ['Apple'] },
          { title: 'B', items: ['Banana'] }
        ],
        'onUpdate:activeIndex': onUpdate
      }
    })

    try {
      await wrapper.findAll('.varo-elevator__index')[1].trigger('click')
      expect(onUpdate).toHaveBeenCalledWith('B')
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' })
    } finally {
      if (originalScrollIntoView) {
        Object.defineProperty(Element.prototype, 'scrollIntoView', {
          configurable: true,
          value: originalScrollIntoView
        })
      } else {
        delete (Element.prototype as { scrollIntoView?: Element['scrollIntoView'] }).scrollIntoView
      }
    }
  })

  it('renders fixed nav, indicator, navbar, and pagination behavior', async () => {
    const onVisible = vi.fn()
    const fixed = mount(VFixedNav, {
      props: {
        visible: false,
        navList: [{ id: 1, text: '首页' }],
        'onUpdate:visible': onVisible
      }
    })
    await fixed.get('.varo-fixed-nav__trigger').trigger('click')
    expect(onVisible).toHaveBeenCalledWith(true)

    const indicator = mount(VIndicator, { props: { total: 3, current: 1 } })
    expect(indicator.findAll('.varo-indicator__item')).toHaveLength(3)

    const indicatorUpdate = vi.fn()
    const clickableIndicator = mount(VIndicator, {
      props: { total: 3, current: 0, 'onUpdate:current': indicatorUpdate }
    })
    await clickableIndicator.findAll('.varo-indicator__item')[2].trigger('click')
    expect(indicatorUpdate).toHaveBeenCalledWith(2)

    const left = vi.fn()
    const nav = mount(VNavbar, { props: { title: '标题', leftText: '返回', onClickLeft: left } })
    await nav.get('.varo-navbar__left').trigger('click')
    expect(left).toHaveBeenCalledTimes(1)

    const page = vi.fn()
    const pagination = mount(VPagination, { props: { modelValue: 1, pageCount: 2, 'onUpdate:modelValue': page } })
    await pagination.get('.varo-pagination__next').trigger('click')
    expect(page).toHaveBeenCalledWith(2)
  })

  it('renders menu, side navbar, tabbar, and tabs interactions', async () => {
    const menuSelect = vi.fn()
    const menu = mount(VMenu, {
      slots: {
        default: () =>
          h(VMenuItem, { name: 'sort', title: '排序', options: [{ text: '默认', value: 'default' }], onSelect: menuSelect })
      }
    })
    await menu.get('.varo-menu__title').trigger('click')
    await menu.get('.varo-menu__option').trigger('click')
    expect(menuSelect).toHaveBeenCalledWith('default', { text: '默认', value: 'default' })

    const sideUpdate = vi.fn()
    const side = mount(VSideNavbar, {
      props: { modelValue: 'a', 'onUpdate:modelValue': sideUpdate },
      slots: { default: () => [h(VSideNavbarItem, { name: 'a', title: 'A' }), h(VSideNavbarItem, { name: 'b', title: 'B' })] }
    })
    await side.findAll('.varo-side-navbar__item')[1].trigger('click')
    expect(sideUpdate).toHaveBeenCalledWith('b')

    const tabbarUpdate = vi.fn()
    const tabbar = mount(VTabbar, {
      props: { modelValue: 'home', 'onUpdate:modelValue': tabbarUpdate },
      slots: { default: () => [h(VTabbarItem, { name: 'home' }, { default: () => '首页' }), h(VTabbarItem, { name: 'mine' }, { default: () => '我的' })] }
    })
    await tabbar.findAll('.varo-tabbar__item')[1].trigger('click')
    expect(tabbarUpdate).toHaveBeenCalledWith('mine')

    const tabsUpdate = vi.fn()
    const tabs = mount(VTabs, {
      props: { active: 'a', 'onUpdate:active': tabsUpdate },
      slots: { default: () => [h(VTab, { name: 'a', title: 'A' }, { default: () => 'A' }), h(VTab, { name: 'b', title: 'B' }, { default: () => 'B' })] }
    })
    await tabs.vm.$nextTick()
    await tabs.findAll('.varo-tabs__tab')[1].trigger('click')
    expect(tabsUpdate).toHaveBeenCalledWith('b')
  })

  it('closes menu after option selection', async () => {
    const wrapper = mount(VMenu, {
      slots: {
        default: () =>
          h(VMenuItem, {
            name: 'sort',
            title: '排序',
            options: [{ text: '默认', value: 'default' }]
          })
      }
    })

    await wrapper.get('.varo-menu__title').trigger('click')
    expect(wrapper.find('.varo-menu__popup').exists()).toBe(true)

    await wrapper.get('.varo-menu__option').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.varo-menu__popup').exists()).toBe(false)
  })
})
