// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import AgentChat from './components/blocks/agent-chat.vue'
import VActionSheet from './components/ui/v-action-sheet.vue'
import VCollapse from './components/ui/v-collapse.vue'
import VCollapseItem from './components/ui/v-collapse-item.vue'
import VList from './components/ui/v-list.vue'
import VNoticeBar from './components/ui/v-notice-bar.vue'
import VSteps from './components/ui/v-steps.vue'
import VSwipeCell from './components/ui/v-swipe-cell.vue'
import VInput from './components/ui/v-input.vue'
import VTextarea from './components/ui/v-textarea.vue'
import VSelect from './components/ui/select.vue'
import VButton from './components/ui/v-button.vue'
import VCard from './components/ui/v-card.vue'

describe('expanded weapp registry components', () => {
  it('uses native mini-program hover classes for pressed feedback', () => {
    const button = mount(VButton, { props: { className: 'rounded-none shadow-none' } })
    expect(button.get('button').attributes('hover-class')).toBe('varo-button--pressed')
    expect(button.get('button').attributes('hover-start-time')).toBe('20')
    expect(button.get('button').attributes('hover-stay-time')).toBe('70')
    expect(button.get('button').classes()).toContain('rounded-none')
    expect(button.get('button').classes()).toContain('shadow-none')

    const disabledButton = mount(VButton, { props: { disabled: true } })
    expect(disabledButton.get('button').attributes('hover-class')).toBe('none')

    const card = mount(VCard, { props: { className: 'rounded-none shadow-none', interactive: true } })
    expect(card.get('.varo-card').attributes('hover-class')).toBe('varo-card--pressed')
    expect(card.get('.varo-card').classes()).toContain('rounded-none')
    expect(card.get('.varo-card').classes()).toContain('shadow-none')
  })

  it('selects an action and closes the action sheet', async () => {
    const wrapper = mount(VActionSheet, {
      props: {
        actions: [{ name: '归档', value: 'archive' }],
        visible: true,
      },
    })

    await wrapper.get('.varo-action-sheet__action').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ item: { value: 'archive' } })
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false])
  })

  it('opens collapse content and selects steps', async () => {
    const collapse = mount({
      render: () =>
        h(VCollapse, { collapsible: true }, {
          default: () => h(VCollapseItem, { title: '订单详情', value: 'order' }, { default: () => '已发货' }),
        }),
    })
    expect(collapse.text()).not.toContain('已发货')
    await collapse.get('.varo-collapse-item__trigger').trigger('click')
    expect(collapse.text()).toContain('已发货')

    const steps = mount(VSteps, {
      props: { clickable: true, current: 0, items: ['下单', '发货'] },
    })
    await steps.findAll('.varo-steps__trigger')[1].trigger('click')
    expect(steps.emitted('update:current')?.[0]).toEqual([1])
  })

  it('supports notice close, list load, and swipe actions', async () => {
    const notice = mount(VNoticeBar, { props: { closeable: true, text: '系统维护' } })
    await notice.get('.varo-notice-bar__close').trigger('click')
    expect(notice.emitted('update:visible')?.[0]).toEqual([false])

    const onLoad = vi.fn()
    mount(VList, { props: { onLoad } })
    await nextTick()
    expect(onLoad).toHaveBeenCalledTimes(1)

    const swipe = mount(VSwipeCell, {
      props: { leftWidth: 80, threshold: 0.25 },
      slots: { default: () => '订单' },
    })
    const content = swipe.get('.varo-swipe-cell__content')
    await content.trigger('touchstart', { touches: [{ clientX: 0 }] })
    await content.trigger('touchmove', { touches: [{ clientX: 40 }] })
    await content.trigger('touchend', { changedTouches: [{ clientX: 40 }] })
    expect(swipe.emitted('update:modelValue')?.at(-1)).toEqual(['left'])
  })

  it('filters from the Select field without a duplicate panel search box', async () => {
    const wrapper = mount(VSelect, {
      props: {
        filterable: true,
        options: [
          { label: 'Shanghai', value: 'shanghai' },
          { label: 'Hangzhou', value: 'hangzhou' },
          { label: 'Suzhou', value: 'suzhou' },
        ],
        value: 'shanghai',
      },
    })
    const filterInput = wrapper.get('.varo-select__filter-input')
    expect(filterInput.attributes('value')).toBe('Shanghai')

    await filterInput.trigger('focus')
    expect(wrapper.find('.varo-select__panel .varo-select__filter-input').exists()).toBe(false)
    await filterInput.setValue('zhou')

    expect(wrapper.emitted('search')?.at(-1)).toEqual(['zhou'])
    expect(wrapper.findAll('.varo-select__option').map(option => option.text())).toEqual(['Hangzhou', 'Suzhou'])
  })

  it('preserves uncontrolled native input and textarea values', async () => {
    const input = mount(VInput, {
      props: {
        ariaDescribedby: 'name-help',
        className: 'consumer-input',
        defaultValue: 'seed',
        formatter: (value: string) => value.toUpperCase(),
        inputId: 'customer-name',
        name: 'customerName',
        selectionStart: 1,
      },
    })
    expect(input.get('input').attributes('value')).toBe('seed')
    expect(input.get('.varo-input').classes()).toContain('consumer-input')
    expect(input.get('.varo-input').attributes('name')).toBeUndefined()
    expect(input.get('input').attributes('id')).toBe('customer-name')
    expect(input.get('input').attributes('name')).toBe('customerName')
    expect(input.get('input').attributes('aria-describedby')).toBe('name-help')
    expect(input.get('input').attributes('selection-start')).toBe('1')

    await input.get('input').trigger('input', { detail: { value: 'next' } })
    expect(input.emitted('update:value')?.at(-1)).toEqual(['NEXT'])
    expect(input.get('input').attributes('value')).toBe('NEXT')

    const textarea = mount(VTextarea, {
      props: { defaultValue: 'memo' },
    })
    expect(textarea.get('textarea').attributes('value')).toBe('memo')
  })

  it('renders the mini-program Agent Chat block and forwards prompts', async () => {
    const wrapper = mount(AgentChat, {
      props: {
        messages: [{ content: '欢迎使用', id: 'welcome', role: 'assistant' }],
        suggestions: ['买一盒牛奶'],
        title: '购物 Agent',
      },
    })

    expect(wrapper.text()).toContain('购物 Agent')
    expect(wrapper.find('rich-text').exists()).toBe(true)
    await wrapper.findAll('button').find(button => button.text() === '买一盒牛奶')!.trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual(['买一盒牛奶'])
  })
})
