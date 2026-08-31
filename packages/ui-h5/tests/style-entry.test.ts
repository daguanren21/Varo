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

  it('targets the stylesheet emitted by the package build', () => {
    expect(packageJson.exports?.['./style.css']).toBe('./dist/style.css')
  })
})
