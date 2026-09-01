import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VLoading } from '../src/loading'
import { VSwitch } from '../src/switch'
import { VToast } from '../src/toast'

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
    const wrapper = mount(VToast, {
      props: {
        'visible': true,
        'message': '保存成功',
        'type': 'success',
        'position': 'top',
        'closeLabel': '关闭保存通知',
        'onUpdate:visible': onUpdate,
      },
    })
    const toast = wrapper.get('.varo-toast')
    expect(toast.classes()).toContain('varo-toast')
    expect(toast.attributes('data-type')).toBe('success')
    expect(toast.attributes('data-position')).toBe('top')
    expect(toast.text()).toContain('保存成功')
    expect(toast.attributes('role')).toBe('status')
    expect(toast.attributes('aria-live')).toBe('polite')
    expect(toast.get('.varo-toast__icon svg').attributes('viewBox')).toBe('0 0 24 24')
    expect(toast.get('.varo-toast__close').attributes('aria-label')).toBe('关闭保存通知')

    await wrapper.get('.varo-toast__close').trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(false)
  })
})
