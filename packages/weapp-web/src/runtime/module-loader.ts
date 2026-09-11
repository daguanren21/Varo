import type { NativeArtifactBundle, NativeGlobals, NativeModule, NativeRequire } from './artifacts.ts'

export function resolveNativeModule(from: string, specifier: string, modules: NativeArtifactBundle['modules']): string {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
    throw new Error(`小程序产物包含未打包的依赖：${specifier}`)
  }
  const segments = specifier.startsWith('/') ? [] : from.split('/').slice(0, -1)
  for (const segment of specifier.split('/')) {
    if (!segment || segment === '.') { continue }
    if (segment === '..') {
      if (!segments.length) { throw new Error(`小程序模块路径越界：${specifier}`) }
      segments.pop()
    }
    else {
      segments.push(segment)
    }
  }
  const path = segments.join('/')
  for (const candidate of [path, `${path}.js`, `${path}.json`, `${path}/index.js`]) {
    if (Object.hasOwn(modules, candidate)) { return candidate }
  }
  throw new Error(`找不到已编译的小程序模块：${path}`)
}

export function createNativeModuleLoader(
  bundle: NativeArtifactBundle,
  globals: NativeGlobals,
  executeComponent: (path: string, execute: () => void) => void,
) {
  const cache = new Map<string, NativeModule>()

  function load(id: string): unknown {
    const existing = cache.get(id)
    if (existing) { return existing.exports }
    const factory = bundle.modules[id]
    if (!factory) { throw new Error(`找不到已编译的小程序模块：${id}`) }
    const initialExports: Record<string, unknown> = {}
    const module: NativeModule = { exports: initialExports }
    cache.set(id, module)
    const require: NativeRequire = specifier => load(resolveNativeModule(id, specifier, bundle.modules))
    const execute = () => factory(require, module, initialExports, globals)
    const componentPath = id.endsWith('.js') ? id.slice(0, -3) : ''
    try {
      if (Object.hasOwn(bundle.components, componentPath)) {
        executeComponent(componentPath, execute)
      }
      else {
        execute()
      }
    }
    catch (error) {
      cache.delete(id)
      throw error
    }
    return module.exports
  }

  return { load, clear: () => cache.clear() }
}
