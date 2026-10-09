import { access, readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import selectorParser from 'postcss-selector-parser'
import ts from 'typescript'
import { postcss } from 'weapp-tailwindcss/core'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(projectRoot, 'devtools/build/mp-weixin')
const requiredComponentExtensions = ['.js', '.json', '.wxml']
const mainPackageLimit = 2 * 1024 * 1024
const requiredRegistryCatalogComponents = [
  'v-action-sheet',
  'v-cell',
  'v-cell-group',
  'v-collapse',
  'v-collapse-item',
  'v-col',
  'v-dialog-close',
  'v-dialog-content',
  'v-dialog-overlay',
  'v-dialog-root',
  'v-dialog-trigger',
  'v-date-field',
  'v-divider',
  'v-grid',
  'v-grid-item',
  'v-icon',
  'v-indicator',
  'v-input',
  'v-list',
  'v-loading',
  'v-menu',
  'v-menu-item',
  'v-navbar',
  'v-notice-bar',
  'v-overlay',
  'v-pagination',
  'v-picker',
  'v-popover-close',
  'v-popover-content',
  'v-popover-root',
  'v-popover-trigger',
  'v-popup',
  'v-pull-refresh',
  'v-radio',
  'v-radio-group',
  'v-rate',
  'v-row',
  'v-safe-area',
  'v-signature',
  'v-watermark',
  'v-searchbar',
  'v-space',
  'v-steps',
  'v-sticky',
  'v-swipe-cell',
  'v-tab',
  'v-tabbar',
  'v-tabbar-item',
  'v-tabs',
  'v-textarea',
  'v-toast',
  'v-toast-region',
]

function pageJsonPaths(appJson) {
  const pages = [...(appJson.pages ?? [])]
  for (const subPackage of appJson.subPackages ?? appJson.subpackages ?? []) {
    for (const page of subPackage.pages ?? []) { pages.push(`${subPackage.root}/${page}`) }
  }
  return pages.map(page => resolve(outputRoot, `${page}.json`))
}

async function exists(path) {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

function componentBasePath(ownerPath, componentPath) {
  if (componentPath.startsWith('plugin://') || componentPath.startsWith('ext://')) { return undefined }
  return componentPath.startsWith('/')
    ? resolve(outputRoot, componentPath.slice(1))
    : resolve(dirname(ownerPath), componentPath)
}

function outputName(path) {
  return relative(outputRoot, path).split(sep).join('/')
}

function assertPackageReference(ownerPath, targetPath) {
  const name = outputName(targetPath)
  if (!name || name === '..' || name.startsWith('../') || isAbsolute(name)) {
    throw new Error(`Native reference escapes output: ${outputName(ownerPath)} -> ${name}`)
  }
  const owner = packageOwner(ownerPath)
  const target = packageOwner(targetPath)
  if (owner !== target && (target || owner?.independent)) {
    throw new Error(`Forbidden synchronous package reference: ${outputName(ownerPath)} (${owner?.root ?? 'main'}) -> ${name} (${target?.root ?? 'main'})`)
  }
}

async function collectOutputFiles(directory, files = new Map()) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) { await collectOutputFiles(path, files) }
    else if (entry.isFile()) { files.set(path, (await stat(path)).size) }
    else { throw new Error(`Unsupported compiled artifact: ${outputName(path)}`) }
  }
  return files
}

async function verifyScriptReferences(files) {
  let count = 0
  for (const path of files.keys()) {
    if (!/\.(?:js|wxs)$/.test(path)) { continue }
    const source = ts.createSourceFile(path, await readFile(path, 'utf8'), ts.ScriptTarget.Latest, false, ts.ScriptKind.JS)
    if (source.parseDiagnostics.length) { throw new Error(`Invalid compiled JavaScript: ${outputName(path)}`) }
    const references = new Set()
    function visit(node) {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) { references.add(node.moduleSpecifier.text) }
      }
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require') {
        const argument = node.arguments[0]
        if (!argument || !ts.isStringLiteralLike(argument)) {
          throw new Error(`Cannot verify dynamic synchronous script dependency in ${outputName(path)}`)
        }
        references.add(argument.text)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
    for (const reference of references) {
      if (!reference.startsWith('.') && !reference.startsWith('/')) {
        throw new Error(`Unbundled script dependency in ${outputName(path)}: ${reference}`)
      }
      const target = componentBasePath(path, extname(reference) ? reference : `${reference}${extname(path)}`)
      assertPackageReference(path, target)
      if (!files.has(target)) {
        throw new Error(`Missing compiled script dependency: ${outputName(path)} -> ${reference}`)
      }
      count++
    }
  }
  return count
}

const devtoolsProjectPath = resolve(projectRoot, 'devtools/build/project.config.json')
const devtoolsProject = JSON.parse(await readFile(devtoolsProjectPath, 'utf8'))
if (devtoolsProject.appid && !/^wx[0-9a-f]{16}$/i.test(devtoolsProject.appid)) {
  throw new Error('DevTools project contains an invalid AppID')
}

const appJsonPath = resolve(outputRoot, 'app.json')
const appJson = JSON.parse(await readFile(appJsonPath, 'utf8'))
const subPackages = [...(appJson.subPackages ?? appJson.subpackages ?? [])]
  .sort((left, right) => right.root.length - left.root.length)
function packageOwner(path) {
  const name = outputName(path)
  return subPackages.find(pkg => name.startsWith(`${pkg.root}/`))
}
const outputFiles = await collectOutputFiles(outputRoot)
let mainPackageBytes = 0
for (const [path, size] of outputFiles) {
  if (!packageOwner(path)) { mainPackageBytes += size }
}
if (mainPackageBytes > mainPackageLimit) {
  throw new Error(`Main package exceeds 2 MiB: ${mainPackageBytes} > ${mainPackageLimit} bytes`)
}
const scriptReferenceCount = await verifyScriptReferences(outputFiles)
for (const pagePath of pageJsonPaths(appJson)) {
  for (const extension of requiredComponentExtensions) {
    const path = pagePath.replace(/\.json$/, extension)
    if (!outputFiles.has(path)) { throw new Error(`Missing compiled page artifact: ${outputName(path)}`) }
  }
}
if (!outputFiles.has(resolve(outputRoot, 'app.js'))) { throw new Error('Compiled app.js is missing') }
for (const tab of appJson.tabBar?.list ?? []) {
  if (!appJson.pages.includes(tab.pagePath) || packageOwner(resolve(outputRoot, tab.pagePath))) {
    throw new Error(`Tab page must remain in main: ${tab.pagePath}`)
  }
  for (const icon of [tab.iconPath, tab.selectedIconPath].filter(Boolean)) {
    const path = resolve(outputRoot, icon)
    assertPackageReference(appJsonPath, path)
    if (!outputFiles.has(path)) { throw new Error(`Missing tab icon: ${icon}`) }
  }
}
const registryCatalogPageJsonPath = resolve(outputRoot, 'registry-catalog/index/index.json')
if (!await exists(registryCatalogPageJsonPath)) {
  throw new Error('Compiled Registry catalog page is missing')
}
const registryCatalogPageJson = JSON.parse(await readFile(registryCatalogPageJsonPath, 'utf8'))
const registeredCatalogComponents = new Set(Object.keys(registryCatalogPageJson.usingComponents ?? {}))
const missingCatalogComponents = requiredRegistryCatalogComponents
  .filter(component => !registeredCatalogComponents.has(component))
if (missingCatalogComponents.length > 0) {
  throw new Error(`Compiled Registry catalog is missing components: ${missingCatalogComponents.join(', ')}`)
}
const queue = [appJsonPath, ...pageJsonPaths(appJson)]
const visited = new Set()
const missing = []
const styleQueue = [{ path: resolve(outputRoot, 'app.wxss'), component: false, app: true }]

while (queue.length > 0) {
  const ownerPath = queue.shift()
  if (!ownerPath || visited.has(ownerPath)) { continue }
  visited.add(ownerPath)
  if (!await exists(ownerPath)) {
    missing.push({ componentPath: ownerPath, extension: '', name: 'page', ownerPath: appJsonPath })
    continue
  }

  const json = JSON.parse(await readFile(ownerPath, 'utf8'))
  if (ownerPath !== appJsonPath) {
    const stylePath = ownerPath.replace(/\.json$/, '.wxss')
    if (await exists(stylePath)) { styleQueue.push({ path: stylePath, component: json.component === true }) }
  }
  const componentReferences = [
    ...Object.entries(json.usingComponents ?? {}),
    ...Object.entries(json.componentGenerics ?? {}).flatMap(([name, options]) => {
      if (options === null || typeof options !== 'object') { return [] }
      const componentPath = options.default
      return typeof componentPath === 'string' ? [[`${name}.default`, componentPath]] : []
    }),
  ]
  for (const [name, componentPath] of componentReferences) {
    if (typeof componentPath !== 'string') { continue }
    const basePath = componentBasePath(ownerPath, componentPath)
    if (!basePath) { continue }
    assertPackageReference(ownerPath, basePath)
    for (const extension of requiredComponentExtensions) {
      const targetPath = `${basePath}${extension}`

      if (!await exists(targetPath)) {
        missing.push({ componentPath, extension, name, ownerPath })
      }
    }
    queue.push(`${basePath}.json`)
  }
}

if (missing.length > 0) {
  const details = missing
    .map(({ componentPath, extension, name, ownerPath }) =>
      `${ownerPath.replace(`${projectRoot}/`, '')}: ${name} -> ${componentPath}${extension}`,
    )
    .join('\n')
  throw new Error(`Unresolved mini-program components:\n${details}`)
}

for (const component of ['AgentEventRenderer', 'AgentMessage', 'AgentConversation', 'AgentStream']) {
  const componentJsonPath = resolve(outputRoot, `components/agent-ui/${component}.json`)
  if (!await exists(componentJsonPath)) { continue }
  const componentJson = JSON.parse(await readFile(componentJsonPath, 'utf8'))
  const componentNames = Object.keys(componentJson.usingComponents ?? {})
  if (componentNames.some(name => name.startsWith('scoped-slot-'))) {
    throw new Error(`${component} streaming content must not cross a scoped-slot boundary`)
  }
}

const visitedStyles = new Set()
const componentSelectorParser = selectorParser()
const invalidComponentSelectors = []
let hasFlexUtility = false
while (styleQueue.length > 0) {
  const entry = styleQueue.shift()
  if (!entry || !entry.path) { continue }
  const { path: stylePath, component, app } = entry
  const visitKey = `${component ? 'component' : app ? 'app' : 'page'}:${stylePath}`
  if (visitedStyles.has(visitKey)) { continue }
  visitedStyles.add(visitKey)
  const styles = postcss.parse(await readFile(stylePath, 'utf8'), { from: stylePath })
  if (app) {
    styles.walkRules('.flex', (rule) => {
      hasFlexUtility ||= rule.nodes.some(node => node.type === 'decl' && node.prop === 'display' && node.value === 'flex')
    })
  }
  else if (component) {
    styles.walkRules((rule) => {
      if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) { return }
      componentSelectorParser.astSync(rule.selector).walk((node) => {
        if (node.type !== 'tag' && node.type !== 'id' && node.type !== 'attribute') { return }
        const { line, column } = rule.source.start
        invalidComponentSelectors.push(`${stylePath}:${line}:${column} ${rule.selector}`)
        return false
      })
    })
  }
  styles.walkAtRules(/^(theme|tailwind)$/, (rule) => {
    throw new Error(`Compiled ${stylePath} still contains @${rule.name}; Tailwind CSS was not generated`)
  })
  styles.walkAtRules('import', (rule) => {
    const importedPath = rule.params.match(/^(['"])(.+)\1$/)?.[2]
    if (importedPath) {
      const target = componentBasePath(stylePath, importedPath)
      if (!target) { throw new Error(`Unsupported style import in ${outputName(stylePath)}: ${importedPath}`) }
      assertPackageReference(stylePath, target)
      styleQueue.push({ path: target, component, app })
    }
  })
}
if (invalidComponentSelectors.length > 0) {
  throw new Error(`Compiled component WXSS contains unsupported selectors:\n${invalidComponentSelectors.join('\n')}`)
}
if (!hasFlexUtility) {
  throw new Error('Compiled app.wxss is missing the flex layout utility; check the Tailwind CSS entry import')
}

console.log(`Verified mini-program component paths and compiled styles; main ${mainPackageBytes}/${mainPackageLimit} bytes; ${scriptReferenceCount} synchronous script references`)
