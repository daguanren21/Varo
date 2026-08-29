import { access, readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(projectRoot, 'devtools/build/mp-weixin')
const requiredComponentExtensions = ['.js', '.json', '.wxml']

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

async function collectFiles(directory, extension, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) { await collectFiles(path, extension, files) }
    else if (extname(entry.name) === extension) { files.push(path) }
  }
  return files
}

async function collectAllFiles(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) { await collectAllFiles(path, files) }
    else if (entry.isFile()) { files.push(path) }
  }
  return files
}

const devtoolsProject = JSON.parse(await readFile(resolve(projectRoot, 'devtools/build/project.config.json'), 'utf8'))
const localConfig = JSON.parse(
  await readFile(resolve(projectRoot, 'project.local.json'), 'utf8').catch(() => '{}'),
)
const allowSimulationAppId = process.env.GITHUB_ACTIONS !== 'true'
  && localConfig.allowSimulationAppId === true
  && devtoolsProject.appid === localConfig.appid
if (devtoolsProject.appid && !allowSimulationAppId && !/^wx[0-9a-f]{16}$/i.test(devtoolsProject.appid)) {
  throw new Error('DevTools project contains an invalid AppID')
}

const appJsonPath = resolve(outputRoot, 'app.json')
const appJson = JSON.parse(await readFile(appJsonPath, 'utf8'))
const pages = [...(appJson.pages ?? [])]
for (const subPackage of appJson.subPackages ?? appJson.subpackages ?? []) {
  for (const page of subPackage.pages ?? []) { pages.push(`${subPackage.root}/${page}`) }
}
if (pages.length !== 51) { throw new Error(`Expected 51 migrated pages, received ${pages.length}`) }

const queue = [appJsonPath, ...pages.map(page => resolve(outputRoot, `${page}.json`))]
const visited = new Set()
const componentStylePaths = new Set()
const missing = []
while (queue.length > 0) {
  const ownerPath = queue.shift()
  if (!ownerPath || visited.has(ownerPath)) { continue }
  visited.add(ownerPath)
  if (!await exists(ownerPath)) {
    missing.push(`${ownerPath.replace(`${projectRoot}/`, '')}: missing JSON`)
    continue
  }
  const json = JSON.parse(await readFile(ownerPath, 'utf8'))
  for (const [name, componentPath] of Object.entries(json.usingComponents ?? {})) {
    if (typeof componentPath !== 'string') { continue }
    const basePath = componentBasePath(ownerPath, componentPath)
    if (!basePath) { continue }
    componentStylePaths.add(`${basePath}.wxss`)
    for (const extension of requiredComponentExtensions) {
      if (!await exists(`${basePath}${extension}`)) {
        missing.push(`${ownerPath.replace(`${projectRoot}/`, '')}: ${name} -> ${componentPath}${extension}`)
      }
    }
    queue.push(`${basePath}.json`)
  }
}
if (missing.length > 0) { throw new Error(`Unresolved mini-program components:\n${missing.join('\n')}`) }

const wxmlFiles = await collectFiles(outputRoot, '.wxml')
const unsafeWxml = []
for (const path of wxmlFiles) {
  const source = await readFile(path, 'utf8')
  if (/\?\.|\?\?|="(?!\{\{)[^"\n]*\n[^"]*"/.test(source)) {
    unsafeWxml.push(path.replace(`${outputRoot}/`, ''))
  }
}
if (unsafeWxml.length > 0) { throw new Error(`Unsafe WXML expressions:\n${unsafeWxml.join('\n')}`) }

const wxssFiles = await collectFiles(outputRoot, '.wxss')
const wxssSources = await Promise.all(wxssFiles.map(path => readFile(path, 'utf8')))
const unresolvedAssetFiles = wxssFiles
  .filter((_, index) => wxssSources[index].includes('__VITE_ASSET__'))
  .map(path => path.replace(`${outputRoot}/`, ''))
if (unresolvedAssetFiles.length > 0) {
  throw new Error(`Unresolved Vite asset placeholders:\n${unresolvedAssetFiles.join('\n')}`)
}
const wxss = wxssSources.join('\n')
if (!wxss.includes('bg-orange-500') || wxss.includes('@import "tailwindcss"')) {
  throw new Error('Tailwind utilities were not transformed into production WXSS')
}

const globalStyle = await readFile(resolve(outputRoot, 'styles.wxss'), 'utf8')
if (/@import\s+["']\.\/assets\//.test(globalStyle)) {
  throw new Error('styles.wxss contains unresolved source CSS imports')
}
if (globalStyle.includes('../../static/fonts/')) {
  throw new Error('styles.wxss contains font paths relative to the source tree')
}
for (const font of ['fa.woff2', 'joufont.woff2']) {
  if (!await exists(resolve(outputRoot, 'static/fonts', font))) {
    throw new Error(`Missing emitted icon font: ${font}`)
  }
}

async function collectImportedStyles(path, visitedStyles = new Set()) {
  if (visitedStyles.has(path) || !await exists(path)) {
    return []
  }
  visitedStyles.add(path)
  const source = await readFile(path, 'utf8')
  const styles = [{ path, source }]
  for (const match of source.matchAll(/@import\s+['"]([^'"]+)['"]/g)) {
    styles.push(...await collectImportedStyles(resolve(dirname(path), match[1]), visitedStyles))
  }
  return styles
}

function findUnsafeSelectors(source) {
  const unsafe = []
  const normalizedSource = source.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const block of normalizedSource.split('{').slice(0, -1)) {
    const selectorText = block.slice(block.lastIndexOf('}') + 1).trim()
    for (const selector of selectorText.split(',').map(value => value.trim()).filter(Boolean)) {
      if (selector.startsWith('@') || /^(?:from|to|\d+%)$/.test(selector)) {
        continue
      }
      const hasAttribute = /(?:^|[^\\])\[/.test(selector)
      const hasId = /(?:^|[\s>+~])#[\w-]+/.test(selector)
      const hasTag = /(?:^|[\s>+~])[a-z][\w-]*(?=[:.#\s>+~]|$)/i.test(selector)
      if (hasAttribute || hasId || hasTag) {
        unsafe.push(selector)
      }
    }
  }
  return unsafe
}

const unsafeComponentSelectors = []
const analyzedStyles = new Set()
for (const componentStylePath of componentStylePaths) {
  for (const style of await collectImportedStyles(componentStylePath)) {
    if (analyzedStyles.has(style.path)) {
      continue
    }
    analyzedStyles.add(style.path)
    for (const selector of findUnsafeSelectors(style.source)) {
      unsafeComponentSelectors.push(`${style.path.replace(`${outputRoot}/`, '')}: ${selector}`)
    }
  }
}
if (unsafeComponentSelectors.length > 0) {
  throw new Error(`Component WXSS contains unsupported selectors:\n${unsafeComponentSelectors.join('\n')}`)
}

const appWxss = await readFile(resolve(outputRoot, 'app.wxss'), 'utf8')
if (!appWxss.startsWith('@import "./styles.wxss";')) {
  throw new Error('app.wxss does not import the generated global Tailwind stylesheet')
}
if (/@import\s+["']\.\/assets\//.test(appWxss)) {
  throw new Error('app.wxss contains unresolved source CSS imports')
}
const requiredThemeVariables = [
  '--varo-ui-primary: #ff6216;',
  '--varo-ui-text: #231815;',
  '--varo-ui-success: #21cf3c;',
  '--varo-ui-danger: #e73828;',
]
const missingThemeVariables = requiredThemeVariables.filter(variable => !appWxss.includes(variable))
if (missingThemeVariables.length > 0) {
  throw new Error(`Realworld Varo theme variables were not generated:\n${missingThemeVariables.join('\n')}`)
}

const localizedChunks = [
  ['ascriptionInfo.js', 'improvePages/_chunks/ascriptionInfo.js'],
  ['basicInfo.js', 'improvePages/_chunks/basicInfo.js'],
  ['deployInfo.js', 'improvePages/_chunks/deployInfo.js'],
  ['openInfo.js', 'improvePages/_chunks/openInfo.js'],
  ['partsInfo.js', 'improvePages/_chunks/partsInfo.js'],
  ['check.js', 'managePages/_chunks/check.js'],
  ['checkShanghai.js', 'managePages/_chunks/checkShanghai.js'],
  ['detail.js', 'managePages/_chunks/detail.js'],
  ['highSearch.js', 'managePages/_chunks/highSearch.js'],
  ['module.js', 'managePages/_chunks/module.js'],
  ['repair.js', 'managePages/_chunks/repair.js'],
]
for (const [original, localized] of localizedChunks) {
  if (await exists(resolve(outputRoot, original)) || !await exists(resolve(outputRoot, localized))) {
    throw new Error(`Subpackage chunk was not localized: ${original} -> ${localized}`)
  }
}

const jsFiles = await collectFiles(outputRoot, '.js')
const unresolvedRequires = []
for (const path of jsFiles) {
  const source = await readFile(path, 'utf8')
  for (const match of source.matchAll(/require\((['"])(\.[^'"]+)\1\)/g)) {
    const target = resolve(dirname(path), match[2])
    if (!await exists(target)) {
      unresolvedRequires.push(`${relative(outputRoot, path)} -> ${match[2]}`)
    }
  }
}
if (unresolvedRequires.length > 0) {
  throw new Error(`Unresolved generated JS imports:\n${unresolvedRequires.join('\n')}`)
}

const outputFiles = await collectAllFiles(outputRoot)
const subPackageRoots = new Set((appJson.subPackages ?? appJson.subpackages ?? []).map(item => item.root))
const fileSizes = await Promise.all(outputFiles.map(async path => [path, (await stat(path)).size]))
const mainPackageBytes = fileSizes
  .filter(([path]) => !subPackageRoots.has(relative(outputRoot, path).split('/')[0]))
  .reduce((total, [, size]) => total + size, 0)
if (mainPackageBytes >= 1_500_000) {
  throw new Error(`Main package exceeds 1.5 MB: ${mainPackageBytes} bytes`)
}

const mediaExtensions = new Set(['.gif', '.jpeg', '.jpg', '.mp3', '.mp4', '.png', '.svg', '.wav'])
const oversizedMedia = fileSizes
  .filter(([path, size]) => mediaExtensions.has(extname(path).toLowerCase()) && size > 200 * 1024)
  .map(([path, size]) => `${relative(outputRoot, path)}: ${size} bytes`)
if (oversizedMedia.length > 0) {
  throw new Error(`Media assets exceed 200 KB:\n${oversizedMedia.join('\n')}`)
}

console.log(`Verified package analyzer budgets; main package is ${mainPackageBytes} bytes`)
console.log('Verified 51 pages, component paths, WXML and selector safety, Varo theme, and Tailwind WXSS')
