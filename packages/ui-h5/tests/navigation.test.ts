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

  it('updates the Elevator anchor while its content scrolls', async () => {
    const wrapper = mount(VElevator, {
      props: {
        defaultActiveIndex: 'A',
        indexes: [
          { title: 'A', items: ['Apple'] },
          { title: 'B', items: ['Banana'] },
          { title: 'C', items: ['Cherry'] },
        ],
      },
    })
    const content = wrapper.get<HTMLElement>('.varo-elevator__content').element
    const groups = wrapper.findAll<HTMLElement>('.varo-elevator__group')
    let scrollTop = 40
    Object.defineProperties(content, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 300 },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (value) => { scrollTop = Number(value) },
      },
    })
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect)
    vi.spyOn(groups[0]!.element, 'getBoundingClientRect').mockReturnValue({ top: 80 } as DOMRect)
    vi.spyOn(groups[1]!.element, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect)
    vi.spyOn(groups[2]!.element, 'getBoundingClientRect').mockReturnValue({ top: 180 } as DOMRect)

    await wrapper.get('.varo-elevator__content').trigger('scroll')
    expect(wrapper.attributes('data-active-index')).toBe('B')
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual(['B'])

    scrollTop = 200
    await wrapper.get('.varo-elevator__content').trigger('scroll')
    expect(wrapper.attributes('data-active-index')).toBe('C')
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual(['C'])
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
    expect(wrapper.findAll('.varo-side-navbar__item')[0].attributes('aria-current')).toBe('page')
    expect(wrapper.findAll('.varo-side-navbar__item')[1].attributes('aria-current')).toBeUndefined()

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
    expect(wrapper.findAll('.varo-tabbar__item')[0].attributes('aria-current')).toBe('page')
    expect(wrapper.findAll('.varo-tabbar__item')[1].attributes('aria-current')).toBeUndefined()
    expect(wrapper.get('.varo-tabbar__icon').attributes('aria-hidden')).toBe('true')

    await wrapper.findAll('.varo-tabbar__item')[1].trigger('click')
    expect(onUpdate).toHaveBeenCalledWith('cart')
  })

  it('provides linked tabs, roving keyboard focus, and disabled-item guards', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VTabs, {
      props: {
        'id': 'account-tabs',
        'active': 'a',
        'ariaLabel': 'Account sections',
        'onUpdate:active': onUpdate,
      },
      attachTo: document.body,
      slots: {
        default: () => [
          h(VTab, { name: 'a', title: '标签 A' }, { default: () => '内容 A' }),
          h(VTab, { name: 'b', title: '标签 B', disabled: true }, { default: () => '内容 B' }),
          h(VTab, { name: 'c', title: '标签 C' }, { default: () => '内容 C' }),
        ],
      },
    })

    await wrapper.vm.$nextTick()
    const list = wrapper.get('[role="tablist"]')
    const tabs = wrapper.findAll<HTMLButtonElement>('[role="tab"]')
    const panel = wrapper.get('[role="tabpanel"]')

    expect(list.attributes('aria-label')).toBe('Account sections')
    expect(list.attributes('aria-orientation')).toBe('horizontal')
    expect(tabs[0].attributes()).toMatchObject({
      'aria-controls': 'account-tabs-panel-s-a',
      'aria-selected': 'true',
      'id': 'account-tabs-trigger-s-a',
      'tabindex': '0',
    })
    expect(tabs[1].attributes()).toMatchObject({
      'aria-disabled': 'true',
      'aria-selected': 'false',
      'data-disabled': 'true',
      'disabled': '',
      'tabindex': '-1',
    })
    expect(panel.attributes()).toMatchObject({
      'aria-labelledby': 'account-tabs-trigger-s-a',
      'id': 'account-tabs-panel-s-a',
      'role': 'tabpanel',
      'tabindex': '0',
    })

    await tabs[1].trigger('click')
    expect(onUpdate).not.toHaveBeenCalled()

    tabs[0].element.focus()
    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    expect(onUpdate).toHaveBeenLastCalledWith('c')
    expect(document.activeElement).toBe(tabs[2].element)

    await wrapper.setProps({ active: 'c' })
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('内容 C')
    expect(tabs[2].attributes('aria-selected')).toBe('true')
    expect(tabs[2].attributes('tabindex')).toBe('0')

    await tabs[2].trigger('keydown', { key: 'Home' })
    expect(onUpdate).toHaveBeenLastCalledWith('a')
    expect(document.activeElement).toBe(tabs[0].element)

    wrapper.unmount()
  })
})
