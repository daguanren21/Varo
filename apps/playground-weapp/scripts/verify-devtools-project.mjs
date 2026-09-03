import { access, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(projectRoot, 'devtools/build/mp-weixin')
const requiredComponentExtensions = ['.js', '.json', '.wxml']
const requiredRegistryCatalogComponents = [
  'v-action-sheet',
  'v-cell',
  'v-cell-group',
  'v-collapse',
  'v-collapse-item',
  'v-col',
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
  'v-popover-close',
  'v-popover-content',
  'v-popover-root',
  'v-popover-trigger',
  'v-popup',
  'v-radio',
  'v-radio-group',
  'v-rate',
  'v-row',
  'v-safe-area',
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
]

function pageJsonPaths(appJson) {
  const pages = [...(appJson.pages ?? [])]
  for (const subPackage of appJson.subPackages ?? appJson.subpackages ?? []) {
    for (const page of subPackage.pages ?? []) pages.push(`${subPackage.root}/${page}`)
  }
  return pages.map((page) => resolve(outputRoot, `${page}.json`))
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function componentBasePath(ownerPath, componentPath) {
  if (componentPath.startsWith('plugin://') || componentPath.startsWith('ext://')) return undefined
  return componentPath.startsWith('/')
    ? resolve(outputRoot, componentPath.slice(1))
    : resolve(dirname(ownerPath), componentPath)
}

const devtoolsProjectPath = resolve(projectRoot, 'devtools/build/project.config.json')
const devtoolsProject = JSON.parse(await readFile(devtoolsProjectPath, 'utf8'))
if (devtoolsProject.appid && !/^wx[0-9a-f]{16}$/i.test(devtoolsProject.appid)) {
  throw new Error('DevTools project contains an invalid AppID')
}

const appJsonPath = resolve(outputRoot, 'app.json')
const appJson = JSON.parse(await readFile(appJsonPath, 'utf8'))
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

while (queue.length > 0) {
  const ownerPath = queue.shift()
  if (!ownerPath || visited.has(ownerPath)) continue
  visited.add(ownerPath)
  if (!await exists(ownerPath)) {
    missing.push({ componentPath: ownerPath, extension: '', name: 'page', ownerPath: appJsonPath })
    continue
  }

  const json = JSON.parse(await readFile(ownerPath, 'utf8'))
  const componentReferences = [
    ...Object.entries(json.usingComponents ?? {}),
    ...Object.entries(json.componentGenerics ?? {}).flatMap(([name, options]) => {
      if (options === null || typeof options !== 'object') return []
      const componentPath = options.default
      return typeof componentPath === 'string' ? [[`${name}.default`, componentPath]] : []
    }),
  ]
  for (const [name, componentPath] of componentReferences) {
    if (typeof componentPath !== 'string') continue
    const basePath = componentBasePath(ownerPath, componentPath)
    if (!basePath) continue
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
      `${ownerPath.replace(`${projectRoot}/`, '')}: ${name} -> ${componentPath}${extension}`
    )
    .join('\n')
  throw new Error(`Unresolved mini-program components:\n${details}`)
}

for (const component of ['AgentEventRenderer', 'AgentMessage', 'AgentConversation', 'AgentStream']) {
  const componentJsonPath = resolve(outputRoot, `components/agent-ui/${component}.json`)
  if (!await exists(componentJsonPath)) continue
  const componentJson = JSON.parse(await readFile(componentJsonPath, 'utf8'))
  const componentNames = Object.keys(componentJson.usingComponents ?? {})
  if (componentNames.some((name) => name.startsWith('scoped-slot-'))) {
    throw new Error(`${component} streaming content must not cross a scoped-slot boundary`)
  }
}

console.log('Verified mini-program component paths')
