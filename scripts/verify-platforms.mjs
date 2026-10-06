import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { getRegistryProfile, registryProfiles } from '../packages/registry/src/index.ts'

const targets = process.argv.slice(2)
const profiles = targets.length ? targets.map(getRegistryProfile) : Object.values(registryProfiles).filter(profile => profile.renderer === 'weapp')
if (profiles.some(profile => profile.renderer !== 'weapp')) { throw new Error('The native matrix only accepts native Registry profiles.') }
const failures = []
for (const profile of profiles) {
  console.log(`\n=== ${profile.id}: compiler=${profile.compilerPlatform}, host=${profile.host} ===`)
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../apps/platform-smoke/scripts/build.mjs', import.meta.url)), profile.id], { stdio: 'inherit' })
  if (result.error) { throw result.error }
  if (result.status !== 0) { failures.push(`${profile.id}: ${result.signal ?? `exit ${result.status}`}`) }
}
if (failures.length) { throw new Error(`Native artifact verification failed:\n${failures.join('\n')}`) }
console.log(`Verified ${profiles.length} native compiler/artifact profiles. Device, SDK packaging and signing are NOT certified by this command.`)
