import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(projectRoot, 'project.config.json')
const localConfigPath = resolve(projectRoot, 'project.local.json')
const targetPaths = [
  resolve(projectRoot, 'devtools/build/project.config.json'),
  resolve(projectRoot, 'dist/dev/project.config.json')
]
const projectConfig = JSON.parse(await readFile(sourcePath, 'utf8'))
const localConfig = JSON.parse(await readFile(localConfigPath, 'utf8').catch(() => '{}'))
const localSimulationAppId = process.env.WEAPP_APP_ID ?? localConfig.appid ?? ''

if (localSimulationAppId && !/^wx[0-9a-f]{16}$/i.test(localSimulationAppId)) {
  throw new Error('WEAPP_APP_ID must be a valid mini-program AppID')
}
projectConfig.appid = localSimulationAppId

projectConfig.miniprogramRoot = 'mp-weixin/'
projectConfig.srcMiniprogramRoot = 'mp-weixin/'
projectConfig.setting ??= {}
projectConfig.setting.urlCheck = false

await Promise.all(targetPaths.map(async (targetPath) => {
  await mkdir(dirname(targetPath), { recursive: true })
  await writeFile(targetPath, `${JSON.stringify(projectConfig, null, 2)}\n`)
}))
