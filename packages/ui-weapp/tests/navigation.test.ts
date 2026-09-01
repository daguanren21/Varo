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

describe('ui-weapp navigation components', () => {
  it('renders elevator and changes active index', async () => {
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

  it('renders fixed nav, indicator, navbar, and pagination behavior', async () => {
    const onVisible = vi.fn()
    const fixed = mount(VFixedNav, {
      props: {
        'visible': false,
        'navList': [{ id: 1, text: '首页' }],
        'onUpdate:visible': onVisible,
      },
    })
    const fixedTrigger = fixed.get('.varo-fixed-nav__trigger')
    expect(fixedTrigger.attributes('aria-expanded')).toBe('false')
    expect(fixedTrigger.attributes('aria-controls')).toBeTruthy()
    await fixed.get('.varo-fixed-nav__trigger').trigger('click')
    expect(onVisible).toHaveBeenCalledWith(true)
    await fixed.setProps({ visible: true })
    expect(fixedTrigger.attributes('aria-expanded')).toBe('true')
    expect(fixed.get('.varo-fixed-nav__list').attributes('id')).toBe(fixedTrigger.attributes('aria-controls'))

    const indicator = mount(VIndicator, { props: { total: 3, current: 1 } })
    expect(indicator.findAll('.varo-indicator__item')).toHaveLength(3)
    expect(indicator.attributes('role')).toBe('navigation')
    expect(indicator.attributes('aria-label')).toBe('轮播进度')
    expect(indicator.findAll('.varo-indicator__item')[1].attributes('aria-label')).toBe('第 2 项，共 3 项')

    const indicatorUpdate = vi.fn()
    const clickableIndicator = mount(VIndicator, {
      props: { 'total': 3, 'current': 0, 'onUpdate:current': indicatorUpdate },
    })
    await clickableIndicator.findAll('.varo-indicator__item')[2].trigger('click')
    expect(indicatorUpdate).toHaveBeenCalledWith(2)

    const left = vi.fn()
    const nav = mount(VNavbar, { props: { title: '标题', leftText: '返回', onClickLeft: left } })
    expect(nav.get('.varo-navbar__left').attributes('aria-label')).toBe('返回')
    expect(nav.get('.varo-navbar__right').attributes('aria-hidden')).toBe('true')
    expect(nav.get('.varo-navbar__right').attributes('tabindex')).toBe('-1')
    await nav.get('.varo-navbar__left').trigger('click')
    expect(left).toHaveBeenCalledTimes(1)

    const page = vi.fn()
    const pagination = mount(VPagination, { props: { 'modelValue': 1, 'pageCount': 2, 'onUpdate:modelValue': page } })
    expect(pagination.attributes('aria-label')).toBe('分页')
    expect(pagination.findAll('.varo-pagination__page')[0].attributes('aria-current')).toBe('page')
    expect(pagination.findAll('.varo-pagination__page')[0].attributes('aria-label')).toBe('第 1 页，共 2 页')
    await pagination.get('.varo-pagination__next').trigger('click')
    expect(page).toHaveBeenCalledWith(2)
  })

  it('renders menu, side navbar, tabbar, and tabs interactions', async () => {
    const menuSelect = vi.fn()
    const menu = mount(VMenu, {
      slots: {
        default: () =>
          h(VMenuItem, { name: 'sort', title: '排序', options: [{ text: '默认', value: 'default' }], onSelect: menuSelect }),
      },
    })
    await menu.get('.varo-menu__title').trigger('click')
    expect(menu.get('.varo-menu__title').attributes('aria-controls')).toBe(menu.get('.varo-menu__popup').attributes('id'))
    expect(menu.get('.varo-menu__title').attributes('aria-haspopup')).toBe('listbox')
    expect(menu.get('.varo-menu__popup').attributes('role')).toBe('listbox')
    expect(menu.get('.varo-menu__option').attributes('role')).toBe('option')
    await menu.get('.varo-menu__option').trigger('click')
    expect(menuSelect).toHaveBeenCalledWith('default', { text: '默认', value: 'default' })

    const sideUpdate = vi.fn()
    const side = mount(VSideNavbar, {
      props: { 'modelValue': 'a', 'onUpdate:modelValue': sideUpdate },
      slots: { default: () => [h(VSideNavbarItem, { name: 'a', title: 'A' }), h(VSideNavbarItem, { name: 'b', title: 'B' })] },
    })
    expect(side.findAll('.varo-side-navbar__item')[0].attributes('aria-current')).toBe('page')
    expect(side.findAll('.varo-side-navbar__item')[1].attributes('aria-current')).toBeUndefined()
    await side.findAll('.varo-side-navbar__item')[1].trigger('click')
    expect(sideUpdate).toHaveBeenCalledWith('b')

    const tabbarUpdate = vi.fn()
    const tabbar = mount(VTabbar, {
      props: { 'modelValue': 'home', 'onUpdate:modelValue': tabbarUpdate },
      slots: { default: () => [h(VTabbarItem, { name: 'home' }, { default: () => '首页' }), h(VTabbarItem, { name: 'mine' }, { default: () => '我的' })] },
    })
    expect(tabbar.findAll('.varo-tabbar__item')[0].attributes('aria-current')).toBe('page')
    expect(tabbar.findAll('.varo-tabbar__item')[1].attributes('aria-current')).toBeUndefined()
    await tabbar.findAll('.varo-tabbar__item')[1].trigger('click')
    expect(tabbarUpdate).toHaveBeenCalledWith('mine')

    const tabsUpdate = vi.fn()
    const tabs = mount(VTabs, {
      props: { 'active': 'a', 'onUpdate:active': tabsUpdate },
      slots: { default: () => [h(VTab, { name: 'a', title: 'A' }, { default: () => 'A' }), h(VTab, { name: 'b', title: 'B' }, { default: () => 'B' })] },
    })
    await tabs.vm.$nextTick()
    await tabs.findAll('.varo-tabs__tab')[1].trigger('click')
    expect(tabsUpdate).toHaveBeenCalledWith('b')
  })

  it('exposes accessible tabs and skips disabled items during keyboard navigation', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VTabs, {
      props: {
        'id': 'weapp-tabs',
        'active': 'a',
        'ariaLabel': 'Order sections',
        'onUpdate:active': onUpdate,
      },
      attachTo: document.body,
      slots: {
        default: () => [
          h(VTab, { name: 'a', title: 'A' }, { default: () => 'A panel' }),
          h(VTab, { name: 'b', title: 'B', disabled: true }, { default: () => 'B panel' }),
          h(VTab, { name: 'c', title: 'C' }, { default: () => 'C panel' }),
        ],
      },
    })

    await wrapper.vm.$nextTick()
    const tabs = wrapper.findAll<HTMLButtonElement>('[role="tab"]')
    const panel = wrapper.get('[role="tabpanel"]')

    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('Order sections')
    expect(tabs[0].attributes('aria-controls')).toBe(panel.attributes('id'))
    expect(panel.attributes('aria-labelledby')).toBe(tabs[0].attributes('id'))
    expect(tabs[1].attributes('aria-disabled')).toBe('true')

    await tabs[1].trigger('click')
    expect(onUpdate).not.toHaveBeenCalled()

    tabs[0].element.focus()
    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    expect(onUpdate).toHaveBeenCalledWith('c')
    expect(document.activeElement).toBe(tabs[2].element)

    wrapper.unmount()
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
})
