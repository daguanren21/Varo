#!/usr/bin/env node
import type { RegistryFile, RegistryItem, RegistryTarget } from '@varo/registry'
import { validateRegistryItem } from '@varo/registry/source'
import { randomUUID } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs'
import { mkdir, open, readFile, rename, rm, rmdir } from './file-system.ts'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export type { RegistryFile, RegistryItem, RegistryTarget } from '@varo/registry'

export interface PlannedRegistryFile extends RegistryFile {
  item: string
  sourcePath: string
  targetPath: string
}

export interface RegistryInstallPlan {
  dependencies: string[]
  devDependencies: string[]
  files: PlannedRegistryFile[]
  items: RegistryItem[]
  target: RegistryTarget
  warnings?: string[]
}

export interface ResolveRegistryOptions {
  registryRoot?: string
  target?: RegistryTarget
}

export interface InstallRegistryOptions extends ResolveRegistryOptions {
  force?: boolean
  projectRoot: string
}

const packageDir = dirname(fileURLToPath(import.meta.url))
const packagedRegistryRoot = resolve(packageDir, '../registry')
const sourceRegistryRoot = resolve(packageDir, '../../../registry')
const defaultRegistryCandidates = packageDir.endsWith(`${sep}src`)
  ? [sourceRegistryRoot, packagedRegistryRoot]
  : [packagedRegistryRoot]
const defaultRegistryRoot
  = defaultRegistryCandidates.find(candidate => existsSync(resolve(candidate, 'components/button/registry.json')))
    ?? defaultRegistryCandidates[0]

const registryGroups = ['blocks', 'components', 'hooks', 'templates', 'themes', 'utils'] as const

function normalizeRegistryName(name: string): string {
  const hasGroup = registryGroups.some(group => name.startsWith(`${group}/`))
  const normalized = hasGroup ? name : `components/${name}`

  if (!/^(?:blocks|components|hooks|templates|themes|utils)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    throw new Error(`Invalid registry item name: ${name}`)
  }

  return normalized
}

function resolveRegistryItem(name: string, registryRoot: string): RegistryItem {
  const normalizedName = normalizeRegistryName(name)
  const unresolvedPath = resolve(registryRoot, normalizedName, 'registry.json')
  if (!existsSync(unresolvedPath)) {
    throw new Error(`Unknown registry item: ${name}`)
  }

  const canonicalRegistryRoot = realpathSync(registryRoot)
  const path = realpathSync(unresolvedPath)
  if (!isWithinRoot(canonicalRegistryRoot, path)) {
    throw new Error(
      `Invalid registry item ${normalizedName} at ${unresolvedPath}: manifest is outside the registry root`,
    )
  }
  if (!lstatSync(path).isFile()) {
    throw new Error(
      `Invalid registry item ${normalizedName} at ${unresolvedPath}: manifest must be a regular file`,
    )
  }

  let input: unknown
  try {
    input = JSON.parse(readFileSync(path, 'utf8')) as unknown
  }
  catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Invalid registry item ${normalizedName} at ${path}: failed to parse JSON: ${reason}`, {
      cause: error,
    })
  }

  const validationErrors = validateRegistryItem(input)
  if (validationErrors.length > 0) {
    throw new Error(`Invalid registry item ${normalizedName} at ${path}: ${validationErrors.join('; ')}`)
  }

  return input as RegistryItem
}

function isWithinRoot(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate)
  return relativePath !== '' && relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath)
}

function assertRelativePath(path: string, label: string, rootName: string) {
  if (isAbsolute(path) || path.split(/[\\/]/).includes('..')) {
    throw new Error(`${label} is outside the ${rootName}: ${path}`)
  }
}

function resolveRegistrySource(registryRoot: string, from: string): string {
  assertRelativePath(from, 'Registry source', 'registry root')
  const canonicalRoot = realpathSync(registryRoot)
  const sourcePath = realpathSync(resolve(canonicalRoot, '..', from))

  if (!isWithinRoot(canonicalRoot, sourcePath)) {
    throw new Error(`Registry source is outside the registry root: ${from}`)
  }

  return sourcePath
}

function resolveProjectTarget(canonicalRoot: string, to: string): string {
  assertRelativePath(to, 'Registry target', 'project root')
  const sourceRoot = resolve(canonicalRoot, 'src')
  const targetPath = resolve(canonicalRoot, to)

  if (!isWithinRoot(sourceRoot, targetPath)) {
    throw new Error(`Registry target is outside the project src directory: ${to}`)
  }

  const targetParent = dirname(targetPath)
  const ancestorSegments = relative(canonicalRoot, targetParent).split(sep)
  let ancestorPath = canonicalRoot
  for (const segment of ancestorSegments) {
    if (segment === '') { continue }
    ancestorPath = resolve(ancestorPath, segment)
    const ancestorStats = lstatSync(ancestorPath, { throwIfNoEntry: false })
    if (ancestorStats === undefined) { break }
    if (ancestorStats.isSymbolicLink()) {
      throw new Error(`Registry target path must not contain a symbolic link: ${to}`)
    }
  }

  const targetStats = lstatSync(targetPath, { throwIfNoEntry: false })
  if (targetStats !== undefined) {
    if (targetStats.isSymbolicLink()) {
      throw new Error(`Registry target must not be a symbolic link: ${to}`)
    }
    if (!targetStats.isFile()) {
      throw new Error(`Registry target must be a regular file: ${to}`)
    }
  }

  return targetPath
}

export function resolveRegistryItems(names: string[], options: ResolveRegistryOptions = {}): RegistryInstallPlan {
  const registryRoot = options.registryRoot ?? defaultRegistryRoot
  const target = options.target ?? 'weapp'
  const items: RegistryItem[] = []
  const seen = new Set<string>()
  const visiting = new Set<string>()
  const dependencyStack: string[] = []

  function visit(requestName: string) {
    const itemPathName = normalizeRegistryName(requestName)
    if (seen.has(itemPathName)) { return }
    if (visiting.has(itemPathName)) {
      const cycleStart = dependencyStack.indexOf(itemPathName)
      const cycle = [...dependencyStack.slice(cycleStart), itemPathName]
      throw new Error(`Cyclic registry dependency: ${cycle.join(' -> ')}`)
    }

    visiting.add(itemPathName)
    dependencyStack.push(itemPathName)
    const item = resolveRegistryItem(requestName, registryRoot)
    try {
      if (!item.targets.includes(target)) {
        throw new Error(`Registry item ${itemPathName} does not support target ${target}`)
      }
      [...item.registryDependencies, ...(item.targetRegistryDependencies?.[target] ?? [])].forEach(visit)
    }
    finally {
      dependencyStack.pop()
      visiting.delete(itemPathName)
    }

    seen.add(itemPathName)
    items.push(item)
  }

  names.forEach(visit)

  const dependencies = Array.from(
    new Set(items.flatMap(item => [...(item.dependencies ?? []), ...(item.targetDependencies?.[target] ?? [])])),
  ).sort()
  const devDependencies = Array.from(
    new Set(items.flatMap(item => [...(item.devDependencies ?? []), ...(item.targetDevDependencies?.[target] ?? [])])),
  ).sort()
  const files = items.flatMap(item =>
    item.files
      .filter(file => file.target === target)
      .map(file => ({
        ...file,
        item: item.name,
        sourcePath: resolveRegistrySource(registryRoot, file.from),
        targetPath: file.to,
      })),
  )

  return { dependencies, devDependencies, files, items, target }
}

export async function installRegistryItems(names: string[], options: InstallRegistryOptions): Promise<RegistryInstallPlan> {
  const plan = resolveRegistryItems(names, options)
  const canonicalProjectRoot = realpathSync(options.projectRoot)
  const plannedTargets = plan.files.map((file) => {
    const targetPath = resolveProjectTarget(canonicalProjectRoot, file.to)
    const hadOriginal = existsSync(targetPath)
    const identityPath = hadOriginal ? realpathSync(targetPath) : targetPath
    return {
      file,
      hadOriginal,
      targetIdentity: identityPath.normalize('NFC').toLowerCase().normalize('NFC'),
      targetPath,
    }
  })
  const seenTargetIdentities = new Set<string>()
  for (const plannedTarget of plannedTargets) {
    const { file, hadOriginal, targetIdentity } = plannedTarget
    if (seenTargetIdentities.has(targetIdentity)) {
      throw new Error(`Registry items target the same file: ${file.to}`)
    }
    seenTargetIdentities.add(targetIdentity)

    if (hadOriginal && !options.force) {
      throw new Error(`Refusing to overwrite existing file: ${file.to}`)
    }
  }

  const sourceBytes = await Promise.all(plannedTargets.map(({ file }) => readFile(file.sourcePath)))
  const commitStates = plannedTargets.map((plannedTarget, index) => ({
    ...plannedTarget,
    backupPath: plannedTarget.hadOriginal
      ? resolve(dirname(plannedTarget.targetPath), `.varo-backup-${randomUUID()}`)
      : undefined,
    originalMoved: false,
    sourceBytes: sourceBytes[index],
    targetCreated: false,
  }))
  const createdDirectories: string[] = []

  try {
    for (const state of commitStates) {
      const missingDirectories: string[] = []
      let targetDirectory = dirname(state.targetPath)
      while (targetDirectory !== canonicalProjectRoot && !existsSync(targetDirectory)) {
        missingDirectories.push(targetDirectory)
        targetDirectory = dirname(targetDirectory)
      }
      for (let index = missingDirectories.length - 1; index >= 0; index -= 1) {
        await mkdir(missingDirectories[index])
        createdDirectories.push(missingDirectories[index])
      }

      if (state.backupPath !== undefined) {
        await rename(state.targetPath, state.backupPath)
        state.originalMoved = true
      }

      const targetHandle = await open(state.targetPath, 'wx')
      state.targetCreated = true
      try {
        await targetHandle.writeFile(state.sourceBytes)
      }
      finally {
        await targetHandle.close()
      }
    }
  }
  catch (installError) {
    const rollbackErrors: unknown[] = []

    for (let index = commitStates.length - 1; index >= 0; index -= 1) {
      const state = commitStates[index]
      let targetRemoved = true

      if (state.targetCreated) {
        try {
          await rm(state.targetPath, { force: true })
          state.targetCreated = false
        }
        catch (rollbackError) {
          rollbackErrors.push(rollbackError)
          targetRemoved = false
        }
      }

      if (!state.originalMoved || state.backupPath === undefined) { continue }
      if (!targetRemoved) { continue }
      if (existsSync(state.targetPath)) {
        rollbackErrors.push(new Error(`Cannot restore registry backup because target exists: ${state.targetPath}`))
        continue
      }

      try {
        await rename(state.backupPath, state.targetPath)
        state.originalMoved = false
      }
      catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
    }

    for (let index = createdDirectories.length - 1; index >= 0; index -= 1) {
      try {
        await rmdir(createdDirectories[index])
      }
      catch (rollbackError) {
        const code = rollbackError !== null && typeof rollbackError === 'object' && 'code' in rollbackError
          ? rollbackError.code
          : undefined
        if (code !== 'ENOENT' && code !== 'ENOTEMPTY') {
          rollbackErrors.push(rollbackError)
        }
      }
    }

    if (rollbackErrors.length > 0) {
      const recoveryPaths = commitStates.flatMap((state) => {
        const paths: string[] = []
        if (state.targetCreated) { paths.push(state.targetPath) }
        if (state.originalMoved && state.backupPath !== undefined) { paths.push(state.backupPath) }
        return paths
      })
      const recoveryMessage = recoveryPaths.length > 0
        ? `; recovery data preserved at ${recoveryPaths.join(', ')}`
        : ''
      throw new AggregateError(
        [installError, ...rollbackErrors],
        `Registry installation failed and rollback was incomplete${recoveryMessage}`,
        { cause: installError },
      )
    }
    throw installError
  }

  const warnings: string[] = []
  for (const state of commitStates) {
    if (!state.originalMoved || state.backupPath === undefined) { continue }

    try {
      await rm(state.backupPath, { force: true })
      state.originalMoved = false
    }
    catch (cleanupError) {
      const reason = cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
      warnings.push(`Registry files were installed, but backup cleanup failed at ${state.backupPath}: ${reason}`)
    }
  }

  return warnings.length > 0 ? { ...plan, warnings } : plan
}

async function runCli(argv: string[]) {
  const [command, ...args] = argv
  let force = false
  let target: RegistryTarget = 'weapp'
  const items: string[] = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--force') {
      force = true
      continue
    }

    if (arg === '--target') {
      const value = args[index + 1]
      if (value !== 'h5' && value !== 'weapp') {
        throw new Error(`Unsupported registry target: ${value ?? '(missing)'}`)
      }
      target = value
      index += 1
      continue
    }

    if (arg.startsWith('--target=')) {
      const value = arg.slice('--target='.length)
      if (value !== 'h5' && value !== 'weapp') {
        throw new Error(`Unsupported registry target: ${value || '(missing)'}`)
      }
      target = value
      continue
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`)
    }

    items.push(arg)
  }

  if (command !== 'add' || items.length === 0) {
    process.stderr.write(
      'Usage: varo add [--target h5|weapp] [--force] <component|blocks/name> [...items]\n',
    )
    process.exitCode = 1
    return
  }

  const plan = await installRegistryItems(items, {
    force,
    projectRoot: process.cwd(),
    target,
  })
  const output = [`Installed ${plan.items.map(item => item.name).join(', ')} for ${plan.target}`]

  if (plan.dependencies.length > 0) {
    output.push(`Dependencies: ${plan.dependencies.join(' ')}`)
  }
  if (plan.devDependencies.length > 0) {
    output.push(`Dev dependencies: ${plan.devDependencies.join(' ')}`)
  }

  process.stdout.write(`${output.join('\n')}\n`)
  if (plan.warnings) {
    process.stderr.write(`${plan.warnings.join('\n')}\n`)
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  runCli(process.argv.slice(2)).catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
