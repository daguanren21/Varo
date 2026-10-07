import { access, readdir, readFile, realpath } from 'node:fs/promises'
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Parser } from 'htmlparser2'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import valueParser from 'postcss-value-parser'
import ts from 'typescript'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(resolve(projectRoot, 'starter-manifest.json'), 'utf8'))
if (manifest.framework !== 'taro' && manifest.framework !== 'uni-app') { throw new Error('Expected a Taro or uni-app source export') }
const isTaro = manifest.framework === 'taro'
const outputDirectory = isTaro ? 'dist/weapp' : 'dist/build/mp-weixin'
const outputRoot = await realpath(resolve(projectRoot, outputDirectory))
const requiredExtensions = ['.js', '.json', '.wxml']
const contents = new Map()
const scriptQueue = []
const templateQueue = []
const styleQueue = []

function inside(root, path) {
  const local = relative(root, path)
  return local !== '' && local !== '..' && !local.startsWith(`..${sep}`) && !isAbsolute(local)
}

function label(path) {
  return relative(outputRoot, path).split(sep).join('/')
}

function outputPath(ownerPath, reference) {
  if (typeof reference !== 'string' || !reference || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference) || reference.includes('\\')) {
    throw new Error(`Non-local native reference in ${label(ownerPath)}: ${reference}`)
  }
  const localReference = decodeURIComponent(reference.split(/[?#]/, 1)[0])
  const path = localReference.startsWith('/')
    ? resolve(outputRoot, localReference.slice(1))
    : resolve(dirname(ownerPath), localReference)
  if (!inside(outputRoot, path)) {
    throw new Error(`Native reference escapes output in ${label(ownerPath)}: ${reference}`)
  }
  return path
}

async function readOutput(path) {
  if (!contents.has(path)) {
    contents.set(path, (async () => {
      let resolved
      try {
        resolved = await realpath(path)
      }
      catch (error) {
        if (error.code === 'ENOENT') { throw new Error(`Missing compiled file: ${label(path)}`) }
        throw error
      }
      if (!inside(outputRoot, resolved)) { throw new Error(`Compiled reference leaves output: ${label(path)}`) }
      return readFile(resolved)
    })())
  }
  return contents.get(path)
}

async function exists(path) {
  try {
    await access(path)
    return true
  }
  catch (error) {
    if (error.code !== 'ENOENT') { throw error }
    return false
  }
}

async function readJson(path) {
  return JSON.parse((await readOutput(path)).toString('utf8'))
}

function assertUniquePages(pages, owner) {
  if (!pages.length || pages.some(page => typeof page !== 'string' || !page) || new Set(pages).size !== pages.length) {
    throw new Error(`${owner} must register nonempty, unique page paths`)
  }
}

const sourceConfig = isTaro ? 'src/app.config.ts' : 'src/pages.json'
let sourcePages
if (isTaro) {
  const text = await readFile(resolve(projectRoot, sourceConfig), 'utf8')
  const source = ts.createSourceFile(sourceConfig, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const statement = source.statements[0]
  const call = statement && ts.isExportAssignment(statement) ? statement.expression : undefined
  if (source.parseDiagnostics.length || source.statements.length !== 1 || !call || !ts.isCallExpression(call)
    || !ts.isIdentifier(call.expression) || call.expression.text !== 'defineAppConfig'
    || call.arguments.length !== 1 || !ts.isObjectLiteralExpression(call.arguments[0])) {
    throw new Error('Keep src/app.config.ts as a static export default defineAppConfig({...}) for recursive route verification')
  }
  const parsed = ts.parseConfigFileTextToJson(sourceConfig, call.arguments[0].getText(source))
  if (parsed.error) { throw new Error('Taro app configuration must contain JSON-compatible static values') }
  sourcePages = parsed.config
}
else { sourcePages = JSON.parse(await readFile(resolve(projectRoot, sourceConfig), 'utf8')) }
const expectedPages = [
  ...(sourcePages.pages ?? []).map(page => isTaro ? page : page.path),
  ...(sourcePages.subPackages ?? []).flatMap(group => group.pages.map(page => `${group.root}/${isTaro ? page : page.path}`)),
]
assertUniquePages(expectedPages, sourceConfig)
const appPath = resolve(outputRoot, 'app.json')
const app = await readJson(appPath)
const pages = [
  ...(app.pages ?? []),
  ...(app.subPackages ?? app.subpackages ?? []).flatMap(group => group.pages.map(page => `${group.root}/${page}`)),
]
assertUniquePages(pages, 'app.json')
if (JSON.stringify([...pages].sort()) !== JSON.stringify([...expectedPages].sort())) {
  throw new Error(`Compiled page registration differs from ${sourceConfig}; rebuild after changing routes`)
}

const project = await readJson(resolve(outputRoot, 'project.config.json'))
if (typeof project.appid !== 'string' || (project.appid && !/^wx[0-9a-f]{16}$/i.test(project.appid))) {
  throw new Error('Compiled project must have your actual AppID or an empty compilation-only AppID')
}
if (project.miniprogramRoot !== './') {
  throw new Error(`Import ${outputDirectory} directly; its miniprogramRoot must be ./`)
}
const sourceProject = JSON.parse(await readFile(resolve(projectRoot, isTaro ? 'project.config.json' : 'src/project.config.json'), 'utf8'))
if (project.appid !== sourceProject.appid) {
  throw new Error('Compiled AppID differs from the prepared local project; rebuild before importing DevTools')
}

function isExternalAsset(reference) {
  return /^(?:https?:|data:|wxfile:|\/\/|#)/i.test(reference)
}

async function checkAsset(ownerPath, reference) {
  if (!reference || reference.includes('{{') || isExternalAsset(reference)) { return }
  await readOutput(outputPath(ownerPath, reference))
}

for (const item of app.tabBar?.list ?? []) {
  if (!pages.includes(item.pagePath)) { throw new Error(`Unregistered tab page: ${item.pagePath}`) }
  for (const reference of [item.iconPath, item.selectedIconPath].filter(Boolean)) {
    await readOutput(outputPath(appPath, reference))
  }
}
for (const reference of [app.sitemapLocation, app.themeLocation].filter(Boolean)) {
  await readOutput(outputPath(appPath, reference))
}

async function enqueueComponent(ownerPath, reference) {
  const basePath = outputPath(ownerPath, reference)
  for (const extension of requiredExtensions) { await readOutput(`${basePath}${extension}`) }
  scriptQueue.push(`${basePath}.js`)
  templateQueue.push(`${basePath}.wxml`)
  return `${basePath}.json`
}

const configQueue = [appPath]
scriptQueue.push(resolve(outputRoot, 'app.js'))
styleQueue.push({ path: resolve(outputRoot, 'app.wxss'), component: false })
for (const page of pages) { configQueue.push(await enqueueComponent(appPath, page)) }

const visitedConfigs = new Set()
for (let index = 0; index < configQueue.length; index++) {
  const path = configQueue[index]
  if (visitedConfigs.has(path)) { continue }
  visitedConfigs.add(path)
  const config = await readJson(path)
  if (Object.keys(config.plugins ?? {}).length) { throw new Error(`Standalone source registers external plugins: ${label(path)}`) }
  const stylePath = path.replace(/\.json$/, '.wxss')
  if (path !== appPath && await exists(stylePath)) {
    styleQueue.push({ path: stylePath, component: config.component === true })
  }
  const references = [
    ...Object.values(config.usingComponents ?? {}),
    ...Object.values(config.componentGenerics ?? {}).flatMap(options =>
      options && typeof options.default === 'string' ? [options.default] : []),
  ]
  for (const reference of references) { configQueue.push(await enqueueComponent(path, reference)) }
}

function assertNativeClass(token, owner) {
  if (token && /[^\w-]/.test(token)) {
    throw new Error(`Untransformed mini-program class in ${owner}: ${token}`)
  }
}

const visitedTemplates = new Set()
for (let index = 0; index < templateQueue.length; index++) {
  const path = templateQueue[index]
  if (visitedTemplates.has(path)) { continue }
  visitedTemplates.add(path)
  const assets = []
  const parser = new Parser({
    onopentag(name, attributes) {
      for (const attr of ['class', 'hover-class', 'class-name', 'className']) {
        for (const token of (attributes[attr] ?? '').replace(/\{\{[\s\S]*?\}\}/g, '').split(/\s+/)) {
          assertNativeClass(token, label(path))
        }
      }
      const source = attributes.src
      if (source && ['import', 'include', 'wxs'].includes(name)) {
        if (source.includes('{{')) { throw new Error(`Dynamic native dependency in ${label(path)}: ${source}`) }
        const target = outputPath(path, source)
        if (name === 'wxs') { scriptQueue.push(target) }
        else { templateQueue.push(target) }
      }
      else if (source) { assets.push(source) }
      if (attributes.poster) { assets.push(attributes.poster) }
    },
  }, { xmlMode: true, decodeEntities: true })
  parser.end((await readOutput(path)).toString('utf8'))
  for (const asset of assets) { await checkAsset(path, asset) }
}

const visitedScripts = new Set()
for (let index = 0; index < scriptQueue.length; index++) {
  const path = scriptQueue[index]
  if (visitedScripts.has(path)) { continue }
  visitedScripts.add(path)
  const source = ts.createSourceFile(label(path), (await readOutput(path)).toString('utf8'), ts.ScriptTarget.Latest, false, ts.ScriptKind.JS)
  if (source.parseDiagnostics.length) { throw new Error(`Invalid compiled JavaScript: ${label(path)}`) }
  const references = new Set()
  const assets = new Set()
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) { references.add(node.moduleSpecifier.text) }
    }
    if (ts.isCallExpression(node) && (
      (ts.isIdentifier(node.expression) && node.expression.text === 'require')
      || node.expression.kind === ts.SyntaxKind.ImportKeyword
    )) {
      const argument = node.arguments[0]
      if (!argument || !ts.isStringLiteralLike(argument)) {
        throw new Error(`Cannot verify dynamic script dependency in ${label(path)}`)
      }
      references.add(argument.text)
    }
    if (ts.isStringLiteralLike(node) && /^\/?static\//.test(node.text)) { assets.add(`/${node.text.replace(/^\//, '')}`) }
    ts.forEachChild(node, visit)
  }
  visit(source)
  for (const reference of references) {
    if (!reference.startsWith('.') && !reference.startsWith('/')) {
      throw new Error(`Unbundled script dependency in ${label(path)}: ${reference}`)
    }
    const target = outputPath(path, extname(reference) ? reference : `${reference}${extname(path)}`)
    await readOutput(target)
    if (/\.(?:js|wxs)$/.test(target)) { scriptQueue.push(target) }
  }
  for (const asset of assets) { await checkAsset(path, asset) }
}

function cssReference(value, owner) {
  const nodes = valueParser(value).nodes.filter(node => node.type !== 'space' && node.type !== 'comment')
  const node = nodes[0]
  if (nodes.length === 1 && node?.type === 'string') { return node.value }
  if (nodes.length === 1 && node?.type === 'function' && node.value.toLowerCase() === 'url') {
    return valueParser.stringify(node.nodes).trim().replace(/^(['"])([\s\S]*)\1$/, '$2')
  }
  throw new Error(`Unsupported compiled style import in ${owner}: ${value}`)
}

const visitedStyles = new Set()
let hasFlexUtility = false
let hasVaroTheme = false
for (let index = 0; index < styleQueue.length; index++) {
  const { path, component } = styleQueue[index]
  const visitKey = `${component}:${path}`
  if (visitedStyles.has(visitKey)) { continue }
  visitedStyles.add(visitKey)
  const styles = postcss.parse((await readOutput(path)).toString('utf8'), { from: label(path) })
  const assets = []
  styles.walkAtRules(/^(?:theme|tailwind|source|apply|utility|variant|custom-variant|layer|property)$/, (rule) => {
    throw new Error(`Uncompiled @${rule.name} in ${label(path)}; check the Tailwind mini-program pipeline`)
  })
  styles.walkAtRules('import', (rule) => {
    styleQueue.push({ path: outputPath(path, cssReference(rule.params, label(path))), component })
  })
  styles.walkRules((rule) => {
    if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) { return }
    const selectors = selectorParser().astSync(rule.selector)
    selectors.walkClasses((node) => { assertNativeClass(node.value, label(path)) })
    if (component) {
      selectors.walk((node) => {
        if (['tag', 'id', 'attribute'].includes(node.type)) {
          throw new Error(`Unsupported component selector in ${label(path)}: ${rule.selector}`)
        }
      })
    }
    if (!component && rule.selector === '.flex') {
      hasFlexUtility ||= rule.nodes.some(node => node.type === 'decl' && node.prop === 'display' && node.value === 'flex')
    }
  })
  styles.walkDecls((declaration) => {
    if (!component && declaration.prop === '--varo-ui-primary') { hasVaroTheme = true }
    valueParser(declaration.value).walk((node) => {
      if (node.type === 'function' && node.value.toLowerCase() === 'url') {
        assets.push(valueParser.stringify(node.nodes).trim().replace(/^(['"])([\s\S]*)\1$/, '$2'))
        return false
      }
    })
  })
  for (const asset of assets) { await checkAsset(path, asset) }
}
if (!hasFlexUtility || !hasVaroTheme) {
  throw new Error('Global output lacks Tailwind flex layout or Varo theme tokens; check both App.vue style imports')
}

let assetCount = 0
async function checkStaticDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const sourcePath = resolve(directory, entry.name)
    if (entry.isSymbolicLink()) { throw new Error(`Static assets must be real files: ${relative(projectRoot, sourcePath)}`) }
    if (entry.isDirectory()) { await checkStaticDirectory(sourcePath) }
    else if (entry.isFile()) {
      const assetPath = relative(resolve(projectRoot, 'src'), sourcePath)
      const output = await readOutput(outputPath(appPath, assetPath.split(sep).join('/')))
      if (!output.equals(await readFile(sourcePath))) { throw new Error(`Stale or changed compiled asset: ${assetPath}`) }
      assetCount++
    }
  }
}
await checkStaticDirectory(resolve(projectRoot, 'src/static'))
console.log(`Verified ${pages.length} declared pages, ${visitedConfigs.size - 1} page/component configs, ${visitedScripts.size} scripts, ${visitedTemplates.size} templates, recursive styles and ${assetCount} static assets. This is build closure evidence, not browser or device certification.`)
