import type { NavigationPayload } from '../store/navigation'
import { useNativeRouter } from 'wevu'
import { useNavigationStore } from '../store/navigation'

export type RouteParams = Record<string, string | number | boolean | null | undefined>

export const NavigationType = {
  navigateTo: 'navigateTo',
  reLaunch: 'reLaunch',
  redirectTo: 'redirectTo',
  switchTab: 'switchTab',
} as const

type NavigationMethod = keyof typeof NavigationType

interface NavigationOptions {
  data?: NavigationPayload
  params?: RouteParams
  type?: NavigationMethod
}

function routeUrl(path: string, area: string, params: RouteParams) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  const pathname = `/${area}/${path}/index`
  return query ? `${pathname}?${query}` : pathname
}

export function useAedNavigation() {
  const router = useNativeRouter()
  const navigation = useNavigationStore()

  function toRoute(path: string, area = 'pages', options: NavigationOptions = {}) {
    navigation.setPayload(options.data)
    const url = routeUrl(path, area, options.params ?? {})
    const method = options.type ?? NavigationType.navigateTo
    return router[method]({ url })
  }

  function back(delta = 1) {
    return router.navigateBack({ delta })
  }

  return {
    back,
    toRoute,
  }
}

export function readRouteData<T extends NavigationPayload = NavigationPayload>() {
  return useNavigationStore().payload.value as unknown as T | undefined
}

export function readRouteParams<T extends RouteParams = RouteParams>() {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as unknown as { options?: T } | undefined
  return (page?.options ?? {}) as unknown as T
}
