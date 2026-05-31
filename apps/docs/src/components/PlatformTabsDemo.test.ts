import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTheme, VaroConfigProvider, type ThemeConfig } from '@varo/theme'
import type { Plugin } from 'vue'
import PlatformTabsDemo from './PlatformTabsDemo.vue'

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

describe('PlatformTabsDemo', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps platform metadata out of the visible summary and collapses example code', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'overview',
        locale: 'zh'
      }
    })

    expect(wrapper.find('.platform-demo__meta-grid').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__note').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('说明')
    expect(wrapper.text()).not.toContain('适合浏览器页面里的表单提交')

    const stage = wrapper.get('.platform-demo__stage')

    expect(wrapper.find('.platform-demo__tabs').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__device-shell').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__status-bar').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__appbar').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__code-block').exists()).toBe(false)

    const toggle = wrapper.get('.platform-demo__code-toggle')
    expect(toggle.attributes('aria-label')).toBe('示例代码')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')

    const codeDetails = wrapper.get('.platform-demo__code-block')
    expect(stage.element.contains(codeDetails.element)).toBe(true)
    expect(toggle.attributes('data-active')).toBe('true')
    expect(toggle.attributes('aria-expanded')).toBe('true')

    const codeTabs = codeDetails.findAll('.platform-demo__code-tab')
    expect(codeTabs).toHaveLength(2)
    expect(codeTabs[0]!.text()).toBe('H5 组件')
    expect(codeTabs[1]!.text()).toBe('小程序组件')
    expect(codeTabs[0]!.attributes('data-active')).toBe('true')
    expect(codeTabs[1]!.attributes('data-active')).toBe('false')
    expect(codeTabs[0]!.attributes('aria-selected')).toBe('true')
    expect(codeTabs[1]!.attributes('aria-selected')).toBe('false')
    expect(codeDetails.findAll('.platform-demo__code-section')).toHaveLength(1)
    expect(codeDetails.get('.platform-demo__code-head').text()).toContain('@varo/ui-h5')
    expect(codeDetails.get('code').text()).toContain("from '@varo/ui-h5'")
    expect(codeDetails.get('code').text()).not.toContain("from '@varo/ui-weapp'")
  })

  it('expands and switches example code between H5 and mini-program snippets', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'button',
        locale: 'zh'
      }
    })

    await wrapper.get('.platform-demo__code-toggle').trigger('click')
    const codeDetails = wrapper.get('.platform-demo__code-block')
    const codeTabs = codeDetails.findAll('.platform-demo__code-tab')
    await codeTabs[1]!.trigger('click')

    expect(codeTabs[0]!.attributes('data-active')).toBe('false')
    expect(codeTabs[1]!.attributes('data-active')).toBe('true')
    expect(codeTabs[0]!.attributes('aria-selected')).toBe('false')
    expect(codeTabs[1]!.attributes('aria-selected')).toBe('true')
    expect(codeDetails.findAll('.platform-demo__code-section')).toHaveLength(1)
    expect(codeDetails.get('.platform-demo__code-head').text()).toContain('小程序组件')
    expect(codeDetails.get('.platform-demo__code-head').text()).toContain('@varo/ui-weapp')
    expect(codeDetails.get('code').text()).toContain("from '@varo/ui-weapp'")
    expect(codeDetails.get('code').text()).not.toContain("from '@varo/ui-h5'")
  })

  it('uses a preview-only layout for demos without controls', () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'cell',
        locale: 'zh'
      }
    })

    expect(wrapper.get('.platform-demo__stage').attributes('data-layout')).toBe('preview-only')
    expect(wrapper.find('.platform-demo__controls').exists()).toBe(false)
    expect(wrapper.findAll('.platform-demo__panel')).toHaveLength(1)
    expect(wrapper.findAll('.varo-cell-group').length).toBeGreaterThanOrEqual(6)
    expect(wrapper.find('.platform-demo__cell-demo').exists()).toBe(true)
    expect(wrapper.find('.platform-demo__card .varo-cell-group').exists()).toBe(false)
  })

  it('renders layout component previews without controls', () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'grid',
        locale: 'zh'
      }
    })

    expect(wrapper.get('.platform-demo__stage').attributes('data-layout')).toBe('preview-only')
    expect(wrapper.find('.platform-demo__controls').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__grid-demo').exists()).toBe(true)
    expect(wrapper.findAll('.varo-grid__item').length).toBeGreaterThanOrEqual(8)
  })

  it('renders navigation component previews without controls', () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'tabs',
        locale: 'zh'
      }
    })

    expect(wrapper.get('.platform-demo__stage').attributes('data-layout')).toBe('preview-only')
    expect(wrapper.find('.platform-demo__controls').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__tabs-demo').exists()).toBe(true)
    expect(wrapper.findAll('.varo-tabs__tab').length).toBeGreaterThanOrEqual(3)
  })

  it('opens menu options in the navigation demo', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'menu',
        locale: 'zh'
      }
    })

    expect(wrapper.find('.varo-menu__popup').exists()).toBe(false)

    await wrapper.get('.varo-menu__title').trigger('click')

    expect(wrapper.find('.varo-menu__popup').exists()).toBe(true)
    expect(wrapper.findAll('.varo-menu__option').length).toBe(3)
  })

  it('auto-advances and supports clicking indicator items', async () => {
    vi.useFakeTimers()
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'indicator',
        locale: 'zh'
      }
    })

    const indicator = wrapper.findAll('.varo-indicator')[0]!

    expect(indicator.attributes('data-current')).toBe('0')
    expect(wrapper.get('.platform-demo__indicator-slide span').text()).toBe('01')

    await vi.advanceTimersByTimeAsync(1800)
    expect(indicator.attributes('data-current')).toBe('1')
    expect(wrapper.get('.platform-demo__indicator-slide span').text()).toBe('02')

    await indicator.findAll('.varo-indicator__item')[3]!.trigger('click')
    expect(indicator.attributes('data-current')).toBe('3')
    expect(wrapper.get('.platform-demo__indicator-slide span').text()).toBe('04')
  })

  it('renders enough elevator floors for the demo effect', () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'elevator',
        locale: 'zh'
      }
    })

    expect(wrapper.findAll('.varo-elevator__group').length).toBeGreaterThanOrEqual(8)
    expect(wrapper.findAll('.varo-elevator__item').length).toBeGreaterThanOrEqual(24)
  })
})
