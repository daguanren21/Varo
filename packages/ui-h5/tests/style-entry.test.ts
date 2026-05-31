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
    expect(style).toContain('.varo-calendar-card')
    expect(style).toContain('.varo-picker')
    expect(style).toContain('.varo-cascader')
    expect(style).toContain('.varo-number-keyboard')
    expect(style).toContain('.varo-short-password__input')
    expect(style).toContain('.varo-uploader')
    expect(style).toContain(".varo-uploader[data-list-type='card']")
    expect(style).toContain('.varo-uploader__progress-bar')
    expect(style).toContain('background-color 0.2s ease')
    expect(style).toContain('appearance: textfield')
    expect(style).toContain('::-webkit-inner-spin-button')
  })

  it('builds the stylesheet file targeted by package exports', () => {
    const builtStyle = readFileSync(resolve(packageRoot, 'dist/style.css'), 'utf8')

    expect(builtStyle).toContain('.varo-checkbox')
    expect(builtStyle).toContain('.varo-calendar-card')
  })
})
