import { access, constants, stat } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { getProject, readJson, run } from './project.mjs'
import { verifyProject } from './verify.mjs'

const [target, ...extra] = process.argv.slice(2)
if (extra.length) { throw new Error('IDE launch accepts exactly one Registry profile') }
const project = getProject(target)
const { profile, platform, ideRoot, appIdVariable } = project
await verifyProject(project)
const config = await readJson(resolve(ideRoot, platform.projectConfigFileName))
if (!config.appid) {
  throw new Error(`No application ID was embedded in this artifact. Set ${appIdVariable} to your registered app ID, then run pnpm --filter @varo/platform-smoke build:${profile.id} again. Artifact-only builds deliberately use no fabricated identity.`)
}

if (profile.compilerPlatform === 'weapp') {
  const cli = process.env.WEAPP_DEVTOOLS_CLI
  if (!cli || !isAbsolute(cli)) {
    throw new Error('Set WEAPP_DEVTOOLS_CLI to the absolute executable path of your installed WeChat Developer Tools CLI. Log in and enable the IDE service port before opening this project.')
  }
  await access(cli, constants.X_OK)
  if (profile.host === 'donut') {
    const host = await readJson(resolve(ideRoot, 'project.miniapp.json'))
    const settings = host[`mini-${profile.os}`]
    console.log(`Donut ${profile.os}: SDK ${settings.sdkVersion}${settings.toolkitVersion ? `, toolkit ${settings.toolkitVersion}` : ''}.`)
    console.log('Use Developer Tools with Donut/multiPlatform support. Opening the IDE does not download or verify the host SDK, native toolchain, signing identity, or device. Install the selected SDK and configure your own signing in the IDE before packaging.')
  }
  run(cli, ['open', '--project', ideRoot])
}
else if (profile.compilerPlatform === 'alipay') {
  const cli = process.env.ALIPAY_MINIDEV || 'minidev'
  try {
    run(cli, ['ide', '--project', ideRoot])
  }
  catch (error) {
    throw new Error('Alipay IDE launch failed. Install the official minidev CLI and Alipay Mini Program Studio, log in with access to the configured AppID, and put minidev on PATH (or set ALIPAY_MINIDEV to its executable).', { cause: error })
  }
}
else {
  const variable = `VARO_${profile.compilerPlatform.toUpperCase()}_IDE_APP`
  const application = process.env[variable]
  if (process.platform !== 'darwin' || !application || !isAbsolute(application) || !application.endsWith('.app')) {
    throw new Error(`Set ${variable} to the absolute .app path of the official ${profile.compilerPlatform} Developer Tools on macOS. On other operating systems, launch the vendor IDE and import ${ideRoot} manually; no unsupported project-import CLI is assumed.`)
  }
  if (!(await stat(application)).isDirectory()) {
    throw new Error(`${variable} is not an installed IDE application: ${application}`)
  }
  run('/usr/bin/open', ['-a', application])
  console.log(`The IDE was launched. Import this project manually: ${ideRoot}`)
}
console.log('IDE launch only. Verify editing, validation, checkbox/switch state, OTP completion, disabled/read-only behavior and drawer dismissal in the target host; no runtime or device result is implied.')
