import { readFileSync, statSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const docsRoot = resolve(__dirname, '..')
const workspaceRoot = resolve(docsRoot, '../..')
const configPath = resolve(docsRoot, '.vitepress/config.ts')
const baseKitPhase1Components = [
  'button',
  'cell',
  'input',
  'textarea',
  'input-number',
  'form',
  'checkbox',
  'radio',
  'switch',
  'select',
  'picker',
  'cascader',
  'date-picker',
  'overlay',
  'popup',
  'dialog',
  'toast',
  'loading'
]

describe('docs navigation', () => {
  it('groups display layout components separately from navigation components', () => {
    const config = readFileSync(configPath, 'utf8')

    expect(config).toContain("text: '布局组件'")
    expect(config).toContain("text: '导航组件'")
    expect(config).toContain("{ text: 'Divider 分割线', link: '/components/divider' }")
    expect(config).toContain("{ text: 'Grid 宫格', link: '/components/grid' }")
    expect(config).toContain("{ text: 'Tabs 选项卡切换', link: '/components/tabs' }")
    expect(config).toContain("{ text: 'Menu 菜单', link: '/components/menu' }")
  })

  it('adds a primitives entry for interactive behavior primitives only', () => {
    const config = readFileSync(configPath, 'utf8')
    const primitiveZh = readFileSync(resolve(docsRoot, 'primitives/index.md'), 'utf8')
    const primitiveEn = readFileSync(resolve(docsRoot, 'en/primitives/index.md'), 'utf8')

    expect(config).toContain("{ text: 'Primitives', link: '/primitives/' }")
    expect(config).toContain("{ text: 'Primitives', link: '/en/primitives/' }")
    expect(primitiveZh).toContain('Dialog')
    expect(primitiveZh).toContain('Overlay')
    expect(primitiveZh).toContain('Popup')
    expect(primitiveZh).toContain('Sticky')
    expect(primitiveZh).not.toContain('Divider')
    expect(primitiveZh).not.toContain('Grid')
    expect(primitiveZh).not.toContain('Layout')
    expect(primitiveZh).not.toContain('Space')
    expect(primitiveEn).toContain('interactive or behavioral primitives')
  })

  it('lists form components and has matching zh/en pages', () => {
    const config = readFileSync(configPath, 'utf8')
    const components = [
      'calendar',
      'calendar-card',
      'cascader',
      'checkbox',
      'date-picker',
      'form',
      'input-number',
      'number-keyboard',
      'picker',
      'radio',
      'range',
      'rate',
      'searchbar',
      'short-password',
      'textarea',
      'uploader'
    ]

    expect(config).toContain("text: '表单组件'")
    expect(config).toContain("text: 'Form Components'")
    expect(config).toContain("'@varo/ui-h5/source/style.css'")

    components.forEach((name) => {
      expect(config).toContain(`/components/${name}`)
      expect(config).toContain(`/en/components/${name}`)
      expect(existsSync(resolve(docsRoot, `components/${name}.md`))).toBe(true)
      expect(existsSync(resolve(docsRoot, `en/components/${name}.md`))).toBe(true)
    })
  })

  it('links the Varo color system in both locales', () => {
    const config = readFileSync(configPath, 'utf8')
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')
    const zhColors = readFileSync(resolve(docsRoot, 'guide/colors.md'), 'utf8')
    const enColors = readFileSync(resolve(docsRoot, 'en/guide/colors.md'), 'utf8')

    expect(config).toContain("{ text: '色彩系统', link: '/guide/colors' }")
    expect(config).toContain("{ text: 'Color System', link: '/en/guide/colors' }")
    expect(zhColors).toContain('Varo Jade')
    expect(zhColors).toContain('Ink Neutral')
    expect(zhColors).toContain('Success')
    expect(zhColors).toContain('Warning')
    expect(zhColors).toContain('Danger')
    expect(zhColors).toContain('Violet')
    expect(zhColors).toContain('<div class="varo-color-system">')
    expect(zhColors).toContain('<section class="varo-color-matrix">')
    expect(zhColors).toContain('class="varo-color-state-strip"')
    expect(zhColors).toContain('## 使用建议')
    expect(zhColors).not.toMatch(/\n\n {4,}</)
    expect(zhColors).not.toContain('```')
    expect(zhColors).not.toContain('&lt;div')
    expect(zhColors).not.toContain('Primary token')
    expect(enColors).toContain('Varo Jade')
    expect(enColors).toContain('Ink Neutral')
    expect(enColors).toContain('Success')
    expect(enColors).toContain('Warning')
    expect(enColors).toContain('Danger')
    expect(enColors).toContain('Violet')
    expect(enColors).toContain('<div class="varo-color-system">')
    expect(enColors).toContain('<section class="varo-color-matrix">')
    expect(enColors).toContain('class="varo-color-state-strip"')
    expect(enColors).toContain('## Usage Notes')
    expect(enColors).not.toMatch(/\n\n {4,}</)
    expect(enColors).not.toContain('```')
    expect(enColors).not.toContain('&lt;div')
    expect(enColors).not.toContain('Primary token')
    expect(css).toContain('.varo-color-state-strip')
    expect(css).toContain('.varo-color-state-item.primary')
    expect(css).not.toContain('.varo-color-demo-button')
    expect(css).not.toContain('@keyframes varo-button-breathe')
  })

  it('keeps the docs outline narrow so examples have room', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('--vp-sidebar-width: 210px')
    expect(css).toContain('--vp-aside-width: 168px')
    expect(css).toContain('--vp-content-container: 1040px')
  })

  it('uses a product-grade docs palette and fixes dark demo contrast for form labels', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('--varo-bg: #f6f7f9')
    expect(css).toContain('--varo-surface: #ffffff')
    expect(css).toContain('--varo-surface-strong: #eef2f6')
    expect(css).toContain('--varo-primary: #08786f')
    expect(css).toContain('--varo-primary-foreground: #ffffff')
    expect(css).toContain('--varo-radius: 6px')
    expect(css).toContain('--varo-radius-lg: 8px')
    expect(css).toContain('--varo-gridline: rgba(24, 36, 51, 0.055)')
    expect(css).toContain('font-family: "IBM Plex Sans", "Aptos", "SF Pro Text",')
    expect(css).toContain('.dark .vp-doc :is(.varo-form-item__label, .varo-checkbox, .varo-radio, .varo-input__label)')
    expect(css).toContain('.dark .vp-doc :is(.varo-input__body, .varo-input-number, .varo-checkbox__icon, .varo-radio__icon, .varo-textarea__control)')
  })

  it('keeps code copy controls icon-only until hover or focus', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain(".vp-doc div[class*='language-'] > button.copy")
    expect(css).toContain('opacity: 0')
    expect(css).toContain(".vp-doc div[class*='language-']:hover > button.copy")
    expect(css).toContain(".vp-doc div[class*='language-'] > button.copy::before")
    expect(css).toContain('content: \"\"')
    expect(css).toContain('.varo-block-copy-icon')
    expect(css).not.toContain('Copy Code')
  })

  it('keeps docs chrome quieter than the content surface', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('--varo-gridline: rgba(24, 36, 51, 0.032)')
    expect(css).toContain('.VPNavBar {')
    expect(css).toContain('background: color-mix(in srgb, var(--varo-surface) 72%, transparent) !important')
    expect(css).toContain('.VPSidebar {')
    expect(css).toContain('background: color-mix(in srgb, var(--varo-bg) 86%, transparent) !important')
    expect(css).toContain('.VPSidebar .curtain')
    expect(css).toContain('background: transparent !important')
    expect(css).toContain('.VPDoc.has-aside .aside')
    expect(css).toContain('border-left: 1px solid color-mix(in srgb, var(--varo-border) 62%, transparent)')
  })

  it('adds a dedicated narrow-screen hero rule to avoid mobile title clipping', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('@media (max-width: 640px)')
    expect(css).toContain('.VPHero .name')
    expect(css).toContain('font-size: clamp(30px, 15vw, 54px)')
    expect(css).toContain('.VPHero .text')
    expect(css).toContain('font-size: clamp(24px, 10.5vw, 42px)')
  })

  it('uses the renewed runtime mark for docs branding', () => {
    const config = readFileSync(configPath, 'utf8')
    const logoPath = resolve(docsRoot, 'public/brand-assets/varo-runtime-mark.png')

    expect(config).toContain("logo: '/brand-assets/varo-runtime-mark.png'")
    expect(existsSync(logoPath)).toBe(true)
    expect(statSync(logoPath).size).toBeGreaterThan(1024)
  })

  it('explains primitives as runtime contracts instead of a flat component list', () => {
    const zhPrimitive = readFileSync(resolve(docsRoot, 'primitives/index.md'), 'utf8')
    const enPrimitive = readFileSync(resolve(docsRoot, 'en/primitives/index.md'), 'utf8')

    expect(zhPrimitive).toContain('运行时契约')
    expect(zhPrimitive).toContain('组合顺序')
    expect(zhPrimitive).toContain('受控与非受控')
    expect(zhPrimitive).toContain('class="varo-primitive-stack"')
    expect(enPrimitive).toContain('runtime contract')
    expect(enPrimitive).toContain('composition order')
    expect(enPrimitive).toContain('controlled and uncontrolled')
    expect(enPrimitive).toContain('class="varo-primitive-stack"')
  })

  it('documents the Base Kit Phase 1 scope and VSelect boundaries', () => {
    const config = readFileSync(configPath, 'utf8')
    const homeZh = readFileSync(resolve(docsRoot, 'index.md'), 'utf8')
    const homeEn = readFileSync(resolve(docsRoot, 'en/index.md'), 'utf8')
    const selectZh = readFileSync(resolve(docsRoot, 'components/select.md'), 'utf8')
    const selectEn = readFileSync(resolve(docsRoot, 'en/components/select.md'), 'utf8')
    const phase1Manifest = JSON.parse(readFileSync(resolve(workspaceRoot, 'registry/base-kit.phase1.json'), 'utf8')) as {
      components: string[]
      target: string
    }
    const requiredPages = [
      'components/select.md',
      'components/switch.md',
      'components/loading.md',
      'components/toast.md',
      'blocks/profile-edit.md',
      'blocks/order-filter.md',
      'en/components/select.md',
      'en/components/switch.md',
      'en/components/loading.md',
      'en/components/toast.md',
      'en/blocks/profile-edit.md',
      'en/blocks/order-filter.md'
    ]

    ;[
      '/components/select',
      '/components/switch',
      '/components/loading',
      '/components/toast',
      '/blocks/profile-edit',
      '/blocks/order-filter',
      '/en/components/select',
      '/en/components/switch',
      '/en/components/loading',
      '/en/components/toast',
      '/en/blocks/profile-edit',
      '/en/blocks/order-filter'
    ].forEach((route) => {
      expect(config).toContain(route)
    })

    requiredPages.forEach((page) => {
      expect(existsSync(resolve(docsRoot, page))).toBe(true)
    })

    expect(phase1Manifest.target).toBe('weapp-vite')
    expect(phase1Manifest.components).toEqual(baseKitPhase1Components)
    expect(phase1Manifest.components).toHaveLength(18)
    expect(homeZh).toContain('Phase 1 Base Kit 包含 18 个低层组件')
    expect(homeZh).toContain('Registry 方向以 `weapp-vite` 作为首个多端 registry 目标')
    expect(homeEn).toContain('Phase 1 Base Kit includes 18 low-level components')
    expect(homeEn).toContain('The multi-end registry direction starts with `weapp-vite` as the first registry target')
    baseKitPhase1Components.forEach((component) => {
      expect(homeZh).toContain(`\`${component}\``)
      expect(homeEn).toContain(`\`${component}\``)
    })

    expect(selectZh).toContain('默认使用 `picker` 模式')
    expect(selectZh).toContain('分组、远程搜索、异步分页属于二次封装组件能力')
    expect(selectEn).toContain('uses `picker` mode by default')
    expect(selectEn).toContain('Grouped options, remote search, and async paging belong in secondary wrappers')
  })
})
