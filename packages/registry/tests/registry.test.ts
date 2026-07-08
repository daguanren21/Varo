import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { baseKitPhase1, validateRegistryItem, type RegistryItem } from '../src'

const root = resolve(__dirname, '../../..')
const readJson = <T>(path: string): T => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T
const createValidRegistryItem = (): RegistryItem => ({
  description: 'A select component.',
  docs: '/components/select',
  exportName: 'VSelect',
  files: [
    {
      target: 'weapp-vite',
      from: 'registry/components/select/select.ts',
      to: 'src/components/ui/select.ts'
    }
  ],
  name: 'select',
  registryDependencies: [],
  targets: ['weapp-vite'],
  title: 'Select',
  type: 'component'
})

const omitRegistryField = (field: keyof RegistryItem): unknown => {
  const item: Record<string, unknown> = { ...createValidRegistryItem() }
  delete item[field]
  return item
}

describe('registry base kit manifest', () => {
  it('declares the complete Base Kit Phase 1 component set', () => {
    const manifest = readJson<{ components: string[] }>('registry/base-kit.phase1.json')

    expect(manifest.components).toEqual([
      'button',
      'cell',
      'input',
      'textarea',
      'input-number',
      'form',
      'checkbox',
      'radio',
      'switch',
      'select',
      'picker',
      'cascader',
      'date-picker',
      'overlay',
      'popup',
      'dialog',
      'toast',
      'loading'
    ])
    expect(baseKitPhase1).toEqual(manifest.components)
  })

  it('validates the select registry item as a weapp-vite base component', () => {
    const item = readJson<RegistryItem>('registry/components/select/registry.json')

    expect(validateRegistryItem(item)).toEqual([])
    expect(item.name).toBe('select')
    expect(item.exportName).toBe('VSelect')
    expect(item.targets).toEqual(['weapp-vite'])
    expect(item.docs).toBe('/components/select')
    expect(item.files).toEqual([
      {
        target: 'weapp-vite',
        from: 'registry/components/select/select.ts',
        to: 'src/components/ui/select.ts'
      }
    ])
  })

  it('keeps missing phase-one entries low-level and target-compatible', () => {
    const names = ['switch', 'toast', 'loading'] as const

    names.forEach((name) => {
      const item = readJson<RegistryItem>(`registry/components/${name}/registry.json`)

      expect(validateRegistryItem(item)).toEqual([])
      expect(item.targets).toEqual(['weapp-vite'])
      expect(item.registryDependencies).toEqual([])
      expect(item.docs).toBe(`/components/${name}`)
    })
  })

  it.each([
    ['missing docs', omitRegistryField('docs'), ['docs must be an absolute docs route']],
    ['non-string docs', { ...createValidRegistryItem(), docs: 42 }, ['docs must be an absolute docs route']],
    ['missing targets', omitRegistryField('targets'), ['targets must be an array']],
    ['non-array targets', { ...createValidRegistryItem(), targets: 'weapp-vite' }, ['targets must be an array']],
    ['missing files', omitRegistryField('files'), ['files must be an array']],
    ['non-array files', { ...createValidRegistryItem(), files: 'select.ts' }, ['files must be an array']],
    [
      'malformed file entry',
      { ...createValidRegistryItem(), files: [{ target: 'weapp-vite' }] },
      ['file.from must start with registry/: undefined', 'file.to must start with src/: undefined']
    ]
  ])('returns validation errors for %s instead of throwing', (_, item, expectedErrors) => {
    let errors: string[] | undefined

    expect(() => {
      errors = validateRegistryItem(item as RegistryItem)
    }).not.toThrow()
    expect(errors).toEqual(expect.arrayContaining(expectedErrors))
  })
})
