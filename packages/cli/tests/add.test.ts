import type { RegistryTarget } from '../src/index'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  installRegistryItems,

  resolveRegistryItems,
} from '../src/index'

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
    targetDependencies?: Partial<Record<RegistryTarget, string[]>>
    targets?: RegistryTarget[]
    to?: string
  } = {},
) {
  const registryRoot = join(fixtureRoot, 'registry')
  const itemName = itemPath.split('/').at(-1)!
  const itemRoot = join(registryRoot, itemPath)
  const source = options.from ?? `registry/${itemPath}/${itemName}.ts`
  const targets = options.targets ?? ['h5', 'weapp-vite']

  mkdirSync(itemRoot, { recursive: true })
  writeFileSync(
    join(itemRoot, 'registry.json'),
    JSON.stringify({
      description: `${itemName} fixture`,
      docs: `/components/${itemName}`,
      files: targets.map(target => ({
        target,
        from: source,
        to: options.to ?? `src/components/ui/${itemName}.ts`,
      })),
      name: itemName,
      registryDependencies: options.registryDependencies ?? [],
      targetDependencies: options.targetDependencies,
      targets,
      title: itemName,
      type: itemPath.startsWith('blocks/') ? 'block' : 'component',
    }),
  )

  if (source === `registry/${itemPath}/${itemName}.ts`) {
    writeFileSync(join(itemRoot, `${itemName}.ts`), `export const ${itemName.replaceAll('-', '_')} = true\n`)
  }

  return registryRoot
}

describe('varo add targets', () => {
  it('resolves H5 dependencies and files before the requested component', () => {
    const plan = resolveRegistryItems(['button'], { registryRoot, target: 'h5' })

    expect(plan.target).toBe('h5')
    expect(plan.items.map(item => item.name)).toEqual(['base', 'cn', 'primitives', 'button'])
    expect(plan.files.map(file => file.to)).toEqual([
      'src/styles/varo.css',
      'src/lib/cn.ts',
      'src/lib/varo-primitives.ts',
      'src/components/ui/button.ts',
    ])
    expect(plan.dependencies).toEqual(
      expect.arrayContaining(['@varo-ui/h5', '@varo-ui/headless', '@varo-ui/theme', 'clsx', 'tailwind-merge', 'vue']),
    )
    expect(plan.dependencies).not.toContain('@weapp-tailwindcss/merge')
  })

  it('resolves mini-program-specific runtime and merge packages by default', () => {
    const plan = resolveRegistryItems(['button'], { registryRoot })

    expect(plan.target).toBe('weapp-vite')
    expect(plan.dependencies).toEqual(
      expect.arrayContaining([
        '@varo-ui/weapp',
        '@varo-ui/headless',
        '@varo-ui/theme',
        '@weapp-tailwindcss/merge',
        'clsx',
        'wevu',
      ]),
    )
    expect(plan.dependencies).not.toContain('tailwind-merge')
    expect(plan.dependencies).not.toContain('vue')
  })

  it('resolves target-specific registry dependencies without copying H5 helpers into weapp', () => {
    const h5 = resolveRegistryItems(['checkbox'], { registryRoot, target: 'h5' })
    const weapp = resolveRegistryItems(['checkbox'], { registryRoot, target: 'weapp-vite' })

    expect(h5.items.map(item => item.name)).toEqual(['base', 'selection', 'checkbox'])
    expect(weapp.items.map(item => item.name)).toEqual(['base', 'checkbox'])
    expect(weapp.files.map(file => file.to)).toContain('src/components/ui/v-checkbox.vue')
    expect(weapp.files.map(file => file.to)).not.toContain('src/components/ui/selection.ts')
  })

  it('installs retail blocks with Varo controls and shared retail contracts', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-retail-'))

    const plan = await installRegistryItems(['blocks/retail-home'], {
      projectRoot,
      registryRoot,
      target: 'weapp-vite',
    })

    expect(plan.items.map(item => item.name)).toEqual(
      expect.arrayContaining(['retail', 'badge', 'button', 'card', 'image', 'input', 'tag', 'retail-home']),
    )
    expect(plan.files.map(file => file.to)).toContain('src/lib/retail.ts')
    expect(plan.files.map(file => file.to)).toContain('src/components/blocks/retail-home.vue')
    const source = readFileSync(join(projectRoot, 'src/components/blocks/retail-home.vue'), 'utf8')
    expect(source).toContain('<VButton')
    expect(source).not.toContain('<button')
  })

  it('copies target-correct component, adapter, merge helper, and styles', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))

    const plan = await installRegistryItems(['button'], {
      projectRoot,
      registryRoot,
      target: 'h5',
    })

    expect(plan.files.map(file => file.to)).toContain('src/components/ui/button.ts')
    expect(readFileSync(join(projectRoot, 'src/components/ui/button.ts'), 'utf8')).toContain('export const VButton')
    expect(readFileSync(join(projectRoot, 'src/lib/varo-primitives.ts'), 'utf8')).toContain('@varo-ui/h5/primitives')
    expect(readFileSync(join(projectRoot, 'src/lib/cn.ts'), 'utf8')).toContain('from \'tailwind-merge\'')
    expect(readFileSync(join(projectRoot, 'src/styles/varo.css'), 'utf8')).toContain('--varo-ui-primary')
  })

  it('runs the executable with an explicit H5 target', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const binPath = join(projectRoot, 'varo-cli.ts')

    symlinkSync(resolve(workspaceRoot, 'packages/cli/src/index.ts'), binPath)

    const output = execFileSync(process.execPath, [binPath, 'add', '--target', 'h5', 'button'], {
      cwd: projectRoot,
      encoding: 'utf8',
    })

    expect(output).toContain('Installed base, cn, primitives, button for h5')
    expect(output).toContain('Dependencies:')
    expect(readFileSync(join(projectRoot, 'src/lib/varo-primitives.ts'), 'utf8')).toContain('@varo-ui/h5/primitives')
  })

  it('reports unsupported CLI and registry targets clearly', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const binPath = join(projectRoot, 'varo-cli.ts')
    symlinkSync(resolve(workspaceRoot, 'packages/cli/src/index.ts'), binPath)

    expect(() =>
      execFileSync(process.execPath, [binPath, 'add', '--target', 'native', 'button'], {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      }),
    ).toThrow(/Unsupported registry target: native/)

    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/weapp-only', { targets: ['weapp-vite'] })
    expect(() => resolveRegistryItems(['weapp-only'], { registryRoot: fixtureRegistry, target: 'h5' })).toThrow(
      'Registry item components/weapp-only does not support target h5',
    )
  })
})

describe('varo add safety', () => {
  it('reports unknown registry items with the original request name', () => {
    expect(() => resolveRegistryItems(['components/not-found'], { registryRoot })).toThrow(
      'Unknown registry item: components/not-found',
    )
  })

  it('runs through a symlinked bin entry and only overwrites with force', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const binPath = join(projectRoot, 'varo-cli.ts')

    symlinkSync(resolve(workspaceRoot, 'packages/cli/src/index.ts'), binPath)

    const output = execFileSync(process.execPath, [binPath, 'add', 'button'], {
      cwd: projectRoot,
      encoding: 'utf8',
    })

    expect(output).toContain('Installed base, cn, primitives, button for weapp-vite')
    const installedPath = join(projectRoot, 'src/components/ui/v-button.vue')
    expect(existsSync(installedPath)).toBe(true)

    writeFileSync(installedPath, 'consumer customization\n')
    const forcedOutput = execFileSync(process.execPath, [binPath, 'add', '--force', 'button'], {
      cwd: projectRoot,
      encoding: 'utf8',
    })

    expect(forcedOutput).toContain('Installed base, cn, primitives, button for weapp-vite')
    expect(readFileSync(installedPath, 'utf8')).toContain('<script setup lang="ts">')
  })

  it('rejects registry names and manifest paths outside their roots', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/source-escape', { from: '../outside.ts' })
    writeRegistryItem(projectRoot, 'components/target-escape', { to: '../outside.ts' })
    const consumerRoot = join(projectRoot, 'consumer')
    mkdirSync(consumerRoot)

    expect(() => resolveRegistryItems(['blocks/../../outside'], { registryRoot: fixtureRegistry })).toThrow(
      'Invalid registry item name: blocks/../../outside',
    )
    expect(() => resolveRegistryItems(['source-escape'], { registryRoot: fixtureRegistry })).toThrow(
      'outside the registry root',
    )
    await expect(
      installRegistryItems(['target-escape'], { projectRoot: consumerRoot, registryRoot: fixtureRegistry }),
    ).rejects.toThrow('outside the project root')
    expect(existsSync(join(projectRoot, 'outside.ts'))).toBe(false)
  })

  it('reports cyclic registry dependencies with their chain', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha', {
      registryDependencies: ['components/beta'],
    })
    writeRegistryItem(projectRoot, 'components/beta', {
      registryDependencies: ['components/alpha'],
    })

    expect(() => resolveRegistryItems(['alpha'], { registryRoot: fixtureRegistry })).toThrow(
      'Cyclic registry dependency: components/alpha -> components/beta -> components/alpha',
    )
  })

  it('preserves existing consumer files unless force is enabled', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha')
    const consumerRoot = join(projectRoot, 'consumer')
    const targetPath = join(consumerRoot, 'src/components/ui/alpha.ts')
    mkdirSync(join(consumerRoot, 'src/components/ui'), { recursive: true })
    writeFileSync(targetPath, 'consumer customization\n')

    await expect(
      installRegistryItems(['alpha'], { projectRoot: consumerRoot, registryRoot: fixtureRegistry }),
    ).rejects.toThrow('Refusing to overwrite existing file: src/components/ui/alpha.ts')
    expect(readFileSync(targetPath, 'utf8')).toBe('consumer customization\n')

    await installRegistryItems(['alpha'], { force: true, projectRoot: consumerRoot, registryRoot: fixtureRegistry })
    expect(readFileSync(targetPath, 'utf8')).toContain('export const alpha')
  })

  it('rejects registry items that target the same consumer file', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const target = 'src/components/ui/shared.ts'
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha', { to: target })
    writeRegistryItem(projectRoot, 'components/beta', { to: target })
    const consumerRoot = join(projectRoot, 'consumer')
    mkdirSync(consumerRoot)

    await expect(
      installRegistryItems(['alpha', 'beta'], { projectRoot: consumerRoot, registryRoot: fixtureRegistry }),
    ).rejects.toThrow('Registry items target the same file: src/components/ui/shared.ts')
    expect(existsSync(join(consumerRoot, target))).toBe(false)
  })
})
