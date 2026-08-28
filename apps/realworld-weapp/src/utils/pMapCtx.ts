export function getScale(mapContext: WechatMiniprogram.MapContext) {
  return new Promise<WechatMiniprogram.GetScaleSuccessCallbackResult>((resolve, reject) => {
    wx.showNavigationBarLoading()
    mapContext.getScale({
      success: resolve,
      fail: reject,
      complete: () => wx.hideNavigationBarLoading(),
    })
  })
}

export function getRegion(mapContext: WechatMiniprogram.MapContext) {
  return new Promise<WechatMiniprogram.GetRegionSuccessCallbackResult>((resolve, reject) => {
    wx.showNavigationBarLoading()
    mapContext.getRegion({
      success: resolve,
      fail: reject,
      complete: () => wx.hideNavigationBarLoading(),
    })
  })
}

export function getCenterLocation(mapContext: WechatMiniprogram.MapContext) {
  return new Promise<WechatMiniprogram.GetCenterLocationSuccessCallbackResult>((resolve, reject) => {
    wx.showNavigationBarLoading()
    mapContext.getCenterLocation({
      success: resolve,
      fail: reject,
      complete: () => wx.hideNavigationBarLoading(),
    })
  })
}
