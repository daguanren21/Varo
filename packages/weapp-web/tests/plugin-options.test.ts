import { describe, expect, it } from 'vitest'
import { assertNativeArtifactsOptions } from '../src/plugin/options.ts'
import { resolveWeappWebHarness } from '../src/runtime/harness.ts'
import { createWxHost } from '../src/runtime/wx-host.ts'

describe('weapp-web plugin options', () => {
  it('rejects empty page maps and escaped compiled paths', () => {
    expect(() => assertNativeArtifactsOptions({ nativeBuildRoot: '/tmp/mp', pages: {} })).toThrow(Error)
    expect(() => assertNativeArtifactsOptions({
      nativeBuildRoot: '/tmp/mp',
      pages: { controls: '../outside' },
    })).toThrow(/invalid compiled page path/)
  })

  it('accepts a host-owned page catalog', () => {
    expect(() => assertNativeArtifactsOptions({
      nativeBuildRoot: '/tmp/mp-weixin',
      pages: { sandbox: 'pages/sandbox/index' },
    })).not.toThrow()
  })
})

describe('weapp-web harness replacement', () => {
  it('lets a host inject extra wx APIs without replacing the default host', () => {
    const host = createWxHost({
      pagePath: 'pages/sandbox/index',
      getPage: () => undefined,
      enqueue: callback => callback(),
      apis: {
        ping: () => 'pong',
      },
    })
    const canIUse = host.wx.canIUse
    if (typeof canIUse !== 'function') { throw new TypeError('wx.canIUse must be a function') }
    expect(canIUse('ping')).toBe(true)
    expect((host.wx.ping as () => string)()).toBe('pong')
    expect(canIUse('login')).toBe(true)
    expect(() => (host.wx.login as () => void)()).toThrow(/不支持 wx.login/)
    host.dispose()
  })

  it('lets a host replace createWxHost entirely', () => {
    const harness = resolveWeappWebHarness({
      createWxHost: () => ({
        wx: { ping: () => 'custom' },
        dispose() {},
      }),
    })
    const host = harness.createWxHost({
      pagePath: 'pages/sandbox/index',
      getPage: () => undefined,
      enqueue: callback => callback(),
    })
    expect((host.wx.ping as () => string)()).toBe('custom')
    expect(host.wx.canIUse).toBeUndefined()
  })
})
