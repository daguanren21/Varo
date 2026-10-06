import type { Pinia } from 'wevu'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, disposePinia, nextTick } from 'wevu'
import { useAedStore } from '../src/store'
import { aedStorageKey, createAedPinia } from '../src/store/manager'
import { useNavigationStore } from '../src/store/navigation'

const { storage } = vi.hoisted(() => {
  const storage = new Map<string, unknown>()
  const clone = (value: unknown) => value === undefined ? undefined : JSON.parse(JSON.stringify(value))
  vi.stubGlobal('wx', {
    getAccountInfoSync: vi.fn(() => ({ miniProgram: { envVersion: 'develop' } })),
    getStorageSync: vi.fn((key: string) => clone(storage.get(key))),
    setStorageSync: vi.fn((key: string, value: unknown) => storage.set(key, clone(value))),
  })
  return { storage }
})

function createAppManager() {
  const manager = createAedPinia()
  createApp({}).use(manager)
  return manager
}

let manager: Pinia
beforeEach(() => {
  storage.clear()
  manager = createAppManager()
})

afterEach(() => disposePinia(manager))

describe('Real-world Weapp Wevu stores', () => {
  it('updates domain state through explicit actions', () => {
    const store = useAedStore(manager)

    store.setAccessToken('token-1')
    store.setManageComponent('deviceMap')
    store.setManageSearch({ keyword: 'AED-001', page: 1, size: 10 })
    store.setMyLocation({ myAddress: '苏州', myLatitude: 31.2, myLongitude: 120.7 })

    expect(store.state.accessToken).toBe('token-1')
    expect(store.state.home.componentId).toBe('deviceMap')
    expect(store.state.home.searchParams).toEqual({ keyword: 'AED-001', page: 1, size: 10 })
    expect(store.state.myAddress).toBe('苏州')
    expect(store.state.myLatitude).toBe(31.2)
    expect(store.state.myLongitude).toBe(120.7)
    store.setMapBounds({ minLat: 30, maxLat: 32, minLng: 119, maxLng: 121 })
    expect(store.mapBounds).toEqual({ minLat: 30, maxLat: 32, minLng: 119, maxLng: 121 })
  })

  it('persists nested-only changes and restores isolated state in a fresh app', async () => {
    const store = useAedStore(manager)
    store.setAccessToken('local-test-token')
    await nextTick()

    store.setBarHeight(42)
    store.setTagRecord({ key: 'device-42', list: [{ checked: true }] })
    await nextTick()
    expect(storage.get(aedStorageKey)).toMatchObject({
      accessToken: 'local-test-token',
      home: { barHeight: 42 },
      tagCheckRecord: { 'device-42': [{ checked: true }] },
    })

    const restoredManager = createAppManager()
    try {
      const restored = useAedStore(restoredManager)
      expect(restored.state.accessToken).toBe('local-test-token')
      expect(restored.state.home.barHeight).toBe(42)
      store.setBarHeight(48)
      store.state.home.searchParams.keyword = 'nested-edit'
      store.state.tagCheckRecord['device-42']![0]!.checked = false
      await nextTick()
      expect(storage.get(aedStorageKey)).toMatchObject({
        home: { barHeight: 48, searchParams: { keyword: 'nested-edit' } },
        tagCheckRecord: { 'device-42': [{ checked: false }] },
      })
      expect(restored.state.home.barHeight).toBe(42)
      expect(restored.state.tagCheckRecord['device-42']![0]!.checked).toBe(true)
    }
    finally {
      disposePinia(restoredManager)
    }
  })

  it('stops persistence on disposal without stopping another app manager', async () => {
    const store = useAedStore(manager)
    store.setBarHeight(42)
    await nextTick()
    const otherManager = createAppManager()
    try {
      const other = useAedStore(otherManager)
      disposePinia(manager)
      store.setBarHeight(99)
      await nextTick()
      expect(storage.get(aedStorageKey)).toMatchObject({ home: { barHeight: 42 } })

      other.setBarHeight(55)
      await nextTick()
      expect(storage.get(aedStorageKey)).toMatchObject({ home: { barHeight: 55 } })
    }
    finally {
      disposePinia(otherManager)
    }
  })

  it('keeps navigation payloads outside URL query strings', () => {
    const navigation = useNavigationStore(manager)
    const payload = { info: { id: 42, serialNumber: 'AED-42' } }

    navigation.setPayload(payload)

    expect(navigation.payload).toEqual(payload)
    navigation.setPayload()
    expect(navigation.payload).toBeUndefined()
  })
})
