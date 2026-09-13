import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { VLoading } from '../src/loading'
import { VSwitch } from '../src/switch'
import { VToast, VToastRegion } from '../src/toast'

describe('ui-weapp missing base kit components', () => {
  it('toggles VSwitch values', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSwitch, {
      props: {
        'modelValue': false,
        'onUpdate:modelValue': onUpdate,
      },
    })

    expect(wrapper.attributes('role')).toBe('switch')
    expect(wrapper.attributes('aria-checked')).toBe('false')

    await wrapper.trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(true)

    await wrapper.setProps({ modelValue: true })
    await wrapper.trigger('click')
    expect(onUpdate).toHaveBeenLastCalledWith(false)
  })

  it('renders VLoading with text', () => {
    const wrapper = mount(VLoading, {
      props: {
        text: '加载中',
      },
    })

    expect(wrapper.classes()).toContain('varo-loading')
    expect(wrapper.get('.varo-loading__spinner').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('加载中')
  })

  it('renders controlled VToast feedback', async () => {
    const onUpdate = vi.fn()
    const onAction = vi.fn()
    const wrapper = mount(VToast, {
      props: {
        'visible': true,
        'message': '保存成功',
        'type': 'success',
        'position': 'top',
        'closeable': true,
        'closeLabel': '关闭保存通知',
        'title': '设置已保存',
        'actionText': '查看',
        'actionLabel': '查看保存结果',
        'onAction': onAction,
        'onUpdate:visible': onUpdate,
      },
    })
    const toast = wrapper.get('.varo-toast')
    expect(toast.classes()).toContain('varo-toast')
    expect(toast.classes()).toContain('varo-toast--success')
    expect(toast.classes()).toContain('varo-toast--top')
    expect(toast.attributes('data-type')).toBe('success')
    expect(toast.attributes('data-position')).toBe('top')
    expect(toast.text()).toContain('保存成功')
    expect(toast.attributes('role')).toBe('status')
    expect(toast.attributes('aria-live')).toBe('polite')
    expect(toast.get('.varo-toast__icon svg').attributes('viewBox')).toBe('0 0 24 24')
    expect(toast.get('.varo-toast__close').attributes('aria-label')).toBe('关闭保存通知')
    expect(toast.get('.varo-toast__title').text()).toBe('设置已保存')
    expect(toast.get('.varo-toast__action').attributes('aria-label')).toBe('查看保存结果')

    await toast.get('.varo-toast__action').trigger('click')
    expect(onAction).toHaveBeenCalledTimes(1)
    await wrapper.get('.varo-toast__close').trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(false)
  })

  it('lays out controlled toasts inside an inline region', () => {
    const wrapper = mount(VToastRegion, {
      props: {
        inline: true,
        position: 'top',
      },
      slots: {
        default: () => h(VToast, { message: '同步完成', type: 'success', visible: true }),
      },
    })

    expect(wrapper.attributes('data-inline')).toBe('true')
    expect(wrapper.attributes('data-position')).toBe('top')
    expect(wrapper.get('.varo-toast').text()).toContain('同步完成')
  })
})
