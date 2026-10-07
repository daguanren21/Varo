import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
try {
  loadEnvFile(resolve(root, '.env.local'))
}
catch (error) {
  if (error.code !== 'ENOENT') { throw error }
}

const appid = process.env.WEAPP_APP_ID ?? ''
if (appid && !/^wx[0-9a-f]{16}$/i.test(appid)) {
  throw new Error('Set WEAPP_APP_ID to your actual registered AppID, or leave it empty for compilation only.')
}
const project = {
  appid,
  projectname: 'varo-retail-taro-starter',
  description: 'Editable Varo retail source — Taro Vue 3',
  compileType: 'miniprogram',
  miniprogramRoot: './',
  setting: { es6: true, minified: true, urlCheck: true },
  packOptions: { ignore: [] },
}
await writeFile(resolve(root, 'project.config.json'), `${JSON.stringify(project, null, 2)}\n`)
console.log(appid
  ? 'Prepared Taro project configuration with your configured AppID.'
  : 'Prepared compilation-only Taro configuration without an AppID. Supply your own AppID before DevTools/device validation.')
