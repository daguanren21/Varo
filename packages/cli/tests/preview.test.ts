// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { exportRegistryItem, installRegistryItems, previewRegistryInstall, resolveRegistryItems } from '../src/index.ts'

const roots: string[] = []
afterEach(() => {
  for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }) }
})
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'varo-preview-'))
  roots.push(root)
  const registryRoot = join(root, 'registry')
  const projectRoot = join(root, 'project')
  mkdirSync(projectRoot)
  mkdirSync(join(registryRoot, 'blocks/sample'), { recursive: true })
  writeFileSync(join(registryRoot, 'blocks/sample/sample.ts'), 'export const sample = true\n')
  const manifest = {
    name: 'sample',
    type: 'block',
    title: 'Sample',
    description: 'Preview fixture',
    docs: '/blocks/sample',
    targets: ['h5'],
    registryDependencies: [],
    dependencies: ['vue'],
    files: [{ target: 'h5', from: 'registry/blocks/sample/sample.ts', to: 'src/blocks/sample.ts' }],
  }
  const save = () => writeFileSync(join(registryRoot, 'blocks/sample/registry.json'), JSON.stringify(manifest))
  save()
  return { root, registryRoot, projectRoot, manifest, save, options: { registryRoot, projectRoot, target: 'h5' as const } }
}

describe('no-write installation preview', () => {
  it('returns the actual install plan and leaves an empty destination untouched', async () => {
    const { projectRoot, options } = fixture()
    const { conflicts, ...preview } = await previewRegistryInstall(['blocks/sample'], options)
    expect(conflicts).toEqual([])
    expect(readdirSync(projectRoot)).toEqual([])
    expect(preview.dependencies).toEqual(['vue'])
    expect(await installRegistryItems(['blocks/sample'], options)).toEqual(preview)
    expect(readFileSync(join(projectRoot, 'src/blocks/sample.ts'), 'utf8')).toBe('export const sample = true\n')
    expect(existsSync(join(projectRoot, 'node_modules'))).toBe(false)
  })

  it.each(['item', 'catalog'] as const)('selects canonical across public callers without changing auto shadow-%s support', async (document) => {
    const { registryRoot, projectRoot, options } = fixture()
    const shadow = {
      name: 'blocks/sample',
      type: 'registry:file',
      files: [{ path: 'shadow.ts', type: 'registry:file', target: '~/src/shadow.ts', content: 'export const shadow = true\n' }],
    }
    writeFileSync(join(registryRoot, 'registry.json'), JSON.stringify(document === 'item'
      ? shadow
      : {
          name: 'shadow',
          homepage: 'https://example.invalid',
          items: [shadow],
        }))
    expect((await resolveRegistryItems(['blocks/sample'], options)).files.map(file => file.to)).toEqual(['src/shadow.ts'])
    expect((await resolveRegistryItems(['blocks/sample'], { ...options, registryFormat: 'auto' })).files.map(file => file.to)).toEqual(['src/shadow.ts'])
    const canonical = { ...options, registryFormat: 'canonical' as const }
    const plan = await resolveRegistryItems(['blocks/sample'], canonical)
    expect(plan.files.map(file => file.to)).toEqual(['src/blocks/sample.ts'])
    expect(plan.dependencies).toEqual(['vue'])
    expect(await previewRegistryInstall(['blocks/sample'], canonical)).toEqual({ ...plan, conflicts: [] })
    const exported = await exportRegistryItem('blocks/sample', canonical)
    expect(exported.files.map(file => file.content)).toEqual(['export const sample = true\n'])
    expect(readdirSync(projectRoot)).toEqual([])
    expect(await installRegistryItems(['blocks/sample'], canonical)).toEqual(plan)
    expect(existsSync(join(projectRoot, 'src/shadow.ts'))).toBe(false)
    expect(readFileSync(join(projectRoot, 'src/blocks/sample.ts'), 'utf8')).toBe('export const sample = true\n')
    expect((await previewRegistryInstall(['blocks/sample'], canonical)).conflicts).toEqual(['src/blocks/sample.ts'])
    await expect(installRegistryItems(['blocks/sample'], canonical)).rejects.toThrow('Refusing to overwrite')
  })

  it('ignores even malformed standard metadata in canonical mode', async () => {
    const { registryRoot, projectRoot, options } = fixture()
    writeFileSync(join(registryRoot, 'registry.json'), '{malformed')
    const preview = await previewRegistryInstall(['blocks/sample'], { ...options, registryFormat: 'canonical' })
    expect(preview.files.map(file => file.to)).toEqual(['src/blocks/sample.ts'])
    expect(readdirSync(projectRoot)).toEqual([])
  })

  it.each(['https://example.invalid/registry', 'file:///tmp/registry', 'ftp://example.invalid/registry', '//host/share', '\\\\host\\share'])('rejects nonlocal canonical root %s', async (registryRoot) => {
    const { options } = fixture()
    const canonical = { ...options, registryRoot, registryFormat: 'canonical' as const }
    await expect(resolveRegistryItems(['blocks/sample'], canonical)).rejects.toThrow('requires a local filesystem root')
    await expect(previewRegistryInstall(['blocks/sample'], canonical)).rejects.toThrow('requires a local filesystem root')
  })

  it('reports existing files without overwriting, while installation still requires force', async () => {
    const { projectRoot, options } = fixture()
    mkdirSync(join(projectRoot, 'src/blocks'), { recursive: true })
    const destination = join(projectRoot, 'src/blocks/sample.ts')
    writeFileSync(destination, 'consumer customization')
    const preview = await previewRegistryInstall(['blocks/sample'], options)
    expect(preview.conflicts).toEqual(['src/blocks/sample.ts'])
    expect(readFileSync(destination, 'utf8')).toBe('consumer customization')
    await expect(installRegistryItems(['blocks/sample'], options)).rejects.toThrow('Refusing to overwrite')
    await installRegistryItems(['blocks/sample'], { ...options, force: true })
    expect(readFileSync(destination, 'utf8')).toBe('export const sample = true\n')
  })

  it.each(['ancestor', 'leaf', 'dangling'] as const)('shares %s symlink rejection with installation', async (kind) => {
    const { root, projectRoot, options } = fixture()
    const outside = join(root, 'outside')
    mkdirSync(outside)
    writeFileSync(join(outside, 'sample.ts'), 'outside data')
    if (kind === 'ancestor') { symlinkSync(outside, join(projectRoot, 'src')) }
    else {
      mkdirSync(join(projectRoot, 'src/blocks'), { recursive: true })
      symlinkSync(join(outside, kind === 'dangling' ? 'absent.ts' : 'sample.ts'), join(projectRoot, 'src/blocks/sample.ts'))
    }
    await expect(previewRegistryInstall(['blocks/sample'], options)).rejects.toThrow(/symbolic link/)
    await expect(installRegistryItems(['blocks/sample'], { ...options, force: true })).rejects.toThrow(/symbolic link/)
    expect(readFileSync(join(outside, 'sample.ts'), 'utf8')).toBe('outside data')
  })

  it('rejects case-folded duplicate and file/descendant destinations without writes', async () => {
    const { projectRoot, options, manifest, save } = fixture()
    manifest.files.push({ ...manifest.files[0]!, to: 'src/blocks/SAMPLE.ts' })
    save()
    await expect(previewRegistryInstall(['blocks/sample'], options)).rejects.toThrow('same file')
    manifest.files[1]!.to = 'src/blocks/sample.ts/nested.ts'
    save()
    await expect(previewRegistryInstall(['blocks/sample'], options)).rejects.toThrow('file and its descendant')
    expect(readdirSync(projectRoot)).toEqual([])
  })

  it('rejects traversal and unsupported profiles before touching a destination', async () => {
    const { projectRoot, options, manifest, save } = fixture()
    await expect(previewRegistryInstall(['blocks/../sample'], options)).rejects.toThrow('Invalid registry item name')
    await expect(previewRegistryInstall(['blocks/sample'], { ...options, target: 'weapp' })).rejects.toThrow('does not support')
    manifest.files[0]!.to = 'src/../../outside.ts'
    save()
    await expect(previewRegistryInstall(['blocks/sample'], options)).rejects.toThrow(/within|outside/)
    expect(readdirSync(projectRoot)).toEqual([])
  })
})
