import type { RegistryTarget } from '../src'
import { describe, expect, it } from 'vitest'
import { getRegistryProfile, isRegistryTarget, registryProfiles } from '../src'

describe('registry deployment profiles', () => {
  it('resolves canonical compiler and host combinations without mutable overrides', () => {
    const expected = [
      { id: 'h5', renderer: 'h5', compilerPlatform: null, host: 'browser', maturity: 'stable' },
      { id: 'weapp', renderer: 'weapp', compilerPlatform: 'weapp', host: 'miniprogram', maturity: 'stable' },
      { id: 'alipay', renderer: 'weapp', compilerPlatform: 'alipay', host: 'miniprogram', maturity: 'experimental' },
      { id: 'tt', renderer: 'weapp', compilerPlatform: 'tt', host: 'miniprogram', maturity: 'experimental' },
      { id: 'xhs', renderer: 'weapp', compilerPlatform: 'xhs', host: 'miniprogram', maturity: 'experimental' },
      { id: 'donut-android', renderer: 'weapp', compilerPlatform: 'weapp', host: 'donut', os: 'android', maturity: 'experimental' },
      { id: 'donut-ios', renderer: 'weapp', compilerPlatform: 'weapp', host: 'donut', os: 'ios', maturity: 'experimental' },
      { id: 'donut-ohos', renderer: 'weapp', compilerPlatform: 'weapp', host: 'donut', os: 'ohos', maturity: 'experimental' },
    ]
    expect(Object.values(registryProfiles)).toEqual(expected)
    for (const entry of expected) {
      expect(isRegistryTarget(entry.id)).toBe(true)
      const profile = getRegistryProfile(entry.id as RegistryTarget)
      expect(Reflect.set(profile, 'compilerPlatform', 'invalid')).toBe(false)
      expect(Reflect.set(registryProfiles, entry.id, { renderer: 'invalid' })).toBe(false)
      expect(getRegistryProfile(entry.id as RegistryTarget)).toEqual(entry)
    }
    expect(Reflect.set(registryProfiles, 'native', { renderer: 'weapp' })).toBe(false)
    expect(isRegistryTarget('native')).toBe(false)
  })

  it.each(['native', 'weapp-vite', 'ALIPAY', 'toString', 'constructor', '', null, undefined, 42])('never resolves unknown target %j through a fallback', (value) => {
    expect(isRegistryTarget(value)).toBe(false)
    expect(() => getRegistryProfile(value as RegistryTarget)).toThrow(/Unsupported registry target/)
  })
})
