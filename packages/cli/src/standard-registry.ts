import type { RegistryFile, RegistryItem, RegistryTarget } from '@varo/registry/source'
import type { RegistryInstallPlan, ResolveRegistryOptions } from './index.ts'
import type {
  StandardRegistryCatalog,
  StandardRegistryFile,
  StandardRegistryItem,
  StandardRegistryType,
} from './standard-types.ts'
import { lstatSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { fetchRegistryFile, registryUrl } from './remote-registry.ts'
import { resolveStandardFileTargets } from './standard-files.ts'

const nativeTypeByStandardType: Record<StandardRegistryType, RegistryItem['type']> = {
  'registry:block': 'block',
  'registry:component': 'component',
  'registry:ui': 'component',
  'registry:hook': 'hook',
  'registry:composable': 'hook',
  'registry:lib': 'util',
  'registry:file': 'util',
  'registry:page': 'template',
  'registry:theme': 'theme',
  'registry:style': 'theme',
  'registry:item': 'util',
}

const unsupportedSideEffectFields = ['css', 'cssVars', 'envVars', 'extends', 'tailwind'] as const
function hasInvalidWindowsPathCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    if (value.charCodeAt(index) < 32 || '<>:"|?*'.includes(value[index]!)) {
      return true
    }
  }
  return false
}
const windowsReservedPathNamePattern = /^(?:aux|com[1-9¹²³]|con|conin\$|conout\$|lpt[1-9¹²³]|nul|prn)$/i

interface LocalDocumentLocation {
  kind: 'local'
  key: string
  manifestPath: string
  sourceRoot: string
  canonicalSourceRoot: string
}

interface RemoteDocumentLocation {
  kind: 'remote'
  key: string
  manifestUrl: string
  sourceRoot: string
}

type DocumentLocation = LocalDocumentLocation | RemoteDocumentLocation

interface LoadedCatalog {
  kind: 'catalog'
  location: DocumentLocation
  catalog: StandardRegistryCatalog
  itemsByName: Map<string, StandardRegistryItem>
}

interface LoadedItem {
  kind: 'item'
  location: DocumentLocation
  item: StandardRegistryItem
}

type LoadedDocument = LoadedCatalog | LoadedItem

interface StandardItemContext {
  identity: string
  item: StandardRegistryItem
  location: DocumentLocation
  catalog?: LoadedCatalog
}

function assertObject(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isWithinRoot(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate)
  return relativePath !== '' && relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath)
}

function assertPortableRelativePath(value: string, label: string) {
  if (
    !isNonEmptyString(value)
    || value !== value.trim()
    || isAbsolute(value)
    || /^[a-z]:[\\/]/i.test(value)
    || value.includes('\\')
    || value.includes('\0')
  ) {
    throw new Error(`${label} must be a portable relative path: ${value}`)
  }

  for (const segment of value.split('/')) {
    const extensionIndex = segment.indexOf('.')
    const basename = extensionIndex === -1 ? segment : segment.slice(0, extensionIndex)
    if (
      segment === ''
      || segment === '.'
      || segment === '..'
      || segment.endsWith('.')
      || segment.endsWith(' ')
      || hasInvalidWindowsPathCharacter(segment)
      || windowsReservedPathNamePattern.test(basename)
    ) {
      throw new Error(`${label} must be a portable relative path: ${value}`)
    }
  }
}

function assertOptionalString(record: Record<string, unknown>, field: string, label: string, allowEmpty = false) {
  const value = record[field]
  if (value !== undefined && (typeof value !== 'string' || (!allowEmpty && value.trim().length === 0))) {
    throw new Error(`${label}.${field} must be ${allowEmpty ? 'a string' : 'a non-empty string'}`)
  }
}

function assertStringArray(record: Record<string, unknown>, field: string, label: string) {
  const value = record[field]
  if (value !== undefined && (!Array.isArray(value) || value.some(entry => !isNonEmptyString(entry)))) {
    throw new Error(`${label}.${field} must be an array of non-empty strings`)
  }
}

function validateStandardFile(value: unknown, label: string): StandardRegistryFile {
  const input = assertObject(value, label)
  if (!isNonEmptyString(input.path)) {
    throw new Error(`${label}.path must be a non-empty string`)
  }
  assertPortableRelativePath(input.path, `${label}.path`)
  if (!Object.hasOwn(nativeTypeByStandardType, String(input.type))) {
    throw new Error(`${label}.type is unsupported: ${String(input.type)}`)
  }
  if (input.target !== undefined) {
    if (!isNonEmptyString(input.target)) {
      throw new Error(`${label}.target must be a non-empty string`)
    }
    const targetPath = input.target.startsWith('~/') ? input.target.slice(2) : input.target
    assertPortableRelativePath(targetPath, `${label}.target`)
  }
  if (input.content !== undefined && typeof input.content !== 'string') {
    throw new Error(`${label}.content must be a string`)
  }
  return input as unknown as StandardRegistryFile
}

function validateStandardItem(value: unknown, label: string): StandardRegistryItem {
  const input = assertObject(value, label)
  if (!isNonEmptyString(input.name)) {
    throw new Error(`${label}.name must be a non-empty string`)
  }
  if (!Object.hasOwn(nativeTypeByStandardType, String(input.type))) {
    throw new Error(`${label}.type is unsupported: ${String(input.type)}`)
  }

  assertOptionalString(input, 'author', label, true)
  assertOptionalString(input, '$schema', label)
  assertOptionalString(input, 'title', label, true)
  assertOptionalString(input, 'description', label, true)
  assertOptionalString(input, 'docs', label, true)
  assertStringArray(input, 'dependencies', label)
  assertStringArray(input, 'categories', label)
  assertStringArray(input, 'devDependencies', label)
  assertStringArray(input, 'registryDependencies', label)

  if (input.files !== undefined) {
    if (!Array.isArray(input.files)) {
      throw new TypeError(`${label}.files must be an array`)
    }
    input.files.forEach((file, index) => validateStandardFile(file, `${label}.files[${index}]`))
  }

  if (input.meta !== undefined) {
    const meta = assertObject(input.meta, `${label}.meta`)
    if (meta.varo !== undefined) {
      const varo = assertObject(meta.varo, `${label}.meta.varo`)
      const target = varo.target
      if (target !== undefined && target !== 'h5' && target !== 'weapp') {
        throw new Error(`${label}.meta.varo.target is unsupported: ${String(target)}`)
      }
    }
  }

  for (const field of unsupportedSideEffectFields) {
    if (Object.hasOwn(input, field)) {
      throw new Error(`${label}.${field} requires unsupported project configuration side effects`)
    }
  }

  return input as unknown as StandardRegistryItem
}

function validateStandardDocument(value: unknown, location: DocumentLocation): LoadedDocument {
  const label = `Standard registry document at ${location.key}`
  const input = assertObject(value, label)

  if (Object.hasOwn(input, 'items')) {
    if (!isNonEmptyString(input.name)) {
      throw new Error(`${label}.name must be a non-empty string`)
    }
    if (!isNonEmptyString(input.homepage)) {
      throw new Error(`${label}.homepage must be a non-empty string`)
    }
    assertOptionalString(input, '$schema', label)
    if (!Array.isArray(input.items)) {
      throw new TypeError(`${label}.items must be an array`)
    }

    const itemsByName = new Map<string, StandardRegistryItem>()
    for (let index = 0; index < input.items.length; index += 1) {
      const item = validateStandardItem(input.items[index], `${label}.items[${index}]`)
      if (itemsByName.has(item.name)) {
        throw new Error(`${label} contains duplicate item name: ${item.name}`)
      }
      itemsByName.set(item.name, item)
    }
    return {
      kind: 'catalog',
      location,
      catalog: input as unknown as StandardRegistryCatalog,
      itemsByName,
    }
  }

  return {
    kind: 'item',
    location,
    item: validateStandardItem(input, label),
  }
}

function remoteUrl(value: string, label: string): URL | undefined {
  if (!/^[a-z][a-z\d+.-]*:/i.test(value) || /^[a-z]:[\\/]/i.test(value)) {
    return undefined
  }

  let url: URL
  try {
    url = new URL(value)
  }
  catch (error) {
    throw new Error(`${label} is not a valid URL: ${value}`, { cause: error })
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${label} must use HTTP or HTTPS`)
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`${label} must not contain credentials, query parameters, or a fragment`)
  }
  return url
}

function remoteDocumentLocation(url: URL): RemoteDocumentLocation {
  return {
    kind: 'remote',
    key: url.href,
    manifestUrl: url.href,
    sourceRoot: new URL('.', url).href,
  }
}

function localDocumentLocation(manifestPath: string, boundary?: string): LocalDocumentLocation {
  let canonicalManifestPath: string
  try {
    canonicalManifestPath = realpathSync(manifestPath)
  }
  catch (error) {
    throw new Error(`Cannot read standard registry document: ${manifestPath}`, { cause: error })
  }

  if (boundary !== undefined && !isWithinRoot(boundary, canonicalManifestPath)) {
    throw new Error(`Standard registry document is outside its source root: ${manifestPath}`)
  }
  if (!lstatSync(canonicalManifestPath).isFile()) {
    throw new Error(`Standard registry document must be a regular file: ${manifestPath}`)
  }

  const canonicalSourceRoot = dirname(canonicalManifestPath)
  return {
    kind: 'local',
    key: pathToFileURL(canonicalManifestPath).href,
    manifestPath: canonicalManifestPath,
    sourceRoot: pathToFileURL(`${canonicalSourceRoot}${sep}`).href,
    canonicalSourceRoot,
  }
}

function selectedDocumentLocation(registryRoot: string): DocumentLocation | undefined {
  const url = remoteUrl(registryRoot, 'Registry URL')
  if (url !== undefined) {
    return url.pathname.endsWith('.json') ? remoteDocumentLocation(url) : undefined
  }

  const selectedPath = resolve(registryRoot)
  const selectedEntry = lstatSync(selectedPath, { throwIfNoEntry: false })
  if (selectedEntry === undefined) {
    throw new Error(`Registry path does not exist: ${registryRoot}`)
  }

  let canonicalSelectedPath: string
  try {
    canonicalSelectedPath = realpathSync(selectedPath)
  }
  catch (error) {
    throw new Error(`Cannot resolve registry path: ${registryRoot}`, { cause: error })
  }
  const selectedStats = lstatSync(canonicalSelectedPath)
  if (selectedStats.isFile()) {
    return localDocumentLocation(canonicalSelectedPath)
  }
  if (!selectedStats.isDirectory()) {
    throw new Error(`Registry path must be a directory or JSON file: ${registryRoot}`)
  }

  const manifestPath = resolve(canonicalSelectedPath, 'registry.json')
  if (lstatSync(manifestPath, { throwIfNoEntry: false }) === undefined) {
    return undefined
  }
  return localDocumentLocation(manifestPath, canonicalSelectedPath)
}

async function loadDocument(
  location: DocumentLocation,
  cache: Map<string, Promise<LoadedDocument>>,
): Promise<LoadedDocument> {
  const existing = cache.get(location.key)
  if (existing !== undefined) {
    return existing
  }

  const pending = (async () => {
    const bytes = location.kind === 'remote'
      ? await fetchRegistryFile(location.manifestUrl)
      : readFileSync(location.manifestPath)
    let input: unknown
    try {
      input = JSON.parse(bytes.toString('utf8')) as unknown
    }
    catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      throw new Error(`Invalid standard registry JSON at ${location.key}: ${reason}`, { cause: error })
    }
    return validateStandardDocument(input, location)
  })()

  cache.set(location.key, pending)
  return pending
}

function itemContext(document: LoadedItem): StandardItemContext
function itemContext(document: LoadedCatalog, item: StandardRegistryItem): StandardItemContext
function itemContext(document: LoadedDocument, item?: StandardRegistryItem): StandardItemContext {
  const standardItem = document.kind === 'item' ? document.item : item!
  return {
    identity: document.kind === 'catalog'
      ? `catalog:${document.location.key}#${encodeURIComponent(standardItem.name)}`
      : `item:${document.location.key}#${encodeURIComponent(standardItem.name)}`,
    item: standardItem,
    location: document.location,
    ...(document.kind === 'catalog' ? { catalog: document } : {}),
  }
}

function namedSiblingLocation(context: StandardItemContext, name: string): DocumentLocation {
  assertPortableRelativePath(name, 'Standard registry dependency name')
  const manifestName = `${name}.json`
  if (context.location.kind === 'remote') {
    return remoteDocumentLocation(new URL(registryUrl(new URL(context.location.sourceRoot), manifestName)))
  }

  const manifestPath = resolve(context.location.canonicalSourceRoot, manifestName)
  if (lstatSync(manifestPath, { throwIfNoEntry: false }) === undefined) {
    throw new Error(`Unknown standard registry dependency: ${name}`)
  }
  return localDocumentLocation(manifestPath, context.location.canonicalSourceRoot)
}

async function resolveDependency(
  context: StandardItemContext,
  dependency: string,
  cache: Map<string, Promise<LoadedDocument>>,
): Promise<StandardItemContext> {
  const dependencyUrl = remoteUrl(dependency, 'Standard registry dependency URL')
  if (dependencyUrl !== undefined) {
    const document = await loadDocument(remoteDocumentLocation(dependencyUrl), cache)
    if (document.kind !== 'item') {
      throw new Error(`Standard registry dependency URL must resolve to a single item: ${dependency}`)
    }
    return itemContext(document)
  }

  if (context.catalog !== undefined) {
    const item = context.catalog.itemsByName.get(dependency)
    if (item === undefined) {
      throw new Error(`Unknown standard registry dependency in ${context.catalog.catalog.name}: ${dependency}`)
    }
    return itemContext(context.catalog, item)
  }

  const document = await loadDocument(namedSiblingLocation(context, dependency), cache)
  if (document.kind !== 'item') {
    throw new Error(`Standard registry dependency must resolve to a single item: ${dependency}`)
  }
  if (document.item.name !== dependency) {
    throw new Error(
      `Standard registry dependency ${dependency} resolved to item ${document.item.name} at ${document.location.key}`,
    )
  }
  return itemContext(document)
}

function declaredTarget(item: StandardRegistryItem): RegistryTarget {
  return item.meta?.varo?.target ?? 'h5'
}

function localSourcePath(location: LocalDocumentLocation, path: string, sourceKey: string): string {
  const unresolvedPath = fileURLToPath(sourceKey)
  let canonicalPath: string
  try {
    canonicalPath = realpathSync(unresolvedPath)
  }
  catch (error) {
    throw new Error(`Cannot read standard registry source ${path} from ${location.key}`, { cause: error })
  }
  if (!isWithinRoot(location.canonicalSourceRoot, canonicalPath)) {
    throw new Error(`Standard registry source is outside its source root: ${path}`)
  }
  if (!lstatSync(canonicalPath).isFile()) {
    throw new Error(`Standard registry source must be a regular file: ${path}`)
  }
  return canonicalPath
}

export async function resolveStandardRegistryItems(
  names: string[],
  options: ResolveRegistryOptions,
): Promise<RegistryInstallPlan | undefined> {
  if (options.registryRoot === undefined) {
    return undefined
  }

  const rootLocation = selectedDocumentLocation(options.registryRoot)
  if (rootLocation === undefined) {
    return undefined
  }

  const cache = new Map<string, Promise<LoadedDocument>>()
  const rootDocument = await loadDocument(rootLocation, cache)
  const requested: StandardItemContext[] = names.map((name) => {
    if (rootDocument.kind === 'catalog') {
      const item = rootDocument.itemsByName.get(name)
      if (item === undefined) {
        throw new Error(`Unknown standard registry item in ${rootDocument.catalog.name}: ${name}`)
      }
      return itemContext(rootDocument, item)
    }
    if (rootDocument.item.name !== name) {
      throw new Error(`Standard registry document contains ${rootDocument.item.name}, not requested item ${name}`)
    }
    return itemContext(rootDocument)
  })

  const requestedTargets = new Set(requested.map(context => declaredTarget(context.item)))
  if (options.target === undefined && requestedTargets.size > 1) {
    throw new Error(`Requested standard registry items target multiple runtimes: ${[...requestedTargets].join(', ')}`)
  }
  const target = options.target ?? requestedTargets.values().next().value ?? 'h5'
  const seen = new Set<string>()
  const visiting = new Set<string>()
  const dependencyStack: StandardItemContext[] = []
  const ordered: StandardItemContext[] = []

  async function visit(context: StandardItemContext) {
    if (seen.has(context.identity)) {
      return
    }
    if (visiting.has(context.identity)) {
      const cycleStart = dependencyStack.findIndex(entry => entry.identity === context.identity)
      const cycle = [...dependencyStack.slice(cycleStart), context].map(entry => entry.item.name)
      throw new Error(`Cyclic standard registry dependency: ${cycle.join(' -> ')}`)
    }

    const itemTarget = declaredTarget(context.item)
    if (itemTarget !== target) {
      throw new Error(`Standard registry item ${context.item.name} targets ${itemTarget}, not ${target}`)
    }

    visiting.add(context.identity)
    dependencyStack.push(context)
    try {
      for (const dependency of context.item.registryDependencies ?? []) {
        await visit(await resolveDependency(context, dependency, cache))
      }
    }
    finally {
      dependencyStack.pop()
      visiting.delete(context.identity)
    }

    seen.add(context.identity)
    ordered.push(context)
  }

  for (const context of requested) {
    await visit(context)
  }

  const items: RegistryItem[] = []
  const files: RegistryInstallPlan['files'] = []
  for (const context of ordered) {
    const destinations = await resolveStandardFileTargets(context.item, options.projectRoot)
    const normalizedFiles: RegistryFile[] = []

    for (const destination of destinations) {
      const standardFile = destination.file
      const sourceKey = registryUrl(new URL(context.location.sourceRoot), standardFile.path)
      const sourcePath = context.location.kind === 'remote'
        ? sourceKey
        : standardFile.content !== undefined
          ? fileURLToPath(sourceKey)
          : localSourcePath(context.location, standardFile.path, sourceKey)
      const normalizedFile: RegistryFile = {
        target,
        from: standardFile.path,
        to: destination.to,
      }
      normalizedFiles.push(normalizedFile)
      files.push({
        ...normalizedFile,
        item: context.item.name,
        sourcePath,
        targetPath: destination.to,
        ...(standardFile.content !== undefined ? { content: standardFile.content } : {}),
        standard: {
          path: standardFile.path,
          sourceKey,
          sourceRoot: context.location.sourceRoot,
          defaultTo: destination.defaultTo,
        },
      })
    }

    items.push({
      name: context.item.name,
      type: nativeTypeByStandardType[context.item.type],
      title: context.item.title ?? context.item.name,
      description: context.item.description ?? `Standard registry item ${context.item.name}`,
      docs: context.item.docs
        ?? context.catalog?.catalog.homepage
        ?? `Standard registry item ${context.item.name}`,
      targets: [target],
      dependencies: [...(context.item.dependencies ?? [])],
      devDependencies: [...(context.item.devDependencies ?? [])],
      registryDependencies: [...(context.item.registryDependencies ?? [])],
      files: normalizedFiles,
    })
  }

  const dependencies = Array.from(new Set(ordered.flatMap(context => context.item.dependencies ?? []))).sort()
  const devDependencies = Array.from(new Set(ordered.flatMap(context => context.item.devDependencies ?? []))).sort()
  return { dependencies, devDependencies, files, items, target }
}
