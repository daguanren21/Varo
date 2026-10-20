import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { Comment, defineComponent, Fragment, h, ref, Text } from 'vue'
import { VBreadcrumb } from '../src/breadcrumb'
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
  it('marks the last breadcrumb as current and emits ancestor selection', async () => {
    const onSelect = vi.fn()
    const wrapper = mount(VBreadcrumb, {
      props: {
        items: [
          { href: '/', label: 'Home' },
          { href: '/orders', label: 'Orders' },
          { label: 'Detail' },
        ],
        label: 'Page path',
        onSelect,
      },
      slots: {
        item: ({ current, item }: { current: boolean, item: { label: string } }) =>
          current ? `Now ${item.label}` : item.label,
      },
    })

    expect(wrapper.get('nav').attributes('aria-label')).toBe('Page path')
    expect(wrapper.findAll('.varo-breadcrumb__item')).toHaveLength(3)
    expect(wrapper.findAll('.varo-breadcrumb__separator .varo-icon[data-name="chevronRight"]')).toHaveLength(2)
    expect(wrapper.get('.varo-breadcrumb__current').attributes('aria-current')).toBe('page')
    expect(wrapper.get('.varo-breadcrumb__current').text()).toBe('Now Detail')
    expect(wrapper.get('a.varo-breadcrumb__link').attributes('href')).toBe('/')

    await wrapper.findAll('.varo-breadcrumb__link')[1]!.trigger('click')
    expect(onSelect).toHaveBeenCalledWith({
      index: 1,
      item: { href: '/orders', label: 'Orders' },
    })

    await wrapper.get('.varo-breadcrumb__current').trigger('click')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('scrolls only the Elevator content when an index is selected', async () => {
    const onUpdate = vi.fn()
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
    const content = wrapper.get<HTMLElement>('.varo-elevator__content').element
    const target = wrapper.findAll<HTMLElement>('.varo-elevator__group')[1]!.element
    const scrollTo = vi.fn()
    Object.defineProperty(content, 'scrollTo', { configurable: true, value: scrollTo })
    Object.defineProperty(target, 'offsetTop', { configurable: true, value: 200 })

    expect(wrapper.findAll('.varo-elevator__index')[0]!.attributes('aria-pressed')).toBe('true')
    expect(wrapper.findAll('.varo-elevator__index')[1]!.attributes('aria-pressed')).toBe('false')
    await wrapper.findAll('.varo-elevator__index')[1]!.trigger('click')

    expect(onUpdate).toHaveBeenCalledWith('B')
    expect(scrollTo).toHaveBeenCalledWith({ top: 200, behavior: 'smooth' })
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

  it.each([1, 3, 4, 20, 38, 40])('keeps first, current, and last in a five-token window at page %i', (page) => {
    const wrapper = mount(VPagination, { props: { modelValue: page, pageCount: 40 } })
    const buttons = wrapper.findAll('.varo-pagination__page')
    const labels = buttons.map(button => Number(button.text()))
    expect(labels).toContain(1)
    expect(labels).toContain(page)
    expect(labels).toContain(40)
    expect(buttons.length + wrapper.findAll('.varo-pagination__ellipsis').length).toBe(5)
    expect(wrapper.get('[aria-current="page"]').text()).toBe(String(page))
    expect(wrapper.get('.varo-pagination__prev').attributes('disabled') !== undefined).toBe(page === 1)
    expect(wrapper.get('.varo-pagination__next').attributes('disabled') !== undefined).toBe(page === 40)
    expect(wrapper.findAll('button.varo-pagination__ellipsis')).toHaveLength(0)
    wrapper.unmount()
  })

  it('keeps huge page counts bounded and ellipses inert', async () => {
    const wrapper = mount(VPagination, { props: { modelValue: 500_000_000, pageCount: 1_000_000_000 } })
    expect(wrapper.findAll('.varo-pagination__page').map(button => button.text())).toEqual(['1', '500000000', '1000000000'])
    await wrapper.get('.varo-pagination__ellipsis').trigger('click')
    await wrapper.get('[aria-current="page"]').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.get('.varo-pagination__next').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[500_000_001]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[500_000_001]])
    wrapper.unmount()
  })

  it('retains simple mode and rejects unavailable navigation', async () => {
    const wrapper = mount(VPagination, { props: { modelValue: 40, pageCount: 40, mode: 'simple' } })
    expect(wrapper.get('.varo-pagination__simple').text()).toBe('40/40')
    expect(wrapper.findAll('.varo-pagination__page')).toHaveLength(0)
    await wrapper.get('.varo-pagination__next').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.get('.varo-pagination__prev').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[39]])
    await wrapper.setProps({ modelValue: 1, pageCount: 0, mode: 'multi' })
    expect(wrapper.findAll('.varo-pagination__page')).toHaveLength(0)
    expect(wrapper.get<HTMLButtonElement>('.varo-pagination__prev').element.disabled).toBe(true)
    expect(wrapper.get<HTMLButtonElement>('.varo-pagination__next').element.disabled).toBe(true)
    await wrapper.get('.varo-pagination__prev').trigger('click')
    await wrapper.get('.varo-pagination__next').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[39]])
    wrapper.unmount()
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

  it('emits only clickTab for the active tab and keeps disabled tabs inert', async () => {
    const wrapper = mount(VTabs, {
      props: { active: 0 },
      slots: {
        default: () => [
          h(VTab, { name: 0, title: 'First' }, { default: () => 'First panel' }),
          h(VTab, { name: 1, title: 'Second' }, { default: () => 'Second panel' }),
          h(VTab, { name: 2, title: 'Disabled', disabled: true }),
        ],
      },
    })
    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[0]!.trigger('click')
    await tabs[0]!.trigger('click')
    await tabs[2]!.trigger('click')
    expect(wrapper.emitted('clickTab')).toEqual([[{ name: 0, title: 'First' }], [{ name: 0, title: 'First' }]])
    expect(wrapper.emitted('update:active')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    await tabs[1]!.trigger('click')
    expect(wrapper.emitted('update:active')).toEqual([[1]])
    expect(wrapper.emitted('change')).toEqual([[1]])
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('First panel')
    await wrapper.setProps({ active: 1 })
    await tabs[1]!.trigger('click')
    expect(wrapper.emitted('change')).toEqual([[1]])
    expect(wrapper.emitted('clickTab')).toHaveLength(4)
    wrapper.unmount()
  })

  it('honors bare disabled attributes while preserving explicit false in compiled slots', async () => {
    const wrapper = mount({
      components: { VTabs, VTab },
      template: '<VTabs active="first"><VTab name="first" title="First" /><VTab name="locked" title="Locked" disabled /><VTab name="last" title="Last" :disabled="false" /></VTabs>',
    })
    const tabs = wrapper.findComponent(VTabs)
    const buttons = tabs.findAll<HTMLButtonElement>('[role="tab"]')
    expect(buttons[1].element.disabled).toBe(true)
    await buttons[1].trigger('click')
    expect(tabs.emitted('clickTab')).toBeUndefined()
    expect(tabs.emitted('change')).toBeUndefined()
    await buttons[2].trigger('click')
    expect(tabs.emitted('update:active')).toEqual([['last']])
    wrapper.unmount()
  })

  it('omits hidden conditional placeholders while retaining nested v-for tabs', async () => {
    const wrapper = mount({
      components: { VTabs, VTab },
      data: () => ({
        active: 'a',
        show: false,
        items: [{ name: 'b', title: 'B' }, { name: 'c', title: 'C' }],
      }),
      template: `
        <VTabs v-model:active="active">
          <VTab name="a" title="A">Panel A</VTab>
          <VTab v-if="show" name="conditional" title="Conditional">Conditional panel</VTab>
          <template v-for="item in items" :key="item.name">
            <VTab :name="item.name" :title="item.title">Panel {{ item.title }}</VTab>
          </template>
        </VTabs>
      `,
    })
    const tabs = wrapper.getComponent(VTabs)
    expect(tabs.findAll('[role="tab"]').map(tab => tab.text())).toEqual(['A', 'B', 'C'])
    await tabs.findAll('[role="tab"]')[1].trigger('click')
    expect(tabs.get('[role="tabpanel"]').text()).toBe('Panel B')
    expect(tabs.emitted('change')).toEqual([['b']])
    await wrapper.setData({ show: true })
    expect(tabs.findAll('[role="tab"]').map(tab => tab.text())).toEqual(['A', 'Conditional', 'B', 'C'])
    await wrapper.setData({ show: false, items: [{ name: 'c', title: 'C' }, { name: 'b', title: 'B' }] })
    expect(tabs.findAll('[role="tab"]').map(tab => tab.text())).toEqual(['A', 'C', 'B'])
    expect(tabs.get('[role="tabpanel"]').text()).toBe('Panel B')
    await tabs.findAll('[role="tab"]')[1].trigger('click')
    expect(tabs.get('[role="tabpanel"]').text()).toBe('Panel C')
    expect(tabs.emitted('change')).toEqual([['b'], ['c']])
    wrapper.unmount()
  })

  it.each([
    { group: 'single-child fragments', multiple: false, localKeys: false },
    { group: 'multi-child fragments', multiple: true, localKeys: false },
    { group: 'fragments with repeated local child keys', multiple: true, localKeys: true },
  ])('preserves active panel state when $group move, insert, and remove', async ({ multiple, localKeys }) => {
    const Draft = defineComponent({
      setup() {
        const value = ref('')
        return () => h('input', {
          value: value.value,
          onInput: (event: Event) => { value.value = (event.target as HTMLInputElement).value },
        })
      },
    })
    const wrapper = mount({
      components: { VTabs, VTab, Draft },
      data: () => ({ active: 'b', show: false, items: [{ name: 'a' }, { name: 'b' }] }),
      template: `
        <VTabs v-model:active="active">
          <VTab v-if="show" name="conditional" title="Conditional" />
          <template v-for="item in items" :key="item.name">
            <VTab ${localKeys ? 'key="main"' : ''} :name="item.name" :title="item.name"><Draft /></VTab>
            ${multiple ? `<VTab ${localKeys ? 'key="extra"' : ''} :name="item.name + '-extra'" :title="item.name + ' extra'" />` : ''}
          </template>
        </VTabs>
      `,
    })
    const tabs = wrapper.getComponent(VTabs)
    const input = wrapper.get<HTMLInputElement>('input')
    await input.setValue('unsaved B draft')
    const draftInstance = wrapper.getComponent(Draft).vm
    const tabInstance = wrapper.findAllComponents(VTab).find(tab => tab.props('name') === 'b')!.vm

    for (const { names, show } of [
      { names: ['b', 'a'], show: false },
      { names: ['c', 'b', 'a'], show: false },
      { names: ['b', 'a'], show: false },
      { names: ['a', 'b'], show: true },
      { names: ['a', 'b'], show: false },
    ]) {
      await wrapper.setData({ items: names.map(name => ({ name })), show })
      expect(tabs.findAll('[role="tab"]').map(tab => tab.text())).toEqual([
        ...(show ? ['Conditional'] : []),
        ...names.flatMap(name => multiple ? [name, `${name} extra`] : [name]),
      ])
      expect(wrapper.get<HTMLInputElement>('input').element).toBe(input.element)
      expect(input.element.value).toBe('unsaved B draft')
      expect(wrapper.getComponent(Draft).vm).toBe(draftInstance)
      expect(wrapper.findAllComponents(VTab).find(tab => tab.props('name') === 'b')!.vm).toBe(tabInstance)
      expect(wrapper.vm.active).toBe('b')
    }

    expect(tabs.emitted('update:active')).toBeUndefined()
    expect(tabs.emitted('change')).toBeUndefined()
    expect(tabs.emitted('clickTab')).toBeUndefined()
    wrapper.unmount()
  })

  it('ignores comments and text in nested fragments during disabled and keyboard navigation', async () => {
    const wrapper = mount(VTabs, {
      props: { active: 0 },
      attachTo: document.body,
      slots: {
        default: () => [
          h(Comment, 'hidden tab'),
          h(Text, ' '),
          h(Fragment, [
            h(VTab, { name: 0, title: 'First' }, { default: () => 'First panel' }),
            [h(Fragment, [
              h(Text, 'Not a tab'),
              h(VTab, { name: 'locked', title: 'Locked', disabled: true }),
              h(Comment),
              h(VTab, { name: '', title: 'Last' }, { default: () => 'Last panel' }),
            ])],
          ]),
        ],
      },
    })
    const tabs = wrapper.findAll<HTMLButtonElement>('[role="tab"]')
    expect(tabs.map(tab => tab.text())).toEqual(['First', 'Locked', 'Last'])
    await tabs[1].trigger('click')
    expect(wrapper.emitted('clickTab')).toBeUndefined()
    tabs[0].element.focus()
    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[2].element)
    expect(wrapper.emitted('update:active')).toEqual([['']])
    await wrapper.setProps({ active: '' })
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('Last panel')
    await tabs[2].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[0].element)
    expect(wrapper.emitted('update:active')).toEqual([[''], [0]])
    await wrapper.setProps({ active: 0 })
    await tabs[0].trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(tabs[2].element)
    await tabs[2].trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(tabs[0].element)
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('First panel')
    wrapper.unmount()
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
