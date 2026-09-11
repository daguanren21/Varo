import type { NativeArtifactBundle, NativeModuleFactory } from '../src/runtime/artifacts.ts'
import { describe, expect, it } from 'vitest'
import { createNativeModuleLoader, resolveNativeModule } from '../src/runtime/module-loader.ts'

function artifactBundle(modules: Record<string, NativeModuleFactory>): NativeArtifactBundle {
  return {
    digest: 'test',
    pages: { controls: 'controls', agent: 'agent' },
    components: {},
    builtinTemplates: {},
    modules,
    styles: {},
    assets: {},
  }
}

function method(value: unknown, name: string): () => unknown {
  if (!value || typeof value !== 'object') { throw new TypeError('Expected module exports') }
  const candidate: unknown = Reflect.get(value, name)
  if (typeof candidate !== 'function') { throw new TypeError(`Expected export ${name}`) }
  return () => Reflect.apply(candidate, value, [])
}

describe('native artifact module loading', () => {
  it('preserves a shared module instance through circular imports', () => {
    const bundle = artifactBundle({
      'a.js': (require, _module, exports) => {
        let count = 0
        exports.increment = () => ++count
        const peer = require('./b')
        exports.viaPeer = () => method(peer, 'increment')()
      },
      'b.js': (require, _module, exports) => {
        const first = require('./a')
        exports.increment = () => method(first, 'increment')()
      },
    })
    const loader = createNativeModuleLoader(bundle, {}, (_path, execute) => execute())
    expect(method(loader.load('a.js'), 'viaPeer')()).toBe(1)
    expect(method(loader.load('b.js'), 'increment')()).toBe(2)
    expect(method(loader.load('a.js'), 'viaPeer')()).toBe(3)
  })

  it('refuses dependency paths outside the artifact graph', () => {
    const bundle = artifactBundle({
      'safe.js': (_require, _module, exports) => { exports.value = 'safe' },
    })
    expect(resolveNativeModule('pages/index.js', '../safe', bundle.modules)).toBe('safe.js')
    expect(() => resolveNativeModule('pages/index.js', '../../safe', bundle.modules)).toThrow(Error)
    expect(() => resolveNativeModule('pages/index.js', 'node:fs', bundle.modules)).toThrow(Error)
    expect(() => resolveNativeModule('pages/index.js', '/missing', bundle.modules)).toThrow(Error)
  })
})
