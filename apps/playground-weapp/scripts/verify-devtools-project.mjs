import { access, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = resolve(projectRoot, 'devtools/build/mp-weixin')
const requiredComponentExtensions = ['.js', '.json', '.wxml']

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
  for (const [name, componentPath] of Object.entries(json.usingComponents ?? {})) {
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
