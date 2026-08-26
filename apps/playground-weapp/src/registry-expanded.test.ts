// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import AgentChat from './components/blocks/agent-chat.vue'
import { VActionSheet } from './components/ui/action-sheet'
import { VCollapse, VCollapseItem } from './components/ui/collapse'
import { VList } from './components/ui/list'
import { VNoticeBar } from './components/ui/notice-bar'
import { VSteps } from './components/ui/steps'
import { VSwipeCell } from './components/ui/swipe-cell'

describe('expanded weapp registry components', () => {
  it('selects an action and closes the action sheet', async () => {
    const wrapper = mount(VActionSheet, {
      props: {
        actions: [{ name: '归档', value: 'archive' }],
        visible: true
      }
    })

    await wrapper.get('.varo-action-sheet__action').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ item: { value: 'archive' } })
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false])
  })

  it('opens collapse content and selects steps', async () => {
    const collapse = mount({
      render: () =>
        h(VCollapse, { collapsible: true }, {
          default: () => h(VCollapseItem, { title: '订单详情', value: 'order' }, { default: () => '已发货' })
        })
    })
    expect(collapse.text()).not.toContain('已发货')
    await collapse.get('.varo-collapse-item__trigger').trigger('click')
    expect(collapse.text()).toContain('已发货')

    const steps = mount(VSteps, {
      props: { clickable: true, current: 0, items: ['下单', '发货'] }
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
      slots: { default: () => '订单' }
    })
    const content = swipe.get('.varo-swipe-cell__content')
    await content.trigger('touchstart', { touches: [{ clientX: 0 }] })
    await content.trigger('touchmove', { touches: [{ clientX: 40 }] })
    await content.trigger('touchend', { changedTouches: [{ clientX: 40 }] })
    expect(swipe.emitted('update:modelValue')?.at(-1)).toEqual(['left'])
  })

  it('renders the mini-program Agent Chat block and forwards prompts', async () => {
    const wrapper = mount(AgentChat, {
      props: {
        messages: [{ content: '欢迎使用', id: 'welcome', role: 'assistant' }],
        suggestions: ['买一盒牛奶'],
        title: '购物 Agent'
      }
    })

    expect(wrapper.text()).toContain('购物 Agent')
    expect(wrapper.text()).toContain('欢迎使用')
    await wrapper.findAll('button').find((button) => button.text() === '买一盒牛奶')!.trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual(['买一盒牛奶'])
  })
})
