import { computed, shallowRef } from 'wevu'

export interface WeappChromeMetrics {
  contentTop: number
  navigationHeight: number
  rightInset: number
  statusBarHeight: number
}

export function useWeappChrome() {
  const metrics = shallowRef<WeappChromeMetrics>({
    contentTop: 64,
    navigationHeight: 44,
    rightInset: 96,
    statusBarHeight: 20,
  })

  if (typeof wx !== 'undefined') {
    const windowInfo = wx.getWindowInfo()
    const capsule = wx.getMenuButtonBoundingClientRect?.()
    const statusBarHeight = windowInfo.statusBarHeight ?? 20
    const hasCapsule = Boolean(capsule && capsule.width > 0 && capsule.height > 0)
    const navigationHeight = hasCapsule
      ? (capsule!.top - statusBarHeight) * 2 + capsule!.height
      : 44
    const rightInset = hasCapsule
      ? Math.max(16, windowInfo.windowWidth - capsule!.left + 10)
      : 16

    metrics.value = {
      contentTop: statusBarHeight + navigationHeight,
      navigationHeight,
      rightInset,
      statusBarHeight,
    }
  }

  const rootStyle = computed(() => ({
    paddingTop: `${metrics.value.statusBarHeight}px`,
  }))
  const navigationStyle = computed(() => ({
    minHeight: `${metrics.value.navigationHeight}px`,
    paddingRight: `${metrics.value.rightInset}px`,
  }))
  const contentTopStyle = computed(() => ({
    paddingTop: `${metrics.value.contentTop}px`,
  }))

  return {
    contentTopStyle,
    metrics,
    navigationStyle,
    rootStyle,
  }
}
