import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createTheme, VaroConfigProvider, type ThemeConfig } from '@varo/theme'
import type { Plugin } from 'vue'
import FormComponentDemo from './FormComponentDemo.vue'

const themeConfig: ThemeConfig = {
  theme: createTheme({
    primary: '#2563eb',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    neutral: '#0f172a'
  })
}
const themePlugin: [Plugin, ThemeConfig] = [VaroConfigProvider, themeConfig]

describe('FormComponentDemo', () => {
  it('expands one active code sample and switches between H5 and mini-program code', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'picker',
        locale: 'zh'
      }
    })

    expect(wrapper.find('.form-demo__code').exists()).toBe(false)

    await wrapper.get('.form-demo__code-toggle').trigger('click')
    const code = wrapper.get('.form-demo__code')
    const tabs = code.findAll('.form-demo__tab')

    expect(tabs).toHaveLength(2)
    expect(tabs[0]!.attributes('data-active')).toBe('true')
    expect(code.get('code').text()).toContain("from '@varo/ui-h5'")
    expect(code.get('code').text()).not.toContain("from '@varo/ui-weapp'")

    await tabs[1]!.trigger('click')

    expect(tabs[0]!.attributes('data-active')).toBe('false')
    expect(tabs[1]!.attributes('data-active')).toBe('true')
    expect(code.get('code').text()).toContain("from '@varo/ui-weapp'")
    expect(code.get('code').text()).not.toContain("from '@varo/ui-h5'")
  })

  it('uses controlled visible state for popup-like form demos', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'picker',
        locale: 'zh'
      }
    })

    expect(wrapper.find('.varo-picker').exists()).toBe(true)

    await wrapper.get('.varo-picker__confirm').trigger('click')

    expect(wrapper.find('.varo-picker').exists()).toBe(false)
    expect(wrapper.find('.form-demo__reopen').exists()).toBe(true)

    await wrapper.get('.form-demo__reopen').trigger('click')

    expect(wrapper.find('.varo-picker').exists()).toBe(true)
  })

  it('shows a full form example with change validation and save errors', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'form',
        locale: 'zh'
      }
    })

    expect(wrapper.findAll('.varo-form-item').length).toBeGreaterThanOrEqual(8)
    expect(wrapper.find('.varo-checkbox-group').exists()).toBe(true)
    expect(wrapper.find('.varo-radio-group').exists()).toBe(true)
    expect(wrapper.find('.varo-input-number').exists()).toBe(true)
    expect(wrapper.find('.varo-rate').exists()).toBe(true)
    expect(wrapper.find('.varo-short-password').exists()).toBe(true)
    expect(wrapper.find('.varo-uploader').exists()).toBe(true)
    expect(wrapper.find('.form-demo__submit.varo-button').exists()).toBe(true)
    expect(wrapper.get('.form-demo__submit').attributes('form')).toBe(wrapper.get('.form-demo__save').attributes('id'))

    await wrapper.findAll('input')[0]!.setValue('A')
    await flushPromises()

    expect(wrapper.find('.varo-form-item__error').text()).toContain('用户名')

    await wrapper.get('.form-demo__save').trigger('submit')
    await flushPromises()

    expect(wrapper.findAll('.varo-form-item__error').length).toBeGreaterThanOrEqual(4)
    expect(wrapper.get('.form-demo__form-status').text()).toContain('保存失败')
  })

  it('validates dynamic company array fields', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'form-array',
        locale: 'zh'
      }
    })

    expect(wrapper.findAll('.form-demo__array-item')).toHaveLength(1)

    await wrapper.get('.form-demo__array-add').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.form-demo__array-item')).toHaveLength(2)

    await wrapper.get('.form-demo__save').trigger('submit')
    await flushPromises()

    expect(wrapper.findAll('.varo-form-item__error').some((node) => node.text().includes('公司 1 名称'))).toBe(true)
    expect(wrapper.findAll('.varo-form-item__error').some((node) => node.text().includes('公司 1 联系人'))).toBe(true)
    expect(wrapper.findAll('.varo-form-item__error').some((node) => node.text().includes('公司 2 电话'))).toBe(true)
    expect(wrapper.findAll('.varo-form-item__error').some((node) => node.text().includes('公司 2 公司类型'))).toBe(true)

    await wrapper.findAll('.form-demo__array-remove')[1]!.trigger('click')
    await flushPromises()

    expect(wrapper.findAll('.form-demo__array-item')).toHaveLength(1)
    expect(wrapper.findAll('.varo-form-item__error').some((node) => node.text().includes('公司 2'))).toBe(false)
  })
})
