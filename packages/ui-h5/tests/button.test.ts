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

describe('ui-h5 button', () => {
  it('exports a themed primitive button', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        variant: 'outline',
        size: 'lg'
      },
      slots: {
        default: () => 'Action'
      }
    })

    expect(wrapper.attributes('data-variant')).toBe('outline')
    expect(wrapper.attributes('data-size')).toBe('lg')
    expect(wrapper.classes().join(' ')).toContain('varo-button')
  })

  it('renders a loading indicator before the button content', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        loading: true
      },
      slots: {
        default: () => 'Saving'
      }
    })

    const loadingIcon = wrapper.get('.varo-button__loading-icon')

    expect(loadingIcon.attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('Saving')
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('exposes Varo-style equivalents for Vant and NutUI button features', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        tone: 'danger',
        variant: 'solid',
        plain: true,
        hairline: true,
        shape: 'round',
        block: true,
        icon: '✓',
        iconPosition: 'right',
        color: '#0f766e',
        nativeType: 'submit'
      },
      slots: {
        default: () => 'Delete'
      }
    })

    expect(wrapper.attributes('data-tone')).toBe('danger')
    expect(wrapper.attributes('data-plain')).toBe('true')
    expect(wrapper.attributes('data-hairline')).toBe('true')
    expect(wrapper.attributes('data-shape')).toBe('round')
    expect(wrapper.attributes('data-block')).toBe('true')
    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.attributes('style')).toContain('--varo-button-color: #0f766e')
    expect(wrapper.get('.varo-button__icon').text()).toBe('✓')
    expect(wrapper.get('.varo-button__icon').attributes('data-position')).toBe('right')
  })

  it('uses loading text when provided', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        loading: true,
        loadingText: 'Saving...'
      },
      slots: {
        default: () => 'Save'
      }
    })

    expect(wrapper.text()).toContain('Saving...')
    expect(wrapper.text()).not.toContain('Save')
  })
})
