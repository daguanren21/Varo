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
})
