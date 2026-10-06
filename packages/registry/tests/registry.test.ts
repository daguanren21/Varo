import type { RegistryItem, RegistryRenderer } from '../src'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, posix, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  baseKitPhase1,
  componentCatalogV01,

  validateRegistryItem,
  weappComponentCatalogV01,
} from '../src'

const root = resolve(__dirname, '../../..')
const registryGroups = ['blocks', 'components', 'themes', 'utils'] as const
const targets: RegistryRenderer[] = ['h5', 'weapp']
const readText = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const readJson = <T>(path: string): T => JSON.parse(readText(path)) as T
const fileExists = (path: string): boolean => existsSync(resolve(root, path))
const registryItemPath = (dependency: string): string => `registry/${dependency}/registry.json`

function registryItemFiles(): string[] {
  return registryGroups.flatMap((group) => {
    const groupRoot = resolve(root, `registry/${group}`)
    if (!existsSync(groupRoot)) { return [] }

    return readdirSync(groupRoot, { withFileTypes: true }).flatMap(entry =>
      entry.isDirectory() && fileExists(`registry/${group}/${entry.name}/registry.json`) ? [`registry/${group}/${entry.name}/registry.json`] : [],
    )
  })
}

function resolveImportDestination(targetPath: string, importPath: string): string[] {
  const resolved = posix.normalize(posix.join(dirname(targetPath), importPath))
  return [resolved, `${resolved}.ts`, `${resolved}.vue`, `${resolved}.css`, `${resolved}/index.ts`]
}

describe('registry catalog', () => {
  it('keeps the Base Kit manifest aligned with the exported core list', () => {
    const manifest = readJson<{ components: string[], targets: RegistryRenderer[] }>('registry/base-kit.phase1.json')

    expect(manifest.targets).toEqual(targets)
    expect(manifest.components).toEqual(baseKitPhase1)
    expect(baseKitPhase1).toHaveLength(15)
  })

  it('keeps dual-target Blocks on Vue for H5 and Wevu for mini-programs', () => {
    const blockNames = ['agent-chat', 'login-form', 'order-filter', 'product-list', 'profile-card', 'profile-edit']
    blockNames.forEach((name) => {
      const manifest = readJson<RegistryItem>(`registry/blocks/${name}/registry.json`)
      const weappFiles = manifest.files.filter(file => file.target === 'weapp' && file.from.endsWith('.vue'))

      expect(manifest.targetDependencies?.h5, name).toContain('vue')
      expect(manifest.targetDependencies?.['weapp'], name).toContain('wevu')
      weappFiles.forEach((file) => {
        expect(readText(file.from), file.from).not.toMatch(/from ['"]vue['"]/)
      })
    })
  })

  it('keeps every registry item valid, target-complete, documented, and backed by source files', () => {
    registryItemFiles().forEach((registryPath) => {
      const item = readJson<RegistryItem>(registryPath)

      expect(validateRegistryItem(item), registryPath).toEqual([])
      item.targets.forEach((target) => {
        expect(item.files.some(file => file.target === target), `${registryPath} ${target}`).toBe(true)
      })
      item.files.forEach((file) => {
        expect(fileExists(file.from), `${registryPath} source ${file.from}`).toBe(true)
      })

      const docsPage = `${item.docs.replace(/^\//, '')}.md`
      expect(fileExists(`apps/docs/${docsPage}`), `${registryPath} docs route ${item.docs}`).toBe(true)
    })
  })

  it('keeps shared cross-target sources runtime-neutral', () => {
    registryItemFiles().forEach((registryPath) => {
      const item = readJson<RegistryItem>(registryPath)
      const targetsBySource = new Map<string, Set<RegistryRenderer>>()

      item.files.forEach((file) => {
        const sourceTargets = targetsBySource.get(file.from) ?? new Set<RegistryRenderer>()
        sourceTargets.add(file.target)
        targetsBySource.set(file.from, sourceTargets)
      })

      targetsBySource.forEach((sourceTargets, sourcePath) => {
        if (!sourceTargets.has('h5') || !sourceTargets.has('weapp')) { return }
        const source = readText(sourcePath)
        expect(source, `${registryPath} shared source ${sourcePath}`).not.toMatch(
          /\bfrom\s+['"](?:vue|wevu)['"]/,
        )
      })
    })
  })

  it('keeps the full H5 catalog, high-consensus weapp catalog, and executable SFC Base Kit aligned', () => {
    expect(weappComponentCatalogV01).toHaveLength(53)
    const baseKitNames = new Set<string>(baseKitPhase1)
    const weappComponentNames = new Set<string>(weappComponentCatalogV01)

    componentCatalogV01.forEach((name) => {
      const registryPath = `registry/components/${name}/registry.json`
      const item = readJson<RegistryItem>(registryPath)
      const h5RegistryDependencies = [
        ...item.registryDependencies,
        ...(item.targetRegistryDependencies?.h5 ?? []),
      ]
      const h5File = item.files.find(file => file.target === 'h5' && file.to === `src/components/ui/${name}.ts`)
      const isBaseKitComponent = baseKitNames.has(name)
      const supportsWeapp = weappComponentNames.has(name)

      expect(item.name).toBe(name)
      expect(item.targets).toContain('h5')
      expect(item.registryDependencies).toContain('themes/base')
      expect(h5File, `${name} must expose its H5 source`).toBeDefined()

      const h5Source = readText(h5File!.from)

      if (h5Source.includes('../../lib/varo-primitives')) {
        expect(h5RegistryDependencies).toContain('utils/primitives')
      }

      if (supportsWeapp) {
        const weappFiles = item.files.filter(file => file.target === 'weapp')
        const usesWevu = weappFiles.some(file => readText(file.from).includes('from \'wevu\''))
        const weappRegistryDependencies = [
          ...item.registryDependencies,
          ...(item.targetRegistryDependencies?.weapp ?? []),
        ]
        const h5UsesCn = item.files
          .filter(file => file.target === 'h5')
          .some(file => readText(file.from).includes('../../lib/cn'))
        const weappUsesCn = weappFiles.some(file => readText(file.from).includes('../../lib/cn'))
        if (!h5UsesCn) {
          expect(item.registryDependencies, `${name} global Registry dependencies`).not.toContain('utils/cn')
        }
        if (weappUsesCn) {
          expect(weappRegistryDependencies, `${name} weapp Registry dependencies`).toContain('utils/cn')
        }
        expect(item.dependencies ?? [], `${name} global dependencies`).not.toContain('vue')
        expect(item.targetDependencies?.weapp ?? [], `${name} weapp dependencies`).not.toContain('vue')
        if (usesWevu) {
          expect(item.targetDependencies?.weapp ?? [], `${name} weapp dependencies`).toContain('wevu')
        }
        if (h5Source.includes('from \'vue\'')) {
          expect(item.targetDependencies?.h5 ?? [], `${name} H5 dependencies`).toContain('vue')
        }
      }

      if (isBaseKitComponent) {
        const weappFile = item.files.find(file => file.target === 'weapp' && file.to.endsWith('.vue'))
        expect(item.targets).toEqual(targets)
        expect(weappFile?.from.endsWith('.vue')).toBe(true)
        expect(readText(weappFile!.from)).toContain('"styleIsolation": "apply-shared"')
      }
      else if (supportsWeapp) {
        const weappFiles = item.files.filter(file => file.target === 'weapp')
        const weappSfcFiles = weappFiles.filter(file => file.to.endsWith('.vue'))
        const hasWeappRenderer = weappFiles.some((weappFile) => {
          const weappSource = readText(weappFile.from)
          return weappSource.includes('<template') || weappSource.includes('defineComponent(')
        })
        expect(item.targets).toEqual(targets)
        if (hasWeappRenderer) {
          expect(weappSfcFiles.length, `${name} must expose a native weapp SFC`).toBeGreaterThan(0)
        }
        expect(item.dependencies ?? [], `${name} global dependencies`).not.toContain('vue')
        expect(item.targetDependencies?.weapp ?? [], `${name} weapp dependencies`).not.toContain('vue')
        if (h5Source.includes('from \'vue\'')) {
          expect(item.targetDependencies?.h5 ?? [], `${name} H5 dependencies`).toContain('vue')
        }

        weappFiles.forEach((weappFile) => {
          const weappSource = readText(weappFile.from)
          expect(weappSource, `${name} ${weappFile.from}`).not.toContain('from \'vue\'')
          if (!weappFile.to.endsWith('.vue')) { return }
          expect(weappFile.from.endsWith('.vue')).toBe(true)
          expect(weappSource).toContain('<script setup lang="ts">')
          expect(weappSource).toContain('"styleIsolation": "apply-shared"')
        })
      }
      else {
        expect(item.targets).toEqual(['h5'])
      }
    })
  })

  it('resolves every registry dependency and copied relative import for both targets', () => {
    const items = registryItemFiles().map(path => readJson<RegistryItem>(path))

    items.forEach((item) => {
      item.registryDependencies.forEach((dependency) => {
        expect(fileExists(registryItemPath(dependency)), `${item.name} dependency ${dependency}`).toBe(true)
      })
      Object.values(item.targetRegistryDependencies ?? {})
        .flat()
        .forEach((dependency) => {
          expect(fileExists(registryItemPath(dependency)), `${item.name} target dependency ${dependency}`).toBe(true)
        })
    })

    targets.forEach((target) => {
      const targetFiles = new Set(
        items.flatMap(item => item.files.filter(file => file.target === target).map(file => file.to)),
      )
      const relativeImportPattern = /\b(?:import|export)\b(?:[^'";]+?\bfrom\s*)?['"](\.{1,2}\/[^'"]+)['"]/g

      items.forEach((item) => {
        item.files
          .filter(file => file.target === target && /\.(?:ts|vue)$/.test(file.from))
          .forEach((file) => {
            const source = readText(file.from)
            Array.from(source.matchAll(relativeImportPattern)).forEach((match) => {
              const candidates = resolveImportDestination(file.to, match[1])
              expect(
                candidates.some(candidate => targetFiles.has(candidate)),
                `${target} ${file.from} imports ${match[1]}`,
              ).toBe(true)
            })
          })
      })
    })
  })
})
