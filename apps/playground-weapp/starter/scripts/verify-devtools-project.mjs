import { access, readFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import selectorParser from 'postcss-selector-parser'
import { postcss } from 'weapp-tailwindcss/core'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(projectRoot, 'devtools/build/mp-weixin')
const requiredExtensions = ['.js', '.json', '.wxml']

function outputPath(ownerPath, reference) {
  if (typeof reference !== 'string' || /^(?:plugin|ext):\/\//.test(reference)) {
    throw new Error(`Non-local native reference in ${relative(projectRoot, ownerPath)}`)
  }
  const path = reference.startsWith('/')
    ? resolve(outputRoot, reference.slice(1))
    : resolve(dirname(ownerPath), reference)
  const localPath = relative(outputRoot, path)
  if (localPath === '..' || localPath.startsWith(`..${sep}`) || localPath === '') {
    throw new Error(`Native reference escapes build output: ${reference}`)
  }
  return path
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

const project = JSON.parse(await readFile(resolve(projectRoot, 'devtools/build/project.config.json'), 'utf8'))
if (typeof project.appid !== 'string' || (project.appid && !/^wx[0-9a-f]{16}$/i.test(project.appid))) {
  throw new Error('DevTools project contains an invalid AppID')
}
const appPath = resolve(outputRoot, 'app.json')
const app = JSON.parse(await readFile(appPath, 'utf8'))
const manifest = JSON.parse(await readFile(resolve(projectRoot, 'starter-manifest.json'), 'utf8'))
const pages = [
  ...(app.pages ?? []),
  ...(app.subPackages ?? app.subpackages ?? []).flatMap(subPackage => subPackage.pages.map(page => `${subPackage.root}/${page}`)),
]
if (JSON.stringify([...pages].sort()) !== JSON.stringify([...manifest.pages].sort()) || new Set(pages).size !== pages.length) {
  throw new Error('Compiled page registration differs from the exported retail page manifest')
}
if (Object.keys(app.plugins ?? {}).length > 0) {
  throw new Error('The standalone retail project must not register plugins')
}
const missing = []
const queue = [appPath]
for (const page of pages) {
  const basePath = outputPath(appPath, page)
  for (const extension of requiredExtensions) {
    if (!await exists(`${basePath}${extension}`)) { missing.push(`${page}${extension}`) }
  }
  queue.push(`${basePath}.json`)
}
for (const item of app.tabBar?.list ?? []) {
  for (const reference of [item.iconPath, item.selectedIconPath].filter(Boolean)) {
    if (!await exists(outputPath(appPath, reference))) { missing.push(reference) }
  }
}

const visited = new Set()
const styleQueue = [{ path: resolve(outputRoot, 'app.wxss'), component: false }]
for (let index = 0; index < queue.length; index++) {
  const ownerPath = queue[index]
  if (visited.has(ownerPath)) { continue }
  visited.add(ownerPath)
  if (!await exists(ownerPath)) { continue }
  const json = JSON.parse(await readFile(ownerPath, 'utf8'))
  const stylePath = ownerPath.replace(/\.json$/, '.wxss')
  if (ownerPath !== appPath && await exists(stylePath)) {
    styleQueue.push({ path: stylePath, component: json.component === true })
  }
  const references = [
    ...Object.entries(json.usingComponents ?? {}),
    ...Object.entries(json.componentGenerics ?? {}).flatMap(([name, options]) =>
      options && typeof options.default === 'string' ? [[`${name}.default`, options.default]] : [],
    ),
  ]
  for (const [name, reference] of references) {
    const basePath = outputPath(ownerPath, reference)
    for (const extension of requiredExtensions) {
      if (!await exists(`${basePath}${extension}`)) {
        missing.push(`${relative(outputRoot, ownerPath)}: ${name} -> ${reference}${extension}`)
      }
    }
    queue.push(`${basePath}.json`)
  }
}
if (missing.length > 0) {
  throw new Error(`Unresolved mini-program pages, components or assets:\n${missing.join('\n')}`)
}

const visitedStyles = new Set()
const componentSelectorParser = selectorParser()
const invalidSelectors = []
let hasFlexUtility = false
for (let index = 0; index < styleQueue.length; index++) {
  const { path: stylePath, component } = styleQueue[index]
  const visitKey = `${component}:${stylePath}`
  if (visitedStyles.has(visitKey)) { continue }
  visitedStyles.add(visitKey)
  const label = relative(outputRoot, stylePath)
  const styles = postcss.parse(await readFile(stylePath, 'utf8'), { from: label })
  if (!component) {
    styles.walkRules('.flex', (rule) => {
      hasFlexUtility ||= rule.nodes.some(node => node.type === 'decl' && node.prop === 'display' && node.value === 'flex')
    })
  }
  else {
    styles.walkRules((rule) => {
      if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) { return }
      componentSelectorParser.astSync(rule.selector).walk((node) => {
        if (!['tag', 'id', 'attribute'].includes(node.type)) { return }
        invalidSelectors.push(`${label}:${rule.source.start.line} ${rule.selector}`)
        return false
      })
    })
  }
  styles.walkAtRules(/^(theme|tailwind)$/, (rule) => {
    throw new Error(`Compiled ${label} still contains @${rule.name}; Tailwind CSS was not generated`)
  })
  styles.walkAtRules('import', (rule) => {
    const reference = rule.params.match(/^(['"])(.+)\1$/)?.[2]
    if (!reference) { throw new Error(`Unsupported compiled style import in ${label}: ${rule.params}`) }
    styleQueue.push({ path: outputPath(stylePath, reference), component })
  })
}
if (invalidSelectors.length > 0) {
  throw new Error(`Compiled component WXSS contains unsupported selectors:\n${invalidSelectors.join('\n')}`)
}
if (!hasFlexUtility) {
  throw new Error('Compiled styles are missing the flex layout utility; check src/styles.css')
}
console.log(`Verified ${pages.length} retail pages, recursive component paths, tab assets and compiled styles. This is compiler evidence, not device certification.`)
