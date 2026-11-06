import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve, relative, sep } from 'node:path'
import vm from 'node:vm'

const output = resolve(import.meta.dirname, 'dist/weapp/dist')
const components = []
const apps = []
const context = vm.createContext({
  App: definition => apps.push(definition),
  Page() {},
  Component: definition => components.push(definition),
  wx: {}, getCurrentPages: () => [], console,
  setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
})
const cache = new Map()
function load(file) {
  const local = relative(output, file)
  assert(local && local !== '..' && !local.startsWith(`..${sep}`), 'Module escaped build output')
  if (cache.has(file)) return cache.get(file).exports
  const module = { exports: {} }
  cache.set(file, module)
  const execute = vm.runInContext(`(function(require,module,exports){${readFileSync(file, 'utf8')}\n})`, context, { filename: file })
  execute(reference => {
    assert(reference.startsWith('.'), `Unexpected external dependency: ${reference}`)
    return load(resolve(dirname(file), reference))
  }, module, module.exports)
  return module.exports
}
// Match actual host order: capability setup in app.js precedes page/components.
load(resolve(output, 'app.js'))
assert.equal(apps.length, 1)
load(resolve(output, 'pages/index/index.js'))
const results = []
for (const owner of ['__weapp_vite_app_shell', 'layouts/default']) {
  const count = components.length
  load(resolve(output, `${owner}.js`))
  assert.equal(components.length, count + 1)
  const definition = components.at(-1)
  const template = readFileSync(resolve(output, `${owner}.wxml`), 'utf8')
  results.push({
    owner,
    templateBindsSlotParent: template.includes('bind:__wevu_native_slot_parent="__weapp_vite_nativeSlotParent"'),
    hasSlotParentHandler: typeof definition.methods?.__weapp_vite_nativeSlotParent === 'function',
    hasDeclarationHandler: typeof definition.methods?.__weapp_vite_nativeDeclaration === 'function',
  })
}
console.log(JSON.stringify(results, null, 2))
assert(results.every(result => result.templateBindsSlotParent && result.hasSlotParentHandler && result.hasDeclarationHandler),
  'Compiled slot owners must register the native slot-parent/declaration handlers')
