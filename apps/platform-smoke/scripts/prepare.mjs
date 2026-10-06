import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { appRoot, fixtureItems, readJson, repoRoot, run } from './project.mjs'

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}

export async function prepareProject(project) {
  const { profile, platform, consumerRoot, configRoot, appIdVariable } = project
  const appPackage = await readJson(resolve(appRoot, 'package.json'))
  const appid = process.env[appIdVariable]?.trim()
  if (appid && /^(?:touristappid|your[_-]?appid|replace[-_]|wx0+$)/i.test(appid)) {
    throw new Error(`${appIdVariable} must be your real application ID; omit it for a credential-free artifact build`)
  }
  if (appid && profile.compilerPlatform === 'weapp' && !/^wx[0-9a-f]{16}$/i.test(appid)) {
    throw new Error(`${appIdVariable} must be a real WeChat/Donut application ID (wx plus 16 hex characters)`)
  }

  // This directory is generated; never install over authored fixture or playground source.
  await rm(consumerRoot, { recursive: true, force: true })
  await mkdir(configRoot, { recursive: true })
  await cp(resolve(appRoot, 'src'), resolve(consumerRoot, 'src'), { recursive: true })
  await writeJson(resolve(consumerRoot, 'package.json'), {
    name: `varo-platform-smoke-${profile.id}`,
    private: true,
    type: 'module',
    dependencies: appPackage.dependencies,
    devDependencies: appPackage.devDependencies,
  })
  await writeJson(resolve(consumerRoot, 'tsconfig.json'), {
    extends: './.weapp-vite/tsconfig.shared.json',
    compilerOptions: { strict: true, skipLibCheck: true },
    include: ['src/**/*.ts', 'src/**/*.vue'],
  })
  run(process.execPath, [
    '--experimental-strip-types',
    resolve(repoRoot, 'packages/cli/src/index.ts'),
    'add',
    '--registry',
    resolve(repoRoot, 'registry'),
    '--target',
    profile.id,
    ...fixtureItems,
  ], { cwd: consumerRoot })

  const projectConfig = profile.compilerPlatform === 'alipay'
    ? { format: 2, compileType: 'mini', miniprogramRoot: 'dist', compileOptions: { typescript: false } }
    : { projectname: `varo-${profile.id}`, compileType: 'miniprogram', miniprogramRoot: 'dist', setting: { es6: true } }
  if (appid) { projectConfig.appid = appid }
  if (profile.host === 'donut') {
    projectConfig.projectArchitecture = 'multiPlatform'
    const { 'mini-android': android, 'mini-ios': ios, 'mini-ohos': ohos, ...common } = await readJson(resolve(appRoot, 'config/donut.json'))
    const hostSettings = { android, ios, ohos }[profile.os]
    const hostConfig = { ...common, [`mini-${profile.os}`]: hostSettings }
    // The compiler copies config/<platform> into the IDE project and emits this runtime sidecar.
    await writeJson(resolve(configRoot, 'project.miniapp.json'), hostConfig)
    await writeJson(resolve(consumerRoot, 'src/app.miniapp.json'), {})
  }
  await writeJson(resolve(configRoot, platform.projectConfigFileName), projectConfig)
}
