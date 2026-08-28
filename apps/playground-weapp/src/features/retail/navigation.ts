export const retailRoutes = {
  cart: '/pages/retail-cart/index',
  category: '/pages/retail-category/index',
  home: '/pages/retail-home/index',
  profile: '/pages/retail-profile/index',
} as const

export function navigateRetail(path: string, query?: Record<string, string>) {
  const search = query
    ? Object.entries(query).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')
    : ''
  wx.navigateTo({ url: search ? `${path}?${search}` : path })
}

export function switchRetailTab(path: keyof typeof retailRoutes) {
  wx.switchTab({ url: retailRoutes[path] })
}
