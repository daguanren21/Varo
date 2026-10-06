import { mkdir, readFile, writeFile } from 'node:fs/promises'
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
  throw new Error('Set WEAPP_APP_ID in .env.local or the shell to your actual mini-program AppID, or leave it empty for compilation only.')
}
const manifest = JSON.parse(await readFile(resolve(root, 'manifest.config.json'), 'utf8'))
manifest['mp-weixin'].appid = appid

// Supplying a source project config prevents uni-app from substituting a tourist AppID.
// Both generated files share this AppID owner; no compiled artifacts are patched.
const project = {
  appid,
  projectname: manifest.name,
  description: manifest.description,
  compileType: 'miniprogram',
  miniprogramRoot: './',
  srcMiniprogramRoot: './',
  libVersion: manifest['mp-weixin'].libVersion,
  setting: manifest['mp-weixin'].setting,
  packOptions: { ignore: [] },
}
await mkdir(resolve(root, 'src'), { recursive: true })
await writeFile(resolve(root, 'src/manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
await writeFile(resolve(root, 'src/project.config.json'), `${JSON.stringify(project, null, 2)}\n`)
console.log(appid
  ? 'Prepared local uni-app configuration with your configured AppID.'
  : 'Prepared compilation-only uni-app configuration without an AppID. Supply your own AppID before DevTools or device validation.')
