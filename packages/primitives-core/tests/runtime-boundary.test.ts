import { readdirSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const workspaceRoot = resolve(__dirname, '../../..')
const sourceExtensions = new Set(['.ts', '.tsx'])

function sourceFiles(packageDir: string) {
  const files: string[] = []
  const root = resolve(workspaceRoot, packageDir, 'src')
  const pending = [root]

  while (pending.length > 0) {
    const directory = pending.pop()

    if (!directory) {
      continue
    }

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)

      if (entry.isDirectory()) {
        pending.push(path)
        continue
      }

      if (entry.isFile() && sourceExtensions.has(path.slice(path.lastIndexOf('.')))) {
        files.push(path)
      }
    }
  }

  return files
}

function importsFrom(source: string, moduleName: string) {
  const escaped = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`\\bfrom\\s+['"]${escaped}['"]|\\bimport\\s*\\(['"]${escaped}['"]\\)`)
  return pattern.test(source)
}

function filesImporting(packageDir: string, moduleName: string) {
  return sourceFiles(packageDir)
    .filter((file) => importsFrom(readFileSync(file, 'utf8'), moduleName))
    .map((file) => relative(workspaceRoot, file))
}

describe('runtime package boundaries', () => {
  it('keeps primitives-core independent from Vue and wevu runtimes', () => {
    expect(filesImporting('packages/primitives-core', 'vue')).toEqual([])
    expect(filesImporting('packages/primitives-core', 'wevu')).toEqual([])
  })

  it('does not claim a wevu runtime implementation while Vue render wrappers are still present', () => {
    expect(filesImporting('packages/primitives-weapp', 'wevu')).toEqual([])
    expect(filesImporting('packages/ui-weapp', 'wevu')).toEqual([])
  })
})
