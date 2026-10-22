import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { realpath } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

// Execute trusted consumer build output at the native registration/lifecycle boundary.
// This verifies the emitted runtime and slot protocol; it is not a device emulator.
export async function verifyNativeSlotOwners(output, consumerRoot) {
  const compilerRequire = createRequire(await realpath(resolve(consumerRoot, 'node_modules/weapp-vite/package.json')))
  const constants = await import(pathToFileURL(compilerRequire.resolve('@weapp-core/constants')).href)
  const {
    WEVU_NATIVE_SLOT_PARENT_METHOD: slotMethod,
    WEVU_NATIVE_SLOT_PARENT_EVENT: slotEvent,
    WEVU_NATIVE_SLOT_PARENT_DATASET_KEY: slotDataset,
    WEVU_NATIVE_DECLARATION_METHOD: declarationMethod,
    WEVU_NATIVE_DECLARATION_EVENT: declarationEvent,
    WEVU_NATIVE_DECLARATION_ADDRESS_PROP: addressProp,
    WEVU_PARENT_INSTANCE_KEY: parentKey,
  } = constants
  for (const ownerPath of ['__weapp_vite_app_shell.js', 'layouts/default.js']) {
    const definitions = []
    let pages = []
    const context = vm.createContext({
      Component: definition => definitions.push(definition),
      wx: {},
      getCurrentPages: () => pages,
      console,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      queueMicrotask,
    })
    const modules = new Map()
    function load(path) {
      const local = relative(output, path)
      assert(local && !local.startsWith(`..${sep}`) && local !== '..', `Module escaped consumer output: ${path}`)
      if (modules.has(path)) { return modules.get(path).exports }
      const module = { exports: {} }
      modules.set(path, module)
      const execute = vm.runInContext(`(function(require,module,exports){${readFileSync(path, 'utf8')}\n})`, context, { filename: path })
      execute((reference) => {
        assert(reference.startsWith('.'), `Unbundled consumer runtime dependency: ${reference}`)
        return load(resolve(dirname(path), reference))
      }, module, module.exports)
      return module.exports
    }
    function definition(path) {
      const count = definitions.length
      load(resolve(output, path))
      assert.equal(definitions.length, count + 1, `${path}: expected one native registration`)
      return definitions.at(-1)
    }
    const ownerDefinition = definition(ownerPath)
    const providerDefinition = definition('components/SlotOwnerProvider.js')
    const consumerDefinition = definition('components/SlotOwnerConsumer.js')
    assert.equal(typeof ownerDefinition.methods?.[slotMethod], 'function', `${ownerPath}: missing slot-parent handler`)
    assert.equal(typeof ownerDefinition.methods?.[declarationMethod], 'function', `${ownerPath}: missing declaration handler`)
    const mounted = []
    function mount(definition, owner, supplied = {}, dispatch = () => {}) {
      const properties = Object.fromEntries(Object.entries(definition.properties ?? {}).map(([name, metadata]) => [name, metadata && typeof metadata === 'object' ? structuredClone(metadata.value) : undefined]))
      Object.assign(properties, supplied)
      const instance = {
        is: 'consumer-slot-proof',
        properties,
        data: { ...definition.data, ...properties },
        setData(values, callback) { Object.assign(this.data, values); callback?.() },
        selectOwnerComponent() { return owner },
        triggerEvent: dispatch,
        ...definition.methods,
      }
      definition.lifetimes.created.call(instance)
      definition.lifetimes.attached.call(instance)
      mounted.push([definition, instance])
      return instance
    }
    function slot(owner, key, detail) {
      owner[slotMethod]({ currentTarget: { dataset: { [slotDataset]: key } }, detail })
    }
    try {
      const page = mount(providerDefinition, undefined, { value: 'page' })
      pages = [page]
      const first = mount(ownerDefinition, page)
      const second = mount(ownerDefinition, page)
      function provider(owner, value) {
        return mount(providerDefinition, owner, { value, [addressProp]: ['provider', ''] }, (name, detail) => {
          if (name === declarationEvent) { owner[declarationMethod]({ detail }) }
          else if (name === slotEvent) { slot(owner, '', detail) }
        })
      }
      const nested = provider(first, 'nearest')
      const sibling = provider(second, 'sibling')
      function consumer(owner, key, expected, reverse = false) {
        const child = mount(consumerDefinition, page, {}, (name, detail) => {
          if (name !== slotEvent) { return }
          for (const target of reverse ? [key, ''] : ['', key]) { slot(owner, target, detail) }
        })
        assert.equal(child.__wevu.proxy.ownership, expected, `${ownerPath}: wrong inherited provider`)
        return child
      }
      assert.equal(consumer(first, '', 'page')[parentKey], first)
      assert.equal(consumer(first, 'provider', 'nearest')[parentKey], nested)
      assert.equal(consumer(first, 'provider', 'nearest', true)[parentKey], nested)
      assert.equal(consumer(second, 'provider', 'sibling')[parentKey], sibling)
      const index = mounted.findIndex(([, instance]) => instance === nested)
      mounted[index][0].lifetimes.detached.call(nested)
      mounted.splice(index, 1)
      let staleResolutions = 0
      slot(first, 'provider', { resolve() { staleResolutions += 1 } })
      assert.equal(staleResolutions, 0, `${ownerPath}: detached provider remained registered`)
    }
    finally {
      for (const [definition, instance] of mounted.reverse()) { definition.lifetimes.detached.call(instance) }
    }
  }
  console.log('[consumers] Executed app-shell/layout registrations: inherited providers, sibling isolation, event order and detach cleanup verified.')
}
