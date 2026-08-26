import { computed, shallowRef } from 'wevu'

export interface WeappChromeMetrics {
  navigationHeight: number
  rightInset: number
  statusBarHeight: number
}

export function useWeappChrome() {
  const metrics = shallowRef<WeappChromeMetrics>({
    navigationHeight: 44,
    rightInset: 96,
    statusBarHeight: 20
  })

  if (typeof wx !== 'undefined') {
    const system = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect?.()
    const statusBarHeight = system.statusBarHeight ?? 20

    metrics.value = !capsule || capsule.width === 0
      ? {
          navigationHeight: 44,
          rightInset: 16,
          statusBarHeight
        }
      : {
          navigationHeight: (capsule.top - statusBarHeight) * 2 + capsule.height,
          rightInset: system.windowWidth - capsule.left + 10,
          statusBarHeight
        }
  }

  const rootStyle = computed(() => ({ paddingTop: `${metrics.value.statusBarHeight}px` }))
  const navigationStyle = computed(() => ({
    minHeight: `${metrics.value.navigationHeight}px`,
    paddingRight: `${Math.max(0, metrics.value.rightInset - 14)}px`
  }))

  return {
    metrics,
    navigationStyle,
    rootStyle
  }
}
