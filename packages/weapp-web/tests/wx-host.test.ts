// @vitest-environment jsdom

import type { template } from 'glass-easel'
import type { NativeArtifactBundle, NativeGlobals } from '../src/runtime/artifacts.ts'
import type { PreviewSelectorQuery, PreviewSelectorResult } from '../src/runtime/selector-query.ts'
import { compileFunction } from 'node:vm'
import { TmplGroup } from 'glass-easel-template-compiler'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { mountWeappWebPreview } from '../src/runtime/mount.ts'
import { nativeTemplates } from '../src/runtime/native-templates.ts'

interface NativeInstance {
  createSelectorQuery: () => PreviewSelectorQuery
  setData: (data: Record<string, unknown>) => void
}
interface NativeWx {
  createSelectorQuery: () => PreviewSelectorQuery
  createCanvasContext: (id: string, owner?: unknown) => unknown
}

function compileTemplates(sources: Record<string, string>): NativeArtifactBundle['builtinTemplates'] {
  const group = new TmplGroup()
  try {
    for (const [path, source] of Object.entries(sources)) { group.addTmpl(path, source) }
    const groupList = compileFunction(`return ${group.getTmplGenObjectGroups()}`)() as NonNullable<template.ComponentTemplate['groupList']>
    return Object.fromEntries(Object.keys(sources).map(path => [path, { groupList, content: groupList[path] }]))
  }
  finally {
    group.free()
  }
}

let builtinTemplates: NativeArtifactBundle['builtinTemplates']
const cleanups: Array<() => void> = []
beforeAll(() => { builtinTemplates = compileTemplates(nativeTemplates) })
afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) { cleanup() }
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

async function mountCanvasFixture(pageKind: 'Page' | 'Component' = 'Component') {
  // jsdom lacks layout and element scrolling; keep native query ownership real.
  const scrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo')
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value(this: HTMLElement, options: ScrollToOptions) {
      this.scrollLeft = options.left ?? this.scrollLeft
      this.scrollTop = options.top ?? this.scrollTop
    },
  })
  cleanups.push(() => {
    if (scrollTo) { Object.defineProperty(HTMLElement.prototype, 'scrollTo', scrollTo) }
    else { Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo') }
  })
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(390)
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(844)
  const instances: { page?: NativeInstance, scopes: NativeInstance[], wx?: NativeWx } = { scopes: [] }
  const errors: unknown[] = []
  const ready = vi.fn()
  const changed = vi.fn()
  const templates = compileTemplates({
    'pages/canvas': '<canvas-scope wx:if="{{first}}" /><canvas-scope /><view id="page-view" />',
    'components/canvas-scope': `
      <canvas wx:if="{{visible}}" id="surface" canvas-id="surface" class="surface" type="2d" aria-label="{{label}}" />
      <canvas id="legacy" canvas-id="legacy" />
      <scroll-view id="scroll" scroll-y="{{true}}"><view class="content">Content</view></scroll-view>
      <input value="hello" bindinput="changed" />
      <button>Action</button>
    `,
  })
  const register = (globals: NativeGlobals, kind: 'Page' | 'Component', definition: Record<string, unknown>) => {
    const constructor = globals[kind] as (definition: Record<string, unknown>) => unknown
    constructor(definition)
  }
  const capturePage = function (this: NativeInstance) { instances.page = this }
  const artifacts: NativeArtifactBundle = {
    digest: 'native-canvas-query',
    pages: { canvas: 'pages/canvas' },
    builtinTemplates,
    styles: {},
    assets: {},
    components: {
      'pages/canvas': {
        config: { usingComponents: { 'canvas-scope': '/components/canvas-scope' } },
        template: templates['pages/canvas'],
        styleScope: '',
      },
      'components/canvas-scope': {
        config: { component: true },
        template: templates['components/canvas-scope'],
        styleScope: '',
      },
    },
    modules: {
      'app.js': (_require, _module, _exports, globals) => {
        const App = globals.App as (definition: Record<string, unknown>) => unknown
        App({})
      },
      'pages/canvas.js': (_require, _module, _exports, globals) => {
        instances.wx = globals.wx as NativeWx
        register(globals, pageKind, {
          data: { first: true },
          ...(pageKind === 'Page' ? { onLoad: capturePage } : { lifetimes: { created: capturePage } }),
        })
      },
      'components/canvas-scope.js': (_require, _module, _exports, globals) => {
        register(globals, 'Component', {
          data: { visible: true, label: 'Drawing' },
          methods: { changed },
          lifetimes: {
            created(this: NativeInstance) { instances.scopes.push(this) },
          },
        })
      },
    },
  }
  const mount = document.createElement('div')
  document.body.append(mount)
  const abort = new AbortController()
  cleanups.push(() => abort.abort())
  const close = await mountWeappWebPreview({
    artifacts,
    mount,
    session: { pagePath: 'pages/canvas', signal: abort.signal, ready, fail(error) { errors.push(error) } },
  })
  const [left, right] = instances.scopes
  if (!instances.page || !instances.wx || !left || !right) { throw new Error('The native canvas fixture did not initialize') }
  const hosts = [...mount.querySelectorAll<HTMLElement>('wx-canvas')].filter(host => host.getAttribute('type') === '2d')
  const controls = hosts.map(host => host.querySelector('canvas')!)
  if (hosts.length !== 2 || controls.some(control => !control)) { throw new Error('Expected two native Canvas2D controls') }
  // jsdom has no layout engine. Measure the actual adapter-owned host nodes;
  // selector resolution, component scope, field delivery and lifecycle stay real.
  hosts.forEach((host, index) => {
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 20, 320 + index, 180 + index))
  })
  return { ...instances, page: instances.page, wx: instances.wx, left, right, hosts, controls, mount, close, errors, ready, changed }
}

function canvasResult(query: PreviewSelectorQuery) {
  return new Promise<PreviewSelectorResult | null>((resolve) => {
    query.select('#surface').fields({ node: true, size: true }, resolve).exec()
  })
}

describe('native selector-query Canvas2D ownership', () => {
  it.each(['Page', 'Component'] as const)('scopes instance and wx queries through real %s registrations', async (pageKind) => {
    const fixture = await mountCanvasFixture(pageKind)
    expect(fixture.ready).toHaveBeenCalledOnce()
    const first = await canvasResult(fixture.left.createSelectorQuery())
    const second = await canvasResult(fixture.right.createSelectorQuery())
    expect(first).toEqual({ node: fixture.controls[0], width: 320, height: 180 })
    expect(second).toEqual({ node: fixture.controls[1], width: 321, height: 181 })
    expect(first!.node).toBeInstanceOf(HTMLCanvasElement)
    expect(first!.node!.getContext).toBe(HTMLCanvasElement.prototype.getContext)
    expect(first!.node).not.toBe(second!.node)
    expect(await canvasResult(fixture.wx.createSelectorQuery().in(fixture.left))).toEqual(first)
    expect(await canvasResult(fixture.wx.createSelectorQuery().in(fixture.right))).toEqual(second)
    expect(await canvasResult(fixture.page.createSelectorQuery())).toBeNull()
    expect(await canvasResult(fixture.wx.createSelectorQuery())).toBeNull()
    expect(fixture.errors).toEqual([])
  })

  it('delivers ordered callbacks, scoped selectAll, geometry and scroll fields in one batch', async () => {
    const fixture = await mountCanvasFixture()
    const callbacks: string[] = []
    const query = fixture.left.createSelectorQuery()
    const callbackResults: unknown[] = []
    query.select('#surface').boundingClientRect((result) => {
      callbacks.push('rect')
      callbackResults.push(result)
    })
    query.selectAll('.surface').fields({ node: true, size: true }, (results) => {
      callbacks.push('nodes')
      callbackResults.push(results)
    })
    query.select('#scroll').fields({ size: true, scrollOffset: true }, (result) => {
      callbacks.push('scroll')
      callbackResults.push(result)
    })
    query.selectViewport().fields({ size: true }, (result) => {
      callbacks.push('viewport')
      callbackResults.push(result)
    })
    query.in(fixture.right).select('#surface').node((result) => {
      callbacks.push('other')
      callbackResults.push(result)
    })
    expect(callbacks).toEqual([])
    const results = await new Promise<unknown[]>(resolve => query.exec(resolve))
    expect(callbacks).toEqual(['rect', 'nodes', 'scroll', 'viewport', 'other'])
    expect(results).toHaveLength(5)
    expect(callbackResults).toEqual(results)
    expect(results[0]).toMatchObject({ id: 'surface', left: 10, top: 20, width: 320, height: 180 })
    expect(results[0]).not.toHaveProperty('node')
    expect(results[1]).toEqual([{ node: fixture.controls[0], width: 320, height: 180 }])
    expect(results[2]).toMatchObject({ width: 0, height: 0, scrollLeft: 0, scrollTop: 0 })
    expect(results[3]).toMatchObject({ width: 390, height: 844 })
    expect(results[4]).toEqual({ node: fixture.controls[1] })
    expect(fixture.errors).toEqual([])
  })

  it('does not return detached or replacement canvases from a stale component scope', async () => {
    const fixture = await mountCanvasFixture()
    const pending = canvasResult(fixture.left.createSelectorQuery())
    fixture.page.setData({ first: false })
    expect(await pending).toBeNull()
    expect(await canvasResult(fixture.left.createSelectorQuery())).toBeNull()
    expect(await canvasResult(fixture.wx.createSelectorQuery().in(fixture.left))).toBeNull()
    expect(await canvasResult(fixture.right.createSelectorQuery())).toMatchObject({ node: fixture.controls[1] })
    expect(() => fixture.wx.createCanvasContext('legacy', fixture.left)).toThrow('找不到 canvas')
    fixture.page.setData({ first: true })
    const replacement = fixture.scopes[2]!
    const replaced = await canvasResult(replacement.createSelectorQuery())
    expect(replaced?.node).toBeInstanceOf(HTMLCanvasElement)
    expect(replaced?.node).not.toBe(fixture.controls[0])
    expect(await canvasResult(fixture.left.createSelectorQuery())).toBeNull()
    expect(fixture.errors).toEqual([])
  })

  it('drops a canvas detached while adapter measurement is pending', async () => {
    const fixture = await mountCanvasFixture()
    const pending = canvasResult(fixture.left.createSelectorQuery())
    // exec schedules adapter measurement first; its geometry callback is async.
    await Promise.resolve()
    fixture.left.setData({ visible: false })
    fixture.left.setData({ visible: true })
    expect(await pending).toBeNull()
    const current = await canvasResult(fixture.left.createSelectorQuery())
    expect(current?.node).toBeInstanceOf(HTMLCanvasElement)
    expect(current?.node).not.toBe(fixture.controls[0])
    expect(fixture.errors).toEqual([])
  })

  it('keeps Canvas2D bitmap sizing caller-owned while preserving legacy and ordinary controls', async () => {
    const fixture = await mountCanvasFixture()
    const result = await canvasResult(fixture.left.createSelectorQuery())
    const canvas = result!.node!
    canvas.width = 640
    canvas.height = 360
    fixture.left.setData({ label: 'Updated drawing' })
    expect(canvas.width).toBe(640)
    expect(canvas.height).toBe(360)
    expect(canvas.getAttribute('aria-label')).toBe('Updated drawing')
    expect(fixture.controls[1]!.width).toBe(300)
    const legacy = await new Promise<PreviewSelectorResult | null>((resolve) => {
      fixture.left.createSelectorQuery().select('#legacy').fields({ node: true, size: true }, resolve).exec()
    })
    expect(legacy?.node).toBeNull()
    expect(legacy).toMatchObject({ width: 0, height: 0 })
    const input = fixture.mount.querySelector('input')!
    input.value = 'updated'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(fixture.changed).toHaveBeenCalledOnce()
    expect(fixture.changed.mock.calls[0]![0]).toMatchObject({ detail: { value: 'updated' } })
    expect(fixture.mount.querySelectorAll('button')).toHaveLength(2)
    expect(fixture.errors).toEqual([])
  })
})
