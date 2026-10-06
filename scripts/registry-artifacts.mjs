import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { lstat, mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { validateRegistryItem } from '../packages/registry/src/index.ts'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const registryRoot = resolve(root, 'registry')

export async function registryItems() {
  const items = []
  const groups = (await readdir(registryRoot, { withFileTypes: true }))
    .filter(entry => entry.isDirectory() && ['blocks', 'components', 'hooks', 'templates', 'themes', 'utils'].includes(entry.name))
    .map(entry => entry.name)
    .sort()
  for (const group of groups) {
    const directory = resolve(registryRoot, group)
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) { continue }
      const manifest = resolve(directory, entry.name, 'registry.json')
      let source
      try { source = await readFile(manifest, 'utf8') }
      catch (error) {
        if (error.code === 'ENOENT') { continue }
        throw error
      }
      const item = JSON.parse(source)
      const errors = validateRegistryItem(item)
      if (errors.length) { throw new Error(`${relative(root, manifest)}: ${errors.join('; ')}`) }
      items.push({ id: `${group}/${entry.name}`, manifest, ...item })
    }
  }
  return items
}

// Only module-specifier AST nodes are changed; comments, strings and user code retain their bytes.
export function rewriteModuleSpecifiers(source, filename, rewrite) {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const edits = []
  function visit(node) {
    let literal
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) { literal = node.moduleSpecifier }
    else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword
      || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) { literal = node.arguments[0] }
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) { literal = node.argument.literal }
    if (literal && ts.isStringLiteralLike(literal)) {
      const replacement = rewrite(literal.text)
      if (replacement !== literal.text) {
        edits.push({ start: literal.getStart(file) + 1, end: literal.getEnd() - 1, replacement })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    source = source.slice(0, edit.start) + edit.replacement + source.slice(edit.end)
  }
  return source
}

export function importSpecifiers(source, filename) {
  const imports = []
  rewriteModuleSpecifiers(source, filename, (specifier) => {
    imports.push(specifier)
    return specifier
  })
  return imports
}

const inventoryPath = 'scripts/registry-projections.json'
const stylePaths = [
  'registry/themes/base/h5.css',
  'registry/themes/base/weapp-vite.css',
  'registry/themes/agent/h5.css',
  'registry/themes/agent/weapp-vite.css',
  'packages/ui-h5/src/style.css',
  'packages/ui-weapp/src/style.css',
]
const registryDirectories = [
  'packages/ui-h5/src/',
  'packages/ui-weapp/native/src/',
  ...['docs', 'playground-h5', 'playground-weapp'].flatMap(app =>
    ['components/ui/', 'components/blocks/', 'components/agent-ui/', 'lib/', 'styles/']
      .map(directory => `apps/${app}/src/${directory}`)),
]

function assertDestination(destination, owner) {
  if (typeof destination !== 'string' || isAbsolute(destination) || /[\\:\0]/.test(destination)
    || destination.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error(`Invalid projection path: ${destination}`)
  }
  const allowed = owner === 'styles'
    ? stylePaths.includes(destination)
    : owner === 'registry'
      ? !stylePaths.includes(destination) && (destination === 'apps/docs/src/registry-catalog.json'
        || registryDirectories.some(directory => destination.startsWith(directory)))
      : owner === 'component-styles'
        && ['registry/components/', 'registry/blocks/'].some(directory => destination.startsWith(directory))
  if (!allowed) { throw new Error(`Projection outside ${owner} ownership: ${destination}`) }
}

async function inspectPath(projectRoot, destination, stats) {
  let path = projectRoot
  for (const part of ['', ...destination.split('/')]) {
    if (part) { path = resolve(path, part) }
    if (!stats.has(path)) {
      try { stats.set(path, await lstat(path)) }
      catch (error) {
        if (error.code !== 'ENOENT') { throw error }
        stats.set(path, undefined)
      }
    }
    const entry = stats.get(path)
    if (!entry) { continue }
    if (entry.isSymbolicLink()) { throw new Error(`Projection contains symlink: ${path}`) }
    if (path === resolve(projectRoot, destination) ? !entry.isFile() : !entry.isDirectory()) {
      throw new Error(`Projection requires a regular file and directory ancestors: ${path}`)
    }
  }
  return path
}

async function readOptional(path) {
  try { return await readFile(path) }
  catch (error) {
    if (error.code !== 'ENOENT') { throw error }
    return undefined
  }
}

const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const sortedRecord = record => Object.fromEntries(Object.entries(record).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0))

// The tracked inventory owns whole generated files, never trees or authored renderers.
// Its first sync adopts only declared destinations; subsequent syncs reject new conflicting files.
export async function projectFiles(files, check = false, { owner, projectRoot = root } = {}) {
  if (!['registry', 'styles', 'component-styles'].includes(owner)) {
    throw new Error(`Unknown projection owner: ${owner}`)
  }
  projectRoot = resolve(projectRoot)
  const stats = new Map()
  const inventoryFile = await inspectPath(projectRoot, inventoryPath, stats)
  const inventoryBytes = await readOptional(inventoryFile)
  const inventory = inventoryBytes ? JSON.parse(inventoryBytes.toString('utf8')) : { version: 1, owners: {} }
  if (inventory?.version !== 1 || !inventory.owners || typeof inventory.owners !== 'object' || Array.isArray(inventory.owners)) {
    throw new Error(`Invalid projection inventory: ${inventoryPath}`)
  }

  const destinations = new Map([[inventoryPath, 'inventory']])
  for (const [priorOwner, entries] of Object.entries(inventory.owners)) {
    if (!['registry', 'styles'].includes(priorOwner) || !entries || typeof entries !== 'object' || Array.isArray(entries)) {
      throw new Error(`Invalid projection inventory owner: ${priorOwner}`)
    }
    for (const [destination, hash] of Object.entries(entries)) {
      assertDestination(destination, priorOwner)
      if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) {
        throw new Error(`Invalid projection digest: ${destination}`)
      }
      if (destinations.has(destination)) { throw new Error(`Conflicting projection owners: ${destination}`) }
      destinations.set(destination, priorOwner)
    }
  }
  for (const destination of files.keys()) {
    assertDestination(destination, owner)
    if (destinations.has(destination) && destinations.get(destination) !== owner) {
      throw new Error(`Conflicting projection owners: ${destination}`)
    }
    destinations.set(destination, owner)
  }

  // Reject aliases and file/directory conflicts even when neither path exists yet.
  const portablePaths = new Map()
  for (const destination of destinations.keys()) {
    const key = destination.normalize('NFC').toLowerCase()
    if (portablePaths.has(key)) { throw new Error(`Conflicting projection paths: ${destination}`) }
    portablePaths.set(key, destination)
  }
  for (const [key, destination] of portablePaths) {
    for (let parent = key.slice(0, key.lastIndexOf('/')); parent; parent = parent.slice(0, parent.lastIndexOf('/'))) {
      if (portablePaths.has(parent)) { throw new Error(`Conflicting projection paths: ${destination}`) }
      if (!parent.includes('/')) { break }
    }
    await inspectPath(projectRoot, destination, stats)
  }

  const changes = []
  const removals = []
  const obsolete = []
  const generated = owner !== 'component-styles'
  const previous = inventory.owners[owner]
  const next = {}
  for (const [destination, content] of files) {
    const path = resolve(projectRoot, destination)
    const current = await readOptional(path)
    if (generated && previous && !Object.hasOwn(previous, destination) && current) {
      throw new Error(`Unowned projection conflicts with an existing file: ${destination}`)
    }
    const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content)
    if (generated) { next[destination] = digest(bytes) }
    if (current?.equals(bytes)) { continue }
    changes.push({ path, bytes })
  }
  for (const [destination, hash] of Object.entries(previous ?? {})) {
    if (files.has(destination)) { continue }
    obsolete.push(destination)
    const path = resolve(projectRoot, destination)
    const current = await readOptional(path)
    if (!current) { continue }
    if (digest(current) !== hash) {
      throw new Error(`Obsolete projection was locally modified; preserving all files: ${destination}`)
    }
    removals.push(path)
  }
  if (generated) {
    inventory.owners[owner] = sortedRecord(next)
    const bytes = Buffer.from(`${JSON.stringify({ version: 1, owners: sortedRecord(inventory.owners) }, null, 2)}\n`)
    if (!inventoryBytes?.equals(bytes)) { changes.push({ path: inventoryFile, bytes }) }
  }
  if (check && (changes.length || obsolete.length)) {
    throw new Error(`Registry projections are stale. Run pnpm sync:registry:\n${[
      ...changes.map(({ path }) => relative(projectRoot, path)),
      ...obsolete.map(destination => `${destination} (obsolete)`),
    ].join('\n')}`)
  }
  // Every ownership, byte and path check above completes before the first mutation.
  for (const path of removals) { await unlink(path) }
  for (const { path, bytes } of changes) {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, bytes)
  }
  return changes.length + removals.length
}
