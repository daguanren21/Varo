import { readdir, readFile } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import ts from 'typescript'
import { parse } from 'vue/compiler-sfc'
import { importSpecifiers, registryItems, root } from './registry-artifacts.mjs'

const failures = []
const neutral = new Map([
  ['shared', new Set()],
  ['utils', new Set()],
  ['hooks', new Set(['@varo/shared', '@varo/utils'])],
  ['primitives-core', new Set(['@varo/shared', '@varo/utils', '@varo/hooks'])],
  ['agent-core', new Set()],
])
const toolImports = ['@varo/weapp-web', '@varo/registry', '@varo/build', '@varo-ui/cli']
const frameworkImports = ['vue', 'wevu', '@vue/']
const matches = (specifier, prefix) => specifier === prefix || specifier.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`)

async function files(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) { result.push(...await files(path)) }
    else if (/\.(?:ts|tsx|vue)$/.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name)) { result.push(path) }
  }
  return result
}

function scriptSource(source, path) {
  if (extname(path) !== '.vue') { return source }
  const { descriptor, errors } = parse(source, { filename: path })
  if (errors.length) { throw new Error(`${path}: ${errors.join('; ')}`) }
  return `${descriptor.script?.content ?? ''}\n${descriptor.scriptSetup?.content ?? ''}`
}

async function inspect(path, { neutralImports, native = false, product = false } = {}) {
  const source = scriptSource(await readFile(path, 'utf8'), path)
  const label = relative(root, path)
  for (const specifier of importSpecifiers(source, path)) {
    if (specifier.includes('primitives-weapp') || specifier === '@varo-ui/weapp/primitives') {
      failures.push(`${label}: obsolete Vue-native renderer ${specifier}`)
    }
    if (product && toolImports.some(prefix => matches(specifier, prefix))) {
      failures.push(`${label}: product runtime imports developer tooling ${specifier}`)
    }
    if (neutralImports !== undefined) {
      if (frameworkImports.some(prefix => matches(specifier, prefix))
        || ((specifier.startsWith('@varo/') || specifier.startsWith('@varo-ui/')) && !neutralImports.has(specifier))) {
        failures.push(`${label}: neutral contract imports upper runtime layer ${specifier}`)
      }
    }
    if (native && (matches(specifier, 'vue') || matches(specifier, '@varo-ui/h5') || matches(specifier, '@varo/primitives-h5'))) {
      failures.push(`${label}: native SFC imports DOM renderer ${specifier}`)
    }
    if ((product || neutralImports !== undefined) && specifier.startsWith('.')) {
      const imported = resolve(path, '..', specifier)
      if (/\/packages\/(?:weapp-web|registry|cli|build)(?:\/|$)/.test(imported)) {
        failures.push(`${label}: relative import crosses into developer tooling ${specifier}`)
      }
    }
  }
  if (neutralImports !== undefined) {
    const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true)
    function visit(node) {
      if (ts.isIdentifier(node) && ['document', 'window', 'HTMLElement', 'HTMLInputElement'].includes(node.text)
        && !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)
        && !(ts.isPropertyAssignment(node.parent) && node.parent.name === node)) {
        failures.push(`${label}: neutral contract uses DOM global ${node.text}`)
      }
      ts.forEachChild(node, visit)
    }
    visit(ast)
  }
}

let inspected = 0
for (const [name, allowed] of neutral) {
  for (const file of await files(resolve(root, `packages/${name}/src`))) {
    await inspect(file, { neutralImports: allowed, product: true }); inspected++
  }
}
for (const directory of ['packages/primitives-h5/src', 'packages/ui-h5/src', 'packages/ui-weapp/native/src']) {
  for (const file of await files(resolve(root, directory))) {
    await inspect(file, { native: directory.includes('/native/'), product: true }); inspected++
  }
}
const nativeSources = new Set((await registryItems()).flatMap(item => item.files.filter(file => file.target === 'weapp' && /\.(?:ts|vue)$/.test(file.from)).map(file => file.from)))
for (const file of nativeSources) { await inspect(resolve(root, file), { native: true, product: true }); inspected++ }
for (const name of [...neutral.keys(), 'ui-h5', 'ui-weapp', 'primitives-h5']) {
  const manifest = JSON.parse(await readFile(resolve(root, `packages/${name}/package.json`), 'utf8'))
  for (const dependency of Object.keys(manifest.dependencies ?? {})) {
    if (toolImports.some(prefix => matches(dependency, prefix))) { failures.push(`${name}: runtime dependency on tool ${dependency}`) }
  }
}
if (failures.length) { throw new Error(`Architecture boundary violations:\n${[...new Set(failures)].join('\n')}`) }
console.log(`Verified ${inspected} product source files: neutral contracts, native/DOM separation, no tool-to-product dependency reversal.`)
