import type { RegistryTarget } from '../src/index'
import type { Mode, PathLike, RmOptions } from 'node:fs'
import type * as FileSystem from '../src/file-system.ts'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

const fsFaultState = vi.hoisted(() => ({
  failBackupCleanup: false,
  failOpenPath: undefined as string | undefined,
  failRemovePath: undefined as string | undefined,
  openAttempts: [] as string[],
}))

vi.mock('../src/file-system.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof FileSystem>()
  const mockedOpen = async (
    path: PathLike,
    flags?: string | number,
    mode?: Mode,
  ) => {
    const targetPath = String(path)
    fsFaultState.openAttempts.push(targetPath)
    if (targetPath === fsFaultState.failOpenPath) {
      throw new Error(`Injected open failure: ${targetPath}`)
    }
    return actual.open(path, flags, mode)
  }
  const mockedRm = async (path: PathLike, options?: RmOptions): Promise<void> => {
    const targetPath = String(path)
    const isBackup = targetPath.split(/[\\/]/).at(-1)?.startsWith('.varo-backup-') === true
    if (
      targetPath === fsFaultState.failRemovePath
      || (fsFaultState.failBackupCleanup && isBackup)
    ) {
      throw new Error(`Injected remove failure: ${targetPath}`)
    }
    return actual.rm(path, options)
  }

  return {
    ...actual,
    open: vi.fn(mockedOpen),
    rm: vi.fn(mockedRm),
  }
})

// Import after the local filesystem mock so the CLI captures fault-injected bindings.
const { installRegistryItems, resolveRegistryItems } = await import('../src/index')

const workspaceRoot = resolve(__dirname, '../../..')
const registryRoot = resolve(workspaceRoot, 'registry')
let projectRoot: string | undefined

afterEach(() => {
  fsFaultState.failBackupCleanup = false
  fsFaultState.failOpenPath = undefined
  fsFaultState.failRemovePath = undefined
  fsFaultState.openAttempts.length = 0

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
  const targets = options.targets ?? ['h5', 'weapp']

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

    expect(plan.target).toBe('weapp')
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
    const weapp = resolveRegistryItems(['checkbox'], { registryRoot, target: 'weapp' })

    expect(h5.items.map(item => item.name)).toEqual(['base', 'primitives', 'selection', 'checkbox'])
    expect(weapp.items.map(item => item.name)).toEqual(['base', 'primitives', 'checkbox'])
    expect(weapp.files.map(file => file.to)).toContain('src/components/ui/v-checkbox.vue')
    expect(weapp.files.map(file => file.to)).not.toContain('src/components/ui/selection.ts')
  })
  it('installs one shadcn Form entry with target-owned renderers', () => {
    const h5 = resolveRegistryItems(['form'], { registryRoot, target: 'h5' })
    const weapp = resolveRegistryItems(['form'], { registryRoot, target: 'weapp' })

    expect(h5.files.map(file => file.to)).toEqual([
      'src/styles/varo.css',
      'src/components/ui/form.ts',
    ])
    expect(weapp.files.map(file => file.to)).toEqual([
      'src/styles/varo.css',
      'src/lib/varo-primitives.ts',
      'src/components/ui/form.ts',
      'src/components/ui/form-context.ts',
      'src/components/ui/v-form.vue',
      'src/components/ui/v-form-item.vue',
    ])
    expect(h5.dependencies).toContain('vue')
    expect(h5.dependencies).not.toContain('wevu')
    expect(weapp.dependencies).toContain('wevu')
    expect(weapp.dependencies).not.toContain('vue')
    expect(h5.files.some(file => file.to === 'src/components/ui/form.ts')).toBe(true)
    expect(weapp.files.some(file => file.to === 'src/components/ui/form.ts')).toBe(true)
  })

  it('installs retail blocks with Varo controls and shared retail contracts', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-retail-'))

    const plan = await installRegistryItems(['blocks/retail-home'], {
      projectRoot,
      registryRoot,
      target: 'weapp',
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

  it('uses the authored root Registry from the source executable', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const binPath = join(projectRoot, 'varo-cli.ts')
    symlinkSync(resolve(workspaceRoot, 'packages/cli/src/index.ts'), binPath)

    const output = execFileSync(
      process.execPath,
      [binPath, 'add', '--target', 'weapp', 'blocks/agent-workspace'],
      { cwd: projectRoot, encoding: 'utf8' },
    )

    expect(output).toContain('agent-workspace')
    expect(readFileSync(join(projectRoot, 'src/components/blocks/agent-workspace.vue'), 'utf8'))
      .toContain('AgentComposerScope')
    expect(existsSync(join(projectRoot, 'src/components/agent-ui/AgentShell.vue'))).toBe(true)
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

    expect(() =>
      execFileSync(process.execPath, [binPath, 'add', '--target', 'weapp-vite', 'button'], {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      }),
    ).toThrow(/Unsupported registry target: weapp-vite/)

    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/weapp-only', { targets: ['weapp'] })
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

    expect(output).toContain('Installed base, cn, primitives, button for weapp')
    const installedPath = join(projectRoot, 'src/components/ui/v-button.vue')
    expect(existsSync(installedPath)).toBe(true)

    writeFileSync(installedPath, 'consumer customization\n')
    const forcedOutput = execFileSync(process.execPath, [binPath, 'add', '--force', 'button'], {
      cwd: projectRoot,
      encoding: 'utf8',
    })

    expect(forcedOutput).toContain('Installed base, cn, primitives, button for weapp')
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
      'file.from must start with registry/: ../outside.ts',
    )
    await expect(
      installRegistryItems(['target-escape'], { projectRoot: consumerRoot, registryRoot: fixtureRegistry }),
    ).rejects.toThrow('file.to must start with src/: ../outside.ts')
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
    expect(readdirSync(dirname(targetPath)).filter(name => name.startsWith('.varo-backup-'))).toEqual([])
  })

  it('keeps a successful force install when backup cleanup fails', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha')
    const consumerRoot = join(projectRoot, 'consumer')
    const targetPath = join(consumerRoot, 'src/components/ui/alpha.ts')
    mkdirSync(dirname(targetPath), { recursive: true })
    writeFileSync(targetPath, 'consumer customization\n')
    fsFaultState.failBackupCleanup = true

    const plan = await installRegistryItems(
      ['alpha'],
      { force: true, projectRoot: consumerRoot, registryRoot: fixtureRegistry },
    )

    expect(readFileSync(targetPath, 'utf8')).toContain('export const alpha')
    const backupNames = readdirSync(dirname(targetPath)).filter(name => name.startsWith('.varo-backup-'))
    expect(backupNames).toHaveLength(1)
    const backupPath = join(dirname(targetPath), backupNames[0]!)
    expect(readFileSync(backupPath, 'utf8')).toBe('consumer customization\n')
    expect(plan.warnings).toEqual([
      expect.stringContaining(backupNames[0]!),
    ])
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

  it('rejects case-only target aliases before writing either file', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const upperTarget = 'src/components/ui/Shared.ts'
    const lowerTarget = 'src/components/ui/shared.ts'
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha', { to: upperTarget })
    writeRegistryItem(projectRoot, 'components/beta', { to: lowerTarget })
    const consumerRoot = join(projectRoot, 'consumer')
    mkdirSync(consumerRoot)

    await expect(
      installRegistryItems(['alpha', 'beta'], { projectRoot: consumerRoot, registryRoot: fixtureRegistry }),
    ).rejects.toThrow(`Registry items target the same file: ${lowerTarget}`)
    expect(existsSync(join(consumerRoot, upperTarget))).toBe(false)
    expect(existsSync(join(consumerRoot, lowerTarget))).toBe(false)
  })

  it.each([
    'src/components/ui/alpha.ts.',
    'src/components/ui /alpha.ts',
    'src/components/ui/victim.ts:stream',
    'src/components/ui/CON.txt',
  ])('rejects non-portable target path %s', (target) => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha', { to: target })

    expect(() => resolveRegistryItems(['alpha'], { registryRoot: fixtureRegistry })).toThrow(
      `file.to must use portable path segments: ${target}`,
    )
  })

  it('installs portable Unicode, internal-space, and symbol path segments', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const target = 'src/components/组件 +@[demo]/alpha.ts'
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha', { to: target })
    const consumerRoot = join(projectRoot, 'consumer')
    mkdirSync(consumerRoot)

    await installRegistryItems(['alpha'], { projectRoot: consumerRoot, registryRoot: fixtureRegistry })

    expect(readFileSync(join(consumerRoot, target), 'utf8')).toContain('export const alpha')
  })

  it('rejects symlinked target ancestors without overwriting the project package manifest', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/escape', {
      to: 'src/link/package.json',
    })
    const consumerRoot = join(projectRoot, 'consumer')
    const packagePath = join(consumerRoot, 'package.json')
    mkdirSync(join(consumerRoot, 'src'), { recursive: true })
    writeFileSync(packagePath, '{ "name": "consumer" }\n')
    symlinkSync('..', join(consumerRoot, 'src/link'), 'dir')

    await expect(
      installRegistryItems(['escape'], { force: true, projectRoot: consumerRoot, registryRoot: fixtureRegistry }),
    ).rejects.toThrow('Registry target path must not contain a symbolic link: src/link/package.json')
    expect(readFileSync(packagePath, 'utf8')).toBe('{ "name": "consumer" }\n')
  })

  it('validates malformed custom registry manifests with item and path context', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/malformed')
    writeFileSync(
      join(fixtureRegistry, 'components/malformed/registry.json'),
      JSON.stringify({ files: 'malformed', name: 'malformed' }),
    )

    expect(() => resolveRegistryItems(['malformed'], { registryRoot: fixtureRegistry })).toThrow(
      /Invalid registry item components\/malformed at .*registry\.json: .*files must be an array/,
    )
  })

  it('rejects registry manifests that resolve outside the registry root before parsing them', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/escape')
    const outsideManifest = join(projectRoot, 'outside-registry.json')
    const manifestPath = join(fixtureRegistry, 'components/escape/registry.json')
    writeFileSync(outsideManifest, '{not valid json')
    rmSync(manifestPath)
    symlinkSync(outsideManifest, manifestPath)

    expect(() => resolveRegistryItems(['escape'], { registryRoot: fixtureRegistry })).toThrow(
      `Invalid registry item components/escape at ${manifestPath}: manifest is outside the registry root`,
    )
  })

  it('rejects traversing destinations without overwriting the project package manifest', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/escape', {
      to: 'src/../package.json',
    })
    const consumerRoot = join(projectRoot, 'consumer')
    const packagePath = join(consumerRoot, 'package.json')
    mkdirSync(consumerRoot)
    writeFileSync(packagePath, '{ "name": "consumer" }\n')

    await expect(
      installRegistryItems(['escape'], { force: true, projectRoot: consumerRoot, registryRoot: fixtureRegistry }),
    ).rejects.toThrow('file.to must stay within src/: src/../package.json')
    expect(readFileSync(packagePath, 'utf8')).toBe('{ "name": "consumer" }\n')
  })

  it('rolls back files after the second target fails to open', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha')
    writeRegistryItem(projectRoot, 'components/beta')
    const consumerRoot = join(projectRoot, 'consumer')
    mkdirSync(consumerRoot)
    const canonicalConsumerRoot = realpathSync(consumerRoot)
    const alphaPath = join(canonicalConsumerRoot, 'src/components/ui/alpha.ts')
    const betaPath = join(canonicalConsumerRoot, 'src/components/ui/beta.ts')
    fsFaultState.failOpenPath = betaPath

    await expect(
      installRegistryItems(['alpha', 'beta'], { projectRoot: consumerRoot, registryRoot: fixtureRegistry }),
    ).rejects.toThrow(`Injected open failure: ${betaPath}`)
    expect(fsFaultState.openAttempts).toEqual([alphaPath, betaPath])
    expect(existsSync(alphaPath)).toBe(false)
    expect(existsSync(betaPath)).toBe(false)
    expect(existsSync(join(consumerRoot, 'src'))).toBe(false)
  })

  it('restores original contents when a force install fails after replacement', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha')
    writeRegistryItem(projectRoot, 'components/beta')
    const consumerRoot = join(projectRoot, 'consumer')
    const originalPath = join(consumerRoot, 'src/components/ui/alpha.ts')
    mkdirSync(dirname(originalPath), { recursive: true })
    writeFileSync(originalPath, 'consumer customization\n')
    const canonicalConsumerRoot = realpathSync(consumerRoot)
    const openedOriginalPath = join(canonicalConsumerRoot, 'src/components/ui/alpha.ts')
    const betaPath = join(canonicalConsumerRoot, 'src/components/ui/beta.ts')
    fsFaultState.failOpenPath = betaPath

    await expect(
      installRegistryItems(
        ['alpha', 'beta'],
        { force: true, projectRoot: consumerRoot, registryRoot: fixtureRegistry },
      ),
    ).rejects.toThrow(`Injected open failure: ${betaPath}`)
    expect(fsFaultState.openAttempts).toEqual([openedOriginalPath, betaPath])
    expect(readFileSync(originalPath, 'utf8')).toBe('consumer customization\n')
    expect(existsSync(betaPath)).toBe(false)
    expect(readdirSync(dirname(originalPath)).filter(name => name.startsWith('.varo-backup-'))).toEqual([])
  })

  it('preserves the original backup when forced rollback cannot remove its replacement', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha')
    writeRegistryItem(projectRoot, 'components/beta')
    const consumerRoot = join(projectRoot, 'consumer')
    const originalPath = join(consumerRoot, 'src/components/ui/alpha.ts')
    mkdirSync(dirname(originalPath), { recursive: true })
    writeFileSync(originalPath, 'consumer customization\n')
    const canonicalConsumerRoot = realpathSync(consumerRoot)
    const openedOriginalPath = join(canonicalConsumerRoot, 'src/components/ui/alpha.ts')
    const betaPath = join(canonicalConsumerRoot, 'src/components/ui/beta.ts')
    fsFaultState.failOpenPath = betaPath
    fsFaultState.failRemovePath = openedOriginalPath

    let installError: unknown
    try {
      await installRegistryItems(
        ['alpha', 'beta'],
        { force: true, projectRoot: consumerRoot, registryRoot: fixtureRegistry },
      )
    }
    catch (error) {
      installError = error
    }

    expect(fsFaultState.openAttempts).toEqual([openedOriginalPath, betaPath])
    expect(installError).toBeInstanceOf(AggregateError)
    const backupNames = readdirSync(dirname(originalPath)).filter(name => name.startsWith('.varo-backup-'))
    expect(backupNames).toHaveLength(1)
    const backupPath = join(dirname(originalPath), backupNames[0]!)
    expect((installError as AggregateError).message).toContain(backupPath)
    expect(readFileSync(backupPath, 'utf8')).toBe('consumer customization\n')
    expect(readFileSync(originalPath, 'utf8')).toContain('export const alpha')
  })

  it('protects existing non-regular registry targets', async () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-cli-'))
    const fixtureRegistry = writeRegistryItem(projectRoot, 'components/alpha')
    const consumerRoot = join(projectRoot, 'consumer')
    const targetPath = join(consumerRoot, 'src/components/ui/alpha.ts')
    mkdirSync(targetPath, { recursive: true })

    await expect(
      installRegistryItems(
        ['alpha'],
        { force: true, projectRoot: consumerRoot, registryRoot: fixtureRegistry },
      ),
    ).rejects.toThrow('Registry target must be a regular file: src/components/ui/alpha.ts')
    expect(readdirSync(targetPath)).toEqual([])
  })
})
