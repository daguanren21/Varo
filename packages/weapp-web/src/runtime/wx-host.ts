export interface WxHostOptions {
  pagePath: string
  getPage: () => Record<string, unknown> | undefined
  enqueue: (callback: () => void) => void
  apis?: Record<string, unknown>
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

function callback(options: Record<string, unknown> | undefined, name: string, value: unknown) {
  const handler = options?.[name]
  if (typeof handler === 'function') { Reflect.apply(handler, undefined, [value]) }
}

export function createWxHost({ pagePath, getPage, enqueue, apis }: WxHostOptions) {
  const resizeListeners = new Set<(value: unknown) => void>()
  const launchOptions = () => ({ path: pagePath, query: {} })
  const windowInfo = () => ({
    pixelRatio: window.devicePixelRatio,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    screenTop: 0,
    statusBarHeight: 0,
    safeArea: { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth, height: window.innerHeight },
  })
  const systemInfo = () => ({
    ...windowInfo(),
    platform: 'web',
    model: 'Varo Web Preview',
    language: navigator.language,
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  })
  const listeners = (set: Set<(value: unknown) => void>) => ({
    add(value: unknown) {
      if (typeof value !== 'function') { throw new TypeError('小程序事件监听器必须是函数') }
      set.add(value as (value: unknown) => void)
    },
    remove(value?: unknown) {
      if (value === undefined) { set.clear() }
      else if (typeof value === 'function') { set.delete(value as (value: unknown) => void) }
    },
  })
  const resize = listeners(resizeListeners)
  const invokePage = (method: string, args: unknown[]) => {
    const page = getPage()
    const handler = page?.[method]
    if (!page || typeof handler !== 'function') { throw new Error(`当前预览页面无法提供 wx.${method}`) }
    return Reflect.apply(handler, page, args)
  }
  const supported: Record<string, unknown> = {
    getWindowInfo: windowInfo,
    getSystemInfoSync: systemInfo,
    getDeviceInfo: () => ({ platform: 'web', model: 'Varo Web Preview', system: navigator.userAgent }),
    getAppBaseInfo: () => ({ language: navigator.language, theme: systemInfo().theme, version: 'Web Preview' }),
    getLaunchOptionsSync: launchOptions,
    getEnterOptionsSync: launchOptions,
    getCurrentPages: () => {
      const page = getPage()
      return page ? [page] : []
    },
    nextTick: (handler: unknown) => {
      if (typeof handler !== 'function') { throw new TypeError('wx.nextTick 需要回调函数') }
      enqueue(() => Reflect.apply(handler, undefined, []))
    },
    getSystemInfo: (value: unknown) => {
      const options = asRecord(value)
      enqueue(() => {
        const result = { ...systemInfo(), errMsg: 'getSystemInfo:ok' }
        callback(options, 'success', result)
        callback(options, 'complete', result)
      })
    },
    createSelectorQuery: () => invokePage('createSelectorQuery', []),
    onWindowResize: resize.add,
    offWindowResize: resize.remove,
  }
  const unavailable = (name: string) => (value?: unknown) => {
    const error = new Error(`Web 兼容预览不支持 wx.${name}，请在微信环境中使用此能力。`)
    const options = asRecord(value)
    const failure = { errMsg: `${name}:fail unsupported in Web Preview` }
    if (typeof options?.fail === 'function' || typeof options?.complete === 'function') {
      enqueue(() => {
        callback(options, 'fail', failure)
        callback(options, 'complete', failure)
      })
      return
    }
    throw error
  }
  Object.assign(supported, apis)
  for (const name of ['login', 'requestPayment', 'getUserProfile', 'getUserInfo', 'getPhoneNumber', 'scanCode', 'chooseImage', 'chooseMedia', 'request', 'uploadFile', 'downloadFile']) {
    if (!Object.hasOwn(supported, name)) { supported[name] = unavailable(name) }
  }
  supported.canIUse = (name: unknown) => typeof name === 'string' && Object.hasOwn(supported, name)

  const onResize = () => {
    const value = { size: { windowWidth: window.innerWidth, windowHeight: window.innerHeight } }
    for (const listener of resizeListeners) { listener(value) }
  }
  window.addEventListener('resize', onResize)

  return {
    wx: supported,
    dispose() {
      window.removeEventListener('resize', onResize)
      resizeListeners.clear()
    },
  }
}
