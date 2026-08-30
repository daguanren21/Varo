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
    expect(zhHome).toContain('双端行为底座')
    expect(zhHome).toContain('可复制组件资产')
    expect(zhHome).toContain('交付可靠性')
    expect(zhHome).not.toContain('shadcn 风格')
    expect(enHome).toContain('Production foundation for cross-runtime component systems')
    expect(enHome).toContain('Dual-target Behavior')
    expect(enHome).toContain('Editable Component Assets')
    expect(enHome).toContain('Delivery Confidence')
    expect(enHome).not.toContain('shadcn-style')
  })

  it('renders a screenshot-first registry Block gallery with executable install commands', () => {
    const zhExamples = readFileSync(resolve(root, 'examples/index.md'), 'utf8')
    const enExamples = readFileSync(resolve(root, 'en/examples/index.md'), 'utf8')
    const zhGuide = readFileSync(resolve(root, 'blocks/build-your-own.md'), 'utf8')
    const enGuide = readFileSync(resolve(root, 'en/blocks/build-your-own.md'), 'utf8')
    const gallery = readFileSync(resolve(root, 'src/components/MiniProgramBlocksGallery.vue'), 'utf8')
    const card = readFileSync(resolve(root, 'src/components/BlockGalleryCard.vue'), 'utf8')
    const definitions = readFileSync(resolve(root, 'src/components/block-gallery.ts'), 'utf8')
    const requiredBlocks = [
      'login-form',
      'profile-card',
      'profile-edit',
      'product-list',
      'order-filter',
      'agent-chat',
      'retail-home',
      'retail-category',
      'retail-cart',
      'retail-product-detail',
      'retail-checkout',
      'retail-order-list',
      'retail-profile',
    ]

    requiredBlocks.forEach((block) => {
      expect(definitions).toContain(`id: '${block}'`)
    })

    expect(zhExamples).toContain('<MiniProgramBlocksGallery locale="zh" />')
    expect(enExamples).toContain('<MiniProgramBlocksGallery locale="en" />')
    expect(zhGuide).toContain('<MiniProgramBlocksGallery locale="zh" />')
    expect(enGuide).toContain('<MiniProgramBlocksGallery locale="en" />')
    expect(gallery).toContain('class="varo-block-gallery__grid"')
    expect(gallery).toContain('type="search"')
    expect(card).toContain('<details class="varo-block-card__details">')
    expect(card).toMatch(/BASE_URL\}blocks\/\$\{props\.block\.id\}\.png/)
    expect(definitions).toMatch(/pnpm dlx @varo-ui\/cli add --target \$\{target\} blocks\/\$\{block\.id\}/)
    expect(zhGuide).not.toContain('| Registry 名称')
    expect(enGuide).not.toContain('| Registry name')
  })
})
