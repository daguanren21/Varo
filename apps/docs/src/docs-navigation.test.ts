import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { componentCatalogItems, componentDocsRoute, createComponentSidebarGroups } from './component-catalog'

const docsRoot = resolve(__dirname, '..')
const workspaceRoot = resolve(docsRoot, '../..')
const configPath = resolve(docsRoot, '.vitepress/config.ts')
const baseKitPhase1Components = [
  'avatar',
  'badge',
  'button',
  'card',
  'checkbox',
  'empty',
  'icon',
  'image',
  'input',
  'input-number',
  'loading',
  'progress',
  'select',
  'switch',
  'tag',
]

describe('docs navigation', () => {
  it('groups display layout components separately from navigation components', () => {
    const groups = createComponentSidebarGroups('zh')
    const links = groups.flatMap(group => group.items)
    expect(groups.map(group => group.text)).toEqual(expect.arrayContaining(['布局组件', '导航组件']))
    expect(links).toEqual(expect.arrayContaining([
      { text: 'Divider 分割线', link: '/components/divider' },
      { text: 'Grid 宫格', link: '/components/grid' },
      { text: 'Tabs 选项卡切换', link: '/components/tabs' },
      { text: 'Menu 菜单', link: '/components/menu' },
    ]))
  })

  it('keeps the shipped Skeleton component visible in feedback documentation', () => {
    const zhLinks = createComponentSidebarGroups('zh').flatMap(group => group.items)
    const enLinks = createComponentSidebarGroups('en').flatMap(group => group.items)
    const skeletonZh = readFileSync(resolve(docsRoot, 'components/skeleton.md'), 'utf8')
    const skeletonEn = readFileSync(resolve(docsRoot, 'en/components/skeleton.md'), 'utf8')
    expect(zhLinks).toContainEqual({ text: 'Skeleton 骨架屏', link: '/components/skeleton' })
    expect(enLinks).toContainEqual({ text: 'Skeleton', link: '/en/components/skeleton' })
    expect(skeletonZh).toContain('<FormComponentDemo example="skeleton" locale="zh" />')
    expect(skeletonEn).toContain('<FormComponentDemo example="skeleton" locale="en" />')
    expect(skeletonZh).toContain('VSkeleton')
    expect(skeletonEn).toContain('VSkeleton')
  })

  it('keeps primitive installation on the overview and detail pages focused on APIs', () => {
    const config = readFileSync(configPath, 'utf8')
    const primitiveZh = readFileSync(resolve(docsRoot, 'primitives/index.md'), 'utf8')
    const primitiveEn = readFileSync(resolve(docsRoot, 'en/primitives/index.md'), 'utf8')
    const dedicatedPages = [
      'button',
      'input',
      'number-field',
      'image',
      'cell',
      'sticky',
      'checkbox',
      'radio-group',
      'switch',
      'tabs',
      'select',
      'collapsible',
      'accordion',
      'popover',
      'dialog',
      'overlay',
      'popup',
    ]

    expect(config).toContain('{ text: \'Primitives\', link: \'/primitives/\' }')
    expect(config).toContain('{ text: \'Primitives\', link: \'/en/primitives/\' }')
    expect(primitiveZh).toContain('pnpm add @varo-ui/headless @varo-ui/h5')
    expect(primitiveZh).toContain('pnpm add @varo-ui/headless @varo-ui/weapp')
    expect(primitiveEn).toContain('pnpm add @varo-ui/headless @varo-ui/h5')
    expect(primitiveEn).toContain('pnpm add @varo-ui/headless @varo-ui/weapp')
    expect(primitiveZh).not.toContain('<PrimitiveCatalog')
    expect(primitiveEn).not.toContain('<PrimitiveCatalog')
    expect(primitiveZh).not.toContain('<RegistryInstallStrip')
    expect(primitiveEn).not.toContain('<RegistryInstallStrip')

    dedicatedPages.forEach((page) => {
      expect(config).toContain(`/primitives/${page}`)
      expect(config).toContain(`/en/primitives/${page}`)
      const zhPage = readFileSync(resolve(docsRoot, `primitives/${page}.md`), 'utf8')
      const enPage = readFileSync(resolve(docsRoot, `en/primitives/${page}.md`), 'utf8')
      expect(zhPage).toContain(`<PrimitiveExample name="${page}" locale="zh" />`)
      expect(enPage).toContain(`<PrimitiveExample name="${page}" locale="en" />`)
      expect(zhPage).not.toMatch(/^## (?:安装|相关文档)$/m)
      expect(enPage).not.toMatch(/^## (?:Install|Installation|Related docs)$/m)
      expect(zhPage).toContain('::: info 平台差异')
      expect(enPage).toContain('::: info Platform notes')
    })

    const checkboxZh = readFileSync(resolve(docsRoot, 'primitives/checkbox.md'), 'utf8')
    const selectZh = readFileSync(resolve(docsRoot, 'primitives/select.md'), 'utf8')
    expect(checkboxZh).toContain('CheckboxRoot')
    expect(checkboxZh).toContain('CheckboxIndicator')
    expect(selectZh).toContain('SelectTrigger')
    expect(selectZh).toContain('SelectValue')
  })

  it('lists form components and has matching zh/en pages', () => {
    const routes = new Set(componentCatalogItems.flatMap(item => [
      componentDocsRoute(item.id, 'zh'),
      componentDocsRoute(item.id, 'en'),
    ]))
    const components = [
      'calendar',
      'calendar-card',
      'cascader',
      'checkbox',
      'date-field',
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
      'uploader',
    ]
    components.forEach((name) => {
      expect(routes.has(`/components/${name}`)).toBe(true)
      expect(routes.has(`/en/components/${name}`)).toBe(true)
      expect(existsSync(resolve(docsRoot, `components/${name}.md`))).toBe(true)
      expect(existsSync(resolve(docsRoot, `en/components/${name}.md`))).toBe(true)
    })
  })

  it('links Badge documentation in both locales and from the Registry manifest', () => {
    const badgeManifest = readFileSync(
      resolve(workspaceRoot, 'registry/components/badge/registry.json'),
      'utf8',
    )
    expect(componentCatalogItems.some(item => item.id === 'badge')).toBe(true)
    expect(componentDocsRoute('badge', 'zh')).toBe('/components/badge')
    expect(componentDocsRoute('badge', 'en')).toBe('/en/components/badge')
    expect(existsSync(resolve(docsRoot, 'components/badge.md'))).toBe(true)
    expect(existsSync(resolve(docsRoot, 'en/components/badge.md'))).toBe(true)
    expect(badgeManifest).toContain('"docs": "/components/badge"')
  })

  it('links Popover documentation in both locales and from the Registry manifest', () => {
    const popoverManifest = readFileSync(
      resolve(workspaceRoot, 'registry/components/popover/registry.json'),
      'utf8',
    )
    expect(componentCatalogItems.some(item => item.id === 'popover')).toBe(true)
    expect(componentDocsRoute('popover', 'zh')).toBe('/components/popover')
    expect(componentDocsRoute('popover', 'en')).toBe('/en/components/popover')
    expect(existsSync(resolve(docsRoot, 'components/popover.md'))).toBe(true)
    expect(existsSync(resolve(docsRoot, 'en/components/popover.md'))).toBe(true)
    expect(popoverManifest).toContain('"docs": "/components/popover"')
  })

  it('links the Varo color system in both locales', () => {
    const config = readFileSync(configPath, 'utf8')
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')
    const zhColors = readFileSync(resolve(docsRoot, 'guide/colors.md'), 'utf8')
    const enColors = readFileSync(resolve(docsRoot, 'en/guide/colors.md'), 'utf8')

    expect(config).toContain('{ text: \'色彩系统\', link: \'/guide/colors\' }')
    expect(config).toContain('{ text: \'Color System\', link: \'/en/guide/colors\' }')
    for (const guide of [zhColors, enColors]) {
      expect(guide).toContain('WeChat Green')
      expect(guide).toContain('#07C160')
      expect(guide).toContain('#13B248')
      expect(guide).toContain('#FA9200')
      expect(guide).toContain('#EB3437')
      expect(guide).toContain('#303133')
      expect(guide).toContain('--varo-ui-text')
      expect(guide).toContain('<div class="varo-color-system">')
      expect(guide).toContain('<section class="varo-color-matrix">')
      expect(guide).toContain('class="varo-color-state-strip"')
    }
    expect(zhColors).toContain('## 使用建议')
    expect(enColors).toContain('## Usage Notes')
    for (const guide of [zhColors, enColors]) {
      expect(guide).not.toMatch(/\n\n {4,}</)
      expect(guide).not.toContain('```')
      expect(guide).not.toContain('&lt;div')
    }
    expect(css).toContain('.varo-color-state-strip')
    expect(css).toContain('.varo-color-state-item.primary')
    expect(css).not.toContain('.varo-color-demo-button')
    expect(css).not.toContain('@keyframes varo-button-breathe')
  })

  it('balances navigation density with a readable content measure', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('--vp-sidebar-width: 224px')
    expect(css).toContain('--vp-aside-width: 188px')
    expect(css).toContain('--vp-content-container: 960px')
    expect(css).toContain('.vp-doc > table th,\n.vp-doc > table td {\n  padding: 12px 16px;')
  })

  it('uses a precision-lab light palette and preserves dark demo contrast', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('--vp-c-bg: #edf3f0')
    expect(css).toContain('--varo-bg: #edf3f0')
    expect(css).toContain('--varo-surface: #f8fbf9')
    expect(css).toContain('--varo-surface-strong: #e8f0ec')
    expect(css).toContain('--varo-primary: #07c160')
    expect(css).toContain('--varo-primary-foreground: #10271b')
    expect(css).toContain('--varo-success: #13b248')
    expect(css).toContain('--varo-warning: #fa9200')
    expect(css).toContain('--varo-danger: #eb3437')
    expect(css).toContain('--varo-info: #73767a')
    expect(css).toContain('--varo-radius: 8px')
    expect(css).toContain('--varo-radius-lg: 12px')
    expect(css).toContain('--varo-gridline: rgb(9 96 61 / 6%)')
    expect(css).toContain('font-family: Inter, \"SF Pro Text\", \"PingFang SC\",')
    expect(css).toContain('--varo-ui-text: var(--varo-foreground)')
    expect(css).toContain('--varo-ui-text-regular: var(--varo-text-regular)')
    expect(css).toContain('--varo-ui-text-muted: var(--varo-muted)')
    expect(css).toContain('--varo-ui-text-placeholder: var(--varo-placeholder)')
    expect(css).toContain('--varo-ui-surface: var(--varo-card-solid)')
    expect(css).toContain('--varo-ui-border: var(--varo-border)')
    expect(css).toContain('--varo-ui-fill: var(--varo-fill)')
    expect(css).toContain('--varo-ui-primary-hover: var(--varo-primary-hover)')
    expect(css).toContain('--varo-ui-success-soft: var(--varo-success-soft)')
    expect(css).toContain('--varo-ui-primary-text: var(--varo-primary-text)')
    expect(css).toContain('--varo-ui-success-text: var(--varo-success-text)')
    expect(css).toContain('--varo-ui-warning-text: var(--varo-warning-text)')
    expect(css).toContain('--varo-ui-danger-text: var(--varo-danger-text)')
    expect(css).toContain('color: var(--varo-ui-text);')
    expect(css).toContain('background: var(--varo-ui-surface);')
    expect(css).not.toContain('color: color-mix(in srgb, var(--varo-bg) 90%, #e6e4df)')
    expect(css).toContain('html:not(.dark) body')
    expect(css).toContain('radial-gradient(circle at 12% 6%, rgb(7 185 92 / 11%)')
    expect(css).toContain('html:not(.dark) .VPSidebar')
    expect(css).toContain('html:not(.dark) .VPDocAsideOutline')
    expect(css).toContain('html:not(.dark) .VPFeature')
    expect(css).toMatch(/\.dark\s*\{[\s\S]*?--vp-c-bg: #0a0a0a/)
    expect(css).toMatch(/\.dark\s*\{[\s\S]*?--varo-primary-text: #76d6aa/)
    expect(css).toMatch(/\.dark\s*\{[\s\S]*?--varo-warning-text: #f0be7a/)
  })

  it('keeps code copy controls icon-only until hover or focus', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('.vp-doc div[class*=\'language-\'] > button.copy')
    expect(css).toContain('opacity: 0')
    expect(css).toContain('.vp-doc div[class*=\'language-\']:hover > button.copy')
    expect(css).toContain('.vp-doc div[class*=\'language-\'] > button.copy::before')
    expect(css).toContain('content: \"\"')
    expect(css).toContain('.varo-block-copy-icon')
    expect(css).not.toContain('Copy Code')
  })

  it('gives light docs chrome structured depth without overpowering content', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('--varo-gridline: rgb(9 96 61 / 6%)')
    expect(css).toContain('.VPNavBar {')
    expect(css).toContain('html:not(.dark) .VPNavBar')
    expect(css).toContain('backdrop-filter: blur(18px) saturate(135%)')
    expect(css).toContain('.VPFeature {')
    expect(css).toContain('background: color-mix(in srgb, var(--varo-card) 84%, transparent) !important')
    expect(css).toContain('html:not(.dark) .VPFeature')
  })

  it('adds a dedicated narrow-screen hero rule to avoid mobile title clipping', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('@media (max-width: 640px)')
    expect(css).toContain('.VPHero .name')
    expect(css).toContain('font-size: 12px')
    expect(css).toContain('.VPHero .text')
    expect(css).toContain('font-size: clamp(32px, 10.5vw, 42px)')
  })

  it('ships a complete Kinetic Grid brand system for docs and product icons', () => {
    const config = readFileSync(configPath, 'utf8')
    const assets = [
      'public/brand-assets/varo-symbol.svg',
      'public/brand-assets/varo-lockup.svg',
      'public/brand-assets/varo-lockup-dark.svg',
      'public/brand-assets/varo-app-icon.svg',
      'public/brand-assets/varo-runtime-mark.png',
      'public/apple-touch-icon.png',
      'public/favicon.ico',
    ]

    expect(config).toContain('light: \'/brand-assets/varo-lockup.svg\'')
    expect(config).toContain('dark: \'/brand-assets/varo-lockup-dark.svg\'')
    expect(config).toContain('siteTitle: false')
    assets.forEach((asset) => {
      const path = resolve(docsRoot, asset)
      expect(existsSync(path), asset).toBe(true)
      expect(statSync(path).size, asset).toBeGreaterThan(200)
    })
  })

  it('keeps the removed Registry install strip out of styled component pages', () => {
    const theme = readFileSync(resolve(docsRoot, '.vitepress/theme/index.ts'), 'utf8')
    expect(theme).not.toContain('RegistryInstallStrip')
    expect(readFileSync(resolve(docsRoot, 'components/textarea.md'), 'utf8')).not.toContain('RegistryInstallStrip')
    expect(readFileSync(resolve(docsRoot, 'en/components/textarea.md'), 'utf8')).not.toContain('RegistryInstallStrip')
  })

  it('documents the dual-target component tiers', () => {
    const phase1Manifest = JSON.parse(readFileSync(resolve(workspaceRoot, 'registry/base-kit.phase1.json'), 'utf8')) as {
      components: string[]
      targets: string[]
    }
    const componentTiers = JSON.parse(
      readFileSync(resolve(workspaceRoot, 'registry/component-tiers.v0.1.json'), 'utf8'),
    ) as {
      agentUi: string[]
      registryCatalog: { h5: number, weappSfc: number, weappSfcBaseKit: number, weappVite: number }
    }
    const requiredComponentIds = [
      'select',
      'switch',
      'list',
      'loading',
      'toast',
      'region-picker',
      'pull-refresh',
      'signature',
      'watermark',
      'map',
      'robot-chat',
    ]
    const requiredPages = [
      ...requiredComponentIds.flatMap(id => [
        `components/${id}.md`,
        `en/components/${id}.md`,
      ]),
      'blocks/build-your-own.md',
      'blocks/profile-edit.md',
      'blocks/order-filter.md',
      'en/blocks/build-your-own.md',
      'en/blocks/profile-edit.md',
      'en/blocks/order-filter.md',
    ]
    requiredComponentIds.forEach((id) => {
      expect(componentCatalogItems.some(item => item.id === id)).toBe(true)
      expect(componentDocsRoute(id, 'zh')).toBe(`/components/${id}`)
      expect(componentDocsRoute(id, 'en')).toBe(`/en/components/${id}`)
    })
    requiredPages.forEach((page) => {
      expect(existsSync(resolve(docsRoot, page))).toBe(true)
    })
    expect(phase1Manifest.targets).toEqual(['h5', 'weapp'])
    expect(phase1Manifest.components).toEqual(baseKitPhase1Components)
    expect(componentTiers.registryCatalog).toEqual({ h5: 62, weappSfc: 52, weappSfcBaseKit: 15, weappVite: 53 })
    expect(componentTiers.agentUi).toHaveLength(42)
  })

  it('keeps the Wevu Registry guide focused on mini-program installation and usage', () => {
    const config = readFileSync(configPath, 'utf8')
    const installationZh = readFileSync(resolve(docsRoot, 'guide/installation.md'), 'utf8')
    const installationEn = readFileSync(resolve(docsRoot, 'en/guide/installation.md'), 'utf8')
    const shadcnZh = readFileSync(resolve(docsRoot, 'guide/shadcn-mode.md'), 'utf8')
    const shadcnEn = readFileSync(resolve(docsRoot, 'en/guide/shadcn-mode.md'), 'utf8')

    expect(config).toContain('{ text: \'Wevu Registry\', link: \'/guide/shadcn-mode\' }')
    expect(config).toContain('{ text: \'Wevu Registry\', link: \'/en/guide/shadcn-mode\' }')
    expect(installationZh).toContain('pnpm dlx @varo-ui/cli add --target weapp button select card')
    expect(installationZh).toContain('pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit')
    expect(installationZh).toContain('pnpm dlx create-weapp-vite@latest varo-app')
    expect(installationZh).toContain('pnpm add vue wevu @varo-ui/weapp @varo-ui/theme')
    expect(installationZh).toContain('pnpm add -D weapp-vite weapp-tailwindcss tailwindcss')
    expect(installationZh).not.toMatch(/\b(?:weapp-vite|wevu|weapp-tailwindcss)@\^?\d/)
    expect(installationZh).not.toMatch(/\b(?:6\.23\.0|5\.3\.6|3\.5\.41)\b/)
    expect(installationZh).toContain('@weapp-tailwindcss/merge')
    expect(installationEn).toContain('pnpm dlx @varo-ui/cli add --target weapp button select card')
    expect(installationEn).toContain('pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit')
    expect(installationEn).toContain('pnpm dlx create-weapp-vite@latest varo-app')
    expect(installationEn).toContain('pnpm add vue wevu @varo-ui/weapp @varo-ui/theme')
    expect(installationEn).toContain('pnpm add -D weapp-vite weapp-tailwindcss tailwindcss')
    expect(installationEn).not.toMatch(/\b(?:weapp-vite|wevu|weapp-tailwindcss)@\^?\d/)
    expect(installationEn).not.toMatch(/\b(?:6\.23\.0|5\.3\.6|3\.5\.41)\b/)
    expect(installationEn).toContain('@weapp-tailwindcss/merge')
    expect(shadcnZh).toContain('pnpm dlx @varo-ui/cli add --target weapp button form toast')
    expect(shadcnZh).toContain('pnpm dlx @varo-ui/cli add --target weapp --force button')
    expect(shadcnZh).toContain('pnpm dlx @varo-ui/cli add --target weapp components/agent-ui')
    expect(shadcnZh).toContain('import { shallowRef } from \'wevu\'')
    expect(shadcnZh).toContain('import VButton from \'@/components/ui/v-button.vue\'')
    expect(shadcnZh).not.toContain('--target h5')
    expect(shadcnZh).not.toContain('from \'vue\'')
    expect(shadcnZh).not.toContain('Reka UI')
    expect(shadcnZh).not.toContain('vee-validate')
    expect(shadcnZh).not.toContain('src/components/biz')
    expect(shadcnEn).toContain('pnpm dlx @varo-ui/cli add --target weapp button form toast')
    expect(shadcnEn).toContain('pnpm dlx @varo-ui/cli add --target weapp --force button')
    expect(shadcnEn).toContain('pnpm dlx @varo-ui/cli add --target weapp components/agent-ui')
    expect(shadcnEn).toContain('import { shallowRef } from \'wevu\'')
    expect(shadcnEn).toContain('import VButton from \'@/components/ui/v-button.vue\'')
    expect(shadcnEn).not.toContain('--target h5')
    expect(shadcnEn).not.toContain('from \'vue\'')
    expect(shadcnEn).not.toContain('Reka UI')
    expect(shadcnEn).not.toContain('vee-validate')
    expect(shadcnEn).not.toContain('src/components/biz')
  })

  it('publishes interactive AI component docs on VitePress 2 alpha', () => {
    const config = readFileSync(configPath, 'utf8')
    const theme = readFileSync(resolve(docsRoot, '.vitepress/theme/index.ts'), 'utf8')
    const tailwind = readFileSync(resolve(docsRoot, '.vitepress/theme/tailwind.css'), 'utf8')
    const demo = readFileSync(resolve(docsRoot, 'src/components/AgentComponentsDemo.vue'), 'utf8')
    const agentIndex = readFileSync(resolve(docsRoot, 'src/components/agent-ui/index.ts'), 'utf8')
    const agentMarkdown = readFileSync(resolve(docsRoot, 'src/components/agent-ui/agent-markdown.css'), 'utf8')
    const aiZh = readFileSync(resolve(docsRoot, 'ai/index.md'), 'utf8')
    const aiEn = readFileSync(resolve(docsRoot, 'en/ai/index.md'), 'utf8')
    const loadingZh = readFileSync(resolve(docsRoot, 'ai/loading.md'), 'utf8')
    const loadingEn = readFileSync(resolve(docsRoot, 'en/ai/loading.md'), 'utf8')
    const workspaceZh = readFileSync(resolve(docsRoot, 'ai/agent-workspace.md'), 'utf8')
    const workspaceEn = readFileSync(resolve(docsRoot, 'en/ai/agent-workspace.md'), 'utf8')
    const ragZh = readFileSync(resolve(docsRoot, 'ai/rag-pipeline.md'), 'utf8')
    const ragEn = readFileSync(resolve(docsRoot, 'en/ai/rag-pipeline.md'), 'utf8')
    const packageJson = JSON.parse(readFileSync(resolve(docsRoot, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>
    }

    expect(packageJson.dependencies.vitepress).toBe('2.0.0-alpha.19')
    expect(config).toContain('{ text: \'AI Agent\', link: \'/ai/\' }')
    expect(config).toContain('{ text: \'AI Agent\', link: \'/en/ai/\' }')
    expect(config).toContain('{ text: \'AgentWorkspace Block\', link: \'/ai/agent-workspace\' }')
    expect(config).toContain('{ text: \'AgentWorkspace Block\', link: \'/en/ai/agent-workspace\' }')
    expect(theme).toContain('app.component(\'AgentComponentsDemo\', AgentComponentsDemo)')
    expect(tailwind).toContain('@import "tailwindcss/utilities.css";')
    expect(tailwind).not.toContain('@import "tailwindcss/utilities.css" layer(utilities);')
    expect(tailwind).toContain('@source "../../src/components/agent-ui/**/*.{ts,vue}";')
    expect(aiZh).toContain('<AgentComponentsDemo locale=\"zh\" />')
    expect(aiEn).toContain('<AgentComponentsDemo locale=\"en\" />')
    expect(aiZh).toContain('components/agent-ui')
    expect(aiEn).toContain('components/agent-ui')
    expect(aiZh).not.toContain('Beautiful UI / beUI / ReUI')
    expect(aiEn).not.toContain('Beautiful UI / beUI / ReUI')
    expect(aiZh).not.toContain('agent-component-inventory')
    expect(aiEn).not.toContain('agent-component-inventory')
    expect(demo).toContain('AgentEventRenderer')
    expect(demo).toContain('AgentRagPipeline')
    expect(demo).toContain('Chat 模式')
    expect(demo).toContain('RAG 模式')
    expect(demo).not.toContain('ai-docs-demo__ledger')
    expect(demo).not.toContain('AgentArtifact')
    expect(demo).not.toContain('AgentAttachmentList')
    expect(demo).toContain('--ai-demo-card: var(--varo-surface)')
    expect(demo).not.toMatch(/background:\s*#(?:fff|f8fafc|eef2f6)\b/)
    expect(agentIndex).toContain('bg-[var(--varo-agent-surface)]')
    expect(agentIndex).not.toContain('from-white')
    expect(agentMarkdown).toContain('background: var(--varo-agent-surface-strong)')
    expect(agentMarkdown).not.toContain('background: #f8fafc')
    expect(aiZh).toContain('pnpm add @varo-ui/ai')
    expect(aiEn).toContain('pnpm add @varo-ui/ai')
    for (const content of [aiZh, aiEn]) {
      for (const target of ['h5', 'weapp']) {
        expect(content).toContain(`pnpm dlx @varo-ui/cli add --target ${target} blocks/agent-chat`)
        expect(content).toContain(`pnpm dlx @varo-ui/cli add --target ${target} blocks/agent-workspace`)
      }
    }
    expect(aiZh).toContain('[AgentWorkspace](./agent-workspace)')
    expect(aiEn).toContain('[AgentWorkspace](./agent-workspace)')
    for (const content of [workspaceZh, workspaceEn]) {
      expect(content).toContain('| `prompt` |')
      expect(content).toContain('`readonly AgentThreadVersion[]`')
      expect(content).toContain('`\'先确认可访问来源，再提交任务\'`')
      expect(content).toContain('`(AgentContextSource, boolean)`')
      expect(content).toContain('| `update:prompt` |')
      expect(content).toContain('`wevu`')
    }
    for (const content of [ragZh, ragEn]) {
      expect(content).toContain('| `className` | `ClassValue` | `undefined` |')
      expect(content).toContain('`readonly AgentRagStep[]`')
      expect(content).toContain('`readonly AgentRagSource[]`')
      expect(content).toContain('`readonly AgentRagAnswerPart[]`')
    }
    expect(workspaceZh).toContain('## Props')
    expect(workspaceZh).toContain('## Events')
    expect(workspaceZh).toContain('`execution`')
    expect(workspaceZh).toContain('scopedSlotsRequireProps: true')
    expect(workspaceEn).toContain('## Props')
    expect(workspaceEn).toContain('## Events')
    expect(workspaceEn).toContain('`execution`')
    expect(workspaceEn).toContain('scopedSlotsRequireProps: true')
    expect(workspaceZh).not.toMatch(/^## 安装$/m)
    expect(workspaceEn).not.toMatch(/^## Install$/m)
    expect(loadingZh).not.toMatch(/^## 安装$/m)
    expect(loadingEn).not.toMatch(/^## Install$/m)
    expect(loadingZh).toContain('import { AgentLoading } from \'@/components/agent-ui\'')
    expect(loadingEn).toContain('import { AgentLoading } from \'@/components/agent-ui\'')
    expect(loadingZh).not.toContain('import { AgentLoading } from \'@varo-ui/ai\'')
    expect(loadingEn).not.toContain('import { AgentLoading } from \'@varo-ui/ai\'')

    const slugs = [
      'loading',
      'thinking',
      'markdown',
      'stream',
      'message',
      'conversation',
      'tool-chip',
      'task-list',
      'radio-group',
      'approval',
      'recommendation',
      'prompt-suggestions',
      'composer',
      'response-actions',
      'artifact',
      'sources',
      'attachments',
      'rag-pipeline',
      'event-renderer',
      'message-scroller',
      'code-block',
      'file-diff',
      'tool-result',
      'image-generation',
      'tool-approval',
      'citations',
      'activity',
      'sidebar',
      'context-card',
      'insight-card',
      'selection-actions',
      'diff-table',
      'records-table',
      'filter-table',
      'command-search',
      'flowchart',
      'fine-tune',
      'agent-chat',
    ]
    slugs.forEach((slug) => {
      const zhPage = readFileSync(resolve(docsRoot, `ai/${slug}.md`), 'utf8')
      const enPage = readFileSync(resolve(docsRoot, `en/ai/${slug}.md`), 'utf8')
      expect(zhPage).toContain(`<AgentComponentDemo component=\"${slug}\" locale=\"zh\" />`)
      expect(enPage).toContain(`<AgentComponentDemo component=\"${slug}\" locale=\"en\" />`)
      expect(zhPage).toContain('## Props')
      expect(enPage).toContain('## Props')
      expect(zhPage).not.toContain('@/components/agent-ui/advanced')
      expect(enPage).not.toContain('@/components/agent-ui/advanced')
      expect(zhPage).not.toMatch(/^## 安装$/m)
      expect(enPage).not.toMatch(/^## Install$/m)
    })
  })

  it('keeps documented target availability aligned with Registry manifests', () => {
    const registryNameByDocsId: Record<string, string> = {
      'calendar-card': 'calendar',
    }

    componentCatalogItems.forEach((item) => {
      const registryName = registryNameByDocsId[item.id] ?? item.id
      const manifest = JSON.parse(
        readFileSync(resolve(workspaceRoot, `registry/components/${registryName}/registry.json`), 'utf8'),
      ) as { targets: string[] }

      expect(item.targets).toEqual(manifest.targets)
    })
  })
})
