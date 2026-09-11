import type { CodeSpace, ComponentEnv } from 'glass-easel-miniprogram-adapter'
import type { NativeArtifactBundle, NativeGlobals } from './artifacts.ts'
import type { WeappWebHarness } from './harness.ts'
import * as glassEasel from 'glass-easel'
import { resolveWeappWebHarness } from './harness.ts'
import { createNativeModuleLoader } from './module-loader.ts'
import { requirePlugin } from './native-elements.ts'

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new TypeError(`${label} 必须是对象`) }
  return value as Record<string, unknown>
}

function nativeProperties(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) { return undefined }
  const properties = record(value, '小程序属性定义')
  return Object.fromEntries(Object.entries(properties).map(([name, definition]) => {
    if (definition === Function) { return [name, { type: null }] }
    if (definition && typeof definition === 'object' && !Array.isArray(definition)) {
      const property = definition as Record<string, unknown>
      // glass-easel supplies a no-op for an absent Function property. A missing
      // optional callback must stay absent, not become an active formatter.
      if (property.type === Function && property.value === undefined && property.default === undefined) {
        return [name, { ...property, type: null }]
      }
    }
    return [name, definition]
  }))
}

function invoke(target: Record<string, unknown> | undefined, name: string, args: unknown[] = []): unknown {
  const method = target?.[name]
  if (typeof method === 'function') { return Reflect.apply(method, target, args) }
}

export interface NativeHost {
  globals: NativeGlobals
  register: () => void
  getPage: () => Record<string, unknown> | undefined
  setPage: (value: unknown) => void
  emitAppVisibility: (visible: boolean) => void
  whenReady: () => Promise<void>
  dispose: () => void
}

export function createNativeHost(
  bundle: NativeArtifactBundle,
  space: CodeSpace,
  pagePath: string,
  reportError: (error: Error) => void,
  harness?: Partial<WeappWebHarness>,
): NativeHost {
  const resolvedHarness = resolveWeappWebHarness(harness)
  let disposed = false

  let currentPage: Record<string, unknown> | undefined
  let app: Record<string, unknown> | undefined
  let environment: ComponentEnv | undefined
  let currentDefinition = ''
  const timeouts = new Set<number>()
  const intervals = new Set<number>()
  const pendingReady = new Set<glassEasel.GeneralComponent>()
  const readyComponents = new WeakSet<glassEasel.GeneralComponent>()
  const readyWaiters = new Set<() => void>()
  let readyQueued = false
  const globals: NativeGlobals = Object.create(null)
  const asError = (error: unknown) => error instanceof Error ? error : new Error(String(error))
  const run = (callback: unknown, args: unknown[]) => {
    if (disposed) { return }
    if (typeof callback !== 'function') { throw new TypeError('小程序调度回调必须是函数') }
    try { Reflect.apply(callback, undefined, args) }
    catch (error) { reportError(asError(error)) }
  }
  const enqueue = (callback: () => void) => window.queueMicrotask(() => run(callback, []))
  const finishReadyWaiters = () => {
    if (pendingReady.size || readyQueued) { return }
    for (const resolve of readyWaiters) { resolve() }
    readyWaiters.clear()
  }
  const scheduleReady = (element: glassEasel.GeneralComponent) => {
    if (disposed || readyComponents.has(element)) { return }
    pendingReady.add(element)
    if (readyQueued) { return }
    readyQueued = true
    enqueue(() => {
      const backend = element.getBackendContext()
      if (!backend) { throw new Error('组件没有可用的渲染后端') }
      backend.render((error) => {
        readyQueued = false
        if (disposed) { return }
        if (error) { reportError(error); return }
        const ready = [...pendingReady].reverse()
        pendingReady.clear()
        for (const component of ready) {
          if (disposed) { break }
          readyComponents.add(component)
          component.triggerLifetime('ready', [])
        }
        finishReadyWaiters()
      })
    })
  }
  const clearTimer = (id: number) => {
    window.clearTimeout(id)
    window.clearInterval(id)
    timeouts.delete(id)
    intervals.delete(id)
  }
  const nativeSetTimeout = (callback: unknown, delay = 0, ...args: unknown[]) => {
    if (disposed) { return 0 }
    if (typeof callback !== 'function') { throw new TypeError('小程序定时器回调必须是函数') }
    const id = window.setTimeout(() => {
      timeouts.delete(id)
      run(callback, args)
    }, delay)
    timeouts.add(id)
    return id
  }
  const nativeSetInterval = (callback: unknown, delay = 0, ...args: unknown[]) => {
    if (disposed) { return 0 }
    if (typeof callback !== 'function') { throw new TypeError('小程序定时器回调必须是函数') }
    const id = window.setInterval(run, delay, callback, args)
    intervals.add(id)
    return id
  }
  const setPage = (value: unknown) => {
    currentPage = record(value, '小程序页面实例')
    Object.defineProperty(currentPage, 'route', { configurable: true, writable: true, value: pagePath })
    Object.defineProperty(currentPage, 'options', { configurable: true, writable: true, value: {} })
  }
  const wxHost = resolvedHarness.createWxHost({ pagePath, getPage: () => currentPage, enqueue })
  const sharedEnv = space.componentEnv('__preview_shared__', value => value)

  function component(...args: unknown[]) {
    if (!environment) { throw new Error('Component 必须在小程序组件模块注册阶段调用') }
    if (args.length) {
      const definition = record(args[0], '小程序组件定义')
      const lifetimes = definition.lifetimes ? record(definition.lifetimes, '组件生命周期') : {}
      const originalCreated = lifetimes.created
      const originalAttached = lifetimes.attached
      const originalDetached = lifetimes.detached
      const isPage = currentDefinition === pagePath
      args[0] = {
        ...definition,
        properties: nativeProperties(definition.properties),
        lifetimes: {
          ...lifetimes,
          created(this: unknown, ...values: unknown[]) {
            const instance = record(this, '小程序组件实例')
            const element: unknown = instance._$
            if (!(element instanceof glassEasel.Component)) { throw new TypeError('组件实例没有 glass-easel owner 信息') }
            // The Web adapter applies Component.export to owner lookup. Wevu's
            // provide/inject needs the native caller, not its public exports.
            Object.defineProperty(instance, 'selectOwnerComponent', {
              configurable: true,
              writable: true,
              value: () => element.ownerShadowRoot?.getHostNode().getMethodCaller() ?? null,
            })
            if (isPage) { setPage(instance) }
            if (typeof originalCreated === 'function') { return Reflect.apply(originalCreated, this, values) }
          },
          attached(this: unknown, ...values: unknown[]) {
            if (typeof originalAttached === 'function') { Reflect.apply(originalAttached, this, values) }
            const instance = record(this, '小程序组件实例')
            const element: unknown = instance._$
            if (!glassEasel.Component.isComponent(element)) { throw new Error('组件实例没有可用的渲染节点') }
            scheduleReady(element)
          },
          detached(this: unknown, ...values: unknown[]) {
            const instance = record(this, '小程序组件实例')
            const element: unknown = instance._$
            if (glassEasel.Component.isComponent(element)) { pendingReady.delete(element) }
            try {
              if (typeof originalDetached === 'function') { return Reflect.apply(originalDetached, this, values) }
            }
            finally {
              if (isPage && currentPage === this) { currentPage = undefined }
            }
          },
        },
      }
    }
    return Reflect.apply(environment.Component, undefined, args)
  }
  const behavior = (...args: unknown[]) => Reflect.apply(sharedEnv.Behavior, undefined, args)
  Object.assign(behavior, { trait: sharedEnv.Behavior.trait })
  const page = (...args: unknown[]) => {
    if (!environment) { throw new Error('Page 必须在小程序页面模块注册阶段调用') }
    return Reflect.apply(environment.Page, undefined, args)
  }
  const application = (value: unknown) => {
    if (app) { throw new Error('小程序 App 不能重复注册') }
    app = { globalData: {}, ...record(value, 'App 定义') }
    const launch = invoke(app, 'onLaunch', [{ path: pagePath, query: {} }])
    if (launch && typeof launch === 'object' && 'then' in launch) {
      void Promise.resolve(launch).catch(error => reportError(asError(error)))
    }
    invoke(app, 'onShow', [{ path: pagePath, query: {} }])
  }

  for (const name of [
    'Object',
    'Array',
    'String',
    'Number',
    'Boolean',
    'Symbol',
    'Reflect',
    'Proxy',
    'Map',
    'WeakMap',
    'Set',
    'WeakSet',
    'Promise',
    'RegExp',
    'JSON',
    'Math',
    'Date',
    'Error',
    'TypeError',
    'RangeError',
    'SyntaxError',
    'Intl',
    'TextEncoder',
    'TextDecoder',
    'ArrayBuffer',
    'DataView',
    'Uint8Array',
    'Uint16Array',
    'Uint32Array',
    'Int8Array',
    'Int16Array',
    'Int32Array',
    'Float32Array',
    'Float64Array',
    'BigInt',
    'BigInt64Array',
    'BigUint64Array',
    'URL',
    'URLSearchParams',
    'AbortController',
    'AbortSignal',
    'atob',
    'btoa',
    'parseInt',
    'parseFloat',
    'isNaN',
    'isFinite',
    'encodeURI',
    'encodeURIComponent',
    'decodeURI',
    'decodeURIComponent',
  ]) {
    globals[name] = Reflect.get(window, name)
  }
  Object.assign(globals, {
    App: application,
    Page: page,
    Component: component,
    Behavior: behavior,
    wx: wxHost.wx,
    requirePlugin,
    getApp: () => app,
    getCurrentPages: () => currentPage ? [currentPage] : [],
    setTimeout: nativeSetTimeout,
    clearTimeout: clearTimer,
    setInterval: nativeSetInterval,
    clearInterval: clearTimer,
    queueMicrotask: enqueue,
    console,
    __wxConfig: { pages: Object.values(bundle.pages), entryPagePath: pagePath },
    window: undefined,
    document: undefined,
    requestAnimationFrame: undefined,
    cancelAnimationFrame: undefined,
  })
  globals.globalThis = globals
  globals.global = globals
  resolvedHarness.extendGlobals?.(globals, { bundle, pagePath })

  const loader = createNativeModuleLoader(bundle, globals, (path, execute) => {
    const previousEnvironment = environment
    const previousDefinition = currentDefinition
    space.componentEnv(path, (value) => {
      environment = value
      currentDefinition = path
      try { execute() }
      finally {
        environment = previousEnvironment
        currentDefinition = previousDefinition
      }
    })
  })

  return {
    globals,
    getPage: () => currentPage,
    setPage,
    register() {
      loader.load('app.js')
      if (!app) { throw new Error('小程序产物没有注册 App') }
      for (const path of Object.keys(bundle.components)) { loader.load(`${path}.js`) }
    },
    emitAppVisibility(visible) {
      invoke(app, visible ? 'onShow' : 'onHide', visible ? [{ path: pagePath, query: {} }] : [])
    },
    whenReady() {
      if (disposed || (!pendingReady.size && !readyQueued)) { return Promise.resolve() }
      return new Promise(resolve => readyWaiters.add(resolve))
    },
    dispose() {
      if (disposed) { return }
      disposed = true
      for (const id of timeouts) { window.clearTimeout(id) }
      for (const id of intervals) { window.clearInterval(id) }
      timeouts.clear()
      intervals.clear()
      pendingReady.clear()
      readyQueued = false
      finishReadyWaiters()
      wxHost.dispose()
      loader.clear()
      currentPage = undefined
      app = undefined
    },
  }
}
