#!/usr/bin/env node
import type { RegistryFile, RegistryItem, RegistryTarget } from '@varo/registry/source'
import type { StandardFileOrigin } from './standard-types.ts'
import { Buffer, isUtf8 } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { validateRegistryItem } from '@varo/registry/source'
import { mkdir, open, readFile, rename, rm, rmdir } from './file-system.ts'
import { fetchRegistryFile, getRemoteRegistryRoot, registryUrl } from './remote-registry.ts'
import { rewriteStandardFileImports } from './standard-files.ts'
import { resolveStandardRegistryItems } from './standard-registry.ts'

export type { RegistryFile, RegistryItem, RegistryTarget } from '@varo/registry/source'

export interface PlannedRegistryFile extends RegistryFile {
  item: string
  sourcePath: string
  targetPath: string
  content?: string
  standard?: StandardFileOrigin
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
  projectRoot?: string
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

async function resolveRegistryItem(name: string, registryRoot: string, remoteRoot?: URL): Promise<RegistryItem> {
  const normalizedName = normalizeRegistryName(name)
  const unresolvedPath = remoteRoot
    ? registryUrl(remoteRoot, `${normalizedName}/registry.json`)
    : resolve(registryRoot, normalizedName, 'registry.json')
  if (!remoteRoot && !existsSync(unresolvedPath)) {
    throw new Error(`Unknown registry item: ${name}`)
  }

  let path = unresolvedPath
  if (!remoteRoot) {
    const canonicalRegistryRoot = realpathSync(registryRoot)
    path = realpathSync(unresolvedPath)
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
  }

  const bytes = remoteRoot ? await fetchRegistryFile(path) : readFileSync(path)
  let input: unknown
  try {
    input = JSON.parse(bytes.toString('utf8')) as unknown
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

export async function resolveRegistryItems(names: string[], options: ResolveRegistryOptions = {}): Promise<RegistryInstallPlan> {
  if (options.registryRoot !== undefined) {
    const standardPlan = await resolveStandardRegistryItems(names, options)
    if (standardPlan !== undefined) {
      return standardPlan
    }
  }

  const registryRoot = options.registryRoot ?? defaultRegistryRoot
  const remoteRoot = getRemoteRegistryRoot(registryRoot)
  const target = options.target ?? 'weapp'
  const items: RegistryItem[] = []
  const seen = new Set<string>()
  const visiting = new Set<string>()
  const dependencyStack: string[] = []

  async function visit(requestName: string) {
    const itemPathName = normalizeRegistryName(requestName)
    if (seen.has(itemPathName)) { return }
    if (visiting.has(itemPathName)) {
      const cycleStart = dependencyStack.indexOf(itemPathName)
      const cycle = [...dependencyStack.slice(cycleStart), itemPathName]
      throw new Error(`Cyclic registry dependency: ${cycle.join(' -> ')}`)
    }

    visiting.add(itemPathName)
    dependencyStack.push(itemPathName)
    const item = await resolveRegistryItem(requestName, registryRoot, remoteRoot)
    try {
      if (!item.targets.includes(target)) {
        throw new Error(`Registry item ${itemPathName} does not support target ${target}`)
      }
      for (const dependency of [...item.registryDependencies, ...(item.targetRegistryDependencies?.[target] ?? [])]) {
        await visit(dependency)
      }
    }
    finally {
      dependencyStack.pop()
      visiting.delete(itemPathName)
    }

    seen.add(itemPathName)
    items.push(item)
  }

  for (const name of names) {
    await visit(name)
  }

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
        target: file.target,
        from: file.from,
        to: file.to,
        item: item.name,
        sourcePath: remoteRoot
          ? registryUrl(remoteRoot, file.from.slice('registry/'.length))
          : resolveRegistrySource(registryRoot, file.from),
        targetPath: file.to,
      })),
  )

  return { dependencies, devDependencies, files, items, target }
}

async function readRegistryFile(file: PlannedRegistryFile): Promise<Buffer> {
  if (file.content !== undefined) {
    return Buffer.from(file.content)
  }
  return /^https?:\/\//.test(file.sourcePath)
    ? fetchRegistryFile(file.sourcePath)
    : readFile(file.sourcePath)
}

function assertUniqueTargets(targets: { file: RegistryFile, targetIdentity: string }[]) {
  const filesByIdentity = new Map<string, RegistryFile>()
  for (const { file, targetIdentity } of targets) {
    if (filesByIdentity.has(targetIdentity)) {
      throw new Error(`Registry items target the same file: ${file.to}`)
    }
    filesByIdentity.set(targetIdentity, file)
  }
  for (const { file, targetIdentity } of targets) {
    let ancestor = targetIdentity
    while (true) {
      const parent = dirname(ancestor)
      if (parent === ancestor) { break }
      const parentFile = filesByIdentity.get(parent)
      if (parentFile) {
        throw new Error(`Registry items target a file and its descendant: ${parentFile.to}, ${file.to}`)
      }
      ancestor = parent
    }
  }
}

export interface ShadcnRegistryItem {
  $schema: string
  name: string
  type: 'registry:file'
  title: string
  description: string
  dependencies: string[]
  devDependencies: string[]
  registryDependencies: string[]
  files: { path: string, type: 'registry:file', target: string, content: string }[]
  meta: { varo: { target: RegistryTarget } }
}

export async function exportRegistryItem(name: string, options: ResolveRegistryOptions = {}): Promise<ShadcnRegistryItem> {
  const plan = await resolveRegistryItems([name], options)
  const item = plan.items[plan.items.length - 1]!
  assertUniqueTargets(plan.files.map(file => ({
    file,
    targetIdentity: file.to.normalize('NFC').toLowerCase().normalize('NFC'),
  })))
  const sourceBytes = await Promise.all(plan.files.map(file => readRegistryFile(file)))
  const rewrittenBytes = rewriteStandardFileImports(plan.files, sourceBytes)
  const files = plan.files.map((file, index) => {
    const bytes = rewrittenBytes[index]!
    if (!isUtf8(bytes)) {
      throw new Error(`Cannot export non-UTF-8 registry file: ${file.to}`)
    }
    return {
      path: file.to,
      type: 'registry:file' as const,
      target: `~/${file.to}`,
      content: bytes.toString('utf8'),
    }
  })

  return {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: item.name,
    // Universal files preserve Varo's destinations without a shadcn style or framework preset.
    type: 'registry:file',
    title: item.title,
    description: item.description,
    dependencies: plan.dependencies,
    devDependencies: plan.devDependencies,
    registryDependencies: [],
    files,
    meta: { varo: { target: plan.target } },
  }
}

export async function installRegistryItems(names: string[], options: InstallRegistryOptions): Promise<RegistryInstallPlan> {
  const plan = await resolveRegistryItems(names, options)
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
  assertUniqueTargets(plannedTargets)
  for (const { file, hadOriginal } of plannedTargets) {
    if (hadOriginal && !options.force) {
      throw new Error(`Refusing to overwrite existing file: ${file.to}`)
    }
  }

  const sourceBytes = rewriteStandardFileImports(
    plan.files,
    await Promise.all(plannedTargets.map(({ file }) => readRegistryFile(file))),
  )
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
  let target: RegistryTarget | undefined
  let registryRoot: string | undefined
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

    if (arg === '--registry' || arg.startsWith('--registry=')) {
      const value = arg === '--registry' ? args[++index] : arg.slice('--registry='.length)
      if (!value || value.startsWith('--')) {
        throw new Error('Missing registry path or URL')
      }
      registryRoot = value
      continue
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`)
    }

    items.push(arg)
  }

  if ((command !== 'add' && command !== 'export') || items.length === 0) {
    process.stderr.write(
      'Usage: varo add [--registry directory|json|url] [--target h5|weapp] [--force] <component|blocks/name> [...items]\n'
      + '       varo export [--registry directory|json|url] [--target h5|weapp] <component|blocks/name>\n',
    )
    process.exitCode = 1
    return
  }

  if (command === 'export') {
    if (items.length !== 1 || force) {
      throw new Error('Export requires exactly one registry item and does not accept --force')
    }
    const item = await exportRegistryItem(items[0]!, { projectRoot: process.cwd(), registryRoot, target })
    process.stdout.write(`${JSON.stringify(item, null, 2)}\n`)
    return
  }

  const plan = await installRegistryItems(items, {
    force,
    projectRoot: process.cwd(),
    registryRoot,
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
