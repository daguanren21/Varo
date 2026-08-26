#!/usr/bin/env node
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export type RegistryTarget = 'h5' | 'weapp-vite'

export interface RegistryFile {
  target: RegistryTarget
  from: string
  to: string
}

export interface RegistryItem {
  dependencies?: string[]
  description: string
  devDependencies?: string[]
  docs: string
  exportName?: string
  files: RegistryFile[]
  name: string
  registryDependencies: string[]
  targetDependencies?: Partial<Record<RegistryTarget, string[]>>
  targetDevDependencies?: Partial<Record<RegistryTarget, string[]>>
  targetRegistryDependencies?: Partial<Record<RegistryTarget, string[]>>
  targets: RegistryTarget[]
  title: string
  type: 'component' | 'block' | 'hook' | 'util' | 'theme' | 'template'
}

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
const defaultRegistryCandidates = [resolve(packageDir, '../registry'), resolve(packageDir, '../../../registry')]
const defaultRegistryRoot =
  defaultRegistryCandidates.find((candidate) => existsSync(resolve(candidate, 'components/button/registry.json'))) ??
  defaultRegistryCandidates[0]

const registryGroups = ['blocks', 'components', 'hooks', 'templates', 'themes', 'utils'] as const

function normalizeRegistryName(name: string): string {
  const hasGroup = registryGroups.some((group) => name.startsWith(`${group}/`))
  const normalized = hasGroup ? name : `components/${name}`

  if (!/^(?:blocks|components|hooks|templates|themes|utils)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    throw new Error(`Invalid registry item name: ${name}`)
  }

  return normalized
}

function readJsonFileSync<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function registryPathForName(registryRoot: string, name: string): string {
  return resolve(registryRoot, normalizeRegistryName(name), 'registry.json')
}

function resolveRegistryItem(name: string, registryRoot: string): RegistryItem {
  const path = registryPathForName(registryRoot, name)
  if (!existsSync(path)) {
    throw new Error(`Unknown registry item: ${name}`)
  }

  return readJsonFileSync<RegistryItem>(path)
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

function resolveProjectTarget(projectRoot: string, to: string): string {
  assertRelativePath(to, 'Registry target', 'project root')
  const canonicalRoot = realpathSync(projectRoot)
  const targetPath = resolve(canonicalRoot, to)

  if (!isWithinRoot(canonicalRoot, targetPath)) {
    throw new Error(`Registry target is outside the project root: ${to}`)
  }

  let existingAncestor = dirname(targetPath)
  while (!existsSync(existingAncestor)) {
    const parent = dirname(existingAncestor)
    if (parent === existingAncestor) break
    existingAncestor = parent
  }

  if (!isWithinRoot(canonicalRoot, realpathSync(existingAncestor)) && realpathSync(existingAncestor) !== canonicalRoot) {
    throw new Error(`Registry target is outside the project root: ${to}`)
  }

  if (existsSync(targetPath) && lstatSync(targetPath).isSymbolicLink()) {
    throw new Error(`Registry target must not be a symbolic link: ${to}`)
  }

  return targetPath
}

export function resolveRegistryItems(names: string[], options: ResolveRegistryOptions = {}): RegistryInstallPlan {
  const registryRoot = options.registryRoot ?? defaultRegistryRoot
  const target = options.target ?? 'weapp-vite'
  const items: RegistryItem[] = []
  const seen = new Set<string>()
  const visiting = new Set<string>()
  const dependencyStack: string[] = []

  function visit(requestName: string) {
    const itemPathName = normalizeRegistryName(requestName)
    if (seen.has(itemPathName)) return
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
    } finally {
      dependencyStack.pop()
      visiting.delete(itemPathName)
    }

    seen.add(itemPathName)
    items.push(item)
  }

  names.forEach(visit)

  const dependencies = Array.from(
    new Set(items.flatMap((item) => [...(item.dependencies ?? []), ...(item.targetDependencies?.[target] ?? [])]))
  ).sort()
  const devDependencies = Array.from(
    new Set(items.flatMap((item) => [...(item.devDependencies ?? []), ...(item.targetDevDependencies?.[target] ?? [])]))
  ).sort()
  const files = items.flatMap((item) =>
    item.files
      .filter((file) => file.target === target)
      .map((file) => ({
        ...file,
        item: item.name,
        sourcePath: resolveRegistrySource(registryRoot, file.from),
        targetPath: file.to
      }))
  )

  return { dependencies, devDependencies, files, items, target }
}

export async function installRegistryItems(names: string[], options: InstallRegistryOptions): Promise<RegistryInstallPlan> {
  const plan = resolveRegistryItems(names, options)
  const plannedTargets = plan.files.map((file) => ({
    file,
    targetPath: resolveProjectTarget(options.projectRoot, file.to)
  }))
  const seenTargets = new Set<string>()

  for (const { file, targetPath } of plannedTargets) {
    if (seenTargets.has(targetPath)) {
      throw new Error(`Registry items target the same file: ${file.to}`)
    }
    seenTargets.add(targetPath)

    if (existsSync(targetPath) && !options.force) {
      throw new Error(`Refusing to overwrite existing file: ${file.to}`)
    }
  }

  await Promise.all(
    plannedTargets.map(async ({ file, targetPath }) => {
      await mkdir(dirname(targetPath), { recursive: true })
      await writeFile(targetPath, await readFile(file.sourcePath, 'utf8'), options.force ? undefined : { flag: 'wx' })
    })
  )

  return plan
}

async function runCli(argv: string[]) {
  const [command, ...args] = argv
  let force = false
  let target: RegistryTarget = 'weapp-vite'
  const items: string[] = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--force') {
      force = true
      continue
    }

    if (arg === '--target') {
      const value = args[index + 1]
      if (value !== 'h5' && value !== 'weapp-vite') {
        throw new Error(`Unsupported registry target: ${value ?? '(missing)'}`)
      }
      target = value
      index += 1
      continue
    }

    if (arg.startsWith('--target=')) {
      const value = arg.slice('--target='.length)
      if (value !== 'h5' && value !== 'weapp-vite') {
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
      'Usage: varo add [--target h5|weapp-vite] [--force] <component|blocks/name> [...items]\n'
    )
    process.exitCode = 1
    return
  }

  const plan = await installRegistryItems(items, {
    force,
    projectRoot: process.cwd(),
    target
  })
  const output = [`Installed ${plan.items.map((item) => item.name).join(', ')} for ${plan.target}`]

  if (plan.dependencies.length > 0) {
    output.push(`Dependencies: ${plan.dependencies.join(' ')}`)
  }
  if (plan.devDependencies.length > 0) {
    output.push(`Dev dependencies: ${plan.devDependencies.join(' ')}`)
  }

  process.stdout.write(`${output.join('\n')}\n`)
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  runCli(process.argv.slice(2)).catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
