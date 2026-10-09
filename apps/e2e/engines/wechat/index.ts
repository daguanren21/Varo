import type { EngineAttemptContext, EngineFixtureContext, EngineHandle, Locator, LocatorAction, NodeRef, OperationContext } from 'e2e/engine'
import type { NativeNode, NativeProgram } from './driver'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { isAbsolute, relative, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { Element, InputElement, MiniProgram, ScrollViewElement, TextareaElement } from '@weapp-vite/miniprogram-automator'
import { ConfigurationError, defineEngine, raceAbort } from 'e2e/engine'
import { attribute, connectDevtools, currentPage, failure, findNodes, launchHeadless, unsupported } from './driver'
import { NativeSemantics } from './semantics'

export interface WechatOptions { mode: 'headless' | 'devtools', endpoint?: string }
export interface AgentInspection {
  busy: boolean
  eventCount: number
  latestProduct?: string
  latestStatus?: string
  messageCount: number
  orderCount: number
  pendingAction?: string
  reasoningCount: number
  sourceLength: number
  status: string
  toolCount: number
}
export interface ThemeInspection { alternate: boolean, primary: string }
export interface NativeGeometry { width: number, height: number, left: number, top: number }
export interface MiniProgramFixture {
  readonly mode: WechatOptions['mode']
  locator: (xpath: string) => Locator
  coldStart: (route: string) => Promise<void>
  reLaunch: (route: string) => Promise<void>
  navigateTo: (route: string) => Promise<void>
  switchTab: (route: string) => Promise<void>
  route: () => Promise<string>
  data: (path?: string) => Promise<unknown>
  inspectAgent: () => Promise<AgentInspection>
  inspectTheme: () => Promise<ThemeInspection>
  toasts: () => Promise<string[]>
  errors: () => Promise<string[]>
  commitNumber: (xpath: string, value: number) => Promise<void>
  geometry: (xpath: string) => Promise<NativeGeometry>
  style: (xpath: string, property: string) => Promise<string>
  windowInfo: () => Promise<Record<string, unknown>>
  screenshot: (label?: string) => Promise<string>
}

const IDENTITY = '() => getApp().globalData && getApp().globalData.varoE2eProjectId'
const INSTALL_TOASTS = `() => {
  const app = getApp();
  if (app.__varoE2eToasts) throw new Error('Native E2E diagnostics already owned');
  const state = { original: wx.showToast, values: [] };
  state.wrapper = function(options) {
    if (state.values.length >= 1000) throw new Error('Native E2E toast observation overflow');
    state.values.push(String(options.title));
    return state.original.apply(this, arguments);
  };
  app.__varoE2eToasts = state;
  wx.showToast = state.wrapper;
}`
const RESTORE_TOASTS = `() => {
  const app = getApp(); const state = app.__varoE2eToasts;
  if (!state) return;
  if (wx.showToast === state.wrapper) wx.showToast = state.original;
  delete app.__varoE2eToasts;
}`

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) { throw failure('ENGINE_FAILURE', `${label} did not return an object`) }
  return value as Record<string, unknown>
}
function routePath(route: string): string {
  if (!/^[\w/-]+(?:\?[^#\s]*)?$/.test(route) || route.split(/[/?]/).includes('..')) {
    throw new ConfigurationError('INVALID_ARGUMENT', 'Expected a native application route')
  }
  return `/${route.replace(/^\/+/, '')}`
}

export function wechat(options: WechatOptions): EngineHandle {
  if (Object.keys(options).some(key => key !== 'mode' && key !== 'endpoint') || !['headless', 'devtools'].includes(options.mode)) {
    throw new ConfigurationError('INVALID_CONFIG', 'wechat requires mode headless or devtools')
  }
  if (options.mode === 'headless' && options.endpoint !== undefined) { throw new ConfigurationError('INVALID_CONFIG', 'Headless mode does not connect to a DevTools endpoint') }
  if (options.endpoint !== undefined) {
    const endpoint = new URL(options.endpoint)
    if (endpoint.protocol !== 'ws:' || !['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
      throw new ConfigurationError('INVALID_CONFIG', 'DevTools endpoint must be an explicit local loopback ws: endpoint without credentials')
    }
  }
  const semantics = new NativeSemantics()
  let projectPath = ''
  let projectId = ''
  let appConfigPath = ''
  let attempt: EngineAttemptContext | undefined
  let program: NativeProgram | undefined
  let fixtureRoot: string | undefined
  let pendingStart: Promise<void> | undefined
  let pendingCleanup: Promise<void> | undefined
  let screenshotCount = 0
  let diagnosticsInstalled = false
  let consoleErrors: string[] = []
  const consoleListener = (payload: unknown): void => {
    if (!payload || typeof payload !== 'object') { consoleErrors.push('Malformed native console event'); return }
    const event = record(payload, 'Native console event')
    const args = Array.isArray(event.args) ? event.args : [event]
    for (const argument of args) {
      const message = typeof argument === 'string' ? argument : JSON.stringify(argument) ?? String(argument)
      if (event.type === 'error' || /\[Varo AgentMarkdown\]|type-uncompatible|Cannot read propert(?:y|ies).*(?:undefined|null)/i.test(message)) { consoleErrors.push(message) }
    }
  }
  const exceptionListener = (payload: unknown): void => { consoleErrors.push(typeof payload === 'string' ? payload : JSON.stringify(payload) ?? String(payload)) }
  function active(): NativeProgram {
    if (!program) { throw failure('INVALID_STATE', 'Native attempt is not open') }
    return program
  }
  async function verifyIdentity(native: MiniProgram, timeout: number): Promise<void> {
    const actual: unknown = await native.evaluateWithOptions(IDENTITY, { timeout })
    if (actual !== projectId) { throw failure('ENGINE_FAILURE', 'DevTools project identity is missing or mismatched. Open the freshly built app.appPath project at the configured endpoint.') }
  }
  async function cleanup(): Promise<void> {
    if (pendingCleanup) { return pendingCleanup }
    pendingCleanup = (async () => {
      // A launch cannot be interrupted by this SDK. Drain it before deleting its project.
      try { await pendingStart }
      catch { /* startAttempt reports the launch failure */ }
      const owned = program
      const directory = fixtureRoot
      program = undefined
      fixtureRoot = undefined
      const failures: unknown[] = []
      if (owned) {
        try {
          if (diagnosticsInstalled) { await owned.evaluateWithOptions(RESTORE_TOASTS, { timeout: 2000 }) }
        }
        catch (error) { failures.push(error) }
        finally {
          diagnosticsInstalled = false
          owned.off('console', consoleListener)
          owned.off('exception', exceptionListener)
          if (owned instanceof MiniProgram) {
            owned.disconnect()
          }
          else {
            try { await owned.close() }
            catch (error) { failures.push(error) }
          }
        }
      }
      if (directory) {
        try { await rm(directory, { recursive: true, force: true }) }
        catch (error) { failures.push(error) }
      }
      semantics.reset()
      if (failures.length) { throw new AggregateError(failures, 'Native attempt cleanup failed') }
    })()
    try { await pendingCleanup }
    finally { pendingCleanup = undefined }
  }
  async function begin(signal: AbortSignal, coldRoute?: string): Promise<void> {
    signal.throwIfAborted()
    semantics.reset()
    consoleErrors = []
    pendingStart = (async () => {
      if (options.mode === 'headless') {
        fixtureRoot = await mkdtemp(resolve(tmpdir(), 'varo-wechat-e2e-'))
        await cp(projectPath, fixtureRoot, { recursive: true, dereference: true })
        if (coldRoute) {
          const configPath = resolve(fixtureRoot, appConfigPath)
          const config = record(JSON.parse(await readFile(configPath, 'utf8')), 'Compiled app.json')
          config.entryPagePath = routePath(coldRoute).slice(1)
          await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`)
        }
        signal.throwIfAborted()
        program = await launchHeadless(fixtureRoot)
      }
      else {
        if (!options.endpoint) { throw failure('ENGINE_FAILURE', 'DevTools requires an explicit WECHAT_AUTOMATION_ENDPOINT pointing at the compiled project') }
        program = await connectDevtools(options.endpoint, 30_000)
        signal.throwIfAborted()
        await verifyIdentity(program, 10_000)
        // Only the verified, explicitly supplied local app is restarted, never user cache/storage.
        await program.compile({ force: true })
        await program.waitForAppReady(30_000)
        await verifyIdentity(program, 10_000)
      }
      signal.throwIfAborted()
      program.on('console', consoleListener)
      program.on('exception', exceptionListener)
      await program.evaluateWithOptions(INSTALL_TOASTS, { timeout: 10_000 })
      diagnosticsInstalled = true
    })()
    try { await raceAbort(pendingStart, signal, 'Starting native attempt') }
    catch (error) {
      try { await cleanup() }
      catch (cleanupError) { throw new AggregateError([error, cleanupError], 'Native start and cleanup failed') }
      throw error
    }
    finally { pendingStart = undefined }
  }
  async function operation<T>(context: OperationContext, work: () => Promise<T>, mutation = false): Promise<T> {
    context.signal.throwIfAborted()
    try { return await raceAbort(work, context.signal, 'Native operation') }
    catch (error) {
      if (context.signal.aborted) {
        try { await cleanup() }
        catch (cleanupError) { throw new AggregateError([error, cleanupError], 'Native cancellation and cleanup failed') }
      }
      if (mutation) {
        const detail = error instanceof Error ? error.message : String(error)
        throw failure('ACTION_MAY_HAVE_COMMITTED', `Native input may already have reached the application; it must not be repeated automatically. Cause: ${detail}`, error)
      }
      throw error
    }
  }
  async function unique(xpath: string, context: OperationContext): Promise<NativeNode> {
    const nodes = await findNodes(await currentPage(active(), context.timeoutMs), xpath, context.timeoutMs)
    if (nodes.length !== 1) { throw failure('NOT_ACTIONABLE', `Expected one native control for ${xpath}; found ${nodes.length}`) }
    return nodes[0]!
  }
  async function reveal(node: Element, context: OperationContext): Promise<void> {
    const native = active()
    if (!(native instanceof MiniProgram)) { unsupported('Headless runtime has no measured layout') }
    const page = await currentPage(native, context.timeoutMs)
    if (!('scrollTop' in page)) { unsupported('Native page has no measured scroll position') }
    const containers = await findNodes(page, '//scroll-view', context.timeoutMs)
    for (let index = containers.length - 1; index >= 0; index--) {
      const container = containers[index]
      if (!(container instanceof ScrollViewElement)) { continue }
      const descendants = await findNodes(page, `(//scroll-view)[${index + 1}]//*`, context.timeoutMs)
      if (!descendants.includes(node)) { continue }
      const [box, target, top, left] = await Promise.all([container.offset(), node.offset(), container.property('scrollTop'), container.property('scrollLeft')])
      if (target.top < box.top || target.top + target.height > box.top + box.height) {
        await container.scrollTo(Number(left), Math.max(0, Number(top) + Number(target.top) - Number(box.top) - Math.max(0, (Number(box.height) - Number(target.height)) / 2)))
        await delay(250, undefined, { signal: context.signal })
      }
    }
    const initial = await node.offset()
    await native.pageScrollTo(Math.max(0, Number(await page.scrollTop()) + Number(initial.top) - 240))
    await delay(250, undefined, { signal: context.signal })
  }
  async function positionedTap(node: Element, context: OperationContext): Promise<void> {
    const native = active()
    if (!(native instanceof MiniProgram)) { unsupported('Headless runtime has no positioned touch sequence') }
    const page = await currentPage(native, context.timeoutMs)
    if (!('scrollTop' in page)) { unsupported('Native page has no measured scroll position') }
    await reveal(node, context)
    const target = await node.offset()
    if (!(target.width > 0 && target.height > 0)) { throw failure('NOT_ACTIONABLE', 'Native control has no touchable box') }
    const touch = { identifier: 0, clientX: target.left + target.width / 2, clientY: target.top + target.height / 2, pageX: target.left + target.width / 2, pageY: Number(await page.scrollTop()) + target.top + target.height / 2 }
    await node.touchstart({ touches: [touch], changeTouches: [touch] })
    await delay(80, undefined, { signal: context.signal })
    await node.touchend({ touches: [], changeTouches: [touch] })
    await delay(150, undefined, { signal: context.signal })
  }
  async function perform(ref: NodeRef, action: LocatorAction, context: OperationContext): Promise<void> {
    if (!['tap', 'fill', 'clear', 'scrollIntoView', 'swipe'].includes(action.kind)) { unsupported(`Native ${action.kind} is not supported`) }
    if (action.kind === 'tap' && action.modifiers?.length) { unsupported('Native taps cannot hold keyboard modifiers') }
    if (action.kind === 'swipe') {
      if (ref.id !== 'wechat-root' || options.mode !== 'devtools' || !['up', 'down'].includes(action.direction) || (action.momentum && action.momentum !== 'none')) { unsupported('Only measured vertical viewport scrolling without momentum is supported') }
      const native = active()
      if (!(native instanceof MiniProgram)) { unsupported('Headless runtime has no measured viewport scrolling') }
      const page = await currentPage(native, context.timeoutMs)
      if (!('scrollTop' in page)) { unsupported('Native page has no measured scroll position') }
      const info = record(await native.callWxMethod('getWindowInfo'), 'Window info')
      const scrollTop = Number(await page.scrollTop())
      await operation(context, () => native.pageScrollTo(Math.max(0, scrollTop + Number(info.windowHeight) * 0.75 * (action.direction === 'down' ? 1 : -1))), true)
      return
    }
    const binding = await semantics.live(active(), ref.id, context)
    const node = binding.node
    if (binding.semantic.states?.hidden) { throw failure('NOT_ACTIONABLE', 'Native control is hidden') }
    if (action.kind === 'fill' || action.kind === 'clear') {
      if (node instanceof Element && !(node instanceof InputElement || node instanceof TextareaElement)) { unsupported('Only native input and textarea controls accept fill') }
      if (!(node instanceof Element) && !['input', 'textarea'].includes(await node.tagName() ?? '')) { unsupported('Only native input and textarea controls accept fill') }
      const readonly = await attribute(node, 'readonly')
      if (readonly !== undefined && readonly !== 'false' && readonly !== '0') { throw failure('NOT_ACTIONABLE', 'Native input is readonly') }
      if (action.kind === 'fill' && action.sensitive) { semantics.sensitive.add(ref.id) }
      const value = action.kind === 'fill' ? action.value : ''
      await operation(context, async () => {
        if (node instanceof InputElement || node instanceof TextareaElement) {
          await node.input(value)
        }
        else if (!(node instanceof Element)) {
          await node.input(value)
        }
        else { unsupported('Only native input and textarea controls accept fill') }
      }, true)
    }
    else if (action.kind === 'tap') {
      await operation(context, async () => {
        if (node instanceof Element) {
          await positionedTap(node, context)
        }
        else { await node.tap() }
      }, true)
    }
    else if (action.kind === 'scrollIntoView') {
      if (!(node instanceof Element)) { unsupported('Headless runtime has no measured layout') }
      await operation(context, () => reveal(node, context), true)
    }
  }
  async function screenshot(label: string | undefined, context: OperationContext): Promise<string> {
    const native = active()
    if (!(native instanceof MiniProgram)) { unsupported('Headless WeChat does not produce screenshots') }
    if (!attempt) { throw failure('INVALID_STATE', 'No native attempt artifact directory') }
    const artifactsDir = attempt.artifactsDir
    const fields = await semantics.locate(native, { kind: 'selector', selector: '//input | //textarea' }, context)
    for (const field of fields) {
      const binding = semantics.bindings.get(field.ref.id)
      if (field.states?.secure && binding && String(await (binding.node instanceof Element ? binding.node.value() : attribute(binding.node, 'value')) ?? '').length) { unsupported('Native screenshot cannot mask a populated secure control') }
    }
    const base64 = await native.screenshot({ timeout: context.timeoutMs })
    if (!base64) { throw failure('ENGINE_FAILURE', 'DevTools returned no screenshot bytes') }
    const bytes = Buffer.from(base64, 'base64')
    if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') { throw failure('ENGINE_FAILURE', 'DevTools screenshot is not PNG evidence') }
    const window = record(await native.callWxMethodWithOptions('getWindowInfo', { timeout: context.timeoutMs }), 'Screenshot window')
    const width = bytes.readUInt32BE(16)
    const height = bytes.readUInt32BE(20)
    const scale = width / Number(window.windowWidth)
    if (!(scale > 0 && height > 0) || Math.abs(height / scale - Number(window.screenHeight)) > 1) { throw failure('ENGINE_FAILURE', 'Native screenshot dimensions do not match the simulator screen') }
    context.signal.throwIfAborted()
    const filename = `native-${++screenshotCount}${label ? `-${label.replace(/[^\w-]/g, '-').slice(0, 80)}` : ''}.png`
    await mkdir(artifactsDir, { recursive: true })
    await writeFile(resolve(artifactsDir, filename), bytes)
    return filename
  }
  function fixture(context: EngineFixtureContext): MiniProgramFixture {
    const surface: MiniProgramFixture = {
      mode: options.mode,
      locator: xpath => context.locator({ kind: 'selector', selector: xpath }),
      async coldStart(route) {
        if (options.mode !== 'headless') { unsupported('A connected user DevTools project cannot change its cold entry') }
        const normalized = routePath(route)
        if (normalized.includes('?')) { unsupported('Cold entry accepts registered routes without query parameters') }
        await cleanup()
        await begin(context.signal, normalized)
      },
      async reLaunch(route) { await operation(context.operation(), async () => { await active().reLaunch(routePath(route)) }, true) },
      async navigateTo(route) { await operation(context.operation(), async () => { await active().navigateTo(routePath(route)) }, true) },
      async switchTab(route) { await operation(context.operation(), async () => { await active().switchTab(routePath(route)) }, true) },
      async route() { return operation(context.operation(), async () => (await currentPage(active(), context.timeouts.action)).path.replace(/^\/+/, '')) },
      async data(path) { return operation(context.operation(), async () => (await currentPage(active(), context.timeouts.action)).data(path)) },
      async inspectAgent() {
        return operation(context.operation(), async () => {
          const page = await currentPage(active(), context.timeouts.action)
          if (page.path.replace(/^\/+/, '') !== 'pages/mall/index') { throw failure('INVALID_STATE', 'Agent inspection requires the mall page') }
          const state = record(await page.callMethodWithOptions('automationInspect', { timeout: context.timeouts.action }), 'Agent inspection')
          const { busy, status, eventCount, messageCount, orderCount, reasoningCount, sourceLength, toolCount, latestProduct, latestStatus, pendingAction } = state
          if (typeof busy !== 'boolean' || typeof status !== 'string'
            || typeof eventCount !== 'number' || typeof messageCount !== 'number' || typeof orderCount !== 'number'
            || typeof reasoningCount !== 'number' || typeof sourceLength !== 'number' || typeof toolCount !== 'number'
            || (latestProduct !== undefined && typeof latestProduct !== 'string')
            || (latestStatus !== undefined && typeof latestStatus !== 'string')
            || (pendingAction !== undefined && typeof pendingAction !== 'string')) {
            throw failure('ENGINE_FAILURE', 'Invalid app-owned Agent inspection')
          }
          return { busy, status, eventCount, messageCount, orderCount, reasoningCount, sourceLength, toolCount, latestProduct, latestStatus, pendingAction }
        })
      },
      async inspectTheme() {
        return operation(context.operation(), async () => {
          const page = await currentPage(active(), context.timeouts.action)
          if (page.path.replace(/^\/+/, '') !== 'pages/index/index') { throw failure('INVALID_STATE', 'Theme inspection requires the component page') }
          const state = record(await page.callMethodWithOptions('automationInspectTheme', { timeout: context.timeouts.action }), 'Theme inspection')
          if (typeof state.alternate !== 'boolean' || typeof state.primary !== 'string') { throw failure('ENGINE_FAILURE', 'Theme inspection lacks the actual theme state') }
          return { alternate: state.alternate, primary: state.primary }
        })
      },
      async toasts() {
        const values: unknown = await operation(context.operation(), () => active().evaluateWithOptions('() => getApp().__varoE2eToasts.values.slice()', { timeout: context.timeouts.action }))
        if (!Array.isArray(values) || !values.every(value => typeof value === 'string')) { throw failure('ENGINE_FAILURE', 'Native toast observation is unavailable') }
        return values
      },
      async errors() {
        const native = active()
        if (native instanceof MiniProgram) { await operation(context.operation(), () => native.flushConsole()) }
        return [...consoleErrors]
      },
      async commitNumber(xpath, value) {
        const op = context.operation()
        const matches = await semantics.locate(active(), { kind: 'selector', selector: xpath }, op)
        if (matches.length !== 1) { throw failure('NOT_ACTIONABLE', `Numeric commit requires one input; found ${matches.length}`) }
        const { node, semantic } = await semantics.live(active(), matches[0]!.ref.id, op)
        if (semantic.states?.hidden) { throw failure('NOT_ACTIONABLE', 'Numeric control is hidden') }
        const readonly = await attribute(node, 'readonly')
        if (readonly !== undefined && readonly !== 'false' && readonly !== '0') { throw failure('NOT_ACTIONABLE', 'Numeric control is readonly') }
        if (node instanceof Element && !(node instanceof InputElement)) { unsupported('Numeric commit requires native input') }
        if (!(node instanceof Element) && await node.tagName() !== 'input') { unsupported('Numeric commit requires native input') }
        await operation(op, async () => {
          if (node instanceof InputElement) {
            await node.input(String(value))
            await node.trigger('blur', { value: String(value) })
          }
          else if (!(node instanceof Element)) {
            await node.input(String(value))
            await node.blur(String(value))
          }
          else {
            unsupported('Numeric commit requires native input')
          }
        }, true)
      },
      async geometry(xpath) {
        return operation(context.operation(), async () => {
          const node = await unique(xpath, context.operation())
          if (!(node instanceof Element)) { unsupported('Headless runtime does not measure touch-target geometry') }
          const rect = await node.offset()
          if (![rect.width, rect.height, rect.left, rect.top].every(Number.isFinite)) { throw failure('NODE_STALE', 'Native control has no current geometry') }
          return { width: rect.width, height: rect.height, left: rect.left, top: rect.top }
        })
      },
      async style(xpath, property) {
        return operation(context.operation(), async () => {
          const node = await unique(xpath, context.operation())
          if (!(node instanceof Element)) { unsupported('Headless runtime does not resolve computed styles') }
          return String(await node.style(property))
        })
      },
      async windowInfo() { return operation(context.operation(), async () => record(await active().callWxMethodWithOptions('getWindowInfo', { timeout: context.timeouts.action }), 'Window info')) },
      async screenshot(label) {
        const path = await operation(context.operation(30_000), () => screenshot(label, context.operation(30_000)))
        context.attachArtifact('screenshot', path)
        return path
      },
    }
    return context.fixture('miniProgram', surface, {
      coldStart: { kind: 'resource', label: route => route, timeout: 30_000 },
      reLaunch: { kind: 'resource', label: route => route },
      navigateTo: { kind: 'resource', label: route => route },
      switchTab: { kind: 'resource', label: route => route },
      route: { kind: 'resource' },
      data: { kind: 'resource', label: path => path ?? 'page data' },
      inspectAgent: { kind: 'resource' },
      inspectTheme: { kind: 'resource' },
      toasts: { kind: 'resource' },
      errors: { kind: 'resource' },
      commitNumber: { kind: 'resource', label: xpath => xpath },
      geometry: { kind: 'resource', label: xpath => xpath },
      style: { kind: 'resource', label: (xpath, property) => `${xpath} ${property}` },
      windowInfo: { kind: 'resource' },
      screenshot: { kind: 'resource', label: label => label ?? 'native screenshot', timeout: 30_000 },
    })
  }
  return defineEngine({
    name: 'varo-wechat',
    version: '1.0.0',
    spiVersion: 1,
    platform: options.mode === 'headless' ? 'weapp-headless' : 'weapp-devtools',
    workers: 1,
    validateApp(app, info) {
      if (!app.appPath || app.url || app.bundleId || app.launchArguments || app.permissions) { throw new ConfigurationError('INVALID_CONFIG', `Target ${info.targetName} requires only a compiled app.appPath`) }
    },
    async init(info) {
      info.signal.throwIfAborted()
      if (!info.app.appPath) { throw new ConfigurationError('INVALID_CONFIG', 'Native target requires app.appPath') }
      projectPath = await realpath(resolve(info.projectRoot, info.app.appPath))
      const expected = await realpath(resolve(info.projectRoot, '../playground-weapp/devtools/build'))
      if (projectPath !== expected) { throw new ConfigurationError('INVALID_CONFIG', 'Native app.appPath must identify the playground compiled DevTools project') }
      projectId = createHash('sha256').update(projectPath).digest('hex')
      const config = record(JSON.parse(await readFile(resolve(projectPath, 'project.config.json'), 'utf8')), 'Project config')
      if (typeof config.miniprogramRoot !== 'string') { throw new ConfigurationError('INVALID_CONFIG', 'Compiled project has no miniprogramRoot') }
      const root = await realpath(resolve(projectPath, config.miniprogramRoot))
      const relation = relative(projectPath, root)
      if (relation.startsWith('..') || isAbsolute(relation)) { throw new ConfigurationError('INVALID_CONFIG', 'Compiled app escapes its project') }
      appConfigPath = relative(projectPath, resolve(root, 'app.json'))
      const app = record(JSON.parse(await readFile(resolve(root, 'app.json'), 'utf8')), 'Compiled app config')
      const pages = app.pages
      if (!Array.isArray(pages) || typeof pages[0] !== 'string') { throw new ConfigurationError('INVALID_CONFIG', 'Compiled native application has no entry route') }
      routePath(typeof app.entryPagePath === 'string' ? app.entryPagePath : pages[0])
    },
    async startAttempt(context) { attempt = context; screenshotCount = 0; await begin(context.signal) },
    async endAttempt() { await cleanup(); attempt = undefined },
    async dispose() { await cleanup(); attempt = undefined },
    observe: context => operation(context, () => semantics.snapshot(active(), context)),
    locate: (expression, context) => operation(context, () => semantics.locate(active(), expression, context)),
    actions: options.mode === 'headless' ? ['tap', 'fill', 'clear'] : ['tap', 'fill', 'clear', 'scrollIntoView', 'swipe'],
    perform: (ref, action, context) => operation(context, () => perform(ref, action, context)),
    session: {
      async back(context) { await operation(context, async () => { await active().navigateBack() }, true) },
      ...(options.mode === 'headless'
        ? { async reset(context: OperationContext) { await cleanup(); await begin(context.signal) } }
        : { async restart(context: OperationContext) { await cleanup(); await begin(context.signal) } }),
      // Connected DevTools storage is user-owned: do not advertise clearState there.
    },
    fixtures: { miniProgram: fixture },
    ...(options.mode === 'devtools' ? { artifacts: { screenshot: (label: string | undefined, context: OperationContext) => operation(context, () => screenshot(label, context)) } } : {}),
  })
}
