import type { GlobalState } from './index'
import { createPinia } from 'wevu'

export const aedStoreId = 'realworld-weapp'
export const aedStorageKey = 'realworld-weapp-state'

export function createAedPinia() {
  return createPinia().use(({ store }) => {
    if (store.$id !== aedStoreId) { return }
    // Subscribe after Pinia owns the state tree so nested updates and disposal follow the store.
    store.$subscribe((_mutation: unknown, value: { state: GlobalState }) => {
      wx.setStorageSync(aedStorageKey, value.state)
    })
  })
}

export const pinia = createAedPinia()
