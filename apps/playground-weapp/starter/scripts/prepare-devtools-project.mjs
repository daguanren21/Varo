import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
try {
  loadEnvFile(resolve(projectRoot, '.env.local'))
}
catch (error) {
  if (error.code !== 'ENOENT') { throw error }
}

const projectConfig = JSON.parse(await readFile(resolve(projectRoot, 'project.config.json'), 'utf8'))
let localConfig = {}
try {
  localConfig = JSON.parse(await readFile(resolve(projectRoot, 'project.local.json'), 'utf8'))
}
catch (error) {
  if (error.code !== 'ENOENT') { throw error }
}
const appId = process.env.WEAPP_APP_ID ?? localConfig.appid ?? ''
if (typeof appId !== 'string' || (appId && !/^wx[0-9a-f]{16}$/i.test(appId))) {
  throw new Error('Set WEAPP_APP_ID in .env.local (or project.local.json appid) to your actual mini-program AppID; leave it empty for compilation only.')
}
projectConfig.appid = appId
projectConfig.miniprogramRoot = 'mp-weixin/'
projectConfig.srcMiniprogramRoot = 'mp-weixin/'

for (const output of ['devtools/build', 'dist/dev']) {
  const targetPath = resolve(projectRoot, output, 'project.config.json')
  await mkdir(dirname(targetPath), { recursive: true })
  await writeFile(targetPath, `${JSON.stringify(projectConfig, null, 2)}\n`)
}
console.log(appId
  ? 'Prepared local DevTools projects with the configured AppID.'
  : 'Prepared compiler-only projects without an AppID. Configure your own AppID before DevTools/device validation.')
