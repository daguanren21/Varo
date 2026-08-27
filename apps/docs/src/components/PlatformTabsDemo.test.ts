import { flushPromises, mount } from '@vue/test-utils'
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

  it('renders phone-frame preview chrome with compact metadata and collapsed example code', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'overview',
        locale: 'zh'
      }
    })

    expect(wrapper.find('.platform-demo__note').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('说明')
    expect(wrapper.text()).not.toContain('适合浏览器页面里的表单提交')

    const stage = wrapper.get('.platform-demo__stage')
    expect(stage.attributes('data-layout')).toBe('controls-preview')
    expect(wrapper.find('.platform-demo__platform-switch').exists()).toBe(true)
    expect(wrapper.find('.platform-demo__phone-frame').exists()).toBe(true)
    expect(wrapper.find('.platform-demo__phone-status').exists()).toBe(true)
    expect(wrapper.find('.platform-demo__phone-appbar').exists()).toBe(true)
    expect(wrapper.find('.platform-demo__meta-grid').exists()).toBe(true)
    expect(wrapper.get('.platform-demo__meta-card strong').text()).toContain('H5')
    expect(wrapper.find('.platform-demo__code-section').exists()).toBe(false)

    const toggle = wrapper.get('.platform-demo__code-toggle')
    expect(toggle.attributes('aria-label')).toBe('展开代码')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.text()).toContain('展开代码')
    expect(wrapper.find('.platform-demo__code-copy').exists()).toBe(false)

    await toggle.trigger('click')

    const codeShell = wrapper.get('.platform-demo__code-shell')
    const codeSection = wrapper.get('.platform-demo__code-section')
    expect(stage.element.contains(codeShell.element)).toBe(true)
    expect(codeShell.attributes('data-expanded')).toBe('true')
    expect(toggle.attributes('data-active')).toBe('true')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(toggle.attributes('aria-label')).toBe('收起代码')
    expect(toggle.text()).toContain('收起代码')

    const codeTabs = codeShell.findAll('.platform-demo__code-tab')
    expect(codeTabs).toHaveLength(2)
    expect(codeTabs[0]!.text()).toBe('H5 组件')
    expect(codeTabs[1]!.text()).toBe('小程序组件')
    expect(codeTabs[0]!.attributes('data-active')).toBe('true')
    expect(codeTabs[1]!.attributes('data-active')).toBe('false')
    expect(codeTabs[0]!.attributes('aria-selected')).toBe('true')
    expect(codeTabs[1]!.attributes('aria-selected')).toBe('false')
    expect(wrapper.findAll('.platform-demo__code-section')).toHaveLength(1)
    expect(codeSection.get('.platform-demo__code-head').text()).toContain('@varo/ui-h5')
    expect(codeSection.get('code').text()).toContain("from '@varo/ui-h5'")
    expect(codeSection.get('code').text()).not.toContain("from '@varo/ui-weapp'")

    const copyButton = wrapper.get('.platform-demo__code-copy')
    expect(copyButton.attributes('aria-label')).toBe('复制 H5 代码')
    expect(copyButton.text()).toContain('复制 H5 代码')
    expect(copyButton.find('.platform-demo__code-copy-icon').exists()).toBe(true)
  })

  it('supports roving keyboard selection for platform tabs', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin]
      },
      props: {
        example: 'button',
        locale: 'zh'
      }
    })

    const stage = wrapper.get('.platform-demo__stage')
    const tabs = wrapper.findAll('.platform-demo__platform-tab')
    expect(stage.attributes('role')).toBe('tabpanel')
    expect(tabs[0]!.attributes('aria-controls')).toBe(stage.attributes('id'))
    expect(tabs[0]!.attributes('tabindex')).toBe('0')
    expect(tabs[1]!.attributes('tabindex')).toBe('-1')

    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()

    expect(wrapper.get('.platform-demo').attributes('data-platform')).toBe('weapp')
    expect(tabs[0]!.attributes('aria-selected')).toBe('false')
    expect(tabs[0]!.attributes('tabindex')).toBe('-1')
    expect(tabs[1]!.attributes('aria-selected')).toBe('true')
    expect(tabs[1]!.attributes('tabindex')).toBe('0')

    await tabs[1]!.trigger('keydown', { key: 'Home' })
    await flushPromises()
    expect(wrapper.get('.platform-demo').attributes('data-platform')).toBe('h5')
  })

  it('expands and switches example code between H5 and mini-program snippets', async () => {
    const writeText = vi.fn((text: string) => Promise.resolve(text))
    const clipboard = { writeText }
    vi.stubGlobal('navigator', { clipboard })

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
    const codeShell = wrapper.get('.platform-demo__code-shell')
    const codeSection = wrapper.get('.platform-demo__code-section')
    const codeTabs = codeShell.findAll('.platform-demo__code-tab')
    await codeTabs[1]!.trigger('click')

    expect(codeTabs[0]!.attributes('data-active')).toBe('false')
    expect(codeTabs[1]!.attributes('data-active')).toBe('true')
    expect(codeTabs[0]!.attributes('aria-selected')).toBe('false')
    expect(codeTabs[1]!.attributes('aria-selected')).toBe('true')
    expect(wrapper.findAll('.platform-demo__code-section')).toHaveLength(1)
    expect(codeSection.get('.platform-demo__code-head').text()).toContain('小程序组件')
    expect(codeSection.get('.platform-demo__code-head').text()).toContain('@varo/ui-weapp')
    expect(codeSection.get('code').text()).toContain("from '@varo/ui-weapp'")
    expect(codeSection.get('code').text()).not.toContain("from '@varo/ui-h5'")
    expect(wrapper.get('.platform-demo').attributes('data-platform')).toBe('weapp')
    expect(wrapper.get('.platform-demo__runtime-pill').text()).toContain('小程序')

    const copyButton = wrapper.get('.platform-demo__code-copy')
    expect(copyButton.attributes('aria-label')).toBe('复制小程序代码')
    await copyButton.trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0]![0]).toContain("from '@varo/ui-weapp'")
    expect(copyButton.attributes('aria-label')).toBe('已复制')
    expect(wrapper.get('.platform-demo__code-toast').text()).toContain('已复制到剪贴板')

    await codeTabs[0]!.trigger('click')
    expect(copyButton.attributes('aria-label')).toBe('复制 H5 代码')
    expect(wrapper.find('.platform-demo__code-toast').exists()).toBe(false)

    vi.unstubAllGlobals()
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
