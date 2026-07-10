import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { installRegistryItems, resolveRegistryItems } from '../src/index'

const workspaceRoot = resolve(__dirname, '../../..')
const registryRoot = resolve(workspaceRoot, 'registry')
let projectRoot: string | undefined

afterEach(() => {
  if (projectRoot) {
    rmSync(projectRoot, { force: true, recursive: true })
    projectRoot = undefined
  }
})

function writeRegistryItem(
  fixtureRoot: string,
  itemPath: string,
  options: {
    from?: string
    registryDependencies?: string[]
    to?: string
  } = {}
) {
  const registryRoot = join(fixtureRoot, 'registry')
  const itemName = itemPath.split('/').at(-1)!
  const itemRoot = join(registryRoot, itemPath)
  const source = options.from ?? `registry/${itemPath}/${itemName}.ts`

  mkdirSync(itemRoot, { recursive: true })
  writeFileSync(
    join(itemRoot, 'registry.json'),
    JSON.stringify({
      description: `${itemName} fixture`,
      docs: `/components/${itemName}`,
      files: [{ target: 'weapp-vite', from: source, to: options.to ?? `src/components/ui/${itemName}.ts` }],
      name: itemName,
      registryDependencies: options.registryDependencies ?? [],
      targets: ['weapp-vite'],
      title: itemName,
      type: itemPath.startsWith('blocks/') ? 'block' : 'component'
    })
  )

  if (source === `registry/${itemPath}/${itemName}.ts`) {
    writeFileSync(join(itemRoot, `${itemName}.ts`), `export const ${itemName.replaceAll('-', '_')} = true\n`)
  }

  return registryRoot
}

describe('varo add', () => {
  it('resolves registry dependencies before requested blocks', () => {
    const plan = resolveRegistryItems(['blocks/profile-edit'], { registryRoot })

    expect(plan.items.map((item) => item.name)).toEqual(['select', 'profile-edit'])
    expect(plan.files.map((file) => file.to)).toEqual([
      'src/components/ui/select.ts',
      'src/components/blocks/profile-edit.vue'
    ])
    expect(plan.dependencies).toEqual(expect.arrayContaining(['vue']))
  })

  it('copies component and block files into a consumer project', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))

    const plan = await installRegistryItems(['button', 'blocks/order-filter'], { projectRoot, registryRoot })

    expect(plan.files.map((file) => file.to)).toEqual([
      'src/components/ui/button.ts',
      'src/components/ui/select.ts',
      'src/components/blocks/order-filter.vue'
    ])
    expect(readFileSync(join(projectRoot, 'src/components/ui/button.ts'), 'utf8')).toContain('export const VButton')
    expect(readFileSync(join(projectRoot, 'src/components/ui/select.ts'), 'utf8')).toContain('export const VSelect')
    expect(readFileSync(join(projectRoot, 'src/components/blocks/order-filter.vue'), 'utf8')).toContain('VSelect')
  })

  it('reports unknown registry items with the original request name', () => {
    expect(() => resolveRegistryItems(['components/not-found'], { registryRoot })).toThrow(
      'Unknown registry item: components/not-found'
    )
  })

  it('runs through a symlinked bin entry', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const binPath = join(projectRoot, 'varo-cli.ts')

    symlinkSync(resolve(workspaceRoot, 'packages/cli/src/index.ts'), binPath)

    const output = execFileSync(process.execPath, [binPath, 'add', 'button'], {
      cwd: projectRoot,
      encoding: 'utf8'
    })

    expect(output).toContain('Installed button')
    const installedPath = join(projectRoot, 'src/components/ui/button.ts')
    expect(existsSync(installedPath)).toBe(true)

    writeFileSync(installedPath, 'consumer customization\n')
    const forcedOutput = execFileSync(process.execPath, [binPath, 'add', '--force', 'button'], {
      cwd: projectRoot,
      encoding: 'utf8'
    })

    expect(forcedOutput).toContain('Installed button')
    expect(readFileSync(installedPath, 'utf8')).toContain('export const VButton')
  })

  it('rejects registry names and manifest paths outside their roots', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const registryRoot = writeRegistryItem(projectRoot, 'components/source-escape', { from: '../outside.ts' })
    writeRegistryItem(projectRoot, 'components/target-escape', { to: '../outside.ts' })
    const consumerRoot = join(projectRoot, 'consumer')
    mkdirSync(consumerRoot)

    expect(() => resolveRegistryItems(['blocks/../../outside'], { registryRoot })).toThrow(
      'Invalid registry item name: blocks/../../outside'
    )
    expect(() => resolveRegistryItems(['source-escape'], { registryRoot })).toThrow('outside the registry root')
    await expect(
      installRegistryItems(['target-escape'], { projectRoot: consumerRoot, registryRoot })
    ).rejects.toThrow('outside the project root')
    expect(existsSync(join(projectRoot, 'outside.ts'))).toBe(false)
  })

  it('reports cyclic registry dependencies with their chain', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const registryRoot = writeRegistryItem(projectRoot, 'components/alpha', {
      registryDependencies: ['components/beta']
    })
    writeRegistryItem(projectRoot, 'components/beta', {
      registryDependencies: ['components/alpha']
    })

    expect(() => resolveRegistryItems(['alpha'], { registryRoot })).toThrow(
      'Cyclic registry dependency: components/alpha -> components/beta -> components/alpha'
    )
  })

  it('preserves existing consumer files unless force is enabled', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const registryRoot = writeRegistryItem(projectRoot, 'components/alpha')
    const consumerRoot = join(projectRoot, 'consumer')
    const targetPath = join(consumerRoot, 'src/components/ui/alpha.ts')
    mkdirSync(join(consumerRoot, 'src/components/ui'), { recursive: true })
    writeFileSync(targetPath, 'consumer customization\n')

    await expect(installRegistryItems(['alpha'], { projectRoot: consumerRoot, registryRoot })).rejects.toThrow(
      'Refusing to overwrite existing file: src/components/ui/alpha.ts'
    )
    expect(readFileSync(targetPath, 'utf8')).toBe('consumer customization\n')

    await installRegistryItems(['alpha'], { force: true, projectRoot: consumerRoot, registryRoot })
    expect(readFileSync(targetPath, 'utf8')).toContain('export const alpha')
  })

  it('rejects registry items that target the same consumer file', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const target = 'src/components/ui/shared.ts'
    const registryRoot = writeRegistryItem(projectRoot, 'components/alpha', { to: target })
    writeRegistryItem(projectRoot, 'components/beta', { to: target })
    const consumerRoot = join(projectRoot, 'consumer')
    mkdirSync(consumerRoot)

    await expect(
      installRegistryItems(['alpha', 'beta'], { projectRoot: consumerRoot, registryRoot })
    ).rejects.toThrow('Registry items target the same file: src/components/ui/shared.ts')
    expect(existsSync(join(consumerRoot, target))).toBe(false)
  })
})
