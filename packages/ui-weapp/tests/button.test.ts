import type { ThemeConfig } from '@varo-ui/theme'
import type { Plugin } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VButton } from '../src/button'

const themeConfig: ThemeConfig = {
  theme: createTheme({
    primary: '#2563eb',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    neutral: '#0f172a',
  }),
}
const themePlugin: [Plugin, ThemeConfig] = [VaroConfigProvider, themeConfig]
const global = {
  plugins: [themePlugin],
}

describe('ui-weapp button', () => {
  it('renders a loading indicator before the button content', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        loading: true,
      },
      slots: {
        default: () => '保存',
      },
    })

    const loadingIcon = wrapper.get('.varo-button__loading-icon')

    expect(loadingIcon.attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('保存')
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('forwards one click without duplicate fallthrough listeners', async () => {
    const onClick = vi.fn()
    const wrapper = mount(VButton, { global, attrs: { onClick } })

    await wrapper.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
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
        nativeType: 'submit',
      },
      slots: {
        default: () => '新增',
      },
    })

    expect(wrapper.attributes('data-tone')).toBe('success')
    expect(wrapper.attributes('data-shape')).toBe('square')
    expect(wrapper.attributes('data-block')).toBe('true')
    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.attributes('style')).toContain('--varo-button-color: #16a34a')
    expect(wrapper.get('.varo-button__icon').text()).toBe('+')
  })

  it('uses borderless solid buttons and the lighter pressed-state token', () => {
    const style = readFileSync(resolve(__dirname, '../src/style.css'), 'utf8')

    expect(style).toContain('--varo-ui-primary-hover: #308e86')
    expect(style).toContain('--varo-button-hover-fill: var(--varo-ui-primary-hover)')
    expect(style).toContain('.varo-button[data-variant=\'solid\']')
    expect(style).toContain('border: 0')
    expect(style).toContain('.varo-button[data-variant=\'solid\'].varo-button--pressed')
    expect(style).toContain('background: var(--varo-button-hover-fill)')
  })
})
