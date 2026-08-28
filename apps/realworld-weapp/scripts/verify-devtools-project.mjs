import { access, readdir, readFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
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

const devtoolsProject = JSON.parse(await readFile(resolve(projectRoot, 'devtools/build/project.config.json'), 'utf8'))
if (devtoolsProject.appid && !/^wx[0-9a-f]{16}$/i.test(devtoolsProject.appid)) {
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
  if (/\?\.|\?\?/.test(source)) { unsafeWxml.push(path.replace(`${outputRoot}/`, '')) }
}
if (unsafeWxml.length > 0) { throw new Error(`Unsafe WXML expressions:\n${unsafeWxml.join('\n')}`) }

const wxssFiles = await collectFiles(outputRoot, '.wxss')
const wxss = (await Promise.all(wxssFiles.map(path => readFile(path, 'utf8')))).join('\n')
if (!wxss.includes('bg-orange-500') || wxss.includes('@import "tailwindcss"')) {
  throw new Error('Tailwind utilities were not transformed into production WXSS')
}
console.log('Verified 51 pages, component paths, WXML safety, and Tailwind WXSS')
