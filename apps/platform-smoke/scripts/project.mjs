import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRegistryProfile, isRegistryTarget, registryProfiles } from '@varo/registry/source'
import { getMiniProgramPlatformDescriptor } from '@weapp-core/shared'

export const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const repoRoot = resolve(appRoot, '../..')
export const fixtureItems = ['button', 'input', 'input-otp', 'form', 'checkbox', 'switch', 'drawer', 'card']

export function getProject(target) {
  if (!isRegistryTarget(target) || getRegistryProfile(target).renderer !== 'weapp') {
    const targets = Object.values(registryProfiles).filter(profile => profile.renderer === 'weapp')
    throw new Error(`Select one native Registry profile: ${targets.map(profile => profile.id).join(', ')}`)
  }
  const profile = getRegistryProfile(target)
  const platform = getMiniProgramPlatformDescriptor(profile.compilerPlatform)
  const consumerRoot = resolve(appRoot, '.generated', profile.id)
  const ideRoot = resolve(consumerRoot, 'dist', profile.compilerPlatform)
  return {
    profile,
    platform,
    consumerRoot,
    ideRoot,
    outputRoot: resolve(ideRoot, 'dist'),
    configRoot: resolve(consumerRoot, 'config', profile.compilerPlatform),
    appIdVariable: profile.host === 'donut' ? 'VARO_DONUT_APP_ID' : `VARO_${profile.compilerPlatform.toUpperCase()}_APP_ID`,
  }
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options })
  if (result.error) {
    throw new Error(`Cannot run ${command}: ${result.error.message}`, { cause: result.error })
  }
  if (result.status !== 0) {
    throw new Error(`${command} failed (${result.signal ?? `exit ${result.status}`})`)
  }
}

export function compilerCli() {
  return fileURLToPath(import.meta.resolve('weapp-vite/bin/weapp-vite.js'))
}
