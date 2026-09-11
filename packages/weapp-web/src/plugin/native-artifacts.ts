import type { Plugin, ResolvedConfig } from 'vite'
import type { NativeArtifactsPluginOptions } from './options.ts'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { isAbsolute, join, posix, relative, resolve, sep } from 'node:path'
import { StyleSheetTransformer } from 'glass-easel-stylesheet-compiler'
import { TmplGroup } from 'glass-easel-template-compiler'
import * as ts from 'typescript'
import { nativeTemplates } from '../runtime/native-templates.ts'
import { assertNativeArtifactsOptions, nativeArtifactModuleId, resolvedNativeArtifactModuleId, resolvePluginPath } from './options.ts'
import { looksLikeAssetReference, scanCss, scanWxml } from './source-scanners.ts'

const nativeTagPrefix = 'wx-'

const styleIsolationValues: Record<string, true> = {
  'apply-shared': true,
  'isolated': true,
  'page-apply-shared': true,
  'page-isolated': true,
  'page-shared': true,
  'shared': true,
}

const pluginNativeComponents: Record<string, string> = {
  'plugin://varoRobot/chat': 'wechat-robot-chat',
}

const factoryGlobalNames = [
  'App',
  'Page',
  'Component',
  'Behavior',
  'wx',
  'requirePlugin',
  'getApp',
  'getCurrentPages',
  'globalThis',
  'global',
  'window',
  'document',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'queueMicrotask',
] as const

interface SerializableStaticConfig {
  addGlobalClass?: boolean
  component?: boolean
  componentGenerics?: Record<string, true | { default?: string }>
  componentPlaceholder?: Record<string, string>
  pureDataPattern?: string
  styleIsolation?: string
  usingComponents?: Record<string, string>
}

interface SourceFile {
  absolutePath: string
  content: string
  relativePath: string
}

interface ComponentSource {
  config: SerializableStaticConfig
  javaScript: SourceFile
  key: string
  template: SourceFile
}

interface CompilerDiagnostic {
  code?: number
  isError: boolean
  message: string
  path?: string
  startColumn?: number
  startLine?: number
}

interface AssetFile {
  absolutePath: string
  relativePath: string
}

interface AssetValue {
  file: AssetFile
  suffix: string
}

interface AssetBinding extends AssetValue {
  token: string
}

interface RenderedAsset extends AssetFile {
  variableName: string
}

interface CompiledStyle {
  content: string
  lowPriorityContent: string
}

interface TextReplacement {
  end: number
  start: number
  value: string
}

function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('code' in error)) { return undefined }
  return typeof error.code === 'string' ? error.code : undefined
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function isWithin(root: string, candidate: string): boolean {
  const pathFromRoot = relative(root, candidate)
  return pathFromRoot === '' || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..' && !isAbsolute(pathFromRoot))
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareStrings)
}

function assertSameDependencies(path: string, kind: string, scanned: readonly string[], compiled: readonly string[]): void {
  const scannedList = sortedUnique(scanned)
  const compiledList = sortedUnique(compiled)
  if (scannedList.length !== compiledList.length || scannedList.some((value, index) => value !== compiledList[index])) {
    throw new Error(
      `[varo-native-artifacts] ${kind} dependency scan disagreed with glass-easel-template-compiler for ${path}. `
      + `Scanner: ${JSON.stringify(scannedList)}; compiler: ${JSON.stringify(compiledList)}`,
    )
  }
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`[varo-native-artifacts] ${label} returned an unexpected value`)
  }
  const items: unknown[] = value
  if (items.some(item => typeof item !== 'string')) {
    throw new Error(`[varo-native-artifacts] ${label} returned an unexpected value`)
  }
  return items as string[]
}

function compilerDiagnostics(value: unknown): CompilerDiagnostic[] {
  if (value === undefined || value === null) { return [] }
  if (!Array.isArray(value)) { throw new TypeError('[varo-native-artifacts] Compiler returned malformed diagnostics') }
  const items: unknown[] = value
  return items.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`[varo-native-artifacts] Compiler returned malformed diagnostic ${index}`)
    }
    const candidate = item as Record<string, unknown>
    if (typeof candidate.isError !== 'boolean' || typeof candidate.message !== 'string') {
      throw new TypeError(`[varo-native-artifacts] Compiler returned malformed diagnostic ${index}`)
    }
    const diagnostic: CompilerDiagnostic = {
      isError: candidate.isError,
      message: candidate.message,
    }
    for (const key of ['code', 'startColumn', 'startLine'] as const) {
      if (typeof candidate[key] === 'number') { diagnostic[key] = candidate[key] }
    }
    if (typeof candidate.path === 'string') { diagnostic.path = candidate.path }
    return diagnostic
  })
}

function reportCompilerDiagnostics(
  diagnostics: readonly CompilerDiagnostic[],
  fallbackPath: string,
  warn: (message: string) => void,
): void {
  const errors: string[] = []
  for (const diagnostic of diagnostics) {
    const path = diagnostic.path ?? fallbackPath
    const location = diagnostic.startLine === undefined
      ? path
      : `${path}:${diagnostic.startLine}:${diagnostic.startColumn ?? 0}`
    const code = diagnostic.code === undefined ? '' : ` (#${diagnostic.code})`
    const message = `${location}${code}: ${diagnostic.message}`
    errors.push(message)
    if (!diagnostic.isError) { warn(`[glass-easel-compiler] ${message}`) }
  }
  if (errors.length > 0) {
    throw new Error(`[varo-native-artifacts] Native compiler rejected input:\n${errors.join('\n')}`)
  }
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`[varo-native-artifacts] ${label} must be a JSON object`)
  }
  return value as Record<string, unknown>
}

function optionalStringRecord(value: unknown, label: string): Record<string, string> | undefined {
  if (value === undefined) { return undefined }
  const source = objectValue(value, label)
  const result: Record<string, string> = {}
  for (const key of Object.keys(source).sort(compareStrings)) {
    if (typeof source[key] !== 'string' || source[key].length === 0) {
      throw new Error(`[varo-native-artifacts] ${label}.${key} must be a non-empty string`)
    }
    result[key] = source[key]
  }
  return result
}

function parseStaticConfig(
  source: string,
  path: string,
  globalUsingComponents: Readonly<Record<string, string>>,
): SerializableStaticConfig {
  let parsed: unknown
  try {
    parsed = JSON.parse(source)
  }
  catch (error) {
    throw new Error(`[varo-native-artifacts] Invalid JSON in ${path}: ${describeError(error)}`)
  }
  const input = objectValue(parsed, path)
  const output: SerializableStaticConfig = {}
  if (input.component !== undefined) {
    if (typeof input.component !== 'boolean') { throw new TypeError(`[varo-native-artifacts] ${path}.component must be boolean`) }
    output.component = input.component
  }
  if (input.addGlobalClass !== undefined) {
    if (typeof input.addGlobalClass !== 'boolean') { throw new TypeError(`[varo-native-artifacts] ${path}.addGlobalClass must be boolean`) }
    output.addGlobalClass = input.addGlobalClass
  }
  if (input.pureDataPattern !== undefined) {
    if (typeof input.pureDataPattern !== 'string') { throw new TypeError(`[varo-native-artifacts] ${path}.pureDataPattern must be a string`) }
    output.pureDataPattern = input.pureDataPattern
  }
  if (input.styleIsolation !== undefined) {
    if (typeof input.styleIsolation !== 'string' || !styleIsolationValues[input.styleIsolation]) {
      throw new Error(`[varo-native-artifacts] Unsupported styleIsolation in ${path}: ${String(input.styleIsolation)}`)
    }
    output.styleIsolation = input.styleIsolation
  }
  const localUsingComponents = optionalStringRecord(input.usingComponents, `${path}.usingComponents`)
  const mergedUsingComponents: Record<string, string> = {}
  for (const [tag, specifier] of Object.entries({ ...globalUsingComponents, ...localUsingComponents })) {
    if (pluginNativeComponents[specifier] === tag) { continue }
    if (pluginNativeComponents[specifier]) {
      throw new Error(`[varo-native-artifacts] Plugin component ${specifier} must be registered as <${pluginNativeComponents[specifier]}>`)
    }
    mergedUsingComponents[tag] = specifier
  }
  if (Object.keys(mergedUsingComponents).length > 0) { output.usingComponents = mergedUsingComponents }
  const placeholders = optionalStringRecord(input.componentPlaceholder, `${path}.componentPlaceholder`)
  if (placeholders) { output.componentPlaceholder = placeholders }
  if (input.componentGenerics !== undefined) {
    const generics = objectValue(input.componentGenerics, `${path}.componentGenerics`)
    const parsedGenerics: Record<string, true | { default?: string }> = {}
    for (const key of Object.keys(generics).sort(compareStrings)) {
      const value = generics[key]
      if (value === true) {
        parsedGenerics[key] = true
        continue
      }
      const generic = objectValue(value, `${path}.componentGenerics.${key}`)
      if (generic.default !== undefined && (typeof generic.default !== 'string' || generic.default.length === 0)) {
        throw new Error(`[varo-native-artifacts] ${path}.componentGenerics.${key}.default must be a non-empty string`)
      }
      parsedGenerics[key] = generic.default === undefined ? {} : { default: generic.default }
    }
    output.componentGenerics = parsedGenerics
  }
  return output
}

function resolveMiniProgramKey(importerKey: string, specifier: string, kind: string): string {
  if (!specifier || specifier.includes('\0') || specifier.includes('\\') || specifier.includes('?') || specifier.includes('#')) {
    throw new Error(`[varo-native-artifacts] Unsafe ${kind} path ${JSON.stringify(specifier)} referenced by ${importerKey}`)
  }
  if (specifier.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(specifier)) {
    throw new Error(`[varo-native-artifacts] Only local mini-program paths and plugin:// components can run in Web Preview: ${specifier} (referenced by ${importerKey})`)
  }
  const unresolved = specifier.startsWith('/')
    ? specifier.slice(1)
    : posix.join(posix.dirname(importerKey), specifier)
  const normalized = posix.normalize(unresolved)
  if (!normalized || normalized === '.' || normalized === '..' || normalized.startsWith('../') || posix.isAbsolute(normalized)) {
    throw new Error(`[varo-native-artifacts] ${kind} path escapes the native build root: ${specifier} (referenced by ${importerKey})`)
  }
  return normalized
}

function resolveComponentKey(importerKey: string, specifier: string): string {
  const key = resolveMiniProgramKey(importerKey, specifier, 'component')
  const extension = posix.extname(key)
  if (!extension) { return key }
  if (extension === '.js' || extension === '.json' || extension === '.wxml') { return key.slice(0, -extension.length) }
  throw new Error(`[varo-native-artifacts] Component path must omit its extension: ${specifier} (referenced by ${importerKey})`)
}

function resolveModuleCandidates(importerKey: string, specifier: string): string[] {
  const key = resolveMiniProgramKey(importerKey, specifier, 'CommonJS module')
  const extension = posix.extname(key)
  if (!extension) { return [`${key}.js`, `${key}/index.js`] }
  if (extension !== '.js') {
    throw new Error(`[varo-native-artifacts] CommonJS dependency must resolve to .js: ${specifier} (required by ${importerKey})`)
  }
  return [key]
}

function splitPathSuffix(specifier: string): { path: string, suffix: string } {
  const suffixStart = specifier.search(/[?#]/)
  return suffixStart < 0
    ? { path: specifier, suffix: '' }
    : { path: specifier.slice(0, suffixStart), suffix: specifier.slice(suffixStart) }
}

function preservedExternalReference(specifier: string, owner: string): boolean {
  if (specifier.startsWith('#')) { return true }
  if (/^data:/i.test(specifier)) {
    if (!/^data:[^,\s]*,/i.test(specifier)) {
      throw new Error(`[varo-native-artifacts] Invalid data URL in ${owner}`)
    }
    return true
  }
  if (/^https:/i.test(specifier)) {
    let parsed: URL
    try {
      parsed = new URL(specifier)
    }
    catch {
      throw new Error(`[varo-native-artifacts] Invalid HTTPS asset URL in ${owner}: ${specifier}`)
    }
    if (parsed.protocol !== 'https:' || !parsed.hostname) {
      throw new Error(`[varo-native-artifacts] Invalid HTTPS asset URL in ${owner}: ${specifier}`)
    }
    return true
  }
  if (specifier.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(specifier)) {
    throw new Error(`[varo-native-artifacts] Unsafe asset URL in ${owner}: ${specifier}. Use a local path, data URL, or HTTPS URL.`)
  }
  return false
}

function resolveLocalFileKey(ownerFile: string, specifier: string, kind: string): { key: string, suffix: string } {
  if (!specifier || specifier.includes('\0') || specifier.includes('\\')) {
    throw new Error(`[varo-native-artifacts] Unsafe ${kind} path ${JSON.stringify(specifier)} in ${ownerFile}`)
  }
  const separated = splitPathSuffix(specifier)
  const unresolved = separated.path.startsWith('/')
    ? separated.path.slice(1)
    : posix.join(posix.dirname(ownerFile), separated.path)
  const key = posix.normalize(unresolved)
  if (!key || key === '.' || key === '..' || key.startsWith('../') || posix.isAbsolute(key)) {
    throw new Error(`[varo-native-artifacts] ${kind} path escapes the native build root: ${specifier} (in ${ownerFile})`)
  }
  return { key, suffix: separated.suffix }
}

function applyReplacements(source: string, replacements: readonly TextReplacement[], owner: string): string {
  if (replacements.length === 0) { return source }
  const ordered = [...replacements].sort((left, right) => left.start - right.start)
  const chunks: string[] = []
  let cursor = 0
  for (const replacement of ordered) {
    if (replacement.start < cursor || replacement.end < replacement.start || replacement.end > source.length) {
      throw new Error(`[varo-native-artifacts] Overlapping source rewrite while processing ${owner}`)
    }
    chunks.push(source.slice(cursor, replacement.start), replacement.value)
    cursor = replacement.end
  }
  chunks.push(source.slice(cursor))
  return chunks.join('')
}

class NativeSourceReader {
  readonly inputs = new Map<string, Buffer>()
  readonly root: string
  readonly realRoot: string
  private readonly cache = new Map<string, SourceFile>()
  private readonly watch: (path: string) => void

  private constructor(root: string, realRoot: string, watch: (path: string) => void) {
    this.root = root
    this.realRoot = realRoot
    this.watch = watch
  }

  static async create(root: string, watch: (path: string) => void): Promise<NativeSourceReader> {
    let realRoot: string
    try {
      const stat = await fs.stat(root)
      if (!stat.isDirectory()) { throw new Error('path is not a directory') }
      realRoot = await fs.realpath(root)
    }
    catch (error) {
      if (errorCode(error) === 'ENOENT') {
        throw new Error(
          `[varo-native-artifacts] Native mini-program build is missing at ${root}. `
          + 'Run "pnpm --filter @varo/playground-weapp build" from the repository root, then restart the preview.',
        )
      }
      throw new Error(`[varo-native-artifacts] Cannot read native mini-program build at ${root}: ${describeError(error)}`)
    }
    return new NativeSourceReader(root, realRoot, watch)
  }

  private async resolveFile(relativePath: string): Promise<{ absolutePath: string, relativePath: string }> {
    if (!relativePath || relativePath.includes('\0') || relativePath.includes('\\') || posix.isAbsolute(relativePath)) {
      throw new Error(`[varo-native-artifacts] Unsafe native build path: ${relativePath}`)
    }
    const normalized = posix.normalize(relativePath)
    const lexicalPath = resolve(this.root, ...normalized.split('/'))
    if (!isWithin(this.root, lexicalPath)) {
      throw new Error(`[varo-native-artifacts] Native build path escapes its root: ${relativePath}`)
    }
    let realPath: string
    try {
      realPath = await fs.realpath(lexicalPath)
    }
    catch (error) {
      if (errorCode(error) === 'ENOENT') {
        throw new Error(
          `[varo-native-artifacts] Missing native artifact ${normalized}. `
          + 'Regenerate apps/playground-weapp/devtools/build/mp-weixin before starting Web Preview.',
        )
      }
      throw error
    }
    if (!isWithin(this.realRoot, realPath)) {
      throw new Error(`[varo-native-artifacts] Native artifact resolves outside the build root: ${relativePath}`)
    }
    const stat = await fs.stat(realPath)
    if (!stat.isFile()) { throw new Error(`[varo-native-artifacts] Native artifact is not a file: ${relativePath}`) }
    this.watch(realPath)
    return { absolutePath: realPath, relativePath: normalized }
  }

  async readText(relativePath: string): Promise<SourceFile> {
    const normalized = posix.normalize(relativePath)
    const cached = this.cache.get(normalized)
    if (cached) { return cached }
    const file = await this.resolveFile(normalized)
    const bytes = await fs.readFile(file.absolutePath)
    const source = { ...file, content: bytes.toString('utf8') }
    this.cache.set(normalized, source)
    this.inputs.set(`native/${normalized}`, bytes)
    return source
  }

  async readTextIfExists(relativePath: string): Promise<SourceFile | null> {
    try {
      return await this.readText(relativePath)
    }
    catch (error) {
      if (error instanceof Error && error.message.startsWith('[varo-native-artifacts] Missing native artifact ')) { return null }
      throw error
    }
  }

  async readAsset(relativePath: string): Promise<AssetFile> {
    const file = await this.resolveFile(relativePath)
    if (!this.inputs.has(`native/${file.relativePath}`)) {
      this.inputs.set(`native/${file.relativePath}`, await fs.readFile(file.absolutePath))
    }
    return file
  }

  digest(): string {
    const hash = createHash('sha256')
    for (const [path, content] of [...this.inputs.entries()].sort(([left], [right]) => compareStrings(left, right))) {
      hash.update(String(Buffer.byteLength(path)))
      hash.update(':')
      hash.update(path)
      hash.update(':')
      hash.update(String(content.byteLength))
      hash.update(':')
      hash.update(content)
      hash.update('\0')
    }
    return hash.digest('hex')
  }
}

class AssetRegistry {
  private readonly aliases = new Map<string, AssetValue>()
  private readonly files = new Map<string, AssetFile>()
  private readonly tokens = new Map<string, AssetValue>()
  private readonly reader: NativeSourceReader

  constructor(reader: NativeSourceReader) {
    this.reader = reader
  }

  private addAlias(alias: string, value: AssetValue, owner: string): void {
    const existing = this.aliases.get(alias)
    if (existing && (existing.file.relativePath !== value.file.relativePath || existing.suffix !== value.suffix)) {
      throw new Error(
        `[varo-native-artifacts] Asset reference ${JSON.stringify(alias)} is ambiguous: it resolves to both `
        + `${existing.file.relativePath} and ${value.file.relativePath}. Use root-relative asset paths (in ${owner}).`,
      )
    }
    this.aliases.set(alias, value)
  }

  async add(specifier: string, ownerFile: string): Promise<AssetBinding | null> {
    if (preservedExternalReference(specifier, ownerFile)) { return null }
    const resolved = resolveLocalFileKey(ownerFile, specifier, 'asset')
    const file = await this.reader.readAsset(resolved.key)
    this.files.set(file.relativePath, file)
    const value = { file, suffix: resolved.suffix }
    this.addAlias(specifier, value, ownerFile)
    this.addAlias(file.relativePath, { file, suffix: '' }, ownerFile)
    this.addAlias(`/${file.relativePath}`, { file, suffix: '' }, ownerFile)
    const token = `__VARO_NATIVE_ASSET_${createHash('sha256').update(`${file.relativePath}\0${resolved.suffix}`).digest('hex').slice(0, 20)}__`
    const existingToken = this.tokens.get(token)
    if (existingToken && (existingToken.file.relativePath !== file.relativePath || existingToken.suffix !== resolved.suffix)) {
      throw new Error('[varo-native-artifacts] Asset placeholder collision')
    }
    this.tokens.set(token, value)
    return { ...value, token }
  }

  renderedFiles(): RenderedAsset[] {
    return [...this.files.values()]
      .sort((left, right) => compareStrings(left.relativePath, right.relativePath))
      .map((file, index) => ({ ...file, variableName: `__nativeAsset${index}` }))
  }

  renderAssetMap(variableByFile: ReadonlyMap<string, string>): string {
    const properties = [...this.aliases.entries()]
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([alias, value]) => {
        const variableName = variableByFile.get(value.file.relativePath)
        if (!variableName) { throw new Error(`[varo-native-artifacts] Missing emitted asset for ${value.file.relativePath}`) }
        const expression = value.suffix ? `${variableName} + ${JSON.stringify(value.suffix)}` : variableName
        return `${JSON.stringify(alias)}: ${expression}`
      })
    return `{\n${properties.join(',\n')}\n}`
  }

  renderInterpolated(source: string, variableByFile: ReadonlyMap<string, string>): string {
    const occurrences: { end: number, expression: string, start: number }[] = []
    for (const [token, value] of this.tokens) {
      const variableName = variableByFile.get(value.file.relativePath)
      if (!variableName) { throw new Error(`[varo-native-artifacts] Missing emitted asset for ${value.file.relativePath}`) }
      const expression = value.suffix ? `${variableName} + ${JSON.stringify(value.suffix)}` : variableName
      let offset = source.indexOf(token)
      while (offset >= 0) {
        occurrences.push({ end: offset + token.length, expression, start: offset })
        offset = source.indexOf(token, offset + token.length)
      }
    }
    if (occurrences.length === 0) { return JSON.stringify(source) }
    occurrences.sort((left, right) => left.start - right.start)
    const expressions: string[] = []
    let cursor = 0
    for (const occurrence of occurrences) {
      if (occurrence.start < cursor) { throw new Error('[varo-native-artifacts] Overlapping asset placeholders') }
      if (occurrence.start > cursor) { expressions.push(JSON.stringify(source.slice(cursor, occurrence.start))) }
      expressions.push(`(${occurrence.expression})`)
      cursor = occurrence.end
    }
    if (cursor < source.length) { expressions.push(JSON.stringify(source.slice(cursor))) }
    return expressions.join(' + ')
  }
}

function inspectJavaScript(source: string, path: string): { assets: string[], requires: string[] } {
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  const assets: string[] = []
  const requires: string[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require') {
      if (node.arguments.length !== 1 || !ts.isStringLiteralLike(node.arguments[0])) {
        const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
        throw new Error(
          `[varo-native-artifacts] Dynamic require is not supported in ${path}:${position.line + 1}:${position.character + 1}; `
          + 'use a static string literal so its native dependency can be bundled.',
        )
      }
      requires.push(node.arguments[0].text)
    }
    else if (ts.isStringLiteralLike(node)) {
      const parent = node.parent
      const isRequireArgument = ts.isCallExpression(parent)
        && ts.isIdentifier(parent.expression)
        && parent.expression.text === 'require'
        && parent.arguments[0] === node
      if (!isRequireArgument && looksLikeAssetReference(node.text)) { assets.push(node.text) }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return { assets: sortedUnique(assets), requires: sortedUnique(requires) }
}

async function collectComponents(
  reader: NativeSourceReader,
  globalUsingComponents: Readonly<Record<string, string>>,
  pages: Readonly<Record<string, string>>,
): Promise<Map<string, ComponentSource>> {
  const components = new Map<string, ComponentSource>()
  const pending = new Map<string, string>(Object.values(pages).map(page => [page, 'preview scenario']))
  while (pending.size > 0) {
    const key = [...pending.keys()].sort(compareStrings)[0]
    if (!key) { break }
    const referencedBy = pending.get(key) ?? 'unknown component'
    pending.delete(key)
    if (components.has(key)) { continue }
    let configFile: SourceFile
    let template: SourceFile
    let javaScript: SourceFile
    try {
      ;[configFile, template, javaScript] = await Promise.all([
        reader.readText(`${key}.json`),
        reader.readText(`${key}.wxml`),
        reader.readText(`${key}.js`),
      ])
    }
    catch (error) {
      throw new Error(`[varo-native-artifacts] Cannot load ${key}, referenced by ${referencedBy}: ${describeError(error)}`)
    }
    const config = parseStaticConfig(configFile.content, configFile.relativePath, globalUsingComponents)
    const availableTags = new Set([
      ...Object.keys(nativeTemplates),
      ...Object.keys(config.usingComponents ?? {}),
      ...Object.keys(config.componentGenerics ?? {}),
      'block',
      'slot',
      'template',
      'import',
      'include',
      'wxs',
    ])
    for (const tag of scanWxml(template.content).tags) {
      if (!availableTags.has(tag)) {
        throw new Error(`[varo-native-artifacts] ${template.relativePath} uses <${tag}> without a supported native element or usingComponents registration`)
      }
    }
    components.set(key, { config, javaScript, key, template })
    const dependencies: { key: string, origin: string }[] = []
    for (const [tag, specifier] of Object.entries(config.usingComponents ?? {})) {
      if (pluginNativeComponents[specifier]) { continue }
      dependencies.push({ key: resolveComponentKey(key, specifier), origin: `${key}.usingComponents.${tag}` })
    }
    for (const [genericName, generic] of Object.entries(config.componentGenerics ?? {})) {
      if (generic !== true && generic.default) {
        dependencies.push({ key: resolveComponentKey(key, generic.default), origin: `${key}.componentGenerics.${genericName}.default` })
      }
    }
    for (const dependency of dependencies.sort((left, right) => compareStrings(left.key, right.key))) {
      if (!components.has(dependency.key) && !pending.has(dependency.key)) { pending.set(dependency.key, dependency.origin) }
    }
  }
  return components
}

async function compileBusinessTemplates(
  reader: NativeSourceReader,
  assets: AssetRegistry,
  components: ReadonlyMap<string, ComponentSource>,
  development: boolean,
  warn: (message: string) => void,
): Promise<string> {
  const group = development ? TmplGroup.newDev() : new TmplGroup()
  try {
    const templateSources = new Map<string, SourceFile>()
    for (const component of components.values()) { templateSources.set(component.key, component.template) }
    const pendingTemplates = new Set(templateSources.keys())
    const pendingScripts = new Set<string>()
    const addedTemplates = new Set<string>()
    while (pendingTemplates.size > 0) {
      const key = [...pendingTemplates].sort(compareStrings)[0]
      if (!key) { break }
      pendingTemplates.delete(key)
      if (addedTemplates.has(key)) { continue }
      const templateFile = templateSources.get(key)
        ?? await reader.readText(`${key}.wxml`)
      templateSources.set(key, templateFile)
      let scan
      try {
        scan = scanWxml(templateFile.content)
      }
      catch (error) {
        throw new Error(`[varo-native-artifacts] Cannot scan ${templateFile.relativePath}: ${describeError(error)}`)
      }
      for (const assetReference of scan.assets) { await assets.add(assetReference, templateFile.relativePath) }
      const rawDiagnostics: unknown = group.addTmpl(key, templateFile.content)
      reportCompilerDiagnostics(compilerDiagnostics(rawDiagnostics), templateFile.relativePath, warn)
      addedTemplates.add(key)
      const scannedTemplateDependencies = scan.dependencies
        .filter(dependency => dependency.kind === 'template')
        .map(dependency => resolveMiniProgramKey(
          key,
          dependency.specifier.endsWith('.wxml')
            ? dependency.specifier.slice(0, -'.wxml'.length)
            : dependency.specifier,
          'WXML dependency',
        ))
      const scannedScriptDependencies = scan.dependencies
        .filter(dependency => dependency.kind === 'script')
        .map(dependency => resolveMiniProgramKey(
          key,
          dependency.specifier.endsWith('.wxs')
            ? dependency.specifier.slice(0, -'.wxs'.length)
            : dependency.specifier,
          'WXS dependency',
        ))
      const compiledTemplateDependencies = stringArray(group.getDirectDependencies(key), `WXML dependencies for ${key}`)
      const compiledScriptDependencies = stringArray(group.getScriptDependencies(key), `WXS dependencies for ${key}`)
      assertSameDependencies(key, 'WXML', scannedTemplateDependencies, compiledTemplateDependencies)
      assertSameDependencies(key, 'WXS', scannedScriptDependencies, compiledScriptDependencies)
      for (const dependency of compiledTemplateDependencies) {
        if (dependency === '..' || dependency.startsWith('../') || posix.isAbsolute(dependency)) {
          throw new Error(`[varo-native-artifacts] WXML dependency escapes the native build root: ${dependency} (from ${key})`)
        }
        if (!addedTemplates.has(dependency)) { pendingTemplates.add(dependency) }
      }
      for (const dependency of compiledScriptDependencies) { pendingScripts.add(dependency) }
    }
    const addedScripts = new Set<string>()
    while (pendingScripts.size > 0) {
      const key = [...pendingScripts].sort(compareStrings)[0]
      if (!key) { break }
      pendingScripts.delete(key)
      if (addedScripts.has(key)) { continue }
      const scriptFile = await reader.readText(key.endsWith('.wxs') ? key : `${key}.wxs`)
      group.addScript(key, scriptFile.content)
      addedScripts.add(key)
      const metadata = inspectJavaScript(scriptFile.content, scriptFile.relativePath)
      for (const specifier of metadata.requires) {
        const dependency = resolveMiniProgramKey(key, specifier, 'WXS require')
        if (!addedScripts.has(dependency)) { pendingScripts.add(dependency) }
      }
    }
    return group.getTmplGenObjectGroups()
  }
  catch (error) {
    if (error instanceof Error && error.message.startsWith('[varo-native-artifacts]')) { throw error }
    throw new Error(`[varo-native-artifacts] Failed to compile native WXML: ${describeError(error)}`)
  }
  finally {
    group.free()
  }
}

function compileBuiltinTemplates(development: boolean, warn: (message: string) => void): { expression: string, keys: string[], inputs: Map<string, Buffer> } {
  const entries = Object.entries(nativeTemplates).sort(([left], [right]) => compareStrings(left, right))
  const group = development ? TmplGroup.newDev() : new TmplGroup()
  const inputs = new Map<string, Buffer>()
  try {
    for (const [key, source] of entries) {
      if (!/^[a-z][a-z\d-]*$/.test(key) || typeof source !== 'string') {
        throw new Error(`[varo-native-artifacts] Invalid nativeTemplates entry ${JSON.stringify(key)}`)
      }
      const rawDiagnostics: unknown = group.addTmpl(key, source)
      reportCompilerDiagnostics(compilerDiagnostics(rawDiagnostics), `nativeTemplates.${key}`, warn)
      const templateDependencies = stringArray(group.getDirectDependencies(key), `native template dependencies for ${key}`)
      const scriptDependencies = stringArray(group.getScriptDependencies(key), `native template script dependencies for ${key}`)
      if (scriptDependencies.length > 0) {
        throw new Error(`[varo-native-artifacts] nativeTemplates.${key} must be self-contained`)
      }
      const unknownDependencies = templateDependencies.filter(dependency => Object.hasOwn(nativeTemplates, dependency) || !/^[a-z][a-z\d-]*$/.test(dependency))
      if (unknownDependencies.length > 0) {
        throw new Error(`[varo-native-artifacts] nativeTemplates.${key} has unsupported template dependencies: ${unknownDependencies.join(', ')}`)
      }
      inputs.set(`builtin/${key}.wxml`, Buffer.from(source))
    }
    return { expression: group.getTmplGenObjectGroups(), inputs, keys: entries.map(([key]) => key) }
  }
  finally {
    group.free()
  }
}

async function inlineWxss(
  reader: NativeSourceReader,
  assets: AssetRegistry,
  relativePath: string,
  stack: ReadonlySet<string>,
): Promise<string> {
  if (stack.has(relativePath)) {
    throw new Error(`[varo-native-artifacts] Circular WXSS import: ${[...stack, relativePath].join(' -> ')}`)
  }
  const file = await reader.readText(relativePath)
  let scan
  try {
    scan = scanCss(file.content)
  }
  catch (error) {
    throw new Error(`[varo-native-artifacts] Cannot scan ${relativePath}: ${describeError(error)}`)
  }
  const nextStack = new Set(stack)
  nextStack.add(relativePath)
  const replacements: TextReplacement[] = []
  for (const reference of scan.imports) {
    if (preservedExternalReference(reference.specifier, relativePath)) { continue }
    const resolvedImport = resolveLocalFileKey(relativePath, reference.specifier, 'WXSS import')
    if (resolvedImport.suffix) {
      throw new Error(`[varo-native-artifacts] Local WXSS imports cannot contain a query or fragment: ${reference.specifier} (in ${relativePath})`)
    }
    const importedPath = posix.extname(resolvedImport.key) ? resolvedImport.key : `${resolvedImport.key}.wxss`
    if (posix.extname(importedPath) !== '.wxss') {
      throw new Error(`[varo-native-artifacts] WXSS import must resolve to .wxss: ${reference.specifier} (in ${relativePath})`)
    }
    replacements.push({
      end: reference.end,
      start: reference.start,
      value: await inlineWxss(reader, assets, importedPath, nextStack),
    })
  }
  for (const reference of scan.urls) {
    const binding = await assets.add(reference.specifier, relativePath)
    if (binding) { replacements.push({ end: reference.end, start: reference.start, value: binding.token }) }
  }
  return applyReplacements(file.content, replacements, relativePath)
}

function compileStyleSheet(
  relativePath: string,
  source: string,
  classPrefix: string | undefined,
  warn: (message: string) => void,
  convertHost = true,
): CompiledStyle {
  let transformer: StyleSheetTransformer
  try {
    transformer = new StyleSheetTransformer(relativePath, source, classPrefix, 750, convertHost, nativeTagPrefix)
  }
  catch (error) {
    throw new Error(`[varo-native-artifacts] Failed to parse ${relativePath}: ${describeError(error)}`)
  }
  try {
    const content = transformer.getContent()
    const lowPriorityContent = transformer.getLowPriorityContent()
    const rawDiagnostics: unknown = transformer.extractWarnings()
    reportCompilerDiagnostics(compilerDiagnostics(rawDiagnostics), relativePath, warn)
    return { content, lowPriorityContent }
  }
  finally {
    transformer.free()
  }
}

function componentStyleScope(key: string, config: SerializableStaticConfig): string {
  const usesStyleScope = config.styleIsolation === undefined
    ? config.component === true
    : config.styleIsolation !== 'shared' && config.styleIsolation !== 'page-shared'
  if (!usesStyleScope) { return '' }
  return `varo-${createHash('sha256').update(key).digest('hex').slice(0, 16)}`
}

async function compileStyles(
  reader: NativeSourceReader,
  assets: AssetRegistry,
  components: ReadonlyMap<string, ComponentSource>,
  warn: (message: string) => void,
): Promise<Map<string, string>> {
  const styles = new Map<string, string>()
  const lowPriorityStyles: string[] = []
  const appSource = await inlineWxss(reader, assets, 'app.wxss', new Set())
  const compiledAppStyle = compileStyleSheet('app.wxss', appSource, undefined, warn, false)
  for (const component of [...components.values()].sort((left, right) => compareStrings(left.key, right.key))) {
    const relativePath = `${component.key}.wxss`
    const styleFile = await reader.readTextIfExists(relativePath)
    if (!styleFile) { continue }
    const source = await inlineWxss(reader, assets, relativePath, new Set())
    const compiled = compileStyleSheet(relativePath, source, componentStyleScope(component.key, component.config) || undefined, warn)
    styles.set(component.key, compiled.content)
    if (compiled.lowPriorityContent) { lowPriorityStyles.push(compiled.lowPriorityContent) }
  }
  const sharedStyles = [...lowPriorityStyles, compiledAppStyle.lowPriorityContent].filter(Boolean)
  styles.set('app', `${sharedStyles.join('\n')}${sharedStyles.length > 0 ? '\n' : ''}${compiledAppStyle.content}`)
  return styles
}

async function collectModules(
  reader: NativeSourceReader,
  assets: AssetRegistry,
  components: ReadonlyMap<string, ComponentSource>,
): Promise<Map<string, SourceFile>> {
  const modules = new Map<string, SourceFile>()
  const pending = new Set<string>(['app.js', ...[...components.keys()].map(key => `${key}.js`)])
  const knownSources = new Map<string, SourceFile>()
  for (const component of components.values()) { knownSources.set(`${component.key}.js`, component.javaScript) }
  while (pending.size > 0) {
    const key = [...pending].sort(compareStrings)[0]
    if (!key) { break }
    pending.delete(key)
    if (modules.has(key)) { continue }
    const source = knownSources.get(key) ?? await reader.readText(key)
    modules.set(key, source)
    const metadata = inspectJavaScript(source.content, source.relativePath)
    for (const assetReference of metadata.assets) { await assets.add(assetReference, source.relativePath) }
    for (const specifier of metadata.requires) {
      const candidates = resolveModuleCandidates(key, specifier)
      let dependency: string | undefined
      for (const candidate of candidates) {
        const candidateSource = knownSources.get(candidate) ?? await reader.readTextIfExists(candidate)
        if (!candidateSource) { continue }
        knownSources.set(candidate, candidateSource)
        dependency = candidate
        break
      }
      if (!dependency) {
        throw new Error(
          `[varo-native-artifacts] Cannot resolve CommonJS dependency ${JSON.stringify(specifier)} from ${key}; `
          + `tried ${candidates.join(', ')}`,
        )
      }
      if (!modules.has(dependency)) { pending.add(dependency) }
    }
  }
  return modules
}

function renderFactory(source: SourceFile): string {
  return `${JSON.stringify(source.relativePath)}: function (require, module, exports, globals) {\n`
    + `const { ${factoryGlobalNames.join(', ')} } = globals\n`
    + `${source.content}\n`
    + '}'
}

function renderVirtualModule(
  reader: NativeSourceReader,
  assets: AssetRegistry,
  components: ReadonlyMap<string, ComponentSource>,
  modules: ReadonlyMap<string, SourceFile>,
  styles: ReadonlyMap<string, string>,
  businessTemplateExpression: string,
  builtinTemplateExpression: string,
  builtinTemplateKeys: readonly string[],
  pages: Readonly<Record<string, string>>,
): string {
  const renderedAssets = assets.renderedFiles()
  const variableByFile = new Map(renderedAssets.map(asset => [asset.relativePath, asset.variableName]))
  const assetImports = renderedAssets.map((asset) => {
    const viteFileId = `/@fs/${asset.absolutePath.split(sep).join('/')}?url`
    return `import ${asset.variableName} from ${JSON.stringify(viteFileId)}`
  })
  const componentProperties = [...components.values()]
    .sort((left, right) => compareStrings(left.key, right.key))
    .map(component => `${JSON.stringify(component.key)}: {\n`
      + `config: ${JSON.stringify(component.config)},\n`
      + `template: { groupList: __businessTemplateGroups, content: __businessTemplateGroups[${JSON.stringify(component.key)}] },\n`
      + `styleScope: ${JSON.stringify(componentStyleScope(component.key, component.config))}\n`
      + '}')
  const builtinProperties = [...builtinTemplateKeys]
    .sort(compareStrings)
    .map(key => `${JSON.stringify(key)}: { groupList: __builtinTemplateGroups, content: __builtinTemplateGroups[${JSON.stringify(key)}] }`)
  const moduleProperties = [...modules.values()]
    .sort((left, right) => compareStrings(left.relativePath, right.relativePath))
    .map(renderFactory)
  const styleProperties = [...styles.entries()]
    .sort(([left], [right]) => compareStrings(left, right))
    .map(([key, content]) => `${JSON.stringify(key)}: ${assets.renderInterpolated(content, variableByFile)}`)
  return `${assetImports.join('\n')}\n`
    + `const __businessTemplateGroups = ${businessTemplateExpression}\n`
    + `const __builtinTemplateGroups = ${builtinTemplateExpression}\n`
    + `const bundle = {\n`
    + `digest: ${JSON.stringify(reader.digest())},\n`
    + `pages: ${JSON.stringify(pages)},\n`
    + `components: {\n${componentProperties.join(',\n')}\n},\n`
    + `builtinTemplates: {\n${builtinProperties.join(',\n')}\n},\n`
    + `modules: {\n${moduleProperties.join(',\n')}\n},\n`
    + `styles: {\n${styleProperties.join(',\n')}\n},\n`
    + `assets: ${assets.renderAssetMap(variableByFile)}\n`
    + `}\nexport default bundle\n`
}

async function buildVirtualModule(
  nativeBuildRoot: string,
  pages: Readonly<Record<string, string>>,
  development: boolean,
  watch: (path: string) => void,
  warn: (message: string) => void,
): Promise<string> {
  const reader = await NativeSourceReader.create(nativeBuildRoot, watch)
  reader.inputs.set('config/scenarios.json', Buffer.from(JSON.stringify(pages)))
  const appConfigFile = await reader.readText('app.json')
  const appConfig = parseStaticConfig(appConfigFile.content, appConfigFile.relativePath, {})
  const globalUsingComponents: Record<string, string> = {}
  for (const [tag, specifier] of Object.entries(appConfig.usingComponents ?? {})) {
    globalUsingComponents[tag] = `/${resolveComponentKey('app', specifier)}`
  }
  const components = await collectComponents(reader, globalUsingComponents, pages)
  const assets = new AssetRegistry(reader)
  const businessTemplateExpression = await compileBusinessTemplates(reader, assets, components, development, warn)
  const builtin = compileBuiltinTemplates(development, warn)
  for (const [path, content] of builtin.inputs) { reader.inputs.set(path, content) }
  const styles = await compileStyles(reader, assets, components, warn)
  const modules = await collectModules(reader, assets, components)
  return renderVirtualModule(
    reader,
    assets,
    components,
    modules,
    styles,
    businessTemplateExpression,
    builtin.expression,
    builtin.keys,
    pages,
  )
}

export function nativeArtifactsPlugin(options: NativeArtifactsPluginOptions): Plugin {
  assertNativeArtifactsOptions(options)
  let config: ResolvedConfig | undefined
  let nativeBuildRoot: string | undefined
  return {
    name: 'varo-native-artifacts',
    enforce: 'pre',
    configResolved(resolvedConfig) {
      config = resolvedConfig
      nativeBuildRoot = resolvePluginPath(resolvedConfig.root, options.nativeBuildRoot)
    },
    resolveId(id) {
      return id === nativeArtifactModuleId ? resolvedNativeArtifactModuleId : null
    },
    async load(id) {
      if (id !== resolvedNativeArtifactModuleId) { return null }
      if (!config || !nativeBuildRoot) {
        throw new Error('[varo-native-artifacts] Vite resolved config was unavailable while loading native artifacts')
      }
      this.addWatchFile(join(nativeBuildRoot, 'app.json'))
      for (const watchFile of options.watchFiles ?? []) {
        this.addWatchFile(resolvePluginPath(config.root, watchFile))
      }
      return buildVirtualModule(
        nativeBuildRoot,
        options.pages,
        config.command === 'serve' || config.mode === 'development',
        path => this.addWatchFile(path),
        message => this.warn(message),
      )
    },
    handleHotUpdate(context) {
      if (!nativeBuildRoot || !isWithin(nativeBuildRoot, context.file)) { return }
      const virtualModule = context.server.moduleGraph.getModuleById(resolvedNativeArtifactModuleId)
      if (!virtualModule) { return }
      context.server.moduleGraph.invalidateModule(virtualModule)
      return [virtualModule]
    },
  }
}
