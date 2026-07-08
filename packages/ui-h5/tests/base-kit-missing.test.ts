import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VLoading } from '../src/loading'
import { VSwitch } from '../src/switch'
import { VToast } from '../src/toast'

describe('ui-h5 missing base kit components', () => {
  it('toggles VSwitch values', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VSwitch, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': onUpdate
      }
    })

    expect(wrapper.attributes('role')).toBe('switch')
    expect(wrapper.attributes('aria-checked')).toBe('false')

    await wrapper.trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(true)
  })

  it('renders VLoading with text', () => {
    const wrapper = mount(VLoading, {
      props: {
        text: '加载中'
      }
    })

    expect(wrapper.classes()).toContain('varo-loading')
    expect(wrapper.get('.varo-loading__spinner').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('加载中')
  })

  it('renders controlled VToast feedback', async () => {
    const onUpdate = vi.fn()
    const wrapper = mount(VToast, {
      props: {
        visible: true,
        message: '保存成功',
        type: 'success',
        position: 'top',
        'onUpdate:visible': onUpdate
      }
    })

    expect(wrapper.classes()).toContain('varo-toast')
    expect(wrapper.attributes('data-type')).toBe('success')
    expect(wrapper.attributes('data-position')).toBe('top')
    expect(wrapper.text()).toContain('保存成功')

    await wrapper.get('.varo-toast__close').trigger('click')

    expect(onUpdate).toHaveBeenCalledWith(false)
  })
})
