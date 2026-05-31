import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createTheme, VaroConfigProvider, type ThemeConfig } from '@varo/theme'
import type { Plugin } from 'vue'
import { VButton } from '../src/button'

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
const global = {
  plugins: [themePlugin]
}

describe('ui-weapp button', () => {
  it('renders a loading indicator before the button content', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        loading: true
      },
      slots: {
        default: () => '保存'
      }
    })

    const loadingIcon = wrapper.get('.varo-button__loading-icon')

    expect(loadingIcon.attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('保存')
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('exposes Varo-style equivalents for Vant and NutUI button features', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        tone: 'success',
        variant: 'ghost',
        shape: 'square',
        block: true,
        icon: '+',
        color: '#16a34a',
        nativeType: 'submit'
      },
      slots: {
        default: () => '新增'
      }
    })

    expect(wrapper.attributes('data-tone')).toBe('success')
    expect(wrapper.attributes('data-shape')).toBe('square')
    expect(wrapper.attributes('data-block')).toBe('true')
    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.attributes('style')).toContain('--varo-button-color: #16a34a')
    expect(wrapper.get('.varo-button__icon').text()).toBe('+')
  })
})
