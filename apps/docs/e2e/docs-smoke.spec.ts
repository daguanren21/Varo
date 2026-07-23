import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const docsRoot = resolve(__dirname, '..')

function firstH2(content: string) {
  return content.split(/\n/).find((line) => line.startsWith('## '))
}

describe('docs smoke baseline', () => {
  it('keeps demo-first component pages in both locales', () => {
    const samples = ['button.md', 'picker.md', 'form.md', 'dialog.md']

    for (const sample of samples) {
      const zh = readFileSync(resolve(docsRoot, 'components', sample), 'utf8')
      const en = readFileSync(resolve(docsRoot, 'en/components', sample), 'utf8')

      expect(firstH2(zh)).toBe('## 演示')
      expect(firstH2(en)).toBe('## Demo')
      expect(zh.includes('PlatformTabsDemo') || zh.includes('FormComponentDemo')).toBe(true)
      expect(en.includes('PlatformTabsDemo') || en.includes('FormComponentDemo')).toBe(true)
    }
  })

  it('keeps primitives catalog pages and authoring guide linked', () => {
    const config = readFileSync(resolve(docsRoot, '.vitepress/config.ts'), 'utf8')
    const zhOverview = readFileSync(resolve(docsRoot, 'primitives/index.md'), 'utf8')
    const enOverview = readFileSync(resolve(docsRoot, 'en/primitives/index.md'), 'utf8')

    expect(zhOverview).toContain('<PrimitiveCatalog locale="zh" />')
    expect(enOverview).toContain('<PrimitiveCatalog locale="en" />')
    expect(config).toContain('/blocks/build-your-own')
    expect(config).toContain('/en/blocks/build-your-own')
    expect(existsSync(resolve(docsRoot, 'blocks/build-your-own.md'))).toBe(true)
    expect(existsSync(resolve(docsRoot, 'en/blocks/build-your-own.md'))).toBe(true)
    expect(existsSync(resolve(docsRoot, 'primitives/checkbox.md'))).toBe(true)
    expect(existsSync(resolve(docsRoot, 'en/primitives/popover.md'))).toBe(true)
  })
})
