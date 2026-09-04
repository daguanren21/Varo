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
    vi.restoreAllMocks()
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
    expect(toggle.get('svg').attributes('viewBox')).toBe('0 0 24 24')
    expect(wrapper.find('.platform-demo__code-copy').exists()).toBe(false)

    await toggle.trigger('click')

    const codeShell = wrapper.get('.platform-demo__code-shell')
    const codeSection = wrapper.get('.platform-demo__code-section')
    expect(stage.element.contains(codeShell.element)).toBe(true)
    expect(codeShell.isVisible()).toBe(true)
    expect(toggle.attributes('data-active')).toBe('true')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(toggle.attributes('aria-label')).toBe('收起代码')
    expect(toggle.text()).toContain('收起代码')

    const codeTabs = codeShell.findAll('.platform-demo__code-tab')
    expect(codeTabs).toHaveLength(2)
    expect(codeTabs[0]!.text()).toBe('H5 写法')
    expect(codeTabs[1]!.text()).toBe('小程序写法')
    expect(codeTabs[0]!.find('svg').exists()).toBe(false)
    expect(codeTabs[1]!.find('svg').exists()).toBe(false)
    expect(codeTabs[0]!.attributes('data-active')).toBe('true')
    expect(codeTabs[1]!.attributes('data-active')).toBe('false')
    expect(codeTabs[0]!.attributes('aria-selected')).toBe('true')
    expect(codeTabs[1]!.attributes('aria-selected')).toBe('false')
    expect(wrapper.findAll('.platform-demo__code-section')).toHaveLength(1)
    expect(codeSection.get('.platform-demo__code-head').text()).toContain('H5 写法')
    expect(codeSection.get('.platform-demo__code-head').text()).toContain('@varo-ui/h5')
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
    const feature = wrapper.get('.platform-demo__image-feature')
    const featureImage = feature.get('.varo-image')
    expect(feature.get('img').attributes('src')).toBe('/blocks/retail-home.png')
    expect(feature.get('img').attributes('loading')).toBe('lazy')
    expect(featureImage.attributes('data-fit')).toBe('cover')

    const fitButtons = wrapper.findAll('.platform-demo__image-fit-options .varo-button')
    expect(fitButtons).toHaveLength(3)
    expect(fitButtons.map(button => button.text())).toEqual(['裁剪填充', '完整展示', '原始尺寸'])
    expect(fitButtons[0]!.attributes('aria-pressed')).toBe('true')
    await fitButtons[1]!.trigger('click')
    expect(featureImage.attributes('data-fit')).toBe('contain')
    expect(fitButtons[1]!.attributes('aria-pressed')).toBe('true')

    expect(wrapper.findAll('.platform-demo__image-item')).toHaveLength(2)
    await wrapper.get('.platform-demo__image-item[data-state="error"] img').trigger('error')
    expect(wrapper.find('.platform-demo__broken-image').exists()).toBe(true)
    expect(wrapper.text()).toContain('自适应封面')
    expect(wrapper.text()).toContain('品牌头像')
    expect(wrapper.text()).toContain('资源不可用')
    expect(wrapper.text()).not.toContain('Vant')
    expect(wrapper.text()).not.toContain('NutUI')
  })
  it('presents Divider through a realistic order summary', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'divider',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__divider-order').text()).toContain('订单 #1042')
    expect(wrapper.get('.platform-demo__divider-order').text()).toContain('实付款')
    expect(wrapper.get('.platform-demo__divider-order').text()).toContain('物流进度')

    const dividers = wrapper.findAll('.varo-divider')
    expect(dividers).toHaveLength(4)
    expect(dividers.filter(node => node.attributes('aria-orientation') === 'horizontal')).toHaveLength(3)
    expect(dividers.filter(node => node.attributes('aria-orientation') === 'vertical')).toHaveLength(1)
    expect(dividers.find(node => node.attributes('data-dashed') === 'true')?.text()).toBe('物流进度')
    expect(wrapper.findAll('.platform-demo__divider-order footer button')).toHaveLength(2)

    await wrapper.findAll('.platform-demo__platform-tab')[1]!.trigger('click')
    expect(wrapper.get('.platform-demo__platform-tab[data-active="true"]').text()).toBe('小程序')
    expect(wrapper.findAll('.varo-divider')).toHaveLength(4)
  })
  it('presents Grid as keyboard-accessible account shortcuts', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'grid',
        locale: 'zh',
      },
    })

    const items = wrapper.findAll('.varo-grid__item')
    expect(items).toHaveLength(8)
    expect(wrapper.findAll('.platform-demo__grid-icon')).toHaveLength(8)
    expect(wrapper.findAll('.varo-grid__badge')).toHaveLength(2)
    expect(wrapper.findAll('.varo-grid__dot')).toHaveLength(1)
    expect(items.every(item => item.attributes('role') === 'button')).toBe(true)
    expect(items.every(item => item.attributes('tabindex') === '0')).toBe(true)

    await items[0]!.trigger('keydown', { key: 'Enter' })
    expect(wrapper.get('.platform-demo__grid-result').text()).toBe('已打开：我的订单')
    await items[1]!.trigger('keydown', { key: ' ' })
    expect(wrapper.get('.platform-demo__grid-result').text()).toBe('已打开：物流')
  })
  it('presents Layout as a 24-column business overview', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'layout',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__layout-overview').text()).toContain('经营概览')
    expect(wrapper.findAll('.varo-row')).toHaveLength(1)
    expect(wrapper.findAll('.varo-col').map(col => col.attributes('data-span'))).toEqual(['16', '8', '8', '8', '8'])
    expect(wrapper.findAll('.platform-demo__layout-card')).toHaveLength(5)
    expect(wrapper.findAll('.platform-demo__layout-card--primary')).toHaveLength(1)

    await wrapper.findAll('.platform-demo__platform-tab')[1]!.trigger('click')
    expect(wrapper.get('.platform-demo__platform-tab[data-active="true"]').text()).toBe('小程序')
    expect(wrapper.findAll('.varo-col')).toHaveLength(5)
  })
  it('presents Space as wrapped filters and stacked full-width actions', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'space',
        locale: 'zh',
      },
    })

    const spaces = wrapper.findAll('.varo-space')
    const buttons = wrapper.findAll('.platform-demo__space-filter .varo-button')
    expect(spaces).toHaveLength(2)
    expect(spaces[0]!.attributes('data-wrap')).toBe('true')
    expect(spaces[1]!.attributes('data-direction')).toBe('vertical')
    expect(spaces[1]!.attributes('data-fill')).toBe('true')
    expect(buttons).toHaveLength(6)
    expect(wrapper.get('.platform-demo__space-filter [role="status"]').text()).toBe('当前筛选：全部')

    await buttons[2]!.trigger('click')
    expect(buttons[2]!.attributes('aria-pressed')).toBe('true')
    await buttons[4]!.trigger('click')
    expect(wrapper.get('.platform-demo__space-filter [role="status"]').text()).toBe('当前筛选：待发货')
    await buttons[5]!.trigger('click')
    expect(wrapper.get('.platform-demo__space-filter [role="status"]').text()).toBe('当前筛选：全部')
  })
  it('presents Sticky as a measured page-scroll month summary', async () => {
    let top = 100
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      bottom: top + 20,
      height: 20,
      left: 0,
      right: 100,
      top,
      width: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }))
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })

    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'sticky',
        locale: 'zh',
      },
    })

    expect(wrapper.findAll('.platform-demo__sticky-list > article')).toHaveLength(8)
    expect(wrapper.get('.platform-demo__sticky-bar').attributes('data-fixed')).toBe('false')
    expect(wrapper.get('.platform-demo__sticky-result').text()).toContain('跟随页面')

    top = 8
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 320 })
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()

    expect(wrapper.get('.platform-demo__sticky-bar').attributes('data-fixed')).toBe('true')
    expect(wrapper.get('.platform-demo__sticky-result').text()).toContain('已吸顶')
    expect(wrapper.get('.platform-demo__sticky-result').text()).toContain('320px')
    vi.restoreAllMocks()
  })

  it('presents Cell as a compact, interactive settings list', async () => {
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
    expect(wrapper.findAll('.varo-cell-group')).toHaveLength(2)
    expect(wrapper.findAll('.varo-cell')).toHaveLength(6)
    expect(wrapper.text()).toContain('账户与安全')
    expect(wrapper.text()).toContain('两步验证已开启')
    expect(wrapper.text()).toContain('偏好设置')
    expect(wrapper.find('.platform-demo__meta-grid').exists()).toBe(false)

    const profile = wrapper.findAll('.varo-cell')[0]!
    expect(profile.attributes('data-size')).toBe('large')
    expect(profile.attributes('data-clickable')).toBe('true')
    await profile.trigger('click')
    expect(wrapper.get('[role="status"]').text()).toBe('已打开：个人资料')

    const notificationSwitch = wrapper.get('.varo-switch')
    expect(notificationSwitch.attributes('aria-label')).toBe('消息通知')
    expect(notificationSwitch.attributes('data-state')).toBe('checked')
    await notificationSwitch.trigger('click')
    expect(notificationSwitch.attributes('data-state')).toBe('unchecked')
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
    expect(wrapper.findAll('.platform-demo__button-sample .varo-button')).toHaveLength(15)

    const hierarchy = wrapper.get('[data-case="hierarchy"]').findAll('.varo-button')
    expect(hierarchy.map(button => button.attributes('data-variant'))).toEqual([
      'solid',
      'outline',
      'ghost',
      'text',
    ])
    expect(hierarchy[0]!.text()).toBe('保存更改')
    expect(hierarchy[3]!.text()).toBe('文字按钮')

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

  it('presents contextual Popover actions and placement examples', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      attachTo: document.body,
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'popover',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__stage').attributes('data-layout')).toBe('preview-only')
    expect(wrapper.find('.platform-demo__panel--controls').exists()).toBe(false)
    expect(wrapper.findAll('.platform-demo__popover-sample')).toHaveLength(1)
    expect(wrapper.findAll('.platform-demo__popover-root')).toHaveLength(1)
    expect(wrapper.findAll('.varo-popover')).toHaveLength(3)

    const context = wrapper.get('[data-case="context"]')
    expect(context.get('.platform-demo__popover-card').attributes('data-side')).toBe('bottom')
    expect(context.get('.platform-demo__popover-card').text()).toContain('订单 #1042')
    expect(context.get('.platform-demo__popover-card').text()).toContain('取消订单')

    await context.get('.platform-demo__popover-done').trigger('click')
    expect(context.find('.platform-demo__popover-card').exists()).toBe(false)
    await context.get('.platform-demo__popover-trigger').trigger('click')
    expect(context.find('.platform-demo__popover-card').exists()).toBe(true)

    const placement = wrapper.get('[data-case="placement"]')
    const placementTriggers = placement.findAll('.platform-demo__popover-trigger')
    expect(placementTriggers).toHaveLength(2)
    await placementTriggers[0]!.trigger('click')
    expect(placement.get('.platform-demo__popover-tip').attributes('data-side')).toBe('top')
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
    expect(codeSection.get('.platform-demo__code-head').text()).toContain('小程序写法')
    expect(codeSection.get('.platform-demo__code-head').text()).toContain('@varo-ui/weapp')
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
    expect(wrapper.findAll('.varo-cell-group')).toHaveLength(2)
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

  it('presents Menu as accessible product sorting and stock filters', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'menu',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__menu-catalog').text()).toContain('128 件商品')
    const title = wrapper.findAll('.varo-menu__title')[0]!
    expect(title.attributes('aria-expanded')).toBe('false')
    expect(title.attributes('aria-haspopup')).toBe('listbox')

    await title.trigger('click')
    const popup = wrapper.get('.varo-menu__popup')
    const options = wrapper.findAll('.varo-menu__option')
    expect(title.attributes('aria-controls')).toBe(popup.attributes('id'))
    expect(popup.attributes('role')).toBe('listbox')
    expect(options).toHaveLength(3)
    expect(options[0]!.attributes('role')).toBe('option')
    expect(options[0]!.attributes('aria-selected')).toBe('true')

    await options[1]!.trigger('click')
    expect(wrapper.find('.varo-menu__popup').exists()).toBe(false)
    expect(wrapper.get('.platform-demo__menu-result').text()).toContain('最新上架 · 全部库存')

    await title.trigger('click')
    await wrapper.findAll('.varo-menu__item')[0]!.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.varo-menu__popup').exists()).toBe(false)
  })

  it('auto-advances an accessible feature carousel and supports direct navigation', async () => {
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

    const indicators = wrapper.findAll('.varo-indicator')
    const indicator = indicators[0]!
    expect(indicators).toHaveLength(2)
    expect(indicator.attributes('role')).toBe('navigation')
    expect(indicator.attributes('aria-label')).toBe('功能轮播分页')
    expect(indicator.findAll('.varo-indicator__item')[0]!.attributes('aria-label')).toBe('第 1 个功能，共 4 个')
    expect(indicator.attributes('data-current')).toBe('0')
    expect(wrapper.get('.platform-demo__indicator-slide > strong').text()).toBe('源码归属业务')
    expect(wrapper.findAll('.platform-demo__indicator-slide > header span')[1]!.text()).toBe('01 / 04')
    expect(wrapper.get('.platform-demo__indicator-slide').attributes('style')).toContain('/blocks/retail-home.png')

    await vi.advanceTimersByTimeAsync(1800)
    expect(indicator.attributes('data-current')).toBe('1')
    expect(wrapper.get('.platform-demo__indicator-slide > strong').text()).toBe('一套公共 API')
    expect(wrapper.get('.platform-demo__indicator-slide').attributes('style')).toContain('/blocks/retail-category.png')

    await indicator.findAll('.varo-indicator__item')[3]!.trigger('click')
    expect(indicator.attributes('data-current')).toBe('3')
    expect(wrapper.get('.platform-demo__indicator-slide > strong').text()).toBe('生产可用')
  })

  it('presents Elevator as an accessible service-city directory', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'elevator',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__elevator-directory').text()).toContain('服务城市')
    expect(wrapper.get('.platform-demo__elevator-directory output').text()).toContain('杭州')
    expect(wrapper.findAll('.varo-elevator__group').length).toBeGreaterThanOrEqual(8)
    expect(wrapper.findAll('.varo-elevator__item').length).toBeGreaterThanOrEqual(24)

    const indexes = wrapper.findAll('.varo-elevator__index')
    expect(indexes[0]!.attributes('aria-pressed')).toBe('true')
    await indexes[1]!.trigger('click')
    expect(indexes[1]!.attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.varo-elevator').attributes('data-active-index')).toBe('B')

    await wrapper.findAll('.varo-elevator__group')[1]!.findAll('.varo-elevator__item')[0]!.trigger('click')
    expect(wrapper.get('.platform-demo__elevator-directory output').text()).toContain('北京')
  })

  it('presents FixedNav as accessible product actions with selection feedback', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'fixed-nav',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__fixed-nav-product').text()).toContain('Varo Pro')
    const trigger = wrapper.get('.varo-fixed-nav__trigger')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(trigger.attributes('aria-controls')).toBe(wrapper.get('.varo-fixed-nav__list').attributes('id'))
    expect(wrapper.findAll('.varo-fixed-nav__item')).toHaveLength(3)
    expect(wrapper.findAll('.varo-fixed-nav__icon')).toHaveLength(0)

    await wrapper.findAll('.varo-fixed-nav__item')[1]!.trigger('click')
    expect(wrapper.get('.platform-demo__fixed-nav-result').text()).toBe('已选择：收藏')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.varo-fixed-nav__list').exists()).toBe(false)

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('presents Navbar as accessible order-detail navigation', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'navbar',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.platform-demo__navbar-order').text()).toContain('预计明日 18:00 前送达')
    const left = wrapper.get('.varo-navbar__left')
    const right = wrapper.get('.varo-navbar__right')
    expect(left.attributes('aria-label')).toBe('返回')
    expect(right.attributes('aria-label')).toBe('帮助')
    expect(wrapper.get('.varo-navbar__arrow').attributes('aria-hidden')).toBe('true')

    await right.trigger('click')
    expect(wrapper.get('.platform-demo__navbar-order [role="status"]').text()).toBe('操作：帮助')
    await left.trigger('click')
    expect(wrapper.get('.platform-demo__navbar-order [role="status"]').text()).toBe('操作：返回')
  })

  it('presents Pagination as accessible order-list navigation', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'pagination',
        locale: 'zh',
      },
    })

    const pagination = wrapper.get('.varo-pagination')
    expect(wrapper.findAll('.platform-demo__pagination-orders > div > article')).toHaveLength(3)
    expect(pagination.attributes('aria-label')).toBe('订单分页')
    expect(pagination.findAll('.varo-pagination__page')[1]!.attributes('aria-current')).toBe('page')
    expect(pagination.findAll('.varo-pagination__page')[1]!.attributes('aria-label')).toBe('第 2 页，共 5 页')
    const firstOrder = wrapper.findAll('.platform-demo__pagination-orders > div > article')[0]!.text()

    await pagination.findAll('.varo-pagination__page')[3]!.trigger('click')
    expect(wrapper.get('.platform-demo__pagination-orders > p').text()).toContain('第 4 页 / 共 5 页')
    expect(wrapper.findAll('.platform-demo__pagination-orders > div > article')[0]!.text()).not.toBe(firstOrder)
  })

  it('presents SideNavbar as account-center section navigation', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'side-navbar',
        locale: 'zh',
      },
    })

    const nav = wrapper.get('.varo-side-navbar')
    const items = wrapper.findAll('.varo-side-navbar__item')
    expect(nav.attributes('aria-label')).toBe('账户中心分区')
    expect(items).toHaveLength(4)
    expect(items[0]!.attributes('aria-current')).toBe('page')
    expect(wrapper.findAll('.varo-side-navbar__badge')).toHaveLength(2)
    expect(wrapper.get('.platform-demo__side-navbar-panel').text()).toContain('2 笔待处理')

    await items[1]!.trigger('click')
    expect(items[0]!.attributes('aria-current')).toBeUndefined()
    expect(items[1]!.attributes('aria-current')).toBe('page')
    expect(wrapper.get('.platform-demo__side-navbar-panel').text()).toContain('3 张优惠券')
  })

  it('presents Tabbar as accessible primary app navigation', async () => {
    const wrapper = mount(PlatformTabsDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'tabbar',
        locale: 'zh',
      },
    })

    const tabbar = wrapper.get('.varo-tabbar')
    const items = wrapper.findAll('.varo-tabbar__item')
    expect(tabbar.attributes('aria-label')).toBe('主要导航')
    expect(items).toHaveLength(4)
    expect(wrapper.findAll('.platform-demo__tabbar-icon')).toHaveLength(4)
    expect(items[0]!.attributes('aria-current')).toBe('page')
    expect(wrapper.get('.varo-tabbar__icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.findAll('.varo-tabbar__badge')).toHaveLength(1)
    expect(wrapper.findAll('.varo-tabbar__dot')).toHaveLength(1)

    await items[2]!.trigger('click')
    expect(items[0]!.attributes('aria-current')).toBeUndefined()
    expect(items[2]!.attributes('aria-current')).toBe('page')
    expect(wrapper.get('.platform-demo__tabbar-page > strong').text()).toBe('消息')
    expect(wrapper.get('.platform-demo__tabbar-page > p').text()).toContain('2 条')
  })
})
