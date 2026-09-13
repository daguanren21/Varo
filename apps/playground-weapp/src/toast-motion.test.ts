// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import VToastRegion from './components/ui/v-toast-region.vue'
import VToast from './components/ui/v-toast.vue'

afterEach(() => vi.useRealTimers())

describe('native weapp toast motion', () => {
  it('morphs status in place and exposes its optional action', async () => {
    const wrapper = mount(VToast, {
      props: {
        actionLabel: '查看同步结果',
        actionText: '查看',
        message: '正在同步组件设计。',
        title: '正在同步',
        type: 'loading',
        visible: true,
      },
    })
    await wrapper.get('.varo-toast').trigger('transitionend')
    const initial = wrapper.get('.varo-toast').element

    await wrapper.setProps({
      message: '按钮、开关与单选样式已更新。',
      title: '同步完成',
      type: 'success',
    })

    expect(wrapper.get('.varo-toast').element).toBe(initial)
    expect(wrapper.get('.varo-toast').classes()).toContain('varo-toast--success')
    expect(wrapper.get('.varo-toast__title').text()).toBe('同步完成')
    expect(wrapper.get('.varo-toast__message').text()).toContain('样式已更新')
    await wrapper.get('.varo-toast__action').trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
    wrapper.unmount()
  })

  it('lays multiple controlled toasts out in one inline region', async () => {
    const wrapper = mount(VToastRegion, {
      props: { inline: true },
      slots: {
        default: () => [
          h(VToast, { message: '第一条', type: 'success', visible: true }),
          h(VToast, { message: '第二条', type: 'warning', visible: true }),
        ],
      },
    })

    expect(wrapper.attributes('data-inline')).toBe('true')
    expect(wrapper.findAll('.varo-toast')).toHaveLength(2)
    expect(wrapper.text()).toContain('第一条')
    expect(wrapper.text()).toContain('第二条')
    wrapper.unmount()
  })

  it('unmounts a hidden toast when its CSS transition ends', async () => {
    const wrapper = mount(VToast, {
      props: {
        message: '将要关闭',
        visible: true,
      },
    })
    await wrapper.get('.varo-toast').trigger('transitionend')

    await wrapper.setProps({ visible: false })
    await flushPromises()
    expect(wrapper.get('.varo-toast').classes()).toContain('varo-toast-leave-to')

    await wrapper.get('.varo-toast').trigger('transitionend')
    expect(wrapper.find('.varo-toast').exists()).toBe(false)
    wrapper.unmount()
  })

  it('retargets rapid visibility reversals without stale cancel events', async () => {
    const wrapper = mount(VToast, {
      props: {
        message: '快速切换',
        visible: true,
      },
    })
    await flushPromises()

    await wrapper.setProps({ visible: false })
    await flushPromises()
    await wrapper.get('.varo-toast').trigger('transitioncancel')
    expect(wrapper.get('.varo-toast').classes()).toContain('varo-toast-leave-to')

    await wrapper.setProps({ visible: true })
    await flushPromises()
    await wrapper.get('.varo-toast').trigger('transitioncancel')
    expect(wrapper.get('.varo-toast').classes()).toContain('varo-toast-enter-active')

    await wrapper.get('.varo-toast').trigger('transitionend')
    expect(wrapper.find('.varo-toast').exists()).toBe(true)
    expect(wrapper.get('.varo-toast').classes()).not.toContain('varo-toast-enter-active')
    wrapper.unmount()
  })

  it('uses a bounded fallback when no transition event fires', async () => {
    vi.useFakeTimers()
    const wrapper = mount(VToast, {
      props: {
        actionText: '查看',
        closeable: true,
        message: '无 CSS 过渡',
        visible: true,
      },
    })
    await wrapper.get('.varo-toast').trigger('transitionend')

    await wrapper.setProps({ visible: false })
    await flushPromises()
    expect(wrapper.get('.varo-toast').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.varo-toast__action').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.varo-toast__close').attributes('disabled')).toBeDefined()

    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.find('.varo-toast').exists()).toBe(false)
    wrapper.unmount()
  })
})
