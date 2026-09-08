import type { TsConfigResult } from 'get-tsconfig'
import type { StandardFileDestination, StandardFilePlanEntry, StandardRegistryFile, StandardRegistryItem } from './standard-types.ts'
import { Buffer, isUtf8 } from 'node:buffer'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, extname, isAbsolute, posix, relative, resolve, sep } from 'node:path'
import { babelParse, parse as parseSfc } from '@vue/compiler-sfc'
import { createPathsMatcher, getTsconfig, parseTsconfig } from 'get-tsconfig'

const defaultAliases = {
  components: '@/components',
  ui: '@/components/ui',
  lib: '@/lib',
  composables: '@/composables',
  utils: '@/lib/utils',
} as const

const defaultDirectories = {
  components: 'src/components',
  ui: 'src/components/ui',
  lib: 'src/lib',
  composables: 'src/composables',
} as const

const codeExtensions: Record<string, true> = {
  '.cjs': true,
  '.cts': true,
  '.js': true,
  '.jsx': true,
  '.mjs': true,
  '.mts': true,
  '.ts': true,
  '.tsx': true,
  '.vue': true,
}
const windowsInvalidPathCharacterPattern = /[<>:"|?*]/
const windowsReservedPathNamePattern = /^(?:aux|com[1-9¹²³]|con|conin\$|conout\$|lpt[1-9¹²³]|nul|prn)$/i

interface ConsumerPaths {
  aliases: string[]
  directories: Record<keyof typeof defaultDirectories, string>
}

interface SyntaxNode {
  type: string
  start?: number | null
  end?: number | null
  value?: unknown
  [key: string]: unknown
}

interface TextPatch {
  start: number
  end: number
  value: string
}

type AliasForm = 'exact' | 'stem' | 'index'

interface KnownStandardFile {
  entry: StandardFilePlanEntry
  index: number
  sourceRoot: string
  sourceUrl: URL
}

interface FileAlias {
  file: KnownStandardFile
  form: AliasForm
}

interface FileMatch {
  file: KnownStandardFile
  form: AliasForm
  style: 'relative' | 'source-alias' | 'src-alias' | 'project-alias'
}

interface StandardFileIndex {
  byEntryIndex: (KnownStandardFile | undefined)[]
  logicalAliases: Map<string, FileAlias[]>
  sourceAliases: Map<string, FileAlias[]>
  sourceRoots: URL[]
}

function errorReason(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (error !== null && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return String(error)
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code < 32 || code === 127) {
      return true
    }
  }
  return false
}

function normalizePortablePath(value: string, label: string): string {
  if (value.length === 0 || value.includes('\\') || hasControlCharacter(value)) {
    throw new Error(`${label} must be a non-empty portable relative path: ${value}`)
  }
  const firstCode = value.charCodeAt(0)
  const hasWindowsDrive = value.length >= 2 && value[1] === ':'
    && ((firstCode >= 65 && firstCode <= 90) || (firstCode >= 97 && firstCode <= 122))
  if (posix.isAbsolute(value) || hasWindowsDrive) {
    throw new Error(`${label} must be relative: ${value}`)
  }

  const segments = value.split('/')
  if (segments.some((segment) => {
    const extensionIndex = segment.indexOf('.')
    const basename = extensionIndex === -1 ? segment : segment.slice(0, extensionIndex)
    return segment === '' || segment === '.' || segment === '..'
      || segment.endsWith('.') || segment.endsWith(' ')
      || windowsInvalidPathCharacterPattern.test(segment)
      || windowsReservedPathNamePattern.test(basename)
  })) {
    throw new Error(`${label} is outside its allowed root: ${value}`)
  }
  return segments.join('/')
}

function normalizeProjectSourcePath(value: string, label: string): string {
  const withoutHome = value.startsWith('~/') ? value.slice(2) : value
  const normalized = normalizePortablePath(withoutHome, label)
  if (!normalized.startsWith('src/')) {
    throw new Error(`${label} is outside the project src directory: ${value}`)
  }
  return normalized
}

function isWithinOrEqual(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate)
  return relativePath === ''
    || (relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath))
}

function projectRelativeSourcePath(projectRoot: string, candidate: string, label: string): string {
  const sourceRoot = resolve(projectRoot, 'src')
  const absoluteCandidate = resolve(candidate)
  if (!isWithinOrEqual(sourceRoot, absoluteCandidate)) {
    throw new Error(`${label} is outside the project src directory: ${absoluteCandidate}`)
  }
  const sourceRelative = relative(sourceRoot, absoluteCandidate).split(sep).join('/')
  return sourceRelative === '' ? 'src' : `src/${sourceRelative}`
}

function findCommonRoot(paths: readonly string[], needle: string): string {
  const needleDirectory = needle.split('/').slice(0, -1).join('/')
  if (needleDirectory === '') {
    return ''
  }

  const needleSegments = needleDirectory.split('/')
  for (let length = needleSegments.length; length > 0; length -= 1) {
    const candidate = needleSegments.slice(0, length).join('/')
    if (paths.some(path => path !== needle && path.startsWith(`${candidate}/`))) {
      return candidate
    }
  }
  return needleDirectory
}

function normalizeNestedAlias(value: string): string {
  let normalized = value.startsWith('@/') || value.startsWith('~/') ? value.slice(2) : value
  while (normalized.startsWith('/')) {
    normalized = normalized.slice(1)
  }
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

function resolveNestedFilePath(filePath: string, commonRoot: string, aliases: readonly string[]): string {
  const normalizedAliases = aliases
    .map(normalizeNestedAlias)
    .filter(alias => alias !== '')
    .sort((left, right) => right.length - left.length)

  for (const alias of normalizedAliases) {
    if (commonRoot.includes(alias)) {
      const aliasEnd = filePath.indexOf(alias) + alias.length
      const nested = filePath.slice(aliasEnd)
      return nested.startsWith('/') ? nested.slice(1) : nested
    }
  }

  const lastCommonRootSegment = commonRoot.split('/').pop() ?? ''
  return `${lastCommonRootSegment}${filePath.replace(commonRoot, '')}`
}

function referencedTsconfigPath(parentPath: string, referencePath: string): string | undefined {
  const unresolved = resolve(dirname(parentPath), referencePath)
  const candidates = extname(unresolved) === '.json'
    ? [unresolved]
    : [`${unresolved}.json`, resolve(unresolved, 'tsconfig.json'), unresolved]
  return candidates.find(candidate => existsSync(candidate))
}

function collectProjectTsconfigs(projectRoot: string): TsConfigResult[] {
  const root = resolve(projectRoot)
  const initial = getTsconfig(root)
  if (initial === null || !isWithinOrEqual(root, initial.path)) {
    return []
  }

  const results: TsConfigResult[] = []
  const seen = new Set<string>()

  function visit(result: TsConfigResult) {
    const configPath = resolve(result.path)
    if (seen.has(configPath)) {
      return
    }
    seen.add(configPath)
    results.push({ path: configPath, config: result.config })

    for (const reference of result.config.references ?? []) {
      const childPath = referencedTsconfigPath(configPath, reference.path)
      if (childPath === undefined) {
        throw new Error(`Referenced TypeScript config does not exist: ${reference.path} from ${configPath}`)
      }
      if (!isWithinOrEqual(root, childPath)) {
        continue
      }
      try {
        visit({ path: childPath, config: parseTsconfig(childPath) })
      }
      catch (error) {
        throw new Error(`Cannot read referenced TypeScript config ${childPath}: ${errorReason(error)}`, { cause: error })
      }
    }
  }

  visit(initial)
  return results
}

function baseUrlCandidate(tsconfig: TsConfigResult, alias: string): string | undefined {
  const baseUrl = tsconfig.config.compilerOptions?.baseUrl
  if (baseUrl === undefined || alias.startsWith('@/') || alias.startsWith('~/')) {
    return undefined
  }
  const absoluteBaseUrl = isAbsolute(baseUrl) ? baseUrl : resolve(dirname(tsconfig.path), baseUrl)
  return resolve(absoluteBaseUrl, alias)
}

function resolveConfiguredAlias(alias: string, projectRoot: string, tsconfigs: readonly TsConfigResult[]): string {
  const root = resolve(projectRoot)
  const sourceRoot = resolve(root, 'src')
  const outsideCandidates: string[] = []

  if (isAbsolute(alias)) {
    if (!isWithinOrEqual(sourceRoot, alias)) {
      throw new Error(`Configured component alias resolves outside the project src directory: ${alias}`)
    }
    return resolve(alias)
  }

  if (alias.startsWith('./') || alias.startsWith('../')) {
    const candidate = resolve(root, alias)
    if (!isWithinOrEqual(sourceRoot, candidate)) {
      throw new Error(`Configured component alias resolves outside the project src directory: ${alias}`)
    }
    return candidate
  }

  if (alias === 'src' || alias.startsWith('src/')) {
    return resolve(root, normalizePortablePath(alias, 'Configured component alias'))
  }

  for (let index = 0; index < tsconfigs.length; index += 1) {
    const tsconfig = tsconfigs[index]!
    const matcher = createPathsMatcher(tsconfig)
    const matched = matcher?.(alias) ?? []
    const candidate = matched[0] ?? baseUrlCandidate(tsconfig, alias)
    if (candidate === undefined) {
      continue
    }
    if (isWithinOrEqual(sourceRoot, candidate)) {
      return resolve(candidate)
    }
    if (index === 0 && matched.length > 0) {
      throw new Error(`Configured component alias resolves outside the project src directory: ${alias} -> ${candidate}`)
    }
    outsideCandidates.push(candidate)
  }

  if (outsideCandidates.length > 0) {
    throw new Error(`Configured component alias resolves outside the project src directory: ${alias} -> ${outsideCandidates[0]}`)
  }
  throw new Error(`Configured component alias cannot be resolved through the project TypeScript config: ${alias}`)
}

async function resolveConsumerPaths(projectRoot?: string): Promise<ConsumerPaths> {
  const aliases = new Set<string>(Object.values(defaultAliases))
  const directories: ConsumerPaths['directories'] = { ...defaultDirectories }
  if (projectRoot === undefined) {
    return { aliases: [...aliases], directories }
  }

  const root = resolve(projectRoot)
  const componentsPath = resolve(root, 'components.json')
  if (!existsSync(componentsPath)) {
    return { aliases: [...aliases], directories }
  }

  let input: unknown
  try {
    input = JSON.parse(await readFile(componentsPath, 'utf8')) as unknown
  }
  catch (error) {
    throw new Error(`Cannot read ${componentsPath}: ${errorReason(error)}`, { cause: error })
  }
  if (input === null || typeof input !== 'object' || Array.isArray(input)
    || !('aliases' in input) || input.aliases === null
    || typeof input.aliases !== 'object' || Array.isArray(input.aliases)) {
    throw new Error(`Invalid components.json aliases in ${componentsPath}`)
  }
  const configuredAliases: Record<string, string> = {}

  for (const [name, value] of Object.entries(input.aliases)) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`Invalid components.json alias ${name} in ${componentsPath}`)
    }
    configuredAliases[name] = value
    aliases.add(value)
  }

  const tsconfigs = collectProjectTsconfigs(root)
  for (const name of Object.keys(defaultDirectories) as (keyof typeof defaultDirectories)[]) {
    const configured = configuredAliases[name]
    if (configured !== undefined) {
      directories[name] = projectRelativeSourcePath(
        root,
        resolveConfiguredAlias(configured, root, tsconfigs),
        `Configured ${name} alias`,
      )
    }
  }
  return { aliases: [...aliases], directories }
}

function defaultDirectoryForFile(
  file: StandardRegistryFile,
  directories: Readonly<Record<keyof typeof defaultDirectories, string>>,
): string | undefined {
  switch (file.type) {
    case 'registry:ui':
      return directories.ui
    case 'registry:block':
    case 'registry:component':
      return directories.components
    case 'registry:lib':
      return directories.lib
    case 'registry:hook':
    case 'registry:composable':
      return directories.composables
    default:
      return undefined
  }
}

export async function resolveStandardFileTargets(
  item: StandardRegistryItem,
  projectRoot?: string,
): Promise<StandardFileDestination[]> {
  const files = item.files ?? []
  if (files.length === 0) {
    return []
  }

  const normalizedPaths = files.map(file => normalizePortablePath(file.path, `Registry source path for ${item.name}`))
  const consumerPaths = await resolveConsumerPaths(projectRoot)

  return files.map((file, index) => {
    const commonRoot = findCommonRoot(normalizedPaths, normalizedPaths[index]!)
    const nestedPath = normalizePortablePath(
      resolveNestedFilePath(normalizedPaths[index]!, commonRoot, consumerPaths.aliases),
      `Registry destination path for ${file.path}`,
    )
    const canonicalDirectory = defaultDirectoryForFile(file, defaultDirectories)
    const defaultTo = canonicalDirectory === undefined
      ? undefined
      : normalizeProjectSourcePath(posix.join(canonicalDirectory, nestedPath), `Default registry target for ${file.path}`)

    if (file.target !== undefined) {
      const to = normalizeProjectSourcePath(file.target, `Registry target for ${file.path}`)
      return { file, to, defaultTo: defaultTo ?? to }
    }
    const consumerDirectory = defaultDirectoryForFile(file, consumerPaths.directories)
    if (consumerDirectory === undefined || defaultTo === undefined) {
      throw new Error(`Registry file type ${file.type} requires an explicit target: ${file.path}`)
    }
    const to = normalizeProjectSourcePath(
      posix.join(consumerDirectory, nestedPath),
      `Registry target for ${file.path}`,
    )
    return { file, to, defaultTo }
  })
}

function normalizedUrl(value: string, directory: boolean): URL {
  let url: URL
  try {
    url = new URL(value)
  }
  catch (error) {
    throw new Error(`Invalid standard file URL: ${value}`, { cause: error })
  }
  url.search = ''
  url.hash = ''
  if (directory && !url.pathname.endsWith('/')) {
    url.pathname += '/'
  }
  return url
}

function urlIdentity(url: URL): string {
  const normalized = new URL(url.href)
  normalized.search = ''
  normalized.hash = ''
  if (normalized.pathname.length > 1 && normalized.pathname.endsWith('/')) {
    normalized.pathname = normalized.pathname.slice(0, -1)
  }
  return normalized.href
}

function addAlias(map: Map<string, FileAlias[]>, key: string, alias: FileAlias) {
  const existing = map.get(key)
  if (existing === undefined) {
    map.set(key, [alias])
    return
  }
  if (!existing.some(candidate => candidate.file.index === alias.file.index && candidate.form === alias.form)) {
    existing.push(alias)
  }
}

function addLogicalAliases(map: Map<string, FileAlias[]>, path: string, file: KnownStandardFile) {
  addAlias(map, path, { file, form: 'exact' })
  const extension = posix.extname(path).toLowerCase()
  if (codeExtensions[extension] !== true) {
    return
  }

  const stem = path.slice(0, -extension.length)
  addAlias(map, stem, { file, form: 'stem' })
  if (posix.basename(stem) === 'index') {
    addAlias(map, posix.dirname(stem), { file, form: 'index' })
  }
}

function addSourceAliases(map: Map<string, FileAlias[]>, source: URL, file: KnownStandardFile) {
  addAlias(map, urlIdentity(source), { file, form: 'exact' })
  const extension = posix.extname(source.pathname).toLowerCase()
  if (codeExtensions[extension] !== true) {
    return
  }

  const stem = new URL(source.href)
  stem.pathname = stem.pathname.slice(0, -extension.length)
  addAlias(map, urlIdentity(stem), { file, form: 'stem' })
  if (posix.basename(stem.pathname) === 'index') {
    const directory = new URL(stem.href)
    directory.pathname = posix.dirname(directory.pathname)
    addAlias(map, urlIdentity(directory), { file, form: 'index' })
  }
}

function buildStandardFileIndex(files: readonly StandardFilePlanEntry[]): StandardFileIndex {
  const byEntryIndex: (KnownStandardFile | undefined)[] = Array.from({ length: files.length })
  const logicalAliases = new Map<string, FileAlias[]>()
  const sourceAliases = new Map<string, FileAlias[]>()
  const sourceRoots = new Map<string, URL>()

  for (let index = 0; index < files.length; index += 1) {
    const entry = files[index]!
    if (entry.standard === undefined) {
      continue
    }

    const sourceUrl = normalizedUrl(entry.standard.sourceKey, false)
    const sourceRoot = normalizedUrl(entry.standard.sourceRoot, true)
    const known: KnownStandardFile = {
      entry,
      index,
      sourceRoot: sourceRoot.href,
      sourceUrl,
    }
    byEntryIndex[index] = known
    sourceRoots.set(sourceRoot.href, sourceRoot)

    addSourceAliases(sourceAliases, sourceUrl, known)
    addLogicalAliases(
      logicalAliases,
      normalizeProjectSourcePath(entry.standard.defaultTo, `Default registry target for ${entry.standard.path}`),
      known,
    )
    addLogicalAliases(
      logicalAliases,
      normalizeProjectSourcePath(entry.to, `Registry target for ${entry.standard.path}`),
      known,
    )
  }

  return {
    byEntryIndex,
    logicalAliases,
    sourceAliases,
    sourceRoots: [...sourceRoots.values()],
  }
}

function aliasRank(form: AliasForm): number {
  switch (form) {
    case 'exact': return 0
    case 'stem': return 1
    case 'index': return 2
  }
}

function chooseAlias(
  candidates: readonly FileAlias[] | undefined,
  importer: KnownStandardFile,
  specifier: string,
): FileAlias | undefined {
  if (candidates === undefined || candidates.length === 0) {
    return undefined
  }

  let bestRank = Number.POSITIVE_INFINITY
  for (const candidate of candidates) {
    bestRank = Math.min(bestRank, aliasRank(candidate.form))
  }
  const preferSameRegistry = candidates.some(candidate =>
    aliasRank(candidate.form) === bestRank && candidate.file.sourceRoot === importer.sourceRoot,
  )

  let selected: FileAlias | undefined
  for (const candidate of candidates) {
    if (aliasRank(candidate.form) !== bestRank
      || (preferSameRegistry && candidate.file.sourceRoot !== importer.sourceRoot)) {
      continue
    }
    if (selected !== undefined && selected.file.index !== candidate.file.index) {
      throw new Error(`Ambiguous installed registry import ${specifier} in ${importer.entry.standard!.path}`)
    }
    selected = candidate
  }
  return selected
}

function stripCodeExtensionFromUrl(url: URL, requestPath: string): URL | undefined {
  const extension = posix.extname(requestPath).toLowerCase()
  if (codeExtensions[extension] !== true) {
    return undefined
  }
  const stem = new URL(url.href)
  stem.pathname = stem.pathname.slice(0, -extension.length)
  return stem
}

function lookupSourceAlias(
  url: URL,
  requestPath: string,
  importer: KnownStandardFile,
  index: StandardFileIndex,
  specifier: string,
): FileAlias | undefined {
  const exact = chooseAlias(index.sourceAliases.get(urlIdentity(url)), importer, specifier)
  if (exact !== undefined) {
    return exact
  }
  const stem = stripCodeExtensionFromUrl(url, requestPath)
  return stem === undefined
    ? undefined
    : chooseAlias(index.sourceAliases.get(urlIdentity(stem)), importer, specifier)
}

function lookupLogicalAlias(
  path: string,
  requestPath: string,
  importer: KnownStandardFile,
  index: StandardFileIndex,
  specifier: string,
): FileAlias | undefined {
  const normalized = posix.normalize(path)
  const exact = chooseAlias(index.logicalAliases.get(normalized), importer, specifier)
  if (exact !== undefined) {
    return exact
  }

  const extension = posix.extname(requestPath).toLowerCase()
  if (codeExtensions[extension] !== true) {
    return undefined
  }
  return chooseAlias(
    index.logicalAliases.get(normalized.slice(0, -extension.length)),
    importer,
    specifier,
  )
}

function resolveRelativeImport(
  requestPath: string,
  importer: KnownStandardFile,
  index: StandardFileIndex,
  specifier: string,
): FileMatch | undefined {
  const sourceUrl = new URL(requestPath, importer.sourceUrl)
  const sourceMatch = lookupSourceAlias(sourceUrl, requestPath, importer, index, specifier)
  if (sourceMatch !== undefined) {
    return { ...sourceMatch, style: 'relative' }
  }

  const logicalBases = [importer.entry.standard!.defaultTo, importer.entry.to]
  for (const base of logicalBases) {
    const candidate = posix.resolve('/', posix.dirname(base), requestPath).slice(1)
    const logicalMatch = lookupLogicalAlias(candidate, requestPath, importer, index, specifier)
    if (logicalMatch !== undefined) {
      return { ...logicalMatch, style: 'relative' }
    }
  }
  return undefined
}

function resolveSourceAliasImport(
  requestPath: string,
  importer: KnownStandardFile,
  index: StandardFileIndex,
  specifier: string,
): FileAlias | undefined {
  const suffix = requestPath.slice(2)
  const importerRoot = normalizedUrl(importer.sourceRoot, true)
  const direct = lookupSourceAlias(new URL(suffix, importerRoot), suffix, importer, index, specifier)
  if (direct !== undefined) {
    return direct
  }

  const matches = new Map<number, FileAlias>()
  for (const sourceRoot of index.sourceRoots) {
    if (sourceRoot.href === importer.sourceRoot) {
      continue
    }
    const match = lookupSourceAlias(new URL(suffix, sourceRoot), suffix, importer, index, specifier)
    if (match !== undefined) {
      matches.set(match.file.index, match)
    }
  }
  if (matches.size > 1) {
    throw new Error(`Ambiguous installed registry import ${specifier} in ${importer.entry.standard!.path}`)
  }
  return matches.values().next().value as FileAlias | undefined
}

function resolveAliasedImport(
  requestPath: string,
  importer: KnownStandardFile,
  index: StandardFileIndex,
  specifier: string,
): FileMatch | undefined {
  const sourceMatch = resolveSourceAliasImport(requestPath, importer, index, specifier)
  if (sourceMatch !== undefined) {
    return { ...sourceMatch, style: 'source-alias' }
  }

  const suffix = requestPath.slice(2)
  const srcMatch = lookupLogicalAlias(`src/${suffix}`, suffix, importer, index, specifier)
  if (srcMatch !== undefined) {
    return { ...srcMatch, style: 'src-alias' }
  }
  if (suffix === 'src' || suffix.startsWith('src/')) {
    const projectMatch = lookupLogicalAlias(suffix, suffix, importer, index, specifier)
    if (projectMatch !== undefined) {
      return { ...projectMatch, style: 'project-alias' }
    }
  }
  return undefined
}

function splitSpecifier(specifier: string): { path: string, suffix: string } {
  const query = specifier.indexOf('?')
  const hash = specifier.indexOf('#')
  let split = specifier.length
  if (query >= 0) {
    split = query
  }
  if (hash >= 0 && hash < split) {
    split = hash
  }
  return { path: specifier.slice(0, split), suffix: specifier.slice(split) }
}

function formatTargetPath(match: FileMatch, requestPath: string): string {
  let target = match.file.entry.to
  const targetExtension = posix.extname(target)
  if (codeExtensions[targetExtension.toLowerCase()] !== true) {
    return target
  }

  const requestExtension = posix.extname(requestPath)
  if (match.form === 'index' && posix.basename(target, targetExtension) === 'index') {
    target = posix.dirname(target)
  }
  else if (requestExtension === '') {
    target = target.slice(0, -targetExtension.length)
  }
  else if (codeExtensions[requestExtension.toLowerCase()] === true) {
    target = `${target.slice(0, -targetExtension.length)}${requestExtension}`
  }
  return target
}

function relocatedSpecifier(match: FileMatch, importer: KnownStandardFile, requestPath: string): string {
  const target = formatTargetPath(match, requestPath)
  if (match.style === 'relative' || match.style === 'source-alias') {
    const relocated = posix.relative(posix.dirname(importer.entry.to), target)
    return relocated.startsWith('.') ? relocated : `./${relocated}`
  }

  const prefix = requestPath.slice(0, 2)
  if (match.style === 'project-alias') {
    return `${prefix}${target}`
  }
  return `${prefix}${target.slice('src/'.length)}`
}

function resolveModuleSpecifier(
  specifier: string,
  importer: KnownStandardFile,
  index: StandardFileIndex,
): string | undefined {
  const split = splitSpecifier(specifier)
  let match: FileMatch | undefined
  if (split.path === '.' || split.path === '..' || split.path.startsWith('./') || split.path.startsWith('../')) {
    match = resolveRelativeImport(split.path, importer, index, specifier)
  }
  else if (split.path.startsWith('@/') || split.path.startsWith('~/')) {
    match = resolveAliasedImport(split.path, importer, index, specifier)
  }
  if (match === undefined) {
    return undefined
  }

  const relocated = `${relocatedSpecifier(match, importer, split.path)}${split.suffix}`
  return relocated === specifier ? undefined : relocated
}

function isSyntaxNode(value: unknown): value is SyntaxNode {
  return value !== null && typeof value === 'object' && 'type' in value && typeof value.type === 'string'
}

function moduleLiteral(node: SyntaxNode): SyntaxNode | undefined {
  let value: unknown
  switch (node.type) {
    case 'ImportDeclaration':
    case 'ExportNamedDeclaration':
    case 'ExportAllDeclaration':
      value = node.source
      break
    case 'ImportExpression':
      value = node.source
      break
    case 'TSImportType':
      value = node.argument ?? node.source
      break
    case 'TSExternalModuleReference':
      value = node.expression
      break
    case 'CallExpression': {
      const callee = node.callee
      if (isSyntaxNode(callee) && callee.type === 'Import' && Array.isArray(node.arguments)) {
        value = node.arguments[0]
      }
      break
    }
  }
  if (!isSyntaxNode(value)) {
    return undefined
  }
  if (value.type === 'StringLiteral') {
    return value
  }
  return value.type === 'TemplateLiteral'
    && Array.isArray(value.expressions)
    && value.expressions.length === 0
    ? value
    : undefined
}

function moduleLiteralValue(literal: SyntaxNode): string | undefined {
  if (literal.type === 'StringLiteral') {
    return typeof literal.value === 'string' ? literal.value : undefined
  }

  const quasis = literal.quasis
  if (!Array.isArray(quasis) || quasis.length !== 1) {
    return undefined
  }
  const quasi = quasis[0]
  if (!isSyntaxNode(quasi) || quasi.type !== 'TemplateElement') {
    return undefined
  }
  const value = quasi.value
  return value !== null && typeof value === 'object'
    && 'cooked' in value && typeof value.cooked === 'string'
    ? value.cooked
    : undefined
}

function walkSyntax(root: unknown, visit: (node: SyntaxNode) => void) {
  const stack: unknown[] = [root]
  const seen = new WeakSet<object>()
  while (stack.length > 0) {
    const value = stack.pop()
    if (value === null || typeof value !== 'object' || seen.has(value)) {
      continue
    }
    seen.add(value)
    if (Array.isArray(value)) {
      for (let index = value.length - 1; index >= 0; index -= 1) {
        stack.push(value[index])
      }
      continue
    }

    if (isSyntaxNode(value)) {
      visit(value)
    }
    for (const [key, child] of Object.entries(value)) {
      if (key !== 'loc' && key !== 'extra' && key !== 'comments' && key !== 'tokens' && key !== 'errors') {
        stack.push(child)
      }
    }
  }
}

function parserPlugins(language: string | undefined, label: string): NonNullable<NonNullable<Parameters<typeof babelParse>[1]>['plugins']> {
  const normalized = language?.toLowerCase()
  const plugins: NonNullable<NonNullable<Parameters<typeof babelParse>[1]>['plugins']> = ['decorators-legacy']
  if (normalized === 'ts' || normalized === 'typescript' || normalized === 'tsx') {
    plugins.push('typescript')
  }
  else if (normalized !== undefined && normalized !== 'js' && normalized !== 'javascript' && normalized !== 'jsx') {
    throw new Error(`Cannot rewrite imports in ${label}: unsupported script language ${language}`)
  }
  if (normalized === undefined || normalized === 'js' || normalized === 'javascript' || normalized === 'jsx' || normalized === 'tsx') {
    plugins.push('jsx')
  }
  return plugins
}

type LiteralQuote = '\'' | '"' | '`'

function escapedLiteralContent(value: string, quote: LiteralQuote): string {
  const escaped = value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
  if (quote === '\'') {
    return escaped.replaceAll('\'', '\\\'')
  }
  if (quote === '"') {
    return escaped.replaceAll('"', '\\"')
  }
  return escaped
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${')
}

function collectScriptPatches(
  source: string,
  sourceOffset: number,
  language: string | undefined,
  importer: KnownStandardFile,
  index: StandardFileIndex,
): TextPatch[] {
  let ast: unknown
  try {
    ast = babelParse(source, {
      plugins: parserPlugins(language, importer.entry.standard!.path),
      sourceType: 'unambiguous',
    })
  }
  catch (error) {
    throw new Error(`Cannot rewrite imports in ${importer.entry.standard!.path}: ${errorReason(error)}`, { cause: error })
  }

  const patches: TextPatch[] = []
  walkSyntax(ast, (node) => {
    const literal = moduleLiteral(node)
    if (literal === undefined) {
      return
    }
    const value = moduleLiteralValue(literal)
    const start = literal.start
    const end = literal.end
    if (value === undefined || typeof start !== 'number' || typeof end !== 'number'
      || !Number.isInteger(start) || !Number.isInteger(end)
      || start < 0 || end > source.length || end - start < 2) {
      throw new Error(`Cannot rewrite an unsupported import literal in ${importer.entry.standard!.path}`)
    }

    let quote: LiteralQuote
    if (literal.type === 'TemplateLiteral') {
      if (source[start] !== '`' || source[end - 1] !== '`') {
        throw new Error(`Cannot rewrite an unsupported import literal in ${importer.entry.standard!.path}`)
      }
      quote = '`'
    }
    else {
      const sourceQuote = source[start]
      if ((sourceQuote !== '\'' && sourceQuote !== '"') || source[end - 1] !== sourceQuote) {
        throw new Error(`Cannot rewrite an unsupported import literal in ${importer.entry.standard!.path}`)
      }
      quote = sourceQuote
    }
    const relocated = resolveModuleSpecifier(value, importer, index)
    if (relocated === undefined) {
      return
    }
    patches.push({
      start: sourceOffset + start + 1,
      end: sourceOffset + end - 1,
      value: escapedLiteralContent(relocated, quote),
    })
  })
  return patches
}

function collectVuePatches(source: string, importer: KnownStandardFile, index: StandardFileIndex): TextPatch[] {
  const parsed = parseSfc(source, { filename: importer.entry.standard!.path })
  if (parsed.errors.length > 0) {
    throw new Error(
      `Cannot rewrite imports in ${importer.entry.standard!.path}: ${parsed.errors.map(errorReason).join('; ')}`,
    )
  }

  const patches: TextPatch[] = []
  for (const block of [parsed.descriptor.script, parsed.descriptor.scriptSetup]) {
    if (block === null || block.content === '') {
      continue
    }
    const offset = block.loc.start.offset
    if (source.slice(offset, offset + block.content.length) !== block.content) {
      throw new Error(`Cannot locate a Vue script block in ${importer.entry.standard!.path}`)
    }
    patches.push(...collectScriptPatches(block.content, offset, block.lang, importer, index))
  }
  return patches
}

function codeLanguage(path: string): string | undefined {
  const extension = posix.extname(path).toLowerCase()
  switch (extension) {
    case '.ts':
    case '.mts':
    case '.cts':
      return 'ts'
    case '.tsx':
      return 'tsx'
    case '.jsx':
      return 'jsx'
    case '.js':
    case '.mjs':
    case '.cjs':
      return 'js'
    default:
      return undefined
  }
}

function applyPatches(source: string, patches: TextPatch[]): string {
  let rewritten = source
  patches.sort((left, right) => right.start - left.start)
  for (const patch of patches) {
    rewritten = `${rewritten.slice(0, patch.start)}${patch.value}${rewritten.slice(patch.end)}`
  }
  return rewritten
}

export function rewriteStandardFileImports(
  files: readonly StandardFilePlanEntry[],
  contents: readonly Buffer[],
): Buffer[] {
  if (files.length !== contents.length) {
    throw new Error(`Registry file/content count mismatch: ${files.length} files, ${contents.length} contents`)
  }

  const index = buildStandardFileIndex(files)
  return files.map((entry, fileIndex) => {
    const content = contents[fileIndex]!
    const known = index.byEntryIndex[fileIndex]
    if (known === undefined) {
      return content
    }

    const extension = posix.extname(entry.standard!.path).toLowerCase()
    const language = codeLanguage(entry.standard!.path)
    if (extension !== '.vue' && language === undefined) {
      return content
    }
    if (!isUtf8(content)) {
      throw new Error(`Cannot rewrite non-UTF-8 registry code file: ${entry.standard!.path}`)
    }

    const source = content.toString('utf8')
    const patches = extension === '.vue'
      ? collectVuePatches(source, known, index)
      : collectScriptPatches(source, 0, language, known, index)
    return patches.length === 0 ? content : Buffer.from(applyPatches(source, patches), 'utf8')
  })
}
