import { defineStore, shallowRef } from 'wevu'

export type NavigationPayload = Record<string, unknown>

export const useNavigationStore = defineStore('realworld-weapp-navigation', () => {
  const payload = shallowRef<NavigationPayload | undefined>(undefined)

  function setPayload(value?: NavigationPayload) {
    payload.value = value
  }

  return {
    payload,
    setPayload,
  }
})
