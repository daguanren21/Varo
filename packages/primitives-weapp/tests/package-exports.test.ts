import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const packageRoot = resolve(__dirname, '..')

describe('primitives-weapp package exports', () => {
  it('builds the hooks and parts subpath exports as first-class entries', () => {
    const packageJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8')) as {
      exports: Record<string, { import: string; types: string }>
    }
    const tsdownConfig = readFileSync(resolve(packageRoot, 'tsdown.config.ts'), 'utf8')

    expect(packageJson.exports['./hooks']).toMatchObject({
      import: './dist/hooks.mjs',
      types: './dist/hooks.d.mts'
    })
    expect(packageJson.exports['./parts']).toMatchObject({
      import: './dist/parts.mjs',
      types: './dist/parts.d.mts'
    })
    expect(tsdownConfig).toContain("'src/hooks.ts'")
    expect(tsdownConfig).toContain("'src/parts.ts'")
  })
})
