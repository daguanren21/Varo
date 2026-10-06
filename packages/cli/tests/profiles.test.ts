// @vitest-environment node
import type { RegistryItem, RegistryRenderer, RegistryTarget } from '../src/index.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { exportRegistryItem, installRegistryItems, resolveRegistryItems } from '../src/index.ts'

const cli = resolve(__dirname, '../src/index.ts')
const roots: string[] = []
const experimentalTargets: RegistryTarget[] = ['alipay', 'tt', 'xhs', 'donut-android', 'donut-ios', 'donut-ohos']

function temporaryRoot() {
  const root = mkdtempSync(join(tmpdir(), 'varo-profiles-'))
  roots.push(root)
  return root
}

function writeItem(root: string, name: string, overrides: Partial<RegistryItem> = {}) {
  const itemRoot = join(root, 'registry/components', name)
  mkdirSync(itemRoot, { recursive: true })
  const renderers: RegistryRenderer[] = ['h5', 'weapp']
  const item: RegistryItem = {
    name,
    title: name,
    description: `${name} profile fixture`,
    docs: `/components/${name}`,
    type: 'component',
    targets: renderers,
    registryDependencies: [],
    files: renderers.map(target => ({
      target,
      from: `registry/components/${name}/${target}.ts`,
      to: `src/components/${name}.ts`,
    })),
    ...overrides,
  }
  writeFileSync(join(itemRoot, 'registry.json'), JSON.stringify(item))
  for (const renderer of renderers) {
    writeFileSync(join(itemRoot, `${renderer}.ts`), `export const renderer = '${renderer}'\n`)
  }
  return join(root, 'registry')
}

afterEach(() => {
  for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }) }
})

describe('deployment profile delivery', () => {
  it.each(experimentalTargets)('delivers admitted renderer sources and round-trips exact %s identity', async (target) => {
    const root = temporaryRoot()
    const registryRoot = writeItem(root, 'entry', {
      platforms: [target],
      targetRegistryDependencies: { h5: ['browser-only'], weapp: ['native-only'] },
      targetDependencies: { h5: ['vue'], weapp: ['wevu'] },
      targetDevDependencies: { h5: ['vite'], weapp: ['weapp-vite'] },
    })
    writeItem(root, 'native-only', { platforms: [target], dependencies: ['clsx'] })
    const projectRoot = temporaryRoot()
    const plan = await installRegistryItems(['entry'], { registryRoot, projectRoot, target })

    expect(plan.target).toBe(target)
    expect(plan.dependencies).toEqual(['clsx', 'wevu'])
    expect(plan.devDependencies).toEqual(['weapp-vite'])
    expect(plan.items.map(item => item.name)).toEqual(['native-only', 'entry'])
    expect(plan.files.map(file => file.target)).toEqual(['weapp', 'weapp'])
    expect(readFileSync(join(projectRoot, 'src/components/entry.ts'), 'utf8')).toBe('export const renderer = \'weapp\'\n')
    expect(readFileSync(join(projectRoot, 'src/components/native-only.ts'), 'utf8')).toBe('export const renderer = \'weapp\'\n')

    const exported = await exportRegistryItem('entry', { registryRoot, target })
    const published = join(root, 'entry.json')
    writeFileSync(published, JSON.stringify(exported))
    const roundTripRoot = temporaryRoot()
    const imported = await installRegistryItems(['entry'], { registryRoot: published, projectRoot: roundTripRoot })
    expect(imported.target).toBe(target)
    expect(imported.items[0]!.targets).toEqual(['weapp'])
    expect(imported.items[0]!.platforms).toEqual([target])
    expect(imported.dependencies).toEqual(plan.dependencies)
    expect(imported.devDependencies).toEqual(plan.devDependencies)
    for (const file of plan.files) {
      expect(readFileSync(join(roundTripRoot, file.to))).toEqual(readFileSync(join(projectRoot, file.to)))
    }
    expect((await exportRegistryItem('entry', { registryRoot: published })).meta.varo.target).toBe(target)

    await expect(installRegistryItems(['entry'], {
      registryRoot: published,
      projectRoot: roundTripRoot,
      target: 'weapp',
      force: true,
    })).rejects.toThrow(/targets .*not weapp/)
    expect(readFileSync(join(roundTripRoot, 'src/components/entry.ts'), 'utf8')).toBe('export const renderer = \'weapp\'\n')
  })

  it('preserves legacy renderer installs regardless of optional experimental admission', async () => {
    const root = temporaryRoot()
    const registryRoot = writeItem(root, 'legacy')
    writeItem(root, 'admitted', { platforms: ['alipay'] })
    for (const target of ['h5', 'weapp'] as const) {
      const projectRoot = temporaryRoot()
      const plan = await installRegistryItems(['legacy', 'admitted'], { registryRoot, projectRoot, target })
      expect(plan.target).toBe(target)
      for (const name of ['legacy', 'admitted']) {
        expect(readFileSync(join(projectRoot, `src/components/${name}.ts`), 'utf8')).toBe(`export const renderer = '${target}'\n`)
      }
    }
  })

  it('rejects an unadmitted requested item without falling back to its renderer', async () => {
    const root = temporaryRoot()
    const registryRoot = writeItem(root, 'legacy')
    const projectRoot = temporaryRoot()
    await expect(installRegistryItems(['legacy'], { registryRoot, projectRoot, target: 'alipay' })).rejects.toThrow(/does not support target alipay/)
    expect(existsSync(join(projectRoot, 'src'))).toBe(false)
  })

  it('validates the entire admission closure before replacing any consumer file', async () => {
    const root = temporaryRoot()
    const registryRoot = writeItem(root, 'entry', { platforms: ['alipay'], targetRegistryDependencies: { weapp: ['shared'] } })
    writeItem(root, 'shared')
    const projectRoot = temporaryRoot()
    mkdirSync(join(projectRoot, 'src/components'), { recursive: true })
    const existing = join(projectRoot, 'src/components/entry.ts')
    writeFileSync(existing, 'consumer customization\n')
    await expect(installRegistryItems(['entry'], { registryRoot, projectRoot, target: 'alipay', force: true })).rejects.toThrow(/components\/shared does not support target alipay/)
    expect(readFileSync(existing, 'utf8')).toBe('consumer customization\n')
    expect(existsSync(join(projectRoot, 'src/components/shared.ts'))).toBe(false)
  })

  it.each([
    { platforms: ['unknown'] },
    { platforms: 'alipay' },
    { platforms: ['alipay'], targets: ['h5'], files: [{ target: 'h5', from: 'registry/components/invalid/h5.ts', to: 'src/invalid.ts' }] },
    { platforms: ['alipay'], files: [{ target: 'alipay', from: 'registry/components/invalid/weapp.ts', to: 'src/invalid.ts' }] },
    { platforms: ['alipay'], targetDependencies: { alipay: ['wevu'] } },
  ])('rejects incompatible profile/renderer metadata before writes: %j', async (overrides) => {
    const root = temporaryRoot()
    const registryRoot = writeItem(root, 'invalid', overrides as unknown as Partial<RegistryItem>)
    const projectRoot = temporaryRoot()
    await expect(installRegistryItems(['invalid'], { registryRoot, projectRoot, target: 'alipay' })).rejects.toThrow(/Invalid registry item/)
    expect(existsSync(join(projectRoot, 'src'))).toBe(false)
  })

  it('rejects unknown programmatic IDs before attempting to load any registry', async () => {
    await expect(resolveRegistryItems(['entry'], { registryRoot: '/nonexistent-registry', target: 'constructor' as RegistryTarget })).rejects.toThrow(/Unsupported registry target/)
  })

  it('keeps no-clobber and traversal protections for admitted profiles', async () => {
    const root = temporaryRoot()
    const registryRoot = writeItem(root, 'entry', { platforms: ['donut-ohos'] })
    const projectRoot = temporaryRoot()
    await installRegistryItems(['entry'], { registryRoot, projectRoot, target: 'donut-ohos' })
    const existing = join(projectRoot, 'src/components/entry.ts')
    writeFileSync(existing, 'consumer customization\n')
    await expect(installRegistryItems(['entry'], { registryRoot, projectRoot, target: 'donut-ohos' })).rejects.toThrow(/Refusing to overwrite/)
    expect(readFileSync(existing, 'utf8')).toBe('consumer customization\n')
    writeItem(root, 'entry', {
      platforms: ['donut-ohos'],
      targets: ['weapp'],
      files: [{ target: 'weapp', from: 'registry/components/entry/weapp.ts', to: 'src/../outside.ts' }],
    })
    await expect(installRegistryItems(['entry'], { registryRoot, projectRoot, target: 'donut-ohos', force: true })).rejects.toThrow(/file.to/)
    expect(readFileSync(existing, 'utf8')).toBe('consumer customization\n')
    expect(existsSync(join(projectRoot, 'outside.ts'))).toBe(false)
  })

  it('exposes exact CLI choices, experimental notice, and machine-readable export', () => {
    const root = temporaryRoot()
    const registryRoot = writeItem(root, 'entry', { platforms: ['alipay', 'donut-ohos'] })
    const projectRoot = temporaryRoot()
    const help = execFileSync(process.execPath, [cli, '--help'], { encoding: 'utf8' })
    for (const target of experimentalTargets) { expect(help).toContain(target) }
    expect(help).toContain('h5|weapp')
    const installed = execFileSync(process.execPath, [cli, 'add', '--registry', registryRoot, '--target', 'alipay', 'entry'], { cwd: projectRoot, encoding: 'utf8' })
    expect(installed).toContain('for alipay')
    expect(installed).toContain('Experimental profile alipay')
    expect(readFileSync(join(projectRoot, 'src/components/entry.ts'), 'utf8')).toBe('export const renderer = \'weapp\'\n')
    const exported = JSON.parse(execFileSync(process.execPath, [cli, 'export', '--registry', registryRoot, '--target=donut-ohos', 'entry'], { encoding: 'utf8' }))
    expect(exported.meta.varo.target).toBe('donut-ohos')
    expect(exported.files[0].content).toBe('export const renderer = \'weapp\'\n')
  })
})
