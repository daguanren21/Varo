import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '..')

describe('homepage content', () => {
  it('keeps the Chinese homepage focused on entry points instead of duplicating docs', () => {
    const content = readFileSync(resolve(root, 'index.md'), 'utf8')

    expect(content).not.toContain('## 安装指南')
    expect(content).not.toContain('## 主题配置')
    expect(content).not.toContain('## 国际化配置')
    expect(content).not.toContain('## 组件使用示例')
    expect(content).not.toContain('## 实时预览')
    expect(content).not.toContain('<PlatformTabsDemo')
    expect(content).not.toContain('<InteractivePreview')
  })

  it('keeps the English homepage focused on entry points instead of duplicating docs', () => {
    const content = readFileSync(resolve(root, 'en/index.md'), 'utf8')

    expect(content).not.toContain('## Installation')
    expect(content).not.toContain('## Theme')
    expect(content).not.toContain('## Internationalization')
    expect(content).not.toContain('## Usage Examples')
    expect(content).not.toContain('## Live Preview')
    expect(content).not.toContain('<PlatformTabsDemo')
    expect(content).not.toContain('<InteractivePreview')
  })

  it('promotes mini-program blocks from the homepage and examples pages', () => {
    const zhHome = readFileSync(resolve(root, 'index.md'), 'utf8')
    const enHome = readFileSync(resolve(root, 'en/index.md'), 'utf8')
    const zhExamples = readFileSync(resolve(root, 'examples/index.md'), 'utf8')
    const enExamples = readFileSync(resolve(root, 'en/examples/index.md'), 'utf8')

    expect(zhHome).toContain('小程序 Blocks')
    expect(enHome).toContain('Mini-program Blocks')
    expect(zhExamples).toContain('小程序业务 Blocks')
    expect(enExamples).toContain('Mini-program Business Blocks')
  })

  it('positions Varo as a serious cross-runtime design system product', () => {
    const zhHome = readFileSync(resolve(root, 'index.md'), 'utf8')
    const enHome = readFileSync(resolve(root, 'en/index.md'), 'utf8')

    expect(zhHome).toContain('跨运行时组件系统的生产底座')
    expect(zhHome).toContain('设计系统运行层')
    expect(zhHome).toContain('组件资产台账')
    expect(zhHome).toContain('交付可靠性')
    expect(zhHome).not.toContain('shadcn 风格')
    expect(enHome).toContain('Production foundation for cross-runtime component systems')
    expect(enHome).toContain('Design System Runtime')
    expect(enHome).toContain('Component Asset Ledger')
    expect(enHome).toContain('Delivery Confidence')
    expect(enHome).not.toContain('shadcn-style')
  })

  it('renders a registry-backed block catalog instead of fictional product flows', () => {
    const zhExamples = readFileSync(resolve(root, 'examples/index.md'), 'utf8')
    const enExamples = readFileSync(resolve(root, 'en/examples/index.md'), 'utf8')
    const gallery = readFileSync(resolve(root, 'src/components/MiniProgramBlocksGallery.vue'), 'utf8')
    const requiredBlocks = ['login-form', 'profile-card', 'profile-edit', 'product-list', 'order-filter', 'agent-chat']

    requiredBlocks.forEach((block) => {
      expect(gallery).toContain(`id: '${block}'`)
    })

    expect(zhExamples).toContain('<MiniProgramBlocksGallery locale="zh" />')
    expect(enExamples).toContain('<MiniProgramBlocksGallery locale="en" />')
    expect(gallery).toContain('class="varo-real-blocks__workspace"')
    expect(gallery).toContain('class="varo-real-blocks__catalog"')
    expect(gallery).toContain('class="varo-real-blocks__detail"')
    expect(gallery).toContain('selectedId')
    expect(gallery).toContain('add --target ${target.value}')
    expect(gallery).toContain('@click')
    expect(gallery).not.toContain('VNavbar')
  })
})
