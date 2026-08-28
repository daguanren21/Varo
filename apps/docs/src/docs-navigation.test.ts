import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

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
    const config = readFileSync(configPath, 'utf8')

    expect(config).toContain('text: \'布局组件\'')
    expect(config).toContain('text: \'导航组件\'')
    expect(config).toContain('{ text: \'Divider 分割线\', link: \'/components/divider\' }')
    expect(config).toContain('{ text: \'Grid 宫格\', link: \'/components/grid\' }')
    expect(config).toContain('{ text: \'Tabs 选项卡切换\', link: \'/components/tabs\' }')
    expect(config).toContain('{ text: \'Menu 菜单\', link: \'/components/menu\' }')
  })

  it('adds a primitives catalog and dedicated pages for interactive behavior primitives', () => {
    const config = readFileSync(configPath, 'utf8')
    const primitiveZh = readFileSync(resolve(docsRoot, 'primitives/index.md'), 'utf8')
    const primitiveEn = readFileSync(resolve(docsRoot, 'en/primitives/index.md'), 'utf8')
    const catalog = readFileSync(resolve(docsRoot, 'src/components/PrimitiveCatalog.vue'), 'utf8')
    const example = readFileSync(resolve(docsRoot, 'src/components/PrimitiveExample.vue'), 'utf8')
    const dedicatedPages = [
      'checkbox',
      'radio-group',
      'switch',
      'tabs',
      'select',
      'collapsible',
      'accordion',
      'popover',
    ]

    expect(config).toContain('{ text: \'Primitives\', link: \'/primitives/\' }')
    expect(config).toContain('{ text: \'Primitives\', link: \'/en/primitives/\' }')
    expect(config).toContain('{ text: \'总览\', link: \'/primitives/\' }')
    expect(config).toContain('{ text: \'Overview\', link: \'/en/primitives/\' }')
    expect(primitiveZh).toContain('<PrimitiveCatalog locale="zh" />')
    expect(primitiveEn).toContain('<PrimitiveCatalog locale="en" />')
    expect(primitiveZh).not.toContain('<PrimitiveInteractionDemo')
    expect(primitiveEn).not.toContain('<PrimitiveInteractionDemo')
    expect(primitiveZh).not.toContain('Reka-style anatomy')
    expect(primitiveEn).not.toContain('Reka-style anatomy')
    expect(catalog).toContain('title: \'Checkbox\'')
    expect(catalog).toContain('href: \'/primitives/checkbox\'')
    expect(catalog).toContain('href: \'/en/primitives/popover\'')
    expect(example).toContain('name: PrimitiveExampleName')
    expect(example).toContain('resolvePrimitiveExample')

    dedicatedPages.forEach((page) => {
      expect(config).toContain(`/primitives/${page}`)
      expect(config).toContain(`/en/primitives/${page}`)
      expect(existsSync(resolve(docsRoot, `primitives/${page}.md`))).toBe(true)
      expect(existsSync(resolve(docsRoot, `en/primitives/${page}.md`))).toBe(true)
      expect(readFileSync(resolve(docsRoot, `primitives/${page}.md`), 'utf8')).toContain(
        `<PrimitiveExample name="${page}" locale="zh" />`,
      )
      expect(readFileSync(resolve(docsRoot, `en/primitives/${page}.md`), 'utf8')).toContain(
        `<PrimitiveExample name="${page}" locale="en" />`,
      )
    })

    ;[
      'CheckboxRoot / CheckboxIndicator',
      'RadioGroup / RadioItem / RadioIndicator',
      'SwitchRoot / SwitchThumb',
      'TabsRoot / TabsList / TabsTrigger / TabsContent',
      'SelectRoot / Trigger / Value / Content / Item',
      'CollapsibleRoot / Trigger / Content',
      'AccordionRoot / Item / Trigger / Content',
      'PopoverRoot / Trigger / Content / Close',
    ].forEach((parts) => {
      expect(catalog).toContain(parts)
    })

    const checkboxZh = readFileSync(resolve(docsRoot, 'primitives/checkbox.md'), 'utf8')
    const selectZh = readFileSync(resolve(docsRoot, 'primitives/select.md'), 'utf8')
    expect(checkboxZh).toContain('CheckboxRoot')
    expect(checkboxZh).toContain('CheckboxIndicator')
    expect(selectZh).toContain('SelectTrigger')
    expect(selectZh).toContain('SelectValue')

    expect(primitiveZh).toContain('## 产品边界')
    expect(primitiveZh).toContain('**primitive** 管行为契约')
    expect(primitiveZh).toContain('**UI wrapper** 管视觉与定位')
    expect(primitiveZh).toContain('同一 `TabsRoot` / `AccordionRoot` 内的 value 必须唯一')
    expect(primitiveEn).toContain('## Product boundaries')
    expect(primitiveEn).toContain('**Primitives** own behavior contracts')
    expect(primitiveEn).toContain('**UI wrappers** own visuals and positioning')
    expect(primitiveEn).toContain('Values inside one `TabsRoot` / `AccordionRoot` must stay unique')
    expect(primitiveZh).not.toContain('Divider')
    expect(primitiveZh).not.toContain('Grid')
    expect(primitiveZh).not.toContain('Layout')
    expect(primitiveZh).not.toContain('Space')
    expect(primitiveEn).toContain('behavior building blocks')
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
      'uploader',
    ]

    expect(config).toContain('text: \'表单组件\'')
    expect(config).toContain('text: \'Form Components\'')
    expect(config).toContain('\'@varo-ui/h5/source/style.css\'')

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

    expect(config).toContain('{ text: \'色彩系统\', link: \'/guide/colors\' }')
    expect(config).toContain('{ text: \'Color System\', link: \'/en/guide/colors\' }')
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

  it('balances navigation density with a readable content measure', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('--vp-sidebar-width: 224px')
    expect(css).toContain('--vp-aside-width: 188px')
    expect(css).toContain('--vp-content-container: 960px')
  })

  it('uses a product-grade docs palette and fixes dark demo contrast for form labels', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('--varo-bg: #f7f8fa')
    expect(css).toContain('--varo-surface: #ffffff')
    expect(css).toContain('--varo-surface-strong: #eef2f5')
    expect(css).toContain('--varo-primary: #0f766e')
    expect(css).toContain('--varo-primary-foreground: #ffffff')
    expect(css).toContain('--varo-radius: 8px')
    expect(css).toContain('--varo-radius-lg: 12px')
    expect(css).toContain('--varo-gridline: rgba(24, 33, 47, 0.045)')
    expect(css).toContain('font-family: Inter, \"SF Pro Text\", \"PingFang SC\",')
    expect(css).toContain('.dark .vp-doc :is(.varo-form-item__label, .varo-checkbox, .varo-radio, .varo-input__label)')
    expect(css).toContain('.dark .vp-doc :is(.varo-input__body, .varo-input-number, .varo-checkbox__icon, .varo-radio__icon, .varo-textarea__control)')
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

  it('keeps docs chrome quieter than the content surface', () => {
    const css = readFileSync(resolve(docsRoot, '.vitepress/theme/custom.css'), 'utf8')

    expect(css).toContain('--varo-gridline: rgba(24, 33, 47, 0.045)')
    expect(css).toContain('.VPNavBar {')
    expect(css).toContain('background: color-mix(in srgb, var(--varo-bg) 94%, transparent) !important')
    expect(css).toContain('backdrop-filter: blur(12px)')
    expect(css).toContain('.VPFeature {')
    expect(css).toContain('background: color-mix(in srgb, var(--varo-card) 84%, transparent) !important')
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

  it('explains primitives as runtime contracts instead of a flat component list', () => {
    const zhPrimitive = readFileSync(resolve(docsRoot, 'primitives/index.md'), 'utf8')
    const enPrimitive = readFileSync(resolve(docsRoot, 'en/primitives/index.md'), 'utf8')

    expect(zhPrimitive).toContain('运行时契约')
    expect(zhPrimitive).toContain('组合顺序')
    expect(zhPrimitive).toContain('受控与非受控')
    expect(zhPrimitive).toContain('class="varo-primitive-stack"')
    expect(enPrimitive).toContain('Runtime contract')
    expect(enPrimitive).toContain('Composition order')
    expect(enPrimitive).toContain('Controlled and uncontrolled')
    expect(enPrimitive).toContain('class="varo-primitive-stack"')
  })

  it('documents the dual-target component tiers and VSelect boundaries', () => {
    const config = readFileSync(configPath, 'utf8')
    const homeZh = readFileSync(resolve(docsRoot, 'index.md'), 'utf8')
    const homeEn = readFileSync(resolve(docsRoot, 'en/index.md'), 'utf8')
    const selectZh = readFileSync(resolve(docsRoot, 'components/select.md'), 'utf8')
    const selectEn = readFileSync(resolve(docsRoot, 'en/components/select.md'), 'utf8')
    const phase1Manifest = JSON.parse(readFileSync(resolve(workspaceRoot, 'registry/base-kit.phase1.json'), 'utf8')) as {
      components: string[]
      targets: string[]
    }
    const componentTiers = JSON.parse(
      readFileSync(resolve(workspaceRoot, 'registry/component-tiers.v0.1.json'), 'utf8'),
    ) as {
      agentUi: string[]
      registryCatalog: { h5: number, weappSfcBaseKit: number, weappVite: number }
    }
    const requiredPages = [
      'components/select.md',
      'components/switch.md',
      'components/loading.md',
      'components/toast.md',
      'blocks/build-your-own.md',
      'blocks/profile-edit.md',
      'blocks/order-filter.md',
      'en/components/select.md',
      'en/components/switch.md',
      'en/components/loading.md',
      'en/components/toast.md',
      'en/blocks/build-your-own.md',
      'en/blocks/profile-edit.md',
      'en/blocks/order-filter.md',
    ]

    ;[
      '/components/select',
      '/components/switch',
      '/components/loading',
      '/components/toast',
      '/blocks/build-your-own',
      '/blocks/profile-edit',
      '/blocks/order-filter',
      '/en/components/select',
      '/en/components/switch',
      '/en/components/loading',
      '/en/components/toast',
      '/en/blocks/build-your-own',
      '/en/blocks/profile-edit',
      '/en/blocks/order-filter',
    ].forEach((route) => {
      expect(config).toContain(route)
    })

    requiredPages.forEach((page) => {
      expect(existsSync(resolve(docsRoot, page))).toBe(true)
    })

    expect(phase1Manifest.targets).toEqual(['h5', 'weapp-vite'])
    expect(phase1Manifest.components).toEqual(baseKitPhase1Components)
    expect(phase1Manifest.components).toHaveLength(15)
    expect(componentTiers.registryCatalog).toEqual({ h5: 56, weappSfcBaseKit: 15, weappVite: 45 })
    expect(componentTiers.agentUi).toHaveLength(36)
    expect(homeZh).toContain('Base Kit 包含 15 个已经通过微信开发者工具编译的原生 SFC 组件')
    expect(homeZh).toContain('小程序已开放 45 个高共识组件族')
    expect(homeEn).toContain('The Base Kit contains 15 native SFC components verified by WeChat DevTools')
    expect(homeEn).toContain('mini-program registry exposes 45 high-consensus families')
    baseKitPhase1Components.forEach((component) => {
      expect(homeZh).toContain(`\`${component}\``)
      expect(homeEn).toContain(`\`${component}\``)
    })

    expect(selectZh).toContain('默认使用 `picker` 模式')
    expect(selectZh).toContain('分组、远程搜索、异步分页属于二次封装组件能力')
    expect(selectEn).toContain('uses `picker` mode by default')
    expect(selectEn).toContain('Grouped options, remote search, and async paging belong in secondary wrappers')
  })

  it('documents shadcn-style install and secondary business wrapping', () => {
    const config = readFileSync(configPath, 'utf8')
    const installationZh = readFileSync(resolve(docsRoot, 'guide/installation.md'), 'utf8')
    const installationEn = readFileSync(resolve(docsRoot, 'en/guide/installation.md'), 'utf8')
    const shadcnZh = readFileSync(resolve(docsRoot, 'guide/shadcn-mode.md'), 'utf8')
    const shadcnEn = readFileSync(resolve(docsRoot, 'en/guide/shadcn-mode.md'), 'utf8')

    expect(config).toContain('{ text: \'shadcn 模式\', link: \'/guide/shadcn-mode\' }')
    expect(config).toContain('{ text: \'shadcn Mode\', link: \'/en/guide/shadcn-mode\' }')
    expect(installationZh).toContain('pnpm dlx @varo-ui/cli add --target weapp-vite button select card')
    expect(installationZh).toContain('pnpm dlx @varo-ui/cli add --target weapp-vite blocks/profile-edit')
    expect(installationZh).toContain('pnpm dlx create-weapp-vite@latest varo-app')
    expect(installationZh).toContain('weapp-vite@6.23.0')
    expect(installationZh).toContain('wevu@6.23.0')
    expect(installationZh).toContain('weapp-tailwindcss@^5.3.6')
    expect(installationZh).toContain('@weapp-tailwindcss/merge')
    expect(installationEn).toContain('pnpm dlx @varo-ui/cli add --target weapp-vite button select card')
    expect(installationEn).toContain('pnpm dlx @varo-ui/cli add --target weapp-vite blocks/profile-edit')
    expect(installationEn).toContain('pnpm dlx create-weapp-vite@latest varo-app')
    expect(installationEn).toContain('weapp-vite@6.23.0')
    expect(installationEn).toContain('wevu@6.23.0')
    expect(installationEn).toContain('weapp-tailwindcss@^5.3.6')
    expect(installationEn).toContain('@weapp-tailwindcss/merge')
    expect(shadcnZh).toContain('src/components/ui/v-button.vue')
    expect(shadcnZh).toContain('src/components/ui/select.vue')
    expect(shadcnZh).toContain('src/components/biz/user-select.ts')
    expect(shadcnZh).toContain('export const UserSelect')
    expect(shadcnZh).toContain('远程搜索、分组、分页')
    expect(shadcnZh).toContain('pnpm dlx @varo-ui/cli add --target weapp-vite --force button select')
    expect(shadcnZh).toContain('components/agent-ui')
    expect(shadcnEn).toContain('src/components/ui/v-button.vue')
    expect(shadcnEn).toContain('src/components/ui/select.vue')
    expect(shadcnEn).toContain('src/components/biz/user-select.ts')
    expect(shadcnEn).toContain('export const UserSelect')
    expect(shadcnEn).toContain('remote search, grouping, and pagination')
    expect(shadcnEn).toContain('pnpm dlx @varo-ui/cli add --target weapp-vite --force button select')
    expect(shadcnEn).toContain('components/agent-ui')
  })

  it('publishes interactive AI component docs on VitePress 2 alpha', () => {
    const config = readFileSync(configPath, 'utf8')
    const theme = readFileSync(resolve(docsRoot, '.vitepress/theme/index.ts'), 'utf8')
    const demo = readFileSync(resolve(docsRoot, 'src/components/AgentComponentsDemo.vue'), 'utf8')
    const aiZh = readFileSync(resolve(docsRoot, 'ai/index.md'), 'utf8')
    const aiEn = readFileSync(resolve(docsRoot, 'en/ai/index.md'), 'utf8')
    const packageJson = JSON.parse(readFileSync(resolve(docsRoot, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>
    }

    expect(packageJson.dependencies.vitepress).toBe('2.0.0-alpha.19')
    expect(config).toContain('{ text: \'AI Agent\', link: \'/ai/\' }')
    expect(config).toContain('{ text: \'AI Agent\', link: \'/en/ai/\' }')
    expect(theme).toContain('app.component(\'AgentComponentsDemo\', AgentComponentsDemo)')
    expect(aiZh).toContain('<AgentComponentsDemo locale=\"zh\" />')
    expect(aiEn).toContain('<AgentComponentsDemo locale=\"en\" />')
    expect(aiZh).toContain('36 个双端 Agent 组件')
    expect(aiEn).toContain('36 dual-target Agent components')
    expect(aiZh).toContain('Beautiful UI / beUI 对标')
    expect(aiEn).toContain('Beautiful UI / beUI Coverage')
    expect(demo).toContain('AgentEventRenderer')
    expect(demo).toContain('AgentArtifact')
    expect(demo).toContain('AgentAttachmentList')

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
    })
  })
})
