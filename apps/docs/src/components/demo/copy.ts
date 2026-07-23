import type { Locale } from './types'

export const zhCopy = {
  codeTitle: '示例代码',
  codeExpand: '展开代码',
  codeCollapse: '收起代码',
  copyCode: '复制代码',
  copyCodeH5: '复制 H5 代码',
  copyCodeWeapp: '复制小程序代码',
  copied: '已复制',
  copyManual: '手动复制',
  copySuccess: '已复制到剪贴板',
  copyUnsupported: '请手动复制代码',
  h5CodeTitle: 'H5 组件',
  weappCodeTitle: '小程序组件',
  previewTitle: '演示效果',
  runtimeLabel: '运行时',
  packageLabel: '安装包',
  variantLabel: '变体',
  sizeLabel: '尺寸',
  loadingLabel: '加载状态',
  invalidLabel: '非法状态',
  currentValueLabel: '当前值',
  emptyValue: '未填写',
  loadingOn: '关闭 loading',
  loadingOff: '打开 loading',
  invalidOn: '恢复正常',
  invalidOff: '标记非法',
  dialogSection: '弹层演示',
  imageBasic: '基础图片',
  imageRound: '圆形图片',
  imageError: '失败态',
  overlayPanel: '遮罩层',
  popupPanel: '弹出层',
  dividerText: '文本分割线',
  gridItems: ['文字', '物流', '收藏', '相册', '地址', '客服', '优惠', '设置'],
  stickyText: '吸顶区域',
  indicatorSlides: ['轮播封面', '新品上架', '会员权益', '限时活动'],
  elevatorGroups: [
    { title: 'A', items: ['安徽', '澳门', '安庆', '鞍山'] },
    { title: 'B', items: ['北京', '保定', '包头', '北海'] },
    { title: 'C', items: ['成都', '重庆', '长沙', '常州'] },
    { title: 'D', items: ['大连', '东莞', '德州', '大庆'] },
    { title: 'F', items: ['福州', '佛山', '抚顺', '阜阳'] },
    { title: 'G', items: ['广州', '桂林', '贵阳', '赣州'] },
    { title: 'H', items: ['杭州', '合肥', '哈尔滨', '海口'] },
    { title: 'J', items: ['济南', '嘉兴', '金华', '江门'] }
  ],
  fixedNavItems: [
    { text: '首页', icon: '⌂' },
    { text: '消息', icon: '✉', num: 2 },
    { text: '客服', icon: '?' }
  ],
  menuOptions: [
    { text: '全部商品', value: 'all' },
    { text: '新品优先', value: 'new' },
    { text: '价格排序', value: 'price' }
  ],
  menuStockOptions: [
    { text: '全部库存', value: 'all' },
    { text: '仅看有货', value: 'in-stock' },
    { text: '预售商品', value: 'presale' }
  ],
  navTitle: '订单详情',
  navLeft: '返回',
  navRight: '更多',
  sideNavItems: [
    { title: '订单', name: 'orders' },
    { title: '资产', name: 'assets', badge: '3' },
    { title: '设置', name: 'settings' }
  ],
  tabbarItems: [
    { title: '首页', name: 'home', icon: '⌂' },
    { title: '分类', name: 'category', icon: '◇' },
    { title: '我的', name: 'profile', icon: '○' }
  ],
  tabsItems: [
    { title: '概览', name: 'overview', body: '核心数据和最近动态' },
    { title: '明细', name: 'detail', body: '列表、筛选和状态切换' },
    { title: '配置', name: 'config', body: '基础设置与策略' }
  ]
}

export const enCopy = {
  codeTitle: 'Example Code',
  codeExpand: 'Show code',
  codeCollapse: 'Hide code',
  copyCode: 'Copy code',
  copyCodeH5: 'Copy H5 code',
  copyCodeWeapp: 'Copy mini-program code',
  copied: 'Copied',
  copyManual: 'Manual',
  copySuccess: 'Copied to clipboard',
  copyUnsupported: 'Copy the code manually',
  h5CodeTitle: 'H5 Component',
  weappCodeTitle: 'Mini-program Component',
  previewTitle: 'Live Preview',
  runtimeLabel: 'Runtime',
  packageLabel: 'Package',
  variantLabel: 'Variant',
  sizeLabel: 'Size',
  loadingLabel: 'Loading',
  invalidLabel: 'Invalid state',
  currentValueLabel: 'Current value',
  emptyValue: 'Empty',
  loadingOn: 'Disable loading',
  loadingOff: 'Enable loading',
  invalidOn: 'Restore valid state',
  invalidOff: 'Mark invalid',
  dialogSection: 'Dialog Preview',
  imageBasic: 'Basic image',
  imageRound: 'Round image',
  imageError: 'Error state',
  overlayPanel: 'Overlay',
  popupPanel: 'Popup',
  dividerText: 'Text Divider',
  gridItems: ['Text', 'Logistics', 'Favorites', 'Album', 'Address', 'Support', 'Coupon', 'Settings'],
  stickyText: 'Sticky Area',
  indicatorSlides: ['Hero Card', 'New Arrivals', 'Member Perks', 'Limited Deal'],
  elevatorGroups: [
    { title: 'A', items: ['Austin', 'Atlanta', 'Albany', 'Arlington'] },
    { title: 'B', items: ['Boston', 'Berkeley', 'Boulder', 'Buffalo'] },
    { title: 'C', items: ['Chicago', 'Cambridge', 'Cleveland', 'Columbus'] },
    { title: 'D', items: ['Denver', 'Dallas', 'Detroit', 'Durham'] },
    { title: 'F', items: ['Fresno', 'Fairfax', 'Frisco', 'Fremont'] },
    { title: 'G', items: ['Glendale', 'Greenville', 'Gilbert', 'Grand Rapids'] },
    { title: 'H', items: ['Houston', 'Hartford', 'Henderson', 'Honolulu'] },
    { title: 'J', items: ['Jacksonville', 'Jersey City', 'Juneau', 'Joliet'] }
  ],
  fixedNavItems: [
    { text: 'Home', icon: '⌂' },
    { text: 'Inbox', icon: '✉', num: 2 },
    { text: 'Help', icon: '?' }
  ],
  menuOptions: [
    { text: 'All items', value: 'all' },
    { text: 'Newest first', value: 'new' },
    { text: 'Price order', value: 'price' }
  ],
  menuStockOptions: [
    { text: 'All stock', value: 'all' },
    { text: 'In stock', value: 'in-stock' },
    { text: 'Presale', value: 'presale' }
  ],
  navTitle: 'Order Detail',
  navLeft: 'Back',
  navRight: 'More',
  sideNavItems: [
    { title: 'Orders', name: 'orders' },
    { title: 'Assets', name: 'assets', badge: '3' },
    { title: 'Settings', name: 'settings' }
  ],
  tabbarItems: [
    { title: 'Home', name: 'home', icon: '⌂' },
    { title: 'Category', name: 'category', icon: '◇' },
    { title: 'Profile', name: 'profile', icon: '○' }
  ],
  tabsItems: [
    { title: 'Overview', name: 'overview', body: 'Key metrics and recent activity' },
    { title: 'Details', name: 'detail', body: 'Lists, filters, and status switching' },
    { title: 'Config', name: 'config', body: 'Basic settings and rules' }
  ]
}


export type DemoUiCopy = typeof zhCopy

export function getDemoCopy(locale: Locale): DemoUiCopy {
  return locale === 'en' ? enCopy : zhCopy
}
