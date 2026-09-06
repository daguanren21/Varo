import type { ThemeConfig } from '@varo-ui/theme'
import type { Plugin } from 'vue'
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

describe('ui-h5 button', () => {
  it('exports a CSS-token-themed primitive button without raw geometry classes', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        variant: 'outline',
        size: 'lg',
      },
      slots: {
        default: () => 'Action',
      },
    })

    expect(wrapper.attributes('data-variant')).toBe('outline')
    expect(wrapper.attributes('data-size')).toBe('lg')
    expect(wrapper.classes().join(' ')).toContain('varo-button')
    expect(wrapper.classes().join(' ')).not.toContain('radius-')
    expect(document.documentElement.style.getPropertyValue('--varo-ui-primary')).toBe('#2563eb')
    expect(document.documentElement.style.getPropertyValue('--varo-ui-button-height-md')).toBe('44px')
  })

  it('forwards one click without duplicate fallthrough listeners', async () => {
    const onClick = vi.fn()
    const wrapper = mount(VButton, { global, attrs: { onClick } })

    await wrapper.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a loading indicator before the button content', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        loading: true,
      },
      slots: {
        default: () => 'Saving',
      },
    })

    const loadingIcon = wrapper.get('.varo-button__loading-icon')

    expect(loadingIcon.attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('Saving')
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('exposes the info tone for its own solid foreground and background pair', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        tone: 'info',
        variant: 'solid',
      },
      slots: {
        default: () => 'Details',
      },
    })

    expect(wrapper.attributes('data-tone')).toBe('info')
    expect(wrapper.attributes('data-variant')).toBe('solid')
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
        nativeType: 'submit',
      },
      slots: {
        default: () => 'Delete',
      },
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
        loadingText: 'Saving...',
      },
      slots: {
        default: () => 'Save',
      },
    })

    expect(wrapper.text()).toContain('Saving...')
    expect(wrapper.text()).not.toContain('Save')
  })

  it('renders a borderless text variant with a custom color', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        color: '#0f766e',
        variant: 'text',
      },
      slots: {
        default: () => 'Text action',
      },
    })

    expect(wrapper.attributes('data-variant')).toBe('text')
    expect(wrapper.attributes('style')).toContain('border-color: transparent')
    expect(wrapper.attributes('style')).toContain('color: #0f766e')
  })

  it('selects a contrast-safe foreground for custom solid colors', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        color: '#fef08a',
      },
      slots: {
        default: () => 'Custom action',
      },
    })

    expect((wrapper.element as HTMLElement).style.color).toBe('rgb(0, 0, 0)')
  })

  it('requires an explicit foreground for non-hex custom colors', () => {
    expect(() => mount(VButton, {
      global,
      props: {
        color: 'rgb(15, 23, 42)',
      },
    })).toThrow('Contrast-safe foreground requires a hex color')
  })

  it('accepts explicit foregrounds for CSS custom color syntax', () => {
    const wrapper = mount(VButton, {
      global,
      props: {
        color: 'rgb(15, 23, 42)',
        foregroundColor: '#ffffff',
      },
      slots: {
        default: () => 'Custom action',
      },
    })

    expect((wrapper.element as HTMLElement).style.color).toBe('rgb(255, 255, 255)')
  })
})
