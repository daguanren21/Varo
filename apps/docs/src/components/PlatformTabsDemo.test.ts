import type { ThemeConfig } from '@varo-ui/theme'
import type { Plugin } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PlatformTabsDemo from './PlatformTabsDemo.vue'

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

describe('PlatformTabsDemo', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a focused preview without runtime metadata or fake device chrome', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'overview',
        locale: 'zh',
      },
    })

    expect(wrapper.find('.platform-demo__note').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__head p').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('说明')
    expect(wrapper.text()).not.toContain('适合浏览器页面里的表单提交')

    const stage = wrapper.get('.platform-demo__stage')
    expect(stage.attributes('data-layout')).toBe('controls-preview')
    expect(wrapper.find('.platform-demo__platform-switch').exists()).toBe(true)
    expect(wrapper.find('.platform-demo__phone-frame').exists()).toBe(true)
    expect(wrapper.find('.platform-demo__phone-status').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__phone-appbar').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__meta-grid').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__runtime-pill').exists()).toBe(false)
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
    expect(codeSection.get('.platform-demo__code-head').text()).not.toContain('@varo-ui/h5')
    expect(codeSection.get('code').text()).toContain('from \'@varo-ui/h5\'')
    expect(codeSection.get('code').text()).not.toContain('from \'@varo-ui/weapp\'')

    const copyButton = wrapper.get('.platform-demo__code-copy')
    expect(copyButton.attributes('aria-label')).toBe('复制 H5 代码')
    expect(copyButton.text()).toContain('复制 H5 代码')
    expect(copyButton.find('.platform-demo__code-copy-icon').exists()).toBe(true)
  })

  it('presents Image as a theme-aware content component', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'image',
        locale: 'zh',
      },
    })

    expect(wrapper.find('.platform-demo__head p').exists()).toBe(false)
    expect(wrapper.get('.platform-demo__image-feature img').attributes('src')).toBe('/blocks/retail-home.png')
    expect(wrapper.findAll('.platform-demo__image-item')).toHaveLength(2)
    await wrapper.get('.platform-demo__image-item[data-state="error"] img').trigger('error')
    expect(wrapper.find('.platform-demo__broken-image').exists()).toBe(true)
    expect(wrapper.text()).toContain('自适应封面')
    expect(wrapper.text()).toContain('品牌头像')
    expect(wrapper.text()).toContain('资源不可用')
    expect(wrapper.text()).not.toContain('Vant')
    expect(wrapper.text()).not.toContain('NutUI')
  })

  it('groups Cell examples inside one component-owned container', () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'cell',
        locale: 'zh',
      },
    })

    expect(wrapper.findAll('.platform-demo__cell-demo')).toHaveLength(1)
    expect(wrapper.findAll('.varo-cell-group')).toHaveLength(6)
    expect(wrapper.find('.platform-demo__meta-grid').exists()).toBe(false)
  })

  it('presents multiple Input cases and derives required errors from the value', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'input',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__stage').attributes('data-layout')).toBe('preview-only')
    expect(wrapper.find('.platform-demo__panel--controls').exists()).toBe(false)
    expect(wrapper.findAll('.platform-demo__input-sample')).toHaveLength(1)
    expect(wrapper.findAll('.varo-input')).toHaveLength(5)
    expect(wrapper.find('.platform-demo__input-sample-head').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__input-state').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('账户设置')
    expect(wrapper.text()).not.toContain('显示错误')
    expect(wrapper.text()).toContain('必填与清空')
    expect(wrapper.text()).toContain('前后缀')
    expect(wrapper.text()).toContain('文本域')
    expect(wrapper.text()).toContain('状态')

    const requiredCase = wrapper.get('[data-case="required"]')
    const requiredInput = requiredCase.get<HTMLInputElement>('.varo-input__control')
    expect(requiredCase.find('.varo-input__error').exists()).toBe(false)
    await requiredInput.trigger('focus')
    await requiredCase.get('.varo-input__clear').trigger('click')
    expect(requiredInput.element.value).toBe('')
    expect(requiredCase.get('.varo-input').attributes('data-invalid')).toBe('true')
    expect(requiredCase.get('.varo-input__error').text()).toBe('请输入显示名称。')

    const affixCase = wrapper.get('[data-case="affixes"]')
    expect(affixCase.text()).toContain('https://')
    expect(affixCase.text()).toContain('.com')
    expect(wrapper.find('[data-case="textarea"] textarea.varo-input__control').exists()).toBe(true)

    const stateInputs = wrapper.get('[data-case="states"]').findAll('.varo-input__control')
    expect(stateInputs).toHaveLength(2)
    expect(stateInputs[0]!.attributes('readonly')).toBeDefined()
    expect(stateInputs[1]!.attributes('disabled')).toBeDefined()
  })

  it('presents Button hierarchy, tones, sizes, states, and layout without detached controls', () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'button',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__stage').attributes('data-layout')).toBe('preview-only')
    expect(wrapper.find('.platform-demo__panel--controls').exists()).toBe(false)
    expect(wrapper.findAll('.platform-demo__button-sample')).toHaveLength(1)
    expect(wrapper.findAll('.platform-demo__button-sample .varo-button')).toHaveLength(14)

    const hierarchy = wrapper.get('[data-case="hierarchy"]').findAll('.varo-button')
    expect(hierarchy.map(button => button.attributes('data-variant'))).toEqual([
      'solid',
      'outline',
      'ghost',
    ])
    expect(hierarchy[0]!.text()).toBe('保存更改')

    const tones = wrapper.get('[data-case="tones"]').findAll('.varo-button')
    expect(tones.map(button => button.attributes('data-tone'))).toEqual([
      'success',
      'warning',
      'danger',
    ])

    const sizes = wrapper.get('[data-case="sizes"]').findAll('.varo-button')
    expect(sizes.map(button => button.attributes('data-size'))).toEqual(['sm', 'md', 'lg'])

    const loading = wrapper.get('[data-case="states"] .varo-button[data-loading="true"]')
    expect(loading.text()).toContain('保存中…')
    expect(loading.attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-case="states"] .varo-button[data-disabled="true"]').text()).toBe('不可用')

    const layout = wrapper.get('[data-case="layout"]')
    expect(layout.get('.varo-button[data-shape="round"]').text()).toContain('创建项目')
    expect(layout.get('.varo-button[data-shape="square"]').text()).toBe('直角')
    expect(layout.get('.varo-button[data-block="true"]').text()).toBe('继续')
  })

  it('presents Badge text anchors, counts, status dots, and tone-aware variants', () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'badge',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__stage').attributes('data-layout')).toBe('preview-only')
    expect(wrapper.find('.platform-demo__panel--controls').exists()).toBe(false)
    expect(wrapper.findAll('.platform-demo__badge-sample')).toHaveLength(1)
    expect(wrapper.findAll('.platform-demo__badge-sample .varo-badge')).toHaveLength(12)

    const anchors = wrapper.get('[data-case="anchors"]').findAll('.varo-badge')
    expect(anchors).toHaveLength(2)
    expect(anchors.map(badge => badge.text())).toEqual(['3', ''])
    expect(anchors.map(badge => badge.attributes('aria-label'))).toEqual([
      '3 条未读消息',
      '新通知',
    ])
    expect(anchors.every(badge => badge.classes().includes('platform-demo__badge-anchor-mark'))).toBe(true)
    expect(
      anchors.every(badge =>
        badge.element.parentElement?.classList.contains('platform-demo__badge-anchor-label')),
    ).toBe(true)

    const counts = wrapper.get('[data-case="counts"]').findAll('.varo-badge')
    expect(counts.map(badge => badge.text())).toEqual(['3', '12', '99+', '0'])
    expect(counts.map(badge => badge.attributes('aria-label'))).toEqual([
      '3 条未读消息',
      '12 个待办任务',
      '120 条提及',
      '0 个草稿',
    ])

    const statuses = wrapper.get('[data-case="statuses"]').findAll('.varo-badge')
    expect(statuses).toHaveLength(3)
    expect(statuses.every(badge => badge.attributes('data-dot') === 'true')).toBe(true)
    expect(statuses.map(badge => badge.attributes('aria-label'))).toEqual(['在线', '同步中', '离线'])

    const variants = wrapper.get('[data-case="variants"]').findAll('.varo-badge')
    expect(variants.map(badge => badge.text())).toEqual(['新', '稳定', '审核'])
    expect(variants.map(badge => badge.attributes('data-variant'))).toEqual([
      'solid',
      'soft',
      'outline',
    ])
  })

  it('supports roving keyboard selection for platform tabs', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'button',
        locale: 'zh',
      },
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
        plugins: [themePlugin],
      },
      props: {
        example: 'button',
        locale: 'zh',
      },
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
    expect(codeSection.get('.platform-demo__code-head').text()).not.toContain('@varo-ui/weapp')
    expect(codeSection.get('code').text()).toContain('from \'@varo-ui/weapp\'')
    expect(codeSection.get('code').text()).not.toContain('from \'@varo-ui/h5\'')
    expect(wrapper.get('.platform-demo').attributes('data-platform')).toBe('weapp')
    expect(wrapper.find('.platform-demo__runtime-pill').exists()).toBe(false)

    const copyButton = wrapper.get('.platform-demo__code-copy')
    expect(copyButton.attributes('aria-label')).toBe('复制小程序代码')
    await copyButton.trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0]![0]).toContain('from \'@varo-ui/weapp\'')
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
        plugins: [themePlugin],
      },
      props: {
        example: 'cell',
        locale: 'zh',
      },
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
        plugins: [themePlugin],
      },
      props: {
        example: 'grid',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__stage').attributes('data-layout')).toBe('preview-only')
    expect(wrapper.find('.platform-demo__controls').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__grid-demo').exists()).toBe(true)
    expect(wrapper.findAll('.varo-grid__item').length).toBeGreaterThanOrEqual(8)
  })

  it('renders navigation component previews without controls', () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'tabs',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__stage').attributes('data-layout')).toBe('preview-only')
    expect(wrapper.find('.platform-demo__controls').exists()).toBe(false)
    expect(wrapper.find('.platform-demo__tabs-demo').exists()).toBe(true)
    expect(wrapper.findAll('.varo-tabs__tab').length).toBeGreaterThanOrEqual(3)
  })

  it('opens menu options in the navigation demo', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'menu',
        locale: 'zh',
      },
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
        plugins: [themePlugin],
      },
      props: {
        example: 'indicator',
        locale: 'zh',
      },
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
        plugins: [themePlugin],
      },
      props: {
        example: 'elevator',
        locale: 'zh',
      },
    })

    expect(wrapper.findAll('.varo-elevator__group').length).toBeGreaterThanOrEqual(8)
    expect(wrapper.findAll('.varo-elevator__item').length).toBeGreaterThanOrEqual(24)
  })
})
