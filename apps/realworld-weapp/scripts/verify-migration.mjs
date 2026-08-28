import { readdir, readFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = resolve(projectRoot, 'src')
const forbidden = [
  '@tarojs/',
  'taro-ui',
  'tarojs-router-next',
  'from \'vue\'',
  'from "vue"',
  'from \'vuex\'',
  'from "vuex"',
  'vuex-persistedstate',
  'require(',
]
const sourceExtensions = new Set(['.ts', '.vue'])
const violations = []

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      await visit(path)
      continue
    }
    if (!sourceExtensions.has(extname(entry.name))) { continue }
    const source = await readFile(path, 'utf8')
    for (const token of forbidden) {
      if (source.includes(token)) { violations.push(`${path.replace(`${projectRoot}/`, '')}: ${token}`) }
    }
  }
}

await visit(sourceRoot)
const packageJson = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'))
for (const name of Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })) {
  if (name.startsWith('@tarojs/') || name === 'taro-ui-vue3' || name === 'vuex') {
    violations.push(`package.json: ${name}`)
  }
}
for (const lockfile of ['yarn.lock', 'package-lock.json']) {
  try {
    await readFile(resolve(projectRoot, lockfile))
    violations.push(lockfile)
  }
  catch {}
}
for (const required of [
  'src/components/ui/VButton.vue',
  'src/components/ui/VInput.vue',
  'src/components/ui/VCheckbox.vue',
  'src/components/ui/VIcon.vue',
  'src/components/ui/VSwitch.vue',
]) {
  try {
    await readFile(resolve(projectRoot, required))
  }
  catch {
    violations.push(`${required}: missing Varo weapp source`)
  }
}
if (violations.length > 0) { throw new Error(`Migration verification failed:\n${violations.join('\n')}`) }
console.log('Verified pnpm + Varo + wevu migration boundaries')
