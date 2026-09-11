import type { Root } from 'glass-easel-miniprogram-adapter'
import type { NativeArtifactBundle } from './artifacts.ts'
import type { WeappWebHarness } from './harness.ts'
import type { NativeHost } from './native-host.ts'
import type { WeappWebRuntimeSession } from './session.ts'
import * as glassEasel from 'glass-easel'
import { MiniProgramEnv } from 'glass-easel-miniprogram-adapter'
import { PreviewBackend } from './backend.ts'
import { resolveWeappWebHarness } from './harness.ts'
import { createNativeHost } from './native-host.ts'
import { tencentMapDemoKey } from './tencent-map.ts'
import './native-elements.css'

export interface MountWeappWebPreviewOptions {
  mount: HTMLElement
  artifacts: NativeArtifactBundle
  session: WeappWebRuntimeSession
  harness?: Partial<WeappWebHarness>
}

function assetUrl(artifacts: NativeArtifactBundle, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path)
    if (url.username || url.password) { throw new Error('预览图片地址不能包含凭据') }
    return url.href
  }
  if (/^data:image\/(?:png|jpeg|gif|webp|svg\+xml);/i.test(path)) { return path }
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) {
    throw new Error(`不支持的预览资源地址：${path}`)
  }
  if (Object.hasOwn(artifacts.assets, path)) {
    return new URL(artifacts.assets[path], window.location.href).href
  }
  const normalized = path.replace(/^\.\//, '').replace(/^\//, '')
  if (normalized.split('/').includes('..')) { throw new Error('预览资源不能越过小程序产物根目录') }
  const url = artifacts.assets[normalized]
  if (!url) { throw new Error(`小程序预览缺少资源：${normalized}`) }
  return new URL(url, window.location.href).href
}

export async function mountWeappWebPreview(options: MountWeappWebPreviewOptions): Promise<() => void> {
  const { mount, artifacts, session } = options
  const harness = resolveWeappWebHarness(options.harness)
  let root: Root | undefined
  let nativeHost: NativeHost | undefined
  let closed = false
  const backend = new PreviewBackend()
  backend.onEvent(glassEasel.Event.triggerBackendEvent)
  const errorListener: Parameters<typeof glassEasel.addGlobalErrorListener>[0] = error => session.fail(error)
  const onVisibility = () => {
    if (closed || !root) { return }
    const visible = document.visibilityState !== 'hidden'
    nativeHost?.emitAppVisibility(visible)
    root.getComponent().triggerPageLifetime(visible ? 'show' : 'hide', [])
  }
  const onResize = () => {
    if (closed || !root) { return }
    root.getComponent().triggerPageLifetime('resize', [{ size: { windowWidth: window.innerWidth, windowHeight: window.innerHeight } }])
  }
  const close = () => {
    if (closed) { return }
    closed = true
    session.signal.removeEventListener('abort', close)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('resize', onResize)
    try {
      if (root) {
        root.getComponent().triggerPageLifetime('hide', [])
        nativeHost?.emitAppVisibility(false)
        root.release()
      }
    }
    finally {
      nativeHost?.dispose()
      backend.destroy()
      glassEasel.removeGlobalErrorListener(errorListener)
      mount.replaceChildren()
    }
  }
  glassEasel.addGlobalErrorListener(errorListener)
  session.signal.addEventListener('abort', close, { once: true })

  try {
    const env = new MiniProgramEnv()
    const nativeComponents = harness.registerNativeElements(env, artifacts.builtinTemplates, {
      mapKey: tencentMapDemoKey,
      resolveAssetUrl: path => assetUrl(artifacts, path),
      reportError: error => session.fail(error),
    })
    const space = env.createCodeSpace('varo-preview', true)
    for (const [tag, definition] of Object.entries(nativeComponents)) {
      space.getComponentSpace().setGlobalUsingComponent(tag, definition)
    }
    const associated = env.associateBackend(backend)
    for (const [path, css] of Object.entries(artifacts.styles)) {
      associated.registerStyleSheetContent(path, css)
      space.addStyleSheet(path, path, path === 'app' ? undefined : artifacts.components[path]?.styleScope)
    }
    for (const [path, component] of Object.entries(artifacts.components)) {
      space.addComponentStaticConfig(path, component.config)
      space.addCompiledTemplate(path, component.template)
      if (!Object.hasOwn(artifacts.styles, path)) { space.addStyleSheet(path, undefined, component.styleScope) }
    }
    nativeHost = createNativeHost(artifacts, space, session.pagePath, error => session.fail(error), harness)
    nativeHost.register()
    if (closed) { throw new Error('小程序预览初始化已中断') }
    const createdRoot = associated.createRoot('wx-page', space, session.pagePath)
    if (closed) {
      createdRoot.release()
      throw new Error('小程序预览初始化已中断')
    }
    root = createdRoot
    if (!nativeHost.getPage()) { nativeHost.setPage(root.get()) }
    const placeholder = document.createElement('span')
    mount.append(placeholder)
    const parentElement = mount as unknown as glassEasel.GeneralBackendElement
    const placeholderElement = placeholder as unknown as glassEasel.GeneralBackendElement
    root.attach(parentElement, placeholderElement)
    root.getComponent().triggerPageLifetime('show', [])
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)
    await new Promise<void>((resolve, reject) => backend.render(error => error ? reject(error) : resolve()))
    await nativeHost.whenReady()
    if (!closed) { session.ready(artifacts.digest) }
    return close
  }
  catch (error) {
    close()
    throw error
  }
}
