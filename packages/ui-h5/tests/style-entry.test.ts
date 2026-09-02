import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const packageRoot = resolve(__dirname, '..')
const packageJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8')) as {
  exports?: Record<string, unknown>
  sideEffects?: boolean | string[]
}

describe('ui-h5 style entry', () => {
  it('ships a public stylesheet for form controls', () => {
    expect(packageJson.exports).toHaveProperty('./style.css')
    expect(packageJson.sideEffects).toContain('./src/style.css')

    const style = readFileSync(resolve(packageRoot, 'src/style.css'), 'utf8')

    expect(style).toContain('.varo-checkbox')
    expect(style).toContain('.varo-radio')
    expect(style).toContain('.varo-input-number')
    expect(style).toContain('.varo-select')
    expect(style).toContain('.varo-switch')
    expect(style).toContain('.varo-switch[data-state=\'checked\']')
    expect(style).toContain('width: 44px')
    expect(style).toContain('background: var(--varo-ui-white)')
    expect(style).toContain('.varo-loading')
    expect(style).toContain('.varo-toast')
    expect(style).toContain('.varo-calendar-card')
    expect(style).toContain('.varo-picker')
    expect(style).toContain('.varo-cascader')
    expect(style).toContain('.varo-number-keyboard')
    expect(style).toContain('.varo-short-password__input')
    expect(style).toContain('.varo-uploader')
    expect(style).toContain('.varo-uploader[data-list-type=\'card\']')
    expect(style).toContain('.varo-uploader__progress-bar')
    expect(style).toContain('background-color 0.2s ease')
    expect(style).toContain('appearance: textfield')
    expect(style).toContain('::-webkit-inner-spin-button')
    expect(style).toContain('--varo-ui-bg: #f2f3f5')
    expect(style).toContain('--varo-ui-surface: #fff')
    expect(style).toContain('--varo-ui-text: #303133')
    expect(style).toContain('--varo-ui-text-regular: #606266')
    expect(style).toContain('--varo-ui-text-muted: #909399')
    expect(style).toContain('--varo-ui-border: #dcdfe6')
    expect(style).toContain('--varo-ui-fill: #f0f2f5')
    expect(style).toContain('--varo-ui-primary: #07c160')
    expect(style).toContain('--varo-ui-primary-hover: #38cd80')
    expect(style).toContain('--varo-ui-info: #73767a')
    expect(style).toContain('--varo-ui-radius: 8px')
    expect(style).toContain('--varo-button-fill: var(--varo-ui-primary)')
    expect(style).toContain('--varo-button-hover-fill: var(--varo-ui-primary-hover)')
    expect(style).toContain('background: var(--varo-button-fill)')
    expect(style).toContain('.varo-button[data-variant=\'solid\']')
    expect(style).toContain('border: 0')
    expect(style).toContain('@media (hover: hover)')
    expect(style).toContain('background: var(--varo-button-hover-fill)')
    expect(style).toContain(':not([data-disabled=\'true\']):hover')
    expect(style).toContain('data-loading=\'true\'')
    expect(style).toContain('cursor: progress')
    expect(style).toContain('border-radius: var(--varo-ui-radius)')
    expect(style).toContain('box-shadow: var(--varo-ui-shadow-sm)')
    expect(style).toMatch(
      /\.varo-badge\s*\{[\s\S]*?color: var\(--varo-ui-primary-foreground\)/,
    )
    expect(style).toContain('--varo-ui-success-soft: #e7f7ec')
    expect(style).toContain('--varo-badge-tone: var(--varo-ui-success)')
    expect(style).toMatch(
      /\.varo-badge\[data-variant='soft'\]\s*\{[\s\S]*?color: var\(--varo-badge-tone\);[\s\S]*?background: var\(--varo-badge-soft\)/,
    )
    expect(style).toMatch(
      /\.varo-badge\[data-variant='outline'\]\s*\{[\s\S]*?color: var\(--varo-badge-tone\)/,
    )
  })

  it('ships mirrored structural styles for every layout primitive', () => {
    const h5 = readFileSync(resolve(packageRoot, 'src/style.css'), 'utf8')
    const weapp = readFileSync(resolve(packageRoot, '../ui-weapp/src/style.css'), 'utf8')
    const registryH5 = readFileSync(resolve(packageRoot, '../../registry/themes/base/h5.css'), 'utf8')
    const registryWeapp = readFileSync(resolve(packageRoot, '../../registry/themes/base/weapp-vite.css'), 'utf8')
    const marker = '/* Layout primitives */'
    const h5Layout = h5.slice(h5.indexOf(marker))

    expect(h5Layout).toContain('.varo-divider')
    expect(h5Layout).toContain('.varo-grid')
    expect(h5Layout).toContain('.varo-row')
    expect(h5Layout).toContain('.varo-col')
    expect(h5Layout).toContain('.varo-space')
    expect(h5Layout).toContain('.varo-sticky')
    expect(h5Layout).toContain('.varo-region-picker')
    expect(h5Layout).toContain('.varo-map')
    expect(h5Layout).toMatch(/\.varo-grid__icon-wrap\s*\{[\s\S]*?position: relative;[\s\S]*?width: 40px;[\s\S]*?height: 40px/)
    expect(h5Layout).toMatch(/\.varo-grid__badge,[\s\S]*?top: 0;[\s\S]*?right: 0;[\s\S]*?width: 20px;[\s\S]*?height: 20px/)
    expect(h5Layout).not.toContain('top: -9px')
    expect(h5Layout).not.toContain('right: -15px')
    expect(weapp.slice(weapp.indexOf(marker))).toBe(h5Layout)

    expect(registryH5.slice(registryH5.indexOf(marker))).toBe(h5Layout)
    expect(registryWeapp.slice(registryWeapp.indexOf(marker))).toBe(h5Layout)
  })
  it('ships delayed Skeleton and reduced-motion styles across targets', () => {
    const sources = [
      readFileSync(resolve(packageRoot, 'src/style.css'), 'utf8'),
      readFileSync(resolve(packageRoot, '../ui-weapp/src/style.css'), 'utf8'),
      readFileSync(resolve(packageRoot, '../../registry/themes/base/h5.css'), 'utf8'),
      readFileSync(resolve(packageRoot, '../../registry/themes/base/weapp-vite.css'), 'utf8'),
    ]

    sources.forEach((source) => {
      expect(source).toContain('.varo-skeleton--pending')
      expect(source).toContain('.varo-skeleton__loaded[data-fade=\'true\']')
      expect(source).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.varo-skeleton/)
    })
  })

  it('ships source-owned pagination and Toast styles across targets', () => {
    const h5 = readFileSync(resolve(packageRoot, 'src/style.css'), 'utf8')
    const weapp = readFileSync(resolve(packageRoot, '../ui-weapp/src/style.css'), 'utf8')
    const registryH5 = readFileSync(resolve(packageRoot, '../../registry/themes/base/h5.css'), 'utf8')
    const registryWeapp = readFileSync(resolve(packageRoot, '../../registry/themes/base/weapp-vite.css'), 'utf8')
    const section = (source: string, start: string, end: string) =>
      source.slice(source.indexOf(start), source.indexOf(end))
    const h5Toast = section(h5, '.varo-toast {', '.varo-rate {')
    const h5Pagination = section(h5, '.varo-pagination {', '.varo-icon {')

    expect(h5Pagination).toContain('flex-wrap: nowrap')
    expect(h5Pagination).toMatch(/\.varo-pagination__prev,[\s\S]*?min-width: 56px/)
    expect(h5Toast).toContain('.varo-toast__icon')
    expect(h5Toast).toContain('.varo-toast-enter-active')
    expect(h5Toast).toContain('@media (prefers-reduced-motion: reduce)')
    expect(section(weapp, '.varo-toast {', '.varo-rate {')).toBe(h5Toast)
    expect(section(registryH5, '.varo-toast {', '.varo-rate {')).toBe(h5Toast)
    expect(section(registryWeapp, '.varo-toast {', '.varo-rate {')).toBe(h5Toast)
    expect(section(weapp, '.varo-pagination {', '.varo-icon {')).toBe(h5Pagination)
    expect(section(registryH5, '.varo-pagination {', '.varo-icon {')).toBe(h5Pagination)
    expect(section(registryWeapp, '.varo-pagination {', '.varo-icon {')).toBe(h5Pagination)
  })

  it('ships mirrored structural styles for tabs navigation', () => {
    const h5 = readFileSync(resolve(packageRoot, 'src/style.css'), 'utf8')
    const weapp = readFileSync(resolve(packageRoot, '../ui-weapp/src/style.css'), 'utf8')
    const registryH5 = readFileSync(resolve(packageRoot, '../../registry/themes/base/h5.css'), 'utf8')
    const registryWeapp = readFileSync(resolve(packageRoot, '../../registry/themes/base/weapp-vite.css'), 'utf8')
    const tabsStyles = (source: string) =>
      source.slice(source.indexOf('.varo-tabs {'), source.indexOf('.varo-icon {'))
    const h5Tabs = tabsStyles(h5)

    expect(h5Tabs).toContain('.varo-tabs__nav')
    expect(h5Tabs).toContain('.varo-tabs__tab:focus-visible')
    expect(h5Tabs).toContain('.varo-tabs__tab[data-disabled=\'true\']')
    expect(h5Tabs).toContain('.varo-tabs[data-type=\'line\']')
    expect(h5Tabs).toContain('.varo-tabs[data-type=\'card\']')
    expect(tabsStyles(weapp)).toBe(h5Tabs)
    expect(tabsStyles(registryH5)).toBe(h5Tabs)
    expect(tabsStyles(registryWeapp)).toBe(h5Tabs)
  })

  it('targets the stylesheet emitted by the package build', () => {
    expect(packageJson.exports?.['./style.css']).toBe('./dist/style.css')
  })
})
