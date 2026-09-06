import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const packageRoot = resolve(__dirname, '..')
const packageJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8')) as {
  exports?: Record<string, unknown>
  sideEffects?: boolean | string[]
}

describe('ui-h5 style entry', () => {
  it('exposes a tree-shaking-safe public stylesheet', () => {
    expect(packageJson.exports).toHaveProperty('./style.css')
    expect(packageJson.sideEffects).toContain('./src/style.css')
  })

  it('keeps each runtime stylesheet synchronized with its Registry source', () => {
    const targets = [
      ['src/style.css', '../../registry/themes/base/h5.css'],
      ['../ui-weapp/src/style.css', '../../registry/themes/base/weapp-vite.css'],
    ]

    for (const [runtimePath, registryPath] of targets) {
      const runtime = readFileSync(resolve(packageRoot, runtimePath), 'utf8')
      const registry = readFileSync(resolve(packageRoot, registryPath), 'utf8')
      expect(runtime).toBe(registry)
    }
  })

  it('targets the stylesheet emitted by the package build', () => {
    expect(packageJson.exports?.['./style.css']).toBe('./dist/style.css')
  })
})
