import { renderWeappThemeCss } from '@varo-ui/theme/weapp'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStore } from 'wevu'
import { useAedStore } from '../src/store'
import { useNavigationStore } from '../src/store/navigation'
import { realworldTheme } from '../src/theme'

const { storage } = vi.hoisted(() => {
  const storage = new Map<string, unknown>()
  vi.stubGlobal('wx', {
    getAccountInfoSync: vi.fn(() => ({ miniProgram: { envVersion: 'develop' } })),
    getStorageSync: vi.fn((key: string) => storage.get(key)),
    setStorageSync: vi.fn((key: string, value: unknown) => storage.set(key, value)),
  })
  return { storage }
})

beforeEach(() => {
  storage.clear()
  createStore()
})

describe('Real-world Weapp Wevu stores', () => {
  it('updates domain state through explicit actions', () => {
    const store = useAedStore()

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
  })

  it('keeps navigation payloads outside URL query strings', () => {
    const navigation = useNavigationStore()
    const payload = { info: { id: 42, serialNumber: 'AED-42' } }

    navigation.setPayload(payload)

    expect(navigation.payload.value).toEqual(payload)
    navigation.setPayload()
    expect(navigation.payload.value).toBeUndefined()
  })
})

describe('Real-world Varo theme', () => {
  it('renders the branded semantic tokens into global mini-program CSS', () => {
    expect(realworldTheme.seed.primary).toBe('#ff6216')
    expect(realworldTheme.components.button.borderRadius).toBe('12px')
    expect(renderWeappThemeCss(realworldTheme)).toContain('--varo-ui-primary: #ff6216;')
    expect(renderWeappThemeCss(realworldTheme)).toContain('--varo-ui-text: #231815;')
  })
})
