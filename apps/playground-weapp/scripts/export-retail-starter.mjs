import { execFileSync, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstat, mkdir, mkdtemp, readdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { parse as parseSfc } from 'vue/compiler-sfc'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(appRoot, '../..')
const sourceRoot = resolve(appRoot, 'src')
const templateRoot = resolve(appRoot, 'starter')
const bridgePath = resolve(sourceRoot, 'lib/varo-primitives.ts')
const retailRoots = new Set(['retail-goods', 'retail-order', 'retail-user', 'retail-coupon', 'retail-promotion'])
const helperEntries = new Map([
  ['@varo-ui/headless', 'packages/primitives-core/src/index.ts'],
  ['@varo-ui/theme/weapp', 'packages/theme/src/weapp.ts'],
  ['@varo/hooks', 'packages/hooks/src/index.ts'],
  ['@varo/shared', 'packages/shared/src/index.ts'],
  ['@varo/utils', 'packages/utils/src/index.ts'],
])
const helperRoots = [...new Set([...helperEntries.values()].map(path => resolve(repoRoot, dirname(path))))]
const textExtensions = new Set(['.vue', '.ts', '.js', '.mjs', '.json', '.css', '.wxss', '.wxml'])
const assetPattern = /\.(?:png|jpe?g|webp|gif|svg|ico|woff2?|ttf|mp4|mp3)(?:[?#].*)?$/i

function inside(root, path) {
  const local = relative(root, path)
  return local === '' || (local !== '..' && !local.startsWith(`..${sep}`) && !isAbsolute(local))
}

function portable(path) {
  return path.split(sep).join('/')
}

function digest(content) {
  return createHash('sha256').update(content).digest('hex')
}

async function statIfPresent(path) {
  try {
    return await lstat(path)
  }
  catch (error) {
    if (error.code !== 'ENOENT') { throw error }
    return undefined
  }
}

async function inspectDestination(path) {
  const stat = await statIfPresent(path)
  if (!stat) { return undefined }
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error('Destination must be a new directory or an empty real directory, never a file or symlink.')
  }
  if ((await readdir(path)).length > 0) {
    throw new Error('Destination is occupied. Choose a new empty destination; no existing files were changed.')
  }
  return stat
}

function parseJson(content, label) {
  const result = ts.parseConfigFileTextToJson(label, content)
  if (result.error) {
    throw new Error(`Invalid JSON in ${label}: ${ts.flattenDiagnosticMessageText(result.error.messageText, '\n')}`)
  }
  return result.config
}

function retailApp(source, manifest) {
  const app = parseJson(manifest, 'app.manifest.json')
  app.pages = (app.pages ?? []).filter(page => /^pages\/retail-[a-z-]+\/index$/.test(page))
  app.subPackages = (app.subPackages ?? app.subpackages ?? []).filter(group => retailRoots.has(group.root))
  delete app.subpackages
  delete app.plugins
  delete app.preloadRule
  if (app.tabBar?.custom) { throw new Error('Custom tab bars need an explicit source closure before export.') }
  if (app.tabBar) { app.tabBar.list = app.tabBar.list.filter(item => app.pages.includes(item.pagePath)) }
  const pages = [...app.pages, ...app.subPackages.flatMap(group => group.pages.map(page => `${group.root}/${page}`))]
  if (!app.pages.length || new Set(pages).size !== pages.length) {
    throw new Error('Native retail page registration is empty or contains duplicates.')
  }
  const content = `${source.trimEnd()}\n\n<json lang="json">\n${JSON.stringify(app, null, 2)}\n</json>\n`
  return { app, pages, content }
}

async function collectProject() {
  const files = new Map()
  const sources = new Map()
  const queue = []
  const queued = new Set()
  const transforms = []
  const packageJson = JSON.parse(await readFile(resolve(templateRoot, 'package.json'), 'utf8'))
  const npmPackages = new Set(Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }))
  const headlessEntry = resolve(repoRoot, helperEntries.get('@varo-ui/headless'))
  const headlessExports = new Map()
  let helperProgram

  async function includeHeadlessExports(node) {
    const bindings = ts.isImportDeclaration(node) && node.importClause?.namedBindings
    if (!bindings || !ts.isNamedImports(bindings) || node.importClause.name) {
      throw new Error('Native headless imports must name their exports explicitly so renderer/DOM helpers stay outside the closure.')
    }
    helperProgram ??= ts.createProgram({
      rootNames: [...helperEntries.values()].map(path => resolve(repoRoot, path)),
      options: {
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        noLib: true,
        types: [],
        paths: Object.fromEntries([...helperEntries].map(([name, path]) => [name, [resolve(repoRoot, path)]])),
      },
    })
    const checker = helperProgram.getTypeChecker()
    const entry = helperProgram.getSourceFile(headlessEntry)
    const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(entry))
    for (const binding of bindings.elements) {
      const name = (binding.propertyName ?? binding.name).text
      if (headlessExports.has(name)) { continue }
      const exported = exports.find(symbol => symbol.name === name)
      if (!exported) { throw new Error(`Unknown native headless export: ${name}`) }
      const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
      const declaration = symbol.declarations?.[0]
      if (!declaration) { throw new Error(`Cannot locate source for headless export: ${name}`) }
      const path = resolve(declaration.getSourceFile().fileName)
      if (path === headlessEntry) { throw new Error(`Headless export must have an owning helper module: ${name}`) }
      enqueue(path)
      headlessExports.set(name, {
        path,
        name: symbol.name,
        typeOnly: ts.isInterfaceDeclaration(declaration) || ts.isTypeAliasDeclaration(declaration),
      })
    }
  }

  async function snapshot(path) {
    if (!sources.has(path)) {
      const stat = await lstat(path)
      if (!stat.isFile() || stat.isSymbolicLink() || await realpath(path) !== path) {
        throw new Error(`Source must be a regular non-symlink file: ${portable(relative(repoRoot, path))}`)
      }
      sources.set(path, await readFile(path))
    }
    return sources.get(path)
  }

  function outputName(path) {
    return inside(sourceRoot, path)
      ? `src/${portable(relative(sourceRoot, path))}`
      : `src/vendor/varo/${portable(relative(repoRoot, path))}`
  }

  function enqueue(path) {
    if (!inside(sourceRoot, path) && !helperRoots.some(root => inside(root, path))) {
      throw new Error(`Import leaves the approved native/pure-helper source closure: ${portable(relative(repoRoot, path))}`)
    }
    const sourceName = portable(relative(sourceRoot, path))
    if (/(?:^|\/)(?:node_modules|dist|devtools|\.weapp-vite|__tests__)(?:\/|$)|\.(?:test|spec)\./.test(sourceName)
      || /^(?:retail-showcase|registry-catalog|components\/(?:agent-ui|demos|mall))\//.test(sourceName)
      || (sourceName.startsWith('pages/') && !sourceName.startsWith('pages/retail-'))) {
      throw new Error(`Non-retail or generated source is not exportable: ${sourceName}`)
    }
    if (!queued.has(path)) {
      queued.add(path)
      queue.push(path)
    }
  }

  async function localTarget(owner, specifier) {
    const clean = specifier.replace(/[?#].*$/, '')
    const base = clean.startsWith('/') ? resolve(sourceRoot, `.${clean}`) : resolve(dirname(owner), clean)
    const candidates = [base]
    if (!extname(base)) {
      candidates.push(...['.ts', '.js', '.vue', '.json', '/index.ts', '/index.js'].map(extension => `${base}${extension}`))
    }
    else if (base.endsWith('.js')) {
      candidates.push(`${base.slice(0, -3)}.ts`)
    }
    for (const candidate of candidates) {
      const stat = await statIfPresent(candidate)
      if (stat?.isSymbolicLink()) { throw new Error(`Source import is a symlink: ${specifier}`) }
      if (stat?.isFile()) {
        enqueue(candidate)
        return candidate
      }
    }
    throw new Error(`Unresolved source reference in ${portable(relative(repoRoot, owner))}: ${specifier}`)
  }

  async function dependency(owner, specifier, node) {
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      const target = await localTarget(owner, specifier)
      if (target === bridgePath) {
        const bindings = ts.isImportDeclaration(node) && node.importClause?.namedBindings
        if (!bindings || !ts.isNamedImports(bindings)
          || bindings.elements.some(binding => (binding.propertyName ?? binding.name).text !== 'varoReactiveRuntime')
          || node.importClause.name) {
          throw new Error('A retail consumer uses renderer exports from lib/varo-primitives.ts; migrate it to native components before export.')
        }
      }
      return specifier
    }
    const helper = helperEntries.get(specifier)
    if (helper) {
      const target = resolve(repoRoot, helper)
      if (specifier === '@varo-ui/headless') { await includeHeadlessExports(node) }
      else { enqueue(target) }
      const path = portable(relative(dirname(outputName(owner)), outputName(target)))
      return path.startsWith('.') ? path : `./${path}`
    }
    const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]
    if (packageName === 'vue' || packageName.startsWith('@varo') || !npmPackages.has(packageName)
      || (helperRoots.some(root => inside(root, owner)) && packageName === 'wevu')) {
      throw new Error(`Unsupported runtime dependency in ${portable(relative(repoRoot, owner))}: ${specifier}. Use relative native source or an explicitly declared registry dependency.`)
    }
    return specifier
  }

  async function scriptReferences(owner, source, offset, edits) {
    const parsed = ts.createSourceFile(owner, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const references = []
    const assets = new Set()
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
        const literal = node.moduleSpecifier
        if (!ts.isStringLiteral(literal)) { throw new Error('Module references must be static strings.') }
        if (owner === bridgePath && ts.isExportDeclaration(node) && !node.exportClause
          && literal.text === '@varo-ui/weapp/primitives') {
          edits.push({ start: offset + node.getStart(parsed), end: offset + node.end, text: '' })
          transforms.push({ file: outputName(owner), operation: 'Remove unused renderer-only wildcard re-export; all reached consumers use varoReactiveRuntime.' })
          return
        }
        references.push({ literal, node })
      }
      else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
        references.push({ literal: node.argument.literal, node })
      }
      else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword
        || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
        if (node.arguments.length !== 1 || !ts.isStringLiteral(node.arguments[0])) {
          throw new Error(`Dynamic module references cannot be exported: ${outputName(owner)}`)
        }
        references.push({ literal: node.arguments[0], node })
      }
      if (ts.isStringLiteral(node) && /^(?:\.{1,2}\/|\/assets\/)/.test(node.text) && assetPattern.test(node.text)) {
        assets.add(node.text)
      }
      ts.forEachChild(node, visit)
    }
    visit(parsed)
    for (const { literal, node } of references) {
      const replacement = await dependency(owner, literal.text, node)
      if (replacement !== literal.text) {
        edits.push({ start: offset + literal.getStart(parsed), end: offset + literal.end, text: JSON.stringify(replacement) })
      }
      assets.delete(literal.text)
    }
    for (const asset of assets) { await localTarget(owner, asset) }
  }

  async function styleReferences(owner, content) {
    for (const match of content.matchAll(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"]|url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) {
      const specifier = match[1] ?? match[2]
      if (/^(?:data:|https?:|#)/.test(specifier)) { continue }
      if (specifier.startsWith('.') || specifier.startsWith('/')) { await localTarget(owner, specifier) }
      else if (!npmPackages.has(specifier.split('/')[0])) {
        throw new Error(`Unresolved stylesheet dependency in ${outputName(owner)}: ${specifier}`)
      }
    }
  }

  async function nativeReferences(owner, config) {
    const references = [
      ...Object.values(config.usingComponents ?? {}),
      ...Object.values(config.componentGenerics ?? {}).flatMap(value => value && typeof value.default === 'string' ? [value.default] : []),
    ]
    for (const reference of references) {
      if (typeof reference !== 'string' || /^(?:plugin|ext):\/\//.test(reference)) {
        throw new Error(`Non-local component registration in ${outputName(owner)}`)
      }
      await localTarget(owner, reference.startsWith('/') || reference.startsWith('.') ? reference : `./${reference}`)
    }
  }

  const appPath = resolve(sourceRoot, 'app.vue')
  const app = retailApp(
    (await snapshot(appPath)).toString('utf8'),
    (await snapshot(resolve(appRoot, 'app.manifest.json'))).toString('utf8'),
  )
  enqueue(appPath)
  transforms.push({ file: 'src/app.vue', operation: 'Embed retail page groups and tab assets from app.manifest.json; remove unrelated pages, plugins and preload rules.' })
  for (const page of app.pages) { await localTarget(appPath, `./${page}.vue`) }
  for (const tab of app.app.tabBar?.list ?? []) {
    for (const asset of [tab.iconPath, tab.selectedIconPath].filter(Boolean)) { await localTarget(appPath, `./${asset}`) }
  }
  enqueue(resolve(sourceRoot, 'styles.css'))
  enqueue(resolve(sourceRoot, 'styles/varo.css'))
  enqueue(resolve(sourceRoot, 'features/retail/http-service.ts'))

  for (let index = 0; index < queue.length; index++) {
    const path = queue[index]
    const original = await snapshot(path)
    let content = path === appPath ? app.content : original
    if (textExtensions.has(extname(path))) {
      content = content.toString('utf8')
      const edits = []
      if (path.endsWith('.vue')) {
        const { descriptor, errors } = parseSfc(content, { filename: outputName(path) })
        if (errors.length) { throw new Error(`Cannot parse native SFC: ${outputName(path)}`) }
        for (const block of [descriptor.script, descriptor.scriptSetup].filter(Boolean)) {
          if (block.src) { await localTarget(path, block.src) }
          else { await scriptReferences(path, block.content, block.loc.start.offset, edits) }
        }
        for (const style of descriptor.styles) {
          if (style.src) { await localTarget(path, style.src) }
          await styleReferences(path, style.content)
        }
        if (descriptor.template?.src) { await localTarget(path, descriptor.template.src) }
        for (const match of (descriptor.template?.content ?? '').matchAll(/\s(?:src|poster)\s*=\s*(['"])([^'"]+)\1/g)) {
          if (!/^(?:https?:|data:|\{\{)/.test(match[2])) { await localTarget(path, match[2]) }
        }
        for (const block of descriptor.customBlocks.filter(block => block.type === 'json')) {
          await nativeReferences(path, parseJson(block.content, outputName(path)))
        }
      }
      else if (['.ts', '.js', '.mjs'].includes(extname(path))) {
        await scriptReferences(path, content, 0, edits)
      }
      else if (['.css', '.wxss'].includes(extname(path))) {
        await styleReferences(path, content)
      }
      else if (path.endsWith('.json')) {
        await nativeReferences(path, parseJson(content, outputName(path)))
      }
      for (const edit of edits.sort((a, b) => b.start - a.start)) {
        content = `${content.slice(0, edit.start)}${edit.text}${content.slice(edit.end)}`
      }
    }
    files.set(outputName(path), content)
  }

  if (helperProgram) {
    for (const source of helperProgram.getSourceFiles()) {
      if (!helperRoots.some(root => inside(root, source.fileName))) { continue }
      if ((await snapshot(source.fileName)).toString('utf8') !== source.text) {
        throw new Error('Pure-helper source changed while exporting; finish source edits before exporting again.')
      }
    }
    const exports = [...headlessExports.keys()].sort().map((name) => {
      const entry = headlessExports.get(name)
      const path = portable(relative(dirname(headlessEntry), entry.path))
      const specifier = path.startsWith('.') ? path : `./${path}`
      const binding = entry.name === name ? name : `${entry.name} as ${name}`
      return `export ${entry.typeOnly ? 'type ' : ''}{ ${binding} } from ${JSON.stringify(specifier)}`
    })
    files.set(outputName(headlessEntry), `${exports.join('\n')}\n`)
    transforms.push({ file: outputName(headlessEntry), operation: 'Generate only the named pure-helper exports consumed by native components from their owning source declarations.' })
  }

  async function addTemplates(directory) {
    for (const name of (await readdir(directory)).sort()) {
      const path = resolve(directory, name)
      const stat = await lstat(path)
      if (stat.isSymbolicLink()) { throw new Error('Starter templates must not contain symlinks.') }
      if (stat.isDirectory()) { await addTemplates(path) }
      else {
        const destination = portable(relative(templateRoot, path))
        if (files.has(destination)) { throw new Error(`Template/source path collision: ${destination}`) }
        files.set(destination, await snapshot(path))
      }
    }
  }
  await addTemplates(templateRoot)
  files.set('LICENSE', await snapshot(resolve(repoRoot, 'LICENSE')))
  await snapshot(fileURLToPath(import.meta.url))
  return { files, sources, pages: app.pages, transforms, packageJson }
}

async function generateLock(directory) {
  const env = { ...process.env, CI: 'true' }
  delete env.PNPM_WORKSPACE_DIR
  delete env.npm_config_workspace_dir
  delete env.npm_config_lockfile_dir
  const args = ['install', '--lockfile-only', '--ignore-scripts', '--no-frozen-lockfile', '--lockfile-dir', '.']
  await new Promise((resolvePromise, reject) => {
    const child = spawn('pnpm', args, { cwd: directory, env, stdio: ['ignore', 'pipe', 'pipe'] })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('error', () => reject(new Error('Cannot launch pnpm. Install pnpm 11.24.0 and run the export again.')))
    child.on('close', code => code === 0
      ? resolvePromise()
      : reject(new Error(`Lockfile generation failed (pnpm exit ${code}). Check registry access and dependency versions, then export again to an empty destination.\n${output}`)))
  })
  if (!await statIfPresent(resolve(directory, 'pnpm-lock.yaml'))) {
    throw new Error('pnpm did not produce pnpm-lock.yaml; the export was not published.')
  }
  if (await statIfPresent(resolve(directory, 'node_modules'))) {
    throw new Error('Lockfile-only preparation unexpectedly created node_modules; the export was not published.')
  }
}

export async function exportRetailStarter(destination) {
  const requested = resolve(destination)
  const initial = await inspectDestination(requested)
  const parent = await realpath(dirname(requested))
  const target = resolve(parent, basename(requested))
  const canonicalRepo = await realpath(repoRoot)
  if (inside(canonicalRepo, target) || inside(target, canonicalRepo)) {
    throw new Error('Export outside the Varo repository and its ancestors to avoid source/workspace collisions.')
  }
  const project = await collectProject()
  const pnpmVersion = execFileSync('pnpm', ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  if (pnpmVersion !== '11.24.0') { throw new Error(`Use pnpm 11.24.0 for this export; found ${pnpmVersion}.`) }
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  const staging = await mkdtemp(resolve(parent, '.varo-retail-export-'))
  let published = false
  try {
    for (const [path, content] of [...project.files].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
      const outputPath = resolve(staging, path)
      await mkdir(dirname(outputPath), { recursive: true })
      await writeFile(outputPath, content, { flag: 'wx' })
    }
    await generateLock(staging)
    project.files.set('pnpm-lock.yaml', await readFile(resolve(staging, 'pnpm-lock.yaml')))
    const manifest = {
      schemaVersion: 1,
      name: project.packageJson.name,
      version: project.packageJson.version,
      license: 'MIT',
      source: { repository: 'https://github.com/daguanren21/Varo', revision, app: 'apps/playground-weapp/src' },
      exporter: { node: process.version, pnpm: pnpmVersion },
      dependencies: project.packageJson.dependencies,
      devDependencies: project.packageJson.devDependencies,
      pages: project.pages,
      transforms: project.transforms,
      files: [...project.files.keys()].sort().map(path => ({ path, sha256: digest(project.files.get(path)) })),
      sourceFiles: [...project.sources.keys()].sort().map(path => ({ path: portable(relative(repoRoot, path)), sha256: digest(project.sources.get(path)) })),
      integrityNote: 'File hashes cover the exported snapshot, including pnpm-lock.yaml, but exclude this manifest itself. Source hashes, not HEAD alone, identify uncommitted changes. Registry resolution happens at export; keep the resulting lockfile for frozen installs.',
    }
    await writeFile(resolve(staging, 'starter-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' })
    const current = await inspectDestination(target)
    if (Boolean(initial) !== Boolean(current) || (initial && (initial.ino !== current.ino || initial.dev !== current.dev))) {
      throw new Error('Destination changed during export. No destination content was replaced; choose another empty directory.')
    }
    await rename(staging, target)
    published = true
    return { pages: project.pages.length, files: project.files.size + 1, revision }
  }
  catch (error) {
    error.message = error.message.replaceAll(staging, '<export-staging>')
    throw error
  }
  finally {
    if (!published) { await rm(staging, { recursive: true, force: true }) }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  if (args[0] === '--') { args.shift() }
  try {
    if (args.length !== 1 || args[0].startsWith('-')) {
      throw new Error('Usage: pnpm retail:export -- <new-empty-destination>. The parent directory must exist; choose a destination outside Varo.')
    }
    const result = await exportRetailStarter(args[0])
    console.log(`Exported ${result.pages} retail pages and ${result.files} files from Varo ${result.revision}.`)
    console.log('Source and output SHA256 digests are in starter-manifest.json. No node_modules or compiled output was copied.')
    console.log('In the exported directory: pnpm install --frozen-lockfile; pnpm dev; pnpm build; pnpm verify.')
    console.log('Configure your own WEAPP_APP_ID in .env.local before DevTools/device validation. Compilation is not device certification.')
  }
  catch (error) {
    let message = String(error.message ?? error)
    for (const path of [repoRoot, homedir()]) { message = message.replaceAll(path, path === repoRoot ? '<varo-source>' : '<home>') }
    console.error(`Retail export failed: ${message}`)
    console.error('No complete export was published. Existing destination contents were not overwritten.')
    process.exitCode = 1
  }
}
