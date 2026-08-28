import type { RegistryItem, RegistryTarget } from '../src'
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
const targets: RegistryTarget[] = ['h5', 'weapp-vite']
const readText = (path: string): string => readFileSync(resolve(root, path), 'utf8')
const readJson = <T>(path: string): T => JSON.parse(readText(path)) as T
const fileExists = (path: string): boolean => existsSync(resolve(root, path))
const registryItemPath = (dependency: string): string => `registry/${dependency}/registry.json`

function registryItemFiles(): string[] {
  return registryGroups.flatMap((group) => {
    const groupRoot = resolve(root, `registry/${group}`)
    if (!existsSync(groupRoot)) { return [] }

    return readdirSync(groupRoot, { withFileTypes: true }).flatMap(entry =>
      entry.isDirectory() ? [`registry/${group}/${entry.name}/registry.json`] : [],
    )
  })
}

function runtimeComponentNames(): string[] {
  const helperFiles: Record<string, true> = {
    'date-utils': true,
    'index': true,
    'layout-utils': true,
    'primitives': true,
    'selection': true,
  }

  return readdirSync(resolve(root, 'packages/ui-h5/src'), { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.ts'))
    .map(entry => entry.name.replace(/\.ts$/, ''))
    .filter(name => !helperFiles[name])
    .sort()
}

function createValidRegistryItem(): RegistryItem {
  return {
    description: 'A select component.',
    docs: '/components/select',
    exportName: 'VSelect',
    files: [
      {
        target: 'h5',
        from: 'registry/components/select/select.ts',
        to: 'src/components/ui/select.ts',
      },
      {
        target: 'weapp-vite',
        from: 'registry/components/select/select.ts',
        to: 'src/components/ui/select.ts',
      },
    ],
    name: 'select',
    registryDependencies: ['themes/base'],
    targets: ['h5', 'weapp-vite'],
    title: 'Select',
    type: 'component',
  }
}

function omitRegistryField(field: keyof RegistryItem): unknown {
  const item: Record<string, unknown> = { ...createValidRegistryItem() }
  delete item[field]
  return item
}

function resolveImportDestination(targetPath: string, importPath: string): string[] {
  const resolved = posix.normalize(posix.join(dirname(targetPath), importPath))
  return [resolved, `${resolved}.ts`, `${resolved}.vue`, `${resolved}.css`, `${resolved}/index.ts`]
}

describe('registry catalog', () => {
  it('keeps the Base Kit manifest aligned with the exported core list', () => {
    const manifest = readJson<{ components: string[], targets: RegistryTarget[] }>('registry/base-kit.phase1.json')

    expect(manifest.targets).toEqual(targets)
    expect(manifest.components).toEqual(baseKitPhase1)
    expect(baseKitPhase1).toHaveLength(15)
  })

  it('publishes every maintained runtime component through the v0.1 registry catalog', () => {
    expect([...componentCatalogV01].sort()).toEqual(runtimeComponentNames())
    expect(componentCatalogV01).toHaveLength(56)
  })

  it('partitions the mini-program registry into high-consensus and specialized tiers', () => {
    const tiers = readJson<{
      agentUi: string[]
      registryCatalog: { h5: number, weappSfcBaseKit: number, weappVite: number }
      runtimeCatalog: { h5: number, weappVite: number }
      weappHighConsensus: string[]
      weappSpecializedPendingRegistry: string[]
    }>('registry/component-tiers.v0.1.json')

    expect(tiers.runtimeCatalog).toEqual({ h5: 56, weappVite: 56 })
    expect(tiers.registryCatalog).toEqual({ h5: 56, weappSfcBaseKit: 15, weappVite: 45 })
    expect(tiers.weappHighConsensus).toEqual(weappComponentCatalogV01)
    expect(
      [...tiers.weappHighConsensus, ...tiers.weappSpecializedPendingRegistry].sort(),
    ).toEqual([...componentCatalogV01].sort())
    expect(tiers.agentUi).toHaveLength(36)
  })

  it('ships advanced Agent UI as native weapp SFCs with target-aware class merging', () => {
    const manifest = readJson<RegistryItem & {
      targetDependencies?: Partial<Record<RegistryTarget, string[]>>
      targetRegistryDependencies?: Partial<Record<RegistryTarget, string[]>>
    }>('registry/components/agent-ui/registry.json')
    const weappFiles = manifest.files.filter(file => file.target === 'weapp-vite')
    const advancedComponents = [
      'AgentMessageScroller',
      'AgentCodeBlock',
      'AgentFileDiff',
      'AgentToolResult',
      'AgentImageGeneration',
      'AgentToolApproval',
      'AgentCitations',
      'AgentActivity',
      'AgentSidebar',
      'AgentContextCard',
      'AgentInsightCard',
      'AgentSelectionActions',
      'AgentDiffTable',
      'AgentRecordsTable',
      'AgentFilterTable',
      'AgentCommandSearch',
      'AgentFlowchart',
      'AgentFineTune',
    ]

    expect(manifest.targetRegistryDependencies?.['weapp-vite']).toContain('utils/cn')
    expect(manifest.targetDependencies?.h5).toContain('vue')
    expect(manifest.targetDependencies?.['weapp-vite']).toContain('wevu')
    expect(weappFiles.some(file => file.to.endsWith('/advanced.ts'))).toBe(false)
    expect(weappFiles.some(file => file.to.endsWith('/agent-advanced.css'))).toBe(false)
    advancedComponents.forEach((name) => {
      expect(
        weappFiles.some(file => file.to === `src/components/agent-ui/${name}.vue`),
        `${name} must ship as a native weapp SFC`,
      ).toBe(true)
    })
    weappFiles.filter(file => file.from.endsWith('.vue')).forEach((file) => {
      expect(readText(file.from), file.from).not.toMatch(/from ['"]vue['"]/)
    })
  })

  it('keeps dual-target Blocks on Vue for H5 and Wevu for mini-programs', () => {
    const blockNames = ['agent-chat', 'login-form', 'order-filter', 'product-list', 'profile-card', 'profile-edit']
    blockNames.forEach((name) => {
      const manifest = readJson<RegistryItem & {
        targetDependencies?: Partial<Record<RegistryTarget, string[]>>
      }>(`registry/blocks/${name}/registry.json`)
      const weappFiles = manifest.files.filter(file => file.target === 'weapp-vite' && file.from.endsWith('.vue'))

      expect(manifest.targetDependencies?.h5, name).toContain('vue')
      expect(manifest.targetDependencies?.['weapp-vite'], name).toContain('wevu')
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

  it('keeps the full H5 catalog, high-consensus weapp catalog, and executable SFC Base Kit aligned', () => {
    expect(weappComponentCatalogV01).toHaveLength(45)
    const baseKitNames = new Set<string>(baseKitPhase1)
    const weappComponentNames = new Set<string>(weappComponentCatalogV01)

    componentCatalogV01.forEach((name) => {
      const registryPath = `registry/components/${name}/registry.json`
      const item = readJson<RegistryItem>(registryPath)
      const h5File = item.files.find(file => file.target === 'h5' && file.to === `src/components/ui/${name}.ts`)
      const isBaseKitComponent = baseKitNames.has(name)
      const supportsWeapp = weappComponentNames.has(name)

      expect(item.name).toBe(name)
      expect(item.targets).toContain('h5')
      expect(item.registryDependencies).toContain('themes/base')
      expect(h5File, `${name} must expose its H5 source`).toBeDefined()

      const h5Source = readText(h5File!.from)
      expect(h5Source).toContain('import \'../../styles/varo.css\'')

      if (h5Source.includes('../../lib/varo-primitives')) {
        expect(item.registryDependencies).toContain('utils/primitives')
      }

      if (isBaseKitComponent) {
        const weappFile = item.files.find(file => file.target === 'weapp-vite' && file.to.endsWith('.vue'))
        expect(item.targets).toEqual(targets)
        expect(weappFile?.from.endsWith('.vue')).toBe(true)
        expect(readText(weappFile!.from)).toContain('"styleIsolation": "apply-shared"')
      }
      else if (supportsWeapp) {
        const weappFile = item.files.find(
          file => file.target === 'weapp-vite' && file.to === `src/components/ui/${name}.ts`,
        )
        expect(item.targets).toEqual(targets)
        expect(weappFile, `${name} must expose its weapp source`).toBeDefined()
        const weappSource = readText(weappFile!.from)
        expect(weappSource).toContain('import \'../../styles/varo.css\'')
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

  it('declares target-specific primitives and class-merge dependencies', () => {
    const primitives = readJson<RegistryItem>('registry/utils/primitives/registry.json')
    const cn = readJson<RegistryItem>('registry/utils/cn/registry.json')

    expect(primitives.targetDependencies).toEqual({
      'h5': ['@varo-ui/h5'],
      'weapp-vite': ['@varo-ui/weapp'],
    })
    expect(cn.dependencies).toEqual(['clsx'])
    expect(cn.targetDependencies).toEqual({
      'h5': ['tailwind-merge'],
      'weapp-vite': ['@weapp-tailwindcss/merge'],
    })
    expect(readText('registry/utils/cn/weapp-vite.ts')).toContain('from \'@weapp-tailwindcss/merge\'')
  })
})

describe('registry validation', () => {
  it.each([
    ['missing docs', omitRegistryField('docs'), ['docs must be an absolute docs route']],
    ['non-string docs', { ...createValidRegistryItem(), docs: 42 }, ['docs must be an absolute docs route']],
    ['missing targets', omitRegistryField('targets'), ['targets must be an array']],
    ['non-array targets', { ...createValidRegistryItem(), targets: 'weapp-vite' }, ['targets must be an array']],
    ['missing files', omitRegistryField('files'), ['files must be an array']],
    ['non-array files', { ...createValidRegistryItem(), files: 'select.ts' }, ['files must be an array']],
    [
      'missing target file',
      { ...createValidRegistryItem(), files: createValidRegistryItem().files.slice(0, 1) },
      ['target has no files: weapp-vite'],
    ],
    [
      'undeclared file target',
      { ...createValidRegistryItem(), targets: ['h5'] },
      ['file target is not declared by item: weapp-vite'],
    ],
    [
      'invalid target dependencies',
      { ...createValidRegistryItem(), targetDependencies: { browser: ['vue'], h5: 'vue' } },
      ['unsupported targetDependencies target: browser', 'targetDependencies.h5 must be an array of package names'],
    ],
    [
      'malformed file entry',
      { ...createValidRegistryItem(), files: [{ target: 'weapp-vite' }] },
      ['file.from must start with registry/: undefined', 'file.to must start with src/: undefined'],
    ],
    [
      'null file entry',
      { ...createValidRegistryItem(), files: [null] },
      [
        'unsupported file target: undefined',
        'file.from must start with registry/: undefined',
        'file.to must start with src/: undefined',
      ],
    ],
  ])('returns validation errors for %s instead of throwing', (_, item, expectedErrors) => {
    let errors: string[] | undefined

    expect(() => {
      errors = validateRegistryItem(item as RegistryItem)
    }).not.toThrow()
    expect(errors).toEqual(expect.arrayContaining(expectedErrors))
  })
})
