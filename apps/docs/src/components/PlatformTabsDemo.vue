<script setup lang="ts">
import type { DemoKind, Locale, Platform } from './demo'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import {

  getDemoCopy,
  getDemoRuntime,

  resolveDemoContent,
} from './demo'

const props = withDefaults(
  defineProps<{
    example: DemoKind
    locale?: Locale
  }>(),
  {
    locale: 'zh',
  },
)

const platforms = ['h5', 'weapp'] as const

const inputValue = ref(props.locale === 'en' ? 'Avery Lin' : '林默')
const inputUrl = ref('varo-ui')
const inputBio = ref(props.locale === 'en' ? 'Registry-first mobile UI.' : 'Registry-first 移动端 UI。')
const inputInvalid = computed(() => inputValue.value.trim().length === 0)
const overviewInputInvalid = ref(false)
const activePlatform = ref<Platform>('h5')
const codeExpanded = ref(false)
const copyState = ref<'idle' | 'copied' | 'unsupported'>('idle')
const platformPanelId = computed(() => `platform-${props.example}-panel`)
const codePanelId = computed(() => `platform-${props.example}-code-panel`)
let copyFeedbackTimer: number | undefined
const overlayVisible = ref(true)
const popupVisible = ref(true)
const elevatorActive = ref('A')
const elevatorSelected = shallowRef(props.locale === 'en' ? 'Hangzhou' : '杭州')
const indicatorCurrent = ref(0)
const fixedNavVisible = ref(true)
const fixedNavSelected = shallowRef('')
const menuActiveName = ref<string | number | undefined>()
const menuValue = ref<string | number>('recommended')
const menuStockValue = ref<string | number>('all')
const navbarAction = shallowRef('')
const paginationPage = ref(2)
const sideNavActive = ref<string | number>('orders')
const tabbarActive = ref<string | number>('home')
const tabsActive = ref<string | number>('overview')
const cellNotificationsEnabled = shallowRef(true)
const cellLastAction = shallowRef<string>()
const imageFit = shallowRef<'cover' | 'contain' | 'scale-down'>('cover')
const gridLastAction = shallowRef<string>()
const spaceDraft = shallowRef('all')
const spaceApplied = shallowRef('all')
const stickyFixed = shallowRef(false)
const stickyScrollTop = shallowRef(0)
const elevatorSampleCopy = computed(() => ({
  title: props.locale === 'en' ? 'Service city' : '服务城市',
  hint: props.locale === 'en' ? 'Choose where the service is available' : '选择可提供服务的城市',
  selected: props.locale === 'en' ? 'Selected' : '已选择',
}))

function selectElevatorItem(item: string | { text?: string, title?: string, value?: string | number }) {
  elevatorSelected.value = typeof item === 'string'
    ? item
    : item.text ?? item.title ?? String(item.value ?? '')
}
const fixedNavSampleCopy = computed(() => ({
  eyebrow: props.locale === 'en' ? 'Subscription' : '年度订阅',
  title: 'Varo Pro',
  description: props.locale === 'en' ? 'All components, Registry Blocks, and Agent UI.' : '全部组件、Registry Blocks 与 Agent UI。',
  price: '¥299',
  priceSuffix: props.locale === 'en' ? '/ year' : '/ 年',
  features: props.locale === 'en' ? ['Dual runtime', 'Owned source', 'Priority updates'] : ['双端运行时', '源码归属业务', '优先更新'],
  action: props.locale === 'en' ? 'Actions' : '操作',
  selected: props.locale === 'en' ? 'Selected' : '已选择',
  items: props.locale === 'en'
    ? [
        { id: 'share', text: 'Share' },
        { id: 'favorite', text: 'Favorite', num: 3 },
        { id: 'support', text: 'Support' },
      ]
    : [
        { id: 'share', text: '分享' },
        { id: 'favorite', text: '收藏', num: 3 },
        { id: 'support', text: '客服' },
      ],
}))
const indicatorSampleCopy = computed(() => ({
  dots: props.locale === 'en' ? 'Dots' : '圆点',
  lines: props.locale === 'en' ? 'Lines' : '线条',
  navigationLabel: props.locale === 'en' ? 'Feature carousel pagination' : '功能轮播分页',
  itemLabel: props.locale === 'en' ? 'Feature {index} of {total}' : '第 {index} 个功能，共 {total} 个',
  items: props.locale === 'en'
    ? [
        { tag: 'Registry', title: 'Own the source', body: 'Install editable target-correct components into your project.' },
        { tag: 'Dual runtime', title: 'One public API', body: 'Use the same contracts on H5 and Wevu mini-programs.' },
        { tag: 'Agent UI', title: 'Model-neutral', body: 'Render streaming, tools, reasoning, and approvals.' },
        { tag: 'Release', title: 'Production ready', body: 'Validate types, tests, builds, Registry paths, and docs.' },
      ]
    : [
        { tag: 'Registry', title: '源码归属业务', body: '把可编辑、目标正确的组件源码安装进项目。' },
        { tag: '双端运行', title: '一套公共 API', body: 'H5 与 Wevu 小程序共享组件契约。' },
        { tag: 'Agent UI', title: '模型无关', body: '覆盖流式文本、工具、推理与审批。' },
        { tag: '发布保障', title: '生产可用', body: '验证类型、测试、构建、Registry 路径与文档。' },
      ],
}))
const menuSampleCopy = computed(() => ({
  title: props.locale === 'en' ? 'Product catalog' : '商品列表',
  count: props.locale === 'en' ? '128 products' : '128 件商品',
  sort: props.locale === 'en' ? 'Sort' : '排序',
  stock: props.locale === 'en' ? 'Availability' : '库存',
  result: props.locale === 'en' ? 'Filters' : '当前筛选',
  sortOptions: props.locale === 'en'
    ? [
        { text: 'Recommended', value: 'recommended' },
        { text: 'Newest', value: 'newest' },
        { text: 'Price low to high', value: 'price-asc' },
      ]
    : [
        { text: '推荐排序', value: 'recommended' },
        { text: '最新上架', value: 'newest' },
        { text: '价格从低到高', value: 'price-asc' },
      ],
  stockOptions: props.locale === 'en'
    ? [
        { text: 'All stock', value: 'all' },
        { text: 'In stock', value: 'in-stock' },
        { text: 'Pre-order', value: 'preorder' },
      ]
    : [
        { text: '全部库存', value: 'all' },
        { text: '仅看有货', value: 'in-stock' },
        { text: '预售商品', value: 'preorder' },
      ],
  products: props.locale === 'en'
    ? [
        { name: 'Varo Pro annual plan', meta: 'In stock', price: '¥299' },
        { name: 'Registry Block pack', meta: 'In stock', price: '¥129' },
        { name: 'Agent UI template', meta: 'Pre-order', price: '¥89' },
      ]
    : [
        { name: 'Varo Pro 年度订阅', meta: '有货', price: '¥299' },
        { name: 'Registry Block 套装', meta: '有货', price: '¥129' },
        { name: 'Agent UI 模板', meta: '预售', price: '¥89' },
      ],
}))

const menuSortLabel = computed(() =>
  menuSampleCopy.value.sortOptions.find(option => option.value === menuValue.value)?.text ?? '',
)
const menuStockLabel = computed(() =>
  menuSampleCopy.value.stockOptions.find(option => option.value === menuStockValue.value)?.text ?? '',
)
const navbarSampleCopy = computed(() => ({
  title: props.locale === 'en' ? 'Order details' : '订单详情',
  back: props.locale === 'en' ? 'Back' : '返回',
  help: props.locale === 'en' ? 'Help' : '帮助',
  status: props.locale === 'en' ? 'Shipped' : '已发货',
  statusHint: props.locale === 'en' ? 'Expected tomorrow before 18:00' : '预计明日 18:00 前送达',
  order: props.locale === 'en' ? 'Order number' : '订单编号',
  orderValue: '1042',
  recipient: props.locale === 'en' ? 'Recipient' : '收货人',
  recipientValue: props.locale === 'en' ? 'Lin · 138****2042' : '林默 · 138****2042',
  total: props.locale === 'en' ? 'Paid' : '实付款',
  totalValue: '¥279',
  action: props.locale === 'en' ? 'Action' : '操作',
}))
const paginationSampleCopy = computed(() => ({
  title: props.locale === 'en' ? 'All orders' : '全部订单',
  total: props.locale === 'en' ? '15 orders' : '共 15 笔',
  page: props.locale === 'en' ? 'Page' : '第',
  pageSuffix: props.locale === 'en' ? 'of 5' : '页 / 共 5 页',
  navigationLabel: props.locale === 'en' ? 'Order pages' : '订单分页',
  itemLabel: props.locale === 'en' ? 'Page {page} of {total}' : '第 {page} 页，共 {total} 页',
  statuses: props.locale === 'en' ? ['Shipped', 'Completed', 'Pending payment'] : ['已发货', '已完成', '待付款'],
}))

const paginationOrders = computed(() => {
  const base = 1048 - paginationPage.value * 3
  return Array.from({ length: 3 }, (_, index) => ({
    id: `#${base - index}`,
    status: paginationSampleCopy.value.statuses[index]!,
    amount: [`¥${279 - paginationPage.value * 10}`, `¥${168 + paginationPage.value * 5}`, `¥${99 + paginationPage.value}`][index]!,
  }))
})
const sideNavbarSampleCopy = computed(() => ({
  navigationLabel: props.locale === 'en' ? 'Account center sections' : '账户中心分区',
  items: props.locale === 'en'
    ? [
        { name: 'orders', title: 'Orders', badge: 2, heading: 'Order management', body: 'Track fulfillment, delivery, and after-sales.', metric: '2 pending', details: ['To ship · 2', 'In transit · 1', 'After-sales · 0'] },
        { name: 'assets', title: 'Assets', badge: 3, heading: 'Account assets', body: 'Coupons, points, and stored value.', metric: '3 coupons', details: ['Coupons · 3', 'Points · 2,480', 'Balance · ¥68'] },
        { name: 'address', title: 'Addresses', heading: 'Delivery addresses', body: 'Manage default and alternate recipients.', metric: '3 saved', details: ['Hangzhou · Default', 'Shanghai · Company', 'Shenzhen · Family'] },
        { name: 'security', title: 'Security', heading: 'Account security', body: 'Password, devices, and verification.', metric: 'Protected', details: ['Two-step verification · On', 'Trusted devices · 2', 'Last login · Today'] },
      ]
    : [
        { name: 'orders', title: '订单', badge: 2, heading: '订单管理', body: '集中查看履约、物流与售后进度。', metric: '2 笔待处理', details: ['待发货 · 2', '运输中 · 1', '售后中 · 0'] },
        { name: 'assets', title: '资产', badge: 3, heading: '账户资产', body: '优惠券、积分与储值余额。', metric: '3 张优惠券', details: ['优惠券 · 3', '积分 · 2,480', '余额 · ¥68'] },
        { name: 'address', title: '地址', heading: '收货地址', body: '管理默认和备用收货信息。', metric: '已保存 3 个', details: ['杭州 · 默认', '上海 · 公司', '深圳 · 家庭'] },
        { name: 'security', title: '安全', heading: '账号安全', body: '密码、设备与验证方式。', metric: '已保护', details: ['两步验证 · 已开启', '可信设备 · 2', '最近登录 · 今天'] },
      ],
}))

const currentSideNavbarItem = computed(() =>
  sideNavbarSampleCopy.value.items.find(item => item.name === sideNavActive.value)
  ?? sideNavbarSampleCopy.value.items[0]!,
)

const tabbarSampleCopy = computed(() => {
  const items = props.locale === 'en'
    ? [
        { name: 'home', title: 'Home', body: 'Overview, recommendations, and recent activity.', path: 'M3 11 12 3l9 8 M5 10v10h14V10 M9 20v-6h6v6' },
        { name: 'category', title: 'Catalog', body: 'Browse components, Blocks, and templates.', path: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z' },
        { name: 'messages', title: 'Messages', body: 'Two unread release and support updates.', path: 'M4 5h16v12H8l-4 4z M8 9h8 M8 13h5', badge: 2 },
        { name: 'profile', title: 'Profile', body: 'Subscription, settings, and account security.', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M5 21a7 7 0 0 1 14 0', dot: true },
      ]
    : [
        { name: 'home', title: '首页', body: '概览、推荐内容和最近动态。', path: 'M3 11 12 3l9 8 M5 10v10h14V10 M9 20v-6h6v6' },
        { name: 'category', title: '分类', body: '浏览组件、Blocks 与模板。', path: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z' },
        { name: 'messages', title: '消息', body: '有 2 条发布和支持消息未读。', path: 'M4 5h16v12H8l-4 4z M8 9h8 M8 13h5', badge: 2 },
        { name: 'profile', title: '我的', body: '订阅、设置与账号安全。', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M5 21a7 7 0 0 1 14 0', dot: true },
      ]
  return {
    navigationLabel: props.locale === 'en' ? 'Primary navigation' : '主要导航',
    items,
  }
})

const currentTabbarItem = computed(() =>
  tabbarSampleCopy.value.items.find(item => item.name === tabbarActive.value)
  ?? tabbarSampleCopy.value.items[0]!,
)
const tabsNavigationLabel = computed(() =>
  props.locale === 'en' ? 'Product detail sections' : '产品详情分区',
)

function selectFixedNavItem(item: { text: string }) {
  fixedNavSelected.value = item.text
  fixedNavVisible.value = false
}

const cellDemoCopy = computed(() => props.locale === 'en'
  ? {
      accountGroup: 'Account & security',
      accountGroupDesc: 'Protected',
      profile: 'Profile',
      profileSubtitle: 'Avatar, name, and bio',
      edit: 'Edit',
      security: 'Login & security',
      securitySubtitle: 'Two-step verification enabled',
      secure: 'Secure',
      notifications: 'Notifications',
      notificationsSubtitle: 'Activity and system updates',
      preferencesGroup: 'Preferences',
      preferencesGroupDesc: 'Personalized',
      appearance: 'Appearance',
      system: 'Follow system',
      language: 'Language',
      english: 'English',
      privacy: 'Privacy',
      standard: 'Standard',
      opened: 'Opened',
    }
  : {
      accountGroup: '账户与安全',
      accountGroupDesc: '已保护',
      profile: '个人资料',
      profileSubtitle: '头像、昵称与简介',
      edit: '编辑',
      security: '登录与安全',
      securitySubtitle: '两步验证已开启',
      secure: '安全',
      notifications: '消息通知',
      notificationsSubtitle: '活动和系统提醒',
      preferencesGroup: '偏好设置',
      preferencesGroupDesc: '个性化',
      appearance: '外观',
      system: '跟随系统',
      language: '语言',
      english: '简体中文',
      privacy: '隐私',
      standard: '标准',
      opened: '已打开',
    })

const cellActionMessage = computed(() =>
  cellLastAction.value ? `${cellDemoCopy.value.opened}：${cellLastAction.value}` : '',
)
const imageFitOptions = computed(() => props.locale === 'en'
  ? [
      { value: 'cover' as const, label: 'Crop' },
      { value: 'contain' as const, label: 'Fit' },
      { value: 'scale-down' as const, label: 'Original' },
    ]
  : [
      { value: 'cover' as const, label: '裁剪填充' },
      { value: 'contain' as const, label: '完整展示' },
      { value: 'scale-down' as const, label: '原始尺寸' },
    ])
const dividerSampleCopy = computed(() => props.locale === 'en'
  ? {
      order: 'Order #1042',
      paid: 'Paid',
      goods: 'Items',
      goodsAmount: '¥299',
      discount: 'Discount',
      discountAmount: '−¥20',
      total: 'Total',
      totalAmount: '¥279',
      logistics: 'Delivery progress',
      shipped: 'Shipped',
      shippedHint: 'Departed Hangzhou center at 16:20',
      arrival: 'Estimated delivery',
      arrivalHint: 'Tomorrow before 18:00',
      contact: 'Contact seller',
      track: 'Track package',
    }
  : {
      order: '订单 #1042',
      paid: '已支付',
      goods: '商品金额',
      goodsAmount: '¥299',
      discount: '优惠',
      discountAmount: '−¥20',
      total: '实付款',
      totalAmount: '¥279',
      logistics: '物流进度',
      shipped: '已发货',
      shippedHint: '16:20 已从杭州仓发出',
      arrival: '预计送达',
      arrivalHint: '明日 18:00 前',
      contact: '联系商家',
      track: '查看物流',
    })
const gridSampleCopy = computed(() => {
  const labels = props.locale === 'en'
    ? ['Orders', 'Delivery', 'Coupons', 'Favorites', 'Addresses', 'Support', 'Invoices', 'Settings']
    : ['我的订单', '物流', '优惠券', '收藏', '收货地址', '客服', '发票', '设置']
  const paths = [
    'M5 7h14v12H5z M8 4h8v3 M8 11h8 M8 15h5',
    'M3 7h11v9H3z M14 10h4l3 3v3h-7z M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
    'M4 7h16v10H4z M8 7a2 2 0 0 0 0 4 M16 13a2 2 0 0 0 0 4 M12 7v10',
    'M12 20S4 15.5 4 9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 15.5 12 20 12 20Z',
    'M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
    'M4 13v-2a8 8 0 0 1 16 0v2 M4 13h3v6H4z M17 13h3v6h-3z M17 19c0 1-2 2-5 2',
    'M6 3h9l3 3v15H6z M14 3v4h4 M9 12h6 M9 16h6',
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19 12l2-1-2-4-2 .5L15 5l-.5-2h-5L9 5 7 7.5 5 7l-2 4 2 1 .5 2L4 16l3 3 2-.5 1 2.5h4l1-2.5 2 .5 3-3-1.5-2Z',
  ]
  return {
    title: props.locale === 'en' ? 'Quick services' : '常用服务',
    hint: props.locale === 'en' ? 'Account shortcuts' : '账户快捷入口',
    opened: props.locale === 'en' ? 'Opened' : '已打开',
    items: labels.map((label, index) => ({
      label,
      path: paths[index]!,
      badge: index === 0 ? '2' : index === 2 ? '3' : undefined,
      dot: index === 1,
    })),
  }
})

const gridActionMessage = computed(() =>
  gridLastAction.value ? `${gridSampleCopy.value.opened}：${gridLastAction.value}` : '',
)
const layoutSampleCopy = computed(() => props.locale === 'en'
  ? {
      title: 'Business overview',
      period: 'This week',
      revenue: 'Revenue',
      revenueValue: '¥86,420',
      revenueTrend: '+12.8%',
      orders: 'Orders',
      ordersValue: '128',
      visitors: 'Visitors',
      visitorsValue: '2,846',
      conversion: 'Conversion',
      conversionValue: '4.5%',
      refunds: 'Refunds',
      refundsValue: '6',
    }
  : {
      title: '经营概览',
      period: '本周',
      revenue: '成交金额',
      revenueValue: '¥86,420',
      revenueTrend: '+12.8%',
      orders: '订单',
      ordersValue: '128',
      visitors: '访客',
      visitorsValue: '2,846',
      conversion: '转化率',
      conversionValue: '4.5%',
      refunds: '退款',
      refundsValue: '6',
    })
const spaceSampleCopy = computed(() => {
  const filters = props.locale === 'en'
    ? [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending payment' },
        { value: 'shipping', label: 'To ship' },
        { value: 'refund', label: 'Refunds' },
      ]
    : [
        { value: 'all', label: '全部' },
        { value: 'pending', label: '待付款' },
        { value: 'shipping', label: '待发货' },
        { value: 'refund', label: '退款/售后' },
      ]
  return {
    title: props.locale === 'en' ? 'Order filters' : '订单筛选',
    hint: props.locale === 'en' ? 'Wrap tags and stack full-width actions' : '标签自动换行，操作纵向填充',
    apply: props.locale === 'en' ? 'Apply filters' : '应用筛选',
    reset: props.locale === 'en' ? 'Reset' : '重置',
    current: props.locale === 'en' ? 'Current' : '当前筛选',
    filters,
  }
})

const spaceAppliedLabel = computed(() =>
  spaceSampleCopy.value.filters.find(item => item.value === spaceApplied.value)?.label ?? '',
)
const stickySampleCopy = computed(() => ({
  title: props.locale === 'en' ? 'May 2026' : '2026 年 5 月',
  count: props.locale === 'en' ? '8 orders' : '8 笔订单',
  hint: props.locale === 'en' ? 'Scroll the page to pin the month summary' : '滚动页面查看月份摘要吸顶',
  normal: props.locale === 'en' ? 'Following page' : '跟随页面',
  fixed: props.locale === 'en' ? 'Pinned' : '已吸顶',
  scroll: props.locale === 'en' ? 'Page scroll' : '页面滚动',
  items: props.locale === 'en'
    ? [
        { id: '#1042', status: 'Shipped', amount: '¥279' },
        { id: '#1041', status: 'Completed', amount: '¥168' },
        { id: '#1040', status: 'Pending payment', amount: '¥99' },
        { id: '#1039', status: 'Completed', amount: '¥428' },
        { id: '#1038', status: 'Refunded', amount: '−¥68' },
        { id: '#1037', status: 'Completed', amount: '¥319' },
        { id: '#1036', status: 'Completed', amount: '¥86' },
        { id: '#1035', status: 'Completed', amount: '¥206' },
      ]
    : [
        { id: '#1042', status: '已发货', amount: '¥279' },
        { id: '#1041', status: '已完成', amount: '¥168' },
        { id: '#1040', status: '待付款', amount: '¥99' },
        { id: '#1039', status: '已完成', amount: '¥428' },
        { id: '#1038', status: '已退款', amount: '−¥68' },
        { id: '#1037', status: '已完成', amount: '¥319' },
        { id: '#1036', status: '已完成', amount: '¥86' },
        { id: '#1035', status: '已完成', amount: '¥206' },
      ],
}))

const buttonSampleCopy = computed(() => props.locale === 'en'
  ? {
      hierarchy: 'Hierarchy',
      primary: 'Save changes',
      secondary: 'Cancel',
      tertiary: 'Later',
      tones: 'Semantic tones',
      success: 'Complete',
      warning: 'Review',
      danger: 'Delete',
      sizes: 'Sizes',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      states: 'States',
      loading: 'Saving…',
      disabled: 'Unavailable',
      layout: 'Shape and layout',
      create: 'Create project',
      continue: 'Continue',
      square: 'Square corners',
    }
  : {
      hierarchy: '操作层级',
      primary: '保存更改',
      secondary: '取消',
      tertiary: '稍后处理',
      tones: '语义色',
      success: '已完成',
      warning: '需确认',
      danger: '删除',
      sizes: '尺寸',
      small: '小号',
      medium: '默认',
      large: '大号',
      states: '状态',
      loading: '保存中…',
      disabled: '不可用',
      layout: '形状与布局',
      create: '创建项目',
      continue: '继续',
      square: '直角',
    })

const badgeSampleCopy = computed(() => props.locale === 'en'
  ? {
      anchors: 'Text anchors',
      messages: 'Messages',
      notifications: 'Notifications',
      messagesLabel: '3 unread messages',
      notificationsLabel: 'New notification',
      counts: 'Counts',
      inbox: 'Inbox',
      tasks: 'Tasks',
      mentions: 'Mentions',
      drafts: 'Drafts',
      inboxLabel: '3 unread inbox items',
      tasksLabel: '12 open tasks',
      mentionsLabel: '120 mentions',
      draftsLabel: '0 drafts',
      statuses: 'Status dots',
      online: 'Online',
      syncing: 'Syncing',
      offline: 'Offline',
      variants: 'Variants',
      new: 'New',
      stable: 'Stable',
      review: 'Review',
    }
  : {
      anchors: '文字角标',
      messages: '消息',
      notifications: '通知',
      messagesLabel: '3 条未读消息',
      notificationsLabel: '新通知',
      counts: '计数',
      inbox: '收件箱',
      tasks: '任务',
      mentions: '提及',
      drafts: '草稿',
      inboxLabel: '3 条未读消息',
      tasksLabel: '12 个待办任务',
      mentionsLabel: '120 条提及',
      draftsLabel: '0 个草稿',
      statuses: '状态点',
      online: '在线',
      syncing: '同步中',
      offline: '离线',
      variants: '变体',
      new: '新',
      stable: '稳定',
      review: '审核',
    })

const popoverSampleCopy = computed(() => props.locale === 'en'
  ? {
      context: 'Context actions',
      trigger: 'Order actions',
      order: 'Order #1042',
      meta: 'Ready to ship · ¥329',
      details: 'View details',
      duplicate: 'Duplicate order',
      cancel: 'Cancel order',
      done: 'Done',
      placement: 'Placement',
      top: 'Top',
      right: 'Right',
      topHint: 'Shown above the trigger',
      rightHint: 'Shown beside the trigger',
      close: 'Close',
    }
  : {
      context: '上下文操作',
      trigger: '订单操作',
      order: '订单 #1042',
      meta: '等待发货 · ¥329',
      details: '查看详情',
      duplicate: '复制订单',
      cancel: '取消订单',
      done: '完成',
      placement: '定位',
      top: '顶部',
      right: '右侧',
      topHint: '显示在触发器上方',
      rightHint: '显示在触发器右侧',
      close: '关闭',
    })

const inputSampleCopy = computed(() => props.locale === 'en'
  ? {
      clearable: 'Required and clearable',
      required: 'Required',
      error: 'Enter a display name.',
      affixes: 'Prefix and suffix',
      urlPlaceholder: 'project-name',
      textarea: 'Textarea',
      textareaPlaceholder: 'Add a short description',
      states: 'States',
      readonly: 'Read only',
      readonlyValue: 'INV-2026-042',
      disabledValue: 'Unavailable',
      disabled: 'Disabled',
    }
  : {
      clearable: '必填与清空',
      required: '必填',
      error: '请输入显示名称。',
      affixes: '前后缀',
      urlPlaceholder: '项目名称',
      textarea: '文本域',
      textareaPlaceholder: '补充简短说明',
      states: '状态',
      readonly: '只读',
      readonlyValue: 'INV-2026-042',
      disabledValue: '不可编辑',
      disabled: '禁用',
    })

const copy = computed(() => getDemoCopy(props.locale))
const demo = computed(() => resolveDemoContent(props.locale, props.example))
const platformDemo = computed(() => demo.value.platforms[activePlatform.value])
const runtime = computed(() => getDemoRuntime(activePlatform.value))
const currentIndicatorItem = computed(
  () => indicatorSampleCopy.value.items[indicatorCurrent.value] ?? indicatorSampleCopy.value.items[0]!,
)
const codeExamples = computed(() => [
  {
    key: 'h5' as Platform,
    title: copy.value.h5CodeTitle,
    code: demo.value.platforms.h5.code,
    packageName: demo.value.platforms.h5.packageName,
  },
  {
    key: 'weapp' as Platform,
    title: copy.value.weappCodeTitle,
    code: demo.value.platforms.weapp.code,
    packageName: demo.value.platforms.weapp.packageName,
  },
])
const activeCodeExample = computed(
  () => codeExamples.value.find(item => item.key === activePlatform.value) ?? codeExamples.value[0]!,
)
const hasControls = computed(() => props.example === 'overview')
const codeToggleLabel = computed(() =>
  codeExpanded.value ? copy.value.codeCollapse : copy.value.codeExpand,
)
const copyLabel = computed(() => {
  if (copyState.value === 'copied') {
    return copy.value.copied
  }

  if (copyState.value === 'unsupported') {
    return copy.value.copyManual
  }

  return activePlatform.value === 'h5' ? copy.value.copyCodeH5 : copy.value.copyCodeWeapp
})

function resetCopyState() {
  if (copyFeedbackTimer) {
    window.clearTimeout(copyFeedbackTimer)
    copyFeedbackTimer = undefined
  }

  copyState.value = 'idle'
}

async function copySnippet() {
  if (!navigator?.clipboard?.writeText) {
    copyState.value = 'unsupported'
    return
  }

  await navigator.clipboard.writeText(activeCodeExample.value.code)
  copyState.value = 'copied'
  copyFeedbackTimer = window.setTimeout(() => {
    copyState.value = 'idle'
    copyFeedbackTimer = undefined
  }, 1800)
}

function setPlatform(platform: Platform) {
  activePlatform.value = platform
  resetCopyState()
}

function codeTabId(platform: Platform) {
  return `platform-${props.example}-code-tab-${platform}`
}

function platformTabId(platform: Platform) {
  return `platform-${props.example}-tab-${platform}`
}

function handlePlatformTabKeydown(event: KeyboardEvent) {
  const currentIndex = platforms.indexOf(activePlatform.value)
  let nextIndex = currentIndex

  if (event.key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % platforms.length
  }
  else if (event.key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + platforms.length) % platforms.length
  }
  else if (event.key === 'Home') {
    nextIndex = 0
  }
  else if (event.key === 'End') {
    nextIndex = platforms.length - 1
  }
  else {
    return
  }

  event.preventDefault()
  const platform = platforms[nextIndex]!
  const tablist = (event.currentTarget as HTMLButtonElement).closest('[role=\"tablist\"]')
  setPlatform(platform)
  void nextTick(() => {
    tablist?.querySelector<HTMLButtonElement>(`[data-platform=\"${platform}\"]`)?.focus()
  })
}

function toggleCodeExpanded() {
  codeExpanded.value = !codeExpanded.value
  if (!codeExpanded.value) {
    resetCopyState()
  }
}

let indicatorTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (props.example !== 'indicator') {
    return
  }

  indicatorTimer = setInterval(() => {
    indicatorCurrent.value = (indicatorCurrent.value + 1) % indicatorSampleCopy.value.items.length
  }, 1800)
})

onBeforeUnmount(() => {
  if (indicatorTimer) {
    clearInterval(indicatorTimer)
  }
  resetCopyState()
})
</script>

<template>
  <section class="platform-demo" :data-platform="activePlatform">
    <header class="platform-demo__head">
      <div>
        <h2>{{ demo.title }}</h2>
      </div>
      <div class="platform-demo__platform-switch" role="tablist" :aria-label="copy.runtimeLabel">
        <button
          :id="platformTabId('h5')"
          type="button"
          role="tab"
          class="platform-demo__platform-tab"
          data-platform="h5"
          :data-active="activePlatform === 'h5'"
          :aria-controls="platformPanelId"
          :aria-selected="activePlatform === 'h5'"
          :tabindex="activePlatform === 'h5' ? 0 : -1"
          @click="setPlatform('h5')"
          @keydown="handlePlatformTabKeydown"
        >
          H5
        </button>
        <button
          :id="platformTabId('weapp')"
          type="button"
          role="tab"
          class="platform-demo__platform-tab"
          data-platform="weapp"
          :data-active="activePlatform === 'weapp'"
          :aria-controls="platformPanelId"
          :aria-selected="activePlatform === 'weapp'"
          :tabindex="activePlatform === 'weapp' ? 0 : -1"
          @click="setPlatform('weapp')"
          @keydown="handlePlatformTabKeydown"
        >
          {{ locale === 'en' ? 'Mini Program' : '小程序' }}
        </button>
      </div>
    </header>

    <div
      :id="platformPanelId"
      class="platform-demo__stage"
      role="tabpanel"
      :aria-labelledby="platformTabId(activePlatform)"
      :data-layout="hasControls ? 'controls-preview' : 'preview-only'"
    >
      <section v-if="hasControls" class="platform-demo__panel platform-demo__panel--controls">
        <div class="platform-demo__controls">
          <div class="platform-demo__control-group">
            <span>{{ copy.invalidLabel }}</span>
            <button
              class="platform-demo__chip"
              type="button"
              :data-active="overviewInputInvalid"
              @click="overviewInputInvalid = !overviewInputInvalid"
            >
              {{ overviewInputInvalid ? copy.invalidOn : copy.invalidOff }}
            </button>
          </div>
        </div>
      </section>

      <section class="platform-demo__panel platform-demo__panel--preview">
        <div class="platform-demo__phone-frame" :data-platform="activePlatform">
          <div class="platform-demo__phone-bezel">
            <div class="platform-demo__phone-screen">
              <div class="platform-demo__phone-content">
                <div class="platform-demo__preview-content" :data-example="example">
                  <template v-if="example === 'button'">
                    <section class="platform-demo__button-sample">
                      <div class="platform-demo__button-cases">
                        <section class="platform-demo__button-case" data-case="hierarchy">
                          <h3>{{ buttonSampleCopy.hierarchy }}</h3>
                          <div class="platform-demo__button-row">
                            <component :is="runtime.Button" native-type="button">
                              {{ buttonSampleCopy.primary }}
                            </component>
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="default"
                              variant="outline"
                            >
                              {{ buttonSampleCopy.secondary }}
                            </component>
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="default"
                              variant="ghost"
                            >
                              {{ buttonSampleCopy.tertiary }}
                            </component>
                          </div>
                        </section>

                        <section class="platform-demo__button-case" data-case="tones">
                          <h3>{{ buttonSampleCopy.tones }}</h3>
                          <div class="platform-demo__button-row">
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="success"
                            >
                              {{ buttonSampleCopy.success }}
                            </component>
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="warning"
                            >
                              {{ buttonSampleCopy.warning }}
                            </component>
                            <component
                              :is="runtime.Button"
                              native-type="button"
                              tone="danger"
                            >
                              {{ buttonSampleCopy.danger }}
                            </component>
                          </div>
                        </section>

                        <section class="platform-demo__button-case" data-case="sizes">
                          <h3>{{ buttonSampleCopy.sizes }}</h3>
                          <div class="platform-demo__button-row platform-demo__button-row--baseline">
                            <component :is="runtime.Button" native-type="button" size="sm" variant="outline">
                              {{ buttonSampleCopy.small }}
                            </component>
                            <component :is="runtime.Button" native-type="button" size="md" variant="outline">
                              {{ buttonSampleCopy.medium }}
                            </component>
                            <component :is="runtime.Button" native-type="button" size="lg" variant="outline">
                              {{ buttonSampleCopy.large }}
                            </component>
                          </div>
                        </section>

                        <section class="platform-demo__button-case" data-case="states">
                          <h3>{{ buttonSampleCopy.states }}</h3>
                          <div class="platform-demo__button-row">
                            <component
                              :is="runtime.Button"
                              loading
                              :loading-text="buttonSampleCopy.loading"
                              native-type="button"
                            />
                            <component
                              :is="runtime.Button"
                              disabled
                              native-type="button"
                              tone="default"
                              variant="outline"
                            >
                              {{ buttonSampleCopy.disabled }}
                            </component>
                          </div>
                        </section>

                        <section class="platform-demo__button-case" data-case="layout">
                          <h3>{{ buttonSampleCopy.layout }}</h3>
                          <div class="platform-demo__button-layout">
                            <div class="platform-demo__button-row">
                              <component :is="runtime.Button" native-type="button" shape="round">
                                <template #icon>
                                  <svg
                                    class="platform-demo__button-icon"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    aria-hidden="true"
                                  >
                                    <path d="M8 3v10M3 8h10" />
                                  </svg>
                                </template>
                                {{ buttonSampleCopy.create }}
                              </component>
                              <component
                                :is="runtime.Button"
                                native-type="button"
                                shape="square"
                                tone="default"
                                variant="outline"
                              >
                                {{ buttonSampleCopy.square }}
                              </component>
                            </div>
                            <component :is="runtime.Button" block native-type="button">
                              {{ buttonSampleCopy.continue }}
                            </component>
                          </div>
                        </section>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'badge'">
                    <section class="platform-demo__badge-sample">
                      <div class="platform-demo__badge-cases">
                        <section class="platform-demo__badge-case" data-case="anchors">
                          <h3>{{ badgeSampleCopy.anchors }}</h3>
                          <div class="platform-demo__badge-anchors">
                            <span class="platform-demo__badge-anchor">
                              <span class="platform-demo__badge-anchor-label">
                                {{ badgeSampleCopy.messages }}
                                <component
                                  :is="runtime.Badge"
                                  :aria-label="badgeSampleCopy.messagesLabel"
                                  :content="3"
                                  class="platform-demo__badge-anchor-mark"
                                />
                              </span>
                            </span>
                            <span class="platform-demo__badge-anchor">
                              <span class="platform-demo__badge-anchor-label">
                                {{ badgeSampleCopy.notifications }}
                                <component
                                  :is="runtime.Badge"
                                  :aria-label="badgeSampleCopy.notificationsLabel"
                                  class="platform-demo__badge-anchor-mark"
                                  dot
                                  tone="danger"
                                />
                              </span>
                            </span>
                          </div>
                        </section>
                        <section class="platform-demo__badge-case" data-case="counts">
                          <h3>{{ badgeSampleCopy.counts }}</h3>
                          <div class="platform-demo__badge-counts">
                            <div>
                              <span class="platform-demo__badge-count-label">{{ badgeSampleCopy.inbox }}</span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.inboxLabel"
                                :content="3"
                              />
                            </div>
                            <div>
                              <span class="platform-demo__badge-count-label">{{ badgeSampleCopy.tasks }}</span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.tasksLabel"
                                :content="12"
                                tone="primary"
                              />
                            </div>
                            <div>
                              <span class="platform-demo__badge-count-label">{{ badgeSampleCopy.mentions }}</span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.mentionsLabel"
                                :content="120"
                                :max="99"
                                tone="warning"
                              />
                            </div>
                            <div>
                              <span class="platform-demo__badge-count-label">{{ badgeSampleCopy.drafts }}</span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.draftsLabel"
                                :content="0"
                                show-zero
                                tone="default"
                              />
                            </div>
                          </div>
                        </section>

                        <section class="platform-demo__badge-case" data-case="statuses">
                          <h3>{{ badgeSampleCopy.statuses }}</h3>
                          <div class="platform-demo__badge-statuses">
                            <span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.online"
                                dot
                                tone="success"
                              />
                              {{ badgeSampleCopy.online }}
                            </span>
                            <span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.syncing"
                                dot
                                tone="warning"
                              />
                              {{ badgeSampleCopy.syncing }}
                            </span>
                            <span>
                              <component
                                :is="runtime.Badge"
                                :aria-label="badgeSampleCopy.offline"
                                dot
                                tone="default"
                              />
                              {{ badgeSampleCopy.offline }}
                            </span>
                          </div>
                        </section>

                        <section class="platform-demo__badge-case" data-case="variants">
                          <h3>{{ badgeSampleCopy.variants }}</h3>
                          <div class="platform-demo__badge-variants">
                            <component :is="runtime.Badge" tone="primary">
                              {{ badgeSampleCopy.new }}
                            </component>
                            <component :is="runtime.Badge" tone="success" variant="soft">
                              {{ badgeSampleCopy.stable }}
                            </component>
                            <component :is="runtime.Badge" tone="warning" variant="outline">
                              {{ badgeSampleCopy.review }}
                            </component>
                          </div>
                        </section>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'popover'">
                    <section class="platform-demo__popover-sample">
                      <div class="platform-demo__popover-cases">
                        <section class="platform-demo__popover-case" data-case="context">
                          <h3>{{ popoverSampleCopy.context }}</h3>
                          <div class="platform-demo__popover-canvas">
                            <component :is="runtime.PopoverRoot" class="platform-demo__popover-root" default-open>
                              <component
                                :is="runtime.PopoverTrigger"
                                class="platform-demo__popover-trigger"
                                type="button"
                              >
                                {{ popoverSampleCopy.trigger }}
                              </component>
                              <component
                                :is="runtime.PopoverContent"
                                align="center"
                                class="platform-demo__popover-card"
                                side="bottom"
                              >
                                <header>
                                  <strong>{{ popoverSampleCopy.order }}</strong>
                                  <small>{{ popoverSampleCopy.meta }}</small>
                                </header>
                                <div class="platform-demo__popover-actions">
                                  <button type="button">
                                    {{ popoverSampleCopy.details }}
                                  </button>
                                  <button type="button">
                                    {{ popoverSampleCopy.duplicate }}
                                  </button>
                                  <component
                                    :is="runtime.PopoverClose"
                                    class="platform-demo__popover-danger"
                                    type="button"
                                  >
                                    {{ popoverSampleCopy.cancel }}
                                  </component>
                                </div>
                                <component
                                  :is="runtime.PopoverClose"
                                  class="platform-demo__popover-done"
                                  type="button"
                                >
                                  {{ popoverSampleCopy.done }}
                                </component>
                              </component>
                            </component>
                          </div>
                        </section>

                        <section class="platform-demo__popover-case" data-case="placement">
                          <h3>{{ popoverSampleCopy.placement }}</h3>
                          <div class="platform-demo__popover-placements">
                            <component :is="runtime.PopoverRoot">
                              <component
                                :is="runtime.PopoverTrigger"
                                class="platform-demo__popover-trigger"
                                type="button"
                              >
                                {{ popoverSampleCopy.top }}
                              </component>
                              <component
                                :is="runtime.PopoverContent"
                                class="platform-demo__popover-tip"
                                side="top"
                              >
                                <span>{{ popoverSampleCopy.topHint }}</span>
                                <component :is="runtime.PopoverClose" type="button">
                                  {{ popoverSampleCopy.close }}
                                </component>
                              </component>
                            </component>
                            <component :is="runtime.PopoverRoot">
                              <component
                                :is="runtime.PopoverTrigger"
                                class="platform-demo__popover-trigger"
                                type="button"
                              >
                                {{ popoverSampleCopy.right }}
                              </component>
                              <component
                                :is="runtime.PopoverContent"
                                class="platform-demo__popover-tip"
                                side="right"
                              >
                                <span>{{ popoverSampleCopy.rightHint }}</span>
                                <component :is="runtime.PopoverClose" type="button">
                                  {{ popoverSampleCopy.close }}
                                </component>
                              </component>
                            </component>
                          </div>
                        </section>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'input'">
                    <section class="platform-demo__input-sample" :data-invalid="String(inputInvalid)">
                      <div class="platform-demo__input-cases">
                        <label
                          class="platform-demo__input-case platform-demo__input-case--wide"
                          data-case="required"
                        >
                          <span class="platform-demo__input-label">
                            <strong>{{ inputSampleCopy.clearable }}</strong>
                            <small>{{ inputSampleCopy.required }}</small>
                          </span>
                          <component
                            :is="runtime.Input"
                            v-model:value="inputValue"
                            clearable
                            :error-message="inputInvalid ? inputSampleCopy.error : undefined"
                            :invalid="inputInvalid"
                            :max-length="16"
                            :placeholder="platformDemo.placeholder"
                            show-word-limit
                          />
                        </label>

                        <label class="platform-demo__input-case" data-case="affixes">
                          <span class="platform-demo__input-label">
                            <strong>{{ inputSampleCopy.affixes }}</strong>
                          </span>
                          <component
                            :is="runtime.Input"
                            v-model:value="inputUrl"
                            clearable
                            :placeholder="inputSampleCopy.urlPlaceholder"
                          >
                            <template #prefix>
                              <span class="platform-demo__input-affix">https://</span>
                            </template>
                            <template #suffix>
                              <span class="platform-demo__input-affix">.com</span>
                            </template>
                          </component>
                        </label>

                        <section class="platform-demo__input-case" data-case="states">
                          <span class="platform-demo__input-label">
                            <strong>{{ inputSampleCopy.states }}</strong>
                          </span>
                          <div class="platform-demo__input-state-grid">
                            <label>
                              <small>{{ inputSampleCopy.readonly }}</small>
                              <component
                                :is="runtime.Input"
                                :default-value="inputSampleCopy.readonlyValue"
                                readonly
                              />
                            </label>
                            <label>
                              <small>{{ inputSampleCopy.disabled }}</small>
                              <component
                                :is="runtime.Input"
                                :default-value="inputSampleCopy.disabledValue"
                                disabled
                              />
                            </label>
                          </div>
                        </section>

                        <label
                          class="platform-demo__input-case platform-demo__input-case--wide"
                          data-case="textarea"
                        >
                          <span class="platform-demo__input-label">
                            <strong>{{ inputSampleCopy.textarea }}</strong>
                          </span>
                          <component
                            :is="runtime.Input"
                            v-model:value="inputBio"
                            :max-length="60"
                            :placeholder="inputSampleCopy.textareaPlaceholder"
                            :rows="3"
                            show-word-limit
                            type="textarea"
                          />
                        </label>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'cell'">
                    <div class="platform-demo__cell-demo">
                      <component
                        :is="runtime.CellGroup"
                        :desc="cellDemoCopy.accountGroupDesc"
                        :title="cellDemoCopy.accountGroup"
                      >
                        <component
                          :is="runtime.Cell"
                          center
                          :desc="cellDemoCopy.edit"
                          is-link
                          size="large"
                          :sub-title="cellDemoCopy.profileSubtitle"
                          :title="cellDemoCopy.profile"
                          @click="cellLastAction = cellDemoCopy.profile"
                        >
                          <template #icon>
                            <span class="platform-demo__cell-avatar" aria-hidden="true">
                              {{ locale === 'en' ? 'A' : '林' }}
                            </span>
                          </template>
                        </component>
                        <component
                          :is="runtime.Cell"
                          center
                          is-link
                          :sub-title="cellDemoCopy.securitySubtitle"
                          :title="cellDemoCopy.security"
                          @click="cellLastAction = cellDemoCopy.security"
                        >
                          <template #icon>
                            <span class="platform-demo__cell-icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24">
                                <path d="M12 3 5.5 5.7v5.1c0 4.2 2.7 8.1 6.5 9.2 3.8-1.1 6.5-5 6.5-9.2V5.7L12 3Z" />
                                <path d="m9.2 11.7 1.8 1.8 3.8-4" />
                              </svg>
                            </span>
                          </template>
                          <template #desc>
                            <span class="platform-demo__cell-status">{{ cellDemoCopy.secure }}</span>
                          </template>
                        </component>
                        <component
                          :is="runtime.Cell"
                          center
                          :sub-title="cellDemoCopy.notificationsSubtitle"
                          :title="cellDemoCopy.notifications"
                        >
                          <template #icon>
                            <span class="platform-demo__cell-icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24">
                                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Z" />
                                <path d="M10 21h4" />
                              </svg>
                            </span>
                          </template>
                          <template #link>
                            <component
                              :is="runtime.Switch"
                              v-model="cellNotificationsEnabled"
                              :aria-label="cellDemoCopy.notifications"
                            />
                          </template>
                        </component>
                      </component>

                      <component
                        :is="runtime.CellGroup"
                        :desc="cellDemoCopy.preferencesGroupDesc"
                        :title="cellDemoCopy.preferencesGroup"
                      >
                        <component
                          :is="runtime.Cell"
                          :desc="cellDemoCopy.system"
                          is-link
                          :title="cellDemoCopy.appearance"
                          @click="cellLastAction = cellDemoCopy.appearance"
                        />
                        <component
                          :is="runtime.Cell"
                          :desc="cellDemoCopy.english"
                          is-link
                          :title="cellDemoCopy.language"
                          @click="cellLastAction = cellDemoCopy.language"
                        />
                        <component
                          :is="runtime.Cell"
                          :desc="cellDemoCopy.standard"
                          is-link
                          :title="cellDemoCopy.privacy"
                          @click="cellLastAction = cellDemoCopy.privacy"
                        />
                      </component>

                      <p
                        v-if="cellActionMessage"
                        class="platform-demo__cell-feedback"
                        role="status"
                      >
                        {{ cellActionMessage }}
                      </p>
                    </div>
                  </template>

                  <template v-else-if="example === 'image'">
                    <section class="platform-demo__image-demo">
                      <div class="platform-demo__image-feature">
                        <component
                          :is="runtime.Image"
                          src="/blocks/retail-home.png"
                          alt="Varo retail storefront"
                          width="100%"
                          :height="176"
                          :fit="imageFit"
                          lazy-load
                          radius="18px"
                        />
                        <div class="platform-demo__image-caption">
                          <strong>{{ copy.imageBasic }}</strong>
                          <span>{{ imageFit }} · 16:9</span>
                        </div>
                      </div>

                      <div
                        class="platform-demo__image-toolbar"
                        role="group"
                        :aria-label="locale === 'en' ? 'Image fit' : '图片填充模式'"
                      >
                        <span>{{ locale === 'en' ? 'Fit' : '填充模式' }}</span>
                        <div class="platform-demo__image-fit-options">
                          <component
                            :is="runtime.Button"
                            v-for="option in imageFitOptions"
                            :key="option.value"
                            :aria-pressed="imageFit === option.value"
                            size="sm"
                            :tone="imageFit === option.value ? 'primary' : 'default'"
                            :variant="imageFit === option.value ? 'soft' : 'ghost'"
                            @click="imageFit = option.value"
                          >
                            {{ option.label }}
                          </component>
                        </div>
                      </div>

                      <div class="platform-demo__image-state-grid">
                        <article class="platform-demo__image-item" data-state="brand">
                          <component
                            :is="runtime.Image"
                            src="/brand-assets/varo-app-icon.png"
                            alt="Varo"
                            :width="72"
                            :height="72"
                            fit="cover"
                            round
                          />
                          <span>{{ copy.imageRound }}</span>
                        </article>

                        <article class="platform-demo__image-item" data-state="error">
                          <component
                            :is="runtime.Image"
                            src="/not-found.png"
                            alt=""
                            :width="72"
                            :height="72"
                            error-text=""
                            fit="cover"
                          >
                            <template #error>
                              <svg
                                class="platform-demo__broken-image"
                                viewBox="0 0 48 48"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path d="M7 7h34v34H7z" />
                                <path d="m7 34 9-9 7 7 5-5 13 12" />
                                <circle cx="34" cy="16" r="4" />
                                <path d="m25 7-4 9 6 5-5 8" />
                              </svg>
                            </template>
                          </component>
                          <span>{{ copy.imageError }}</span>
                        </article>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'divider'">
                    <section class="platform-demo__divider-demo">
                      <article class="platform-demo__divider-order">
                        <header>
                          <strong>{{ dividerSampleCopy.order }}</strong>
                          <span>{{ dividerSampleCopy.paid }}</span>
                        </header>
                        <div class="platform-demo__divider-prices">
                          <span>{{ dividerSampleCopy.goods }}</span>
                          <strong>{{ dividerSampleCopy.goodsAmount }}</strong>
                          <span>{{ dividerSampleCopy.discount }}</span>
                          <strong class="platform-demo__divider-discount">
                            {{ dividerSampleCopy.discountAmount }}
                          </strong>
                        </div>
                        <component :is="runtime.Divider" :spacing="12" />
                        <div class="platform-demo__divider-total">
                          <strong>{{ dividerSampleCopy.total }}</strong>
                          <strong>{{ dividerSampleCopy.totalAmount }}</strong>
                        </div>

                        <component
                          :is="runtime.Divider"
                          content-position="left"
                          dashed
                          :spacing="16"
                        >
                          {{ dividerSampleCopy.logistics }}
                        </component>

                        <div class="platform-demo__divider-timeline">
                          <div>
                            <span aria-hidden="true" />
                            <p>
                              <strong>{{ dividerSampleCopy.shipped }}</strong>
                              <small>{{ dividerSampleCopy.shippedHint }}</small>
                            </p>
                          </div>
                          <component :is="runtime.Divider" :spacing="8" />
                          <div>
                            <span aria-hidden="true" />
                            <p>
                              <strong>{{ dividerSampleCopy.arrival }}</strong>
                              <small>{{ dividerSampleCopy.arrivalHint }}</small>
                            </p>
                          </div>
                        </div>

                        <footer>
                          <button type="button">
                            {{ dividerSampleCopy.contact }}
                          </button>
                          <component :is="runtime.Divider" vertical />
                          <button type="button">
                            {{ dividerSampleCopy.track }}
                          </button>
                        </footer>
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'grid'">
                    <section class="platform-demo__grid-demo">
                      <article class="platform-demo__grid-service">
                        <header>
                          <div>
                            <strong>{{ gridSampleCopy.title }}</strong>
                            <span>{{ gridSampleCopy.hint }}</span>
                          </div>
                          <span>8</span>
                        </header>
                        <component
                          :is="runtime.Grid"
                          :border="false"
                          :column-num="4"
                          :gutter="8"
                          clickable
                        >
                          <component
                            :is="runtime.GridItem"
                            v-for="item in gridSampleCopy.items"
                            :key="item.label"
                            :aria-label="item.label"
                            :badge="item.badge"
                            :dot="item.dot"
                            :text="item.label"
                            @click="gridLastAction = item.label"
                          >
                            <template #icon>
                              <svg
                                class="platform-demo__grid-icon"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path :d="item.path" />
                              </svg>
                            </template>
                          </component>
                        </component>
                        <p
                          v-if="gridActionMessage"
                          class="platform-demo__grid-result"
                          role="status"
                        >
                          {{ gridActionMessage }}
                        </p>
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'layout'">
                    <section class="platform-demo__layout-demo">
                      <article class="platform-demo__layout-overview">
                        <header>
                          <strong>{{ layoutSampleCopy.title }}</strong>
                          <span>{{ layoutSampleCopy.period }}</span>
                        </header>
                        <component :is="runtime.Row" :gutter="[8, 8]" align="stretch">
                          <component :is="runtime.Col" :span="16">
                            <article class="platform-demo__layout-card platform-demo__layout-card--primary">
                              <span>{{ layoutSampleCopy.revenue }}</span>
                              <strong>{{ layoutSampleCopy.revenueValue }}</strong>
                              <small>{{ layoutSampleCopy.revenueTrend }}</small>
                            </article>
                          </component>
                          <component :is="runtime.Col" :span="8">
                            <article class="platform-demo__layout-card">
                              <span>{{ layoutSampleCopy.orders }}</span>
                              <strong>{{ layoutSampleCopy.ordersValue }}</strong>
                            </article>
                          </component>
                          <component :is="runtime.Col" :span="8">
                            <article class="platform-demo__layout-card">
                              <span>{{ layoutSampleCopy.visitors }}</span>
                              <strong>{{ layoutSampleCopy.visitorsValue }}</strong>
                            </article>
                          </component>
                          <component :is="runtime.Col" :span="8">
                            <article class="platform-demo__layout-card">
                              <span>{{ layoutSampleCopy.conversion }}</span>
                              <strong>{{ layoutSampleCopy.conversionValue }}</strong>
                            </article>
                          </component>
                          <component :is="runtime.Col" :span="8">
                            <article class="platform-demo__layout-card">
                              <span>{{ layoutSampleCopy.refunds }}</span>
                              <strong>{{ layoutSampleCopy.refundsValue }}</strong>
                            </article>
                          </component>
                        </component>
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'space'">
                    <section class="platform-demo__space-demo">
                      <article class="platform-demo__space-filter">
                        <header>
                          <strong>{{ spaceSampleCopy.title }}</strong>
                          <span>{{ spaceSampleCopy.hint }}</span>
                        </header>
                        <component :is="runtime.Space" class="platform-demo__space-tags" :size="[8, 8]" wrap>
                          <component
                            :is="runtime.Button"
                            v-for="filter in spaceSampleCopy.filters"
                            :key="filter.value"
                            :aria-pressed="spaceDraft === filter.value"
                            size="sm"
                            :tone="spaceDraft === filter.value ? 'primary' : 'default'"
                            :variant="spaceDraft === filter.value ? 'soft' : 'outline'"
                            @click="spaceDraft = filter.value"
                          >
                            {{ filter.label }}
                          </component>
                        </component>
                        <component
                          :is="runtime.Space"
                          class="platform-demo__space-actions"
                          direction="vertical"
                          fill
                          :size="[8, 8]"
                        >
                          <component
                            :is="runtime.Button"
                            size="sm"
                            @click="spaceApplied = spaceDraft"
                          >
                            {{ spaceSampleCopy.apply }}
                          </component>
                          <component
                            :is="runtime.Button"
                            size="sm"
                            tone="default"
                            variant="outline"
                            @click="spaceDraft = 'all'; spaceApplied = 'all'"
                          >
                            {{ spaceSampleCopy.reset }}
                          </component>
                        </component>
                        <p role="status">
                          {{ spaceSampleCopy.current }}：{{ spaceAppliedLabel }}
                        </p>
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'sticky'">
                    <section class="platform-demo__sticky-demo">
                      <article class="platform-demo__sticky-feed">
                        <p class="platform-demo__sticky-hint">
                          {{ stickySampleCopy.hint }}
                        </p>
                        <component
                          :is="runtime.Sticky"
                          :offset-top="72"
                          :z-index="4"
                          @change="stickyFixed = $event"
                          @scroll="stickyScrollTop = $event.scrollTop"
                        >
                          <template #default="{ fixed }">
                            <header
                              class="platform-demo__sticky-bar"
                              :data-fixed="String(fixed)"
                            >
                              <div>
                                <strong>{{ stickySampleCopy.title }}</strong>
                                <span>{{ stickySampleCopy.count }}</span>
                              </div>
                              <span>{{ fixed ? stickySampleCopy.fixed : stickySampleCopy.normal }}</span>
                            </header>
                          </template>
                        </component>
                        <div class="platform-demo__sticky-list">
                          <article
                            v-for="item in stickySampleCopy.items"
                            :key="item.id"
                          >
                            <div>
                              <strong>{{ item.id }}</strong>
                              <span>{{ item.status }}</span>
                            </div>
                            <strong>{{ item.amount }}</strong>
                          </article>
                        </div>
                        <p class="platform-demo__sticky-result" role="status">
                          {{ stickyFixed ? stickySampleCopy.fixed : stickySampleCopy.normal }}
                          · {{ stickySampleCopy.scroll }} {{ stickyScrollTop }}px
                        </p>
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'elevator'">
                    <section class="platform-demo__nav-demo platform-demo__elevator-demo">
                      <article class="platform-demo__elevator-directory">
                        <header>
                          <div>
                            <strong>{{ elevatorSampleCopy.title }}</strong>
                            <span>{{ elevatorSampleCopy.hint }}</span>
                          </div>
                          <output>{{ elevatorSampleCopy.selected }}：{{ elevatorSelected }}</output>
                        </header>
                        <component
                          :is="runtime.Elevator"
                          :active-index="elevatorActive"
                          :indexes="copy.elevatorGroups"
                          @click-item="selectElevatorItem"
                          @update:active-index="elevatorActive = $event"
                        />
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'fixed-nav'">
                    <section class="platform-demo__nav-demo platform-demo__fixed-nav-demo">
                      <article class="platform-demo__fixed-nav-product">
                        <span>{{ fixedNavSampleCopy.eyebrow }}</span>
                        <h3>{{ fixedNavSampleCopy.title }}</h3>
                        <p>{{ fixedNavSampleCopy.description }}</p>
                        <div>
                          <strong>{{ fixedNavSampleCopy.price }}</strong>
                          <span>{{ fixedNavSampleCopy.priceSuffix }}</span>
                        </div>
                        <ul>
                          <li v-for="feature in fixedNavSampleCopy.features" :key="feature">
                            {{ feature }}
                          </li>
                        </ul>
                        <p
                          v-if="fixedNavSelected"
                          class="platform-demo__fixed-nav-result"
                          role="status"
                        >
                          {{ fixedNavSampleCopy.selected }}：{{ fixedNavSelected }}
                        </p>
                      </article>
                      <component
                        :is="runtime.FixedNav"
                        :visible="fixedNavVisible"
                        :nav-list="fixedNavSampleCopy.items"
                        :active-text="fixedNavSampleCopy.action"
                        @select="selectFixedNavItem"
                        @update:visible="fixedNavVisible = $event"
                      />
                    </section>
                  </template>

                  <template v-else-if="example === 'indicator'">
                    <section class="platform-demo__nav-demo platform-demo__indicator-demo">
                      <article class="platform-demo__indicator-slide">
                        <header>
                          <span>{{ currentIndicatorItem.tag }}</span>
                          <span>{{ String(indicatorCurrent + 1).padStart(2, '0') }} / 04</span>
                        </header>
                        <strong>{{ currentIndicatorItem.title }}</strong>
                        <p>{{ currentIndicatorItem.body }}</p>
                      </article>
                      <div class="platform-demo__indicator-controls">
                        <div>
                          <span>{{ indicatorSampleCopy.dots }}</span>
                          <component
                            :is="runtime.Indicator"
                            :aria-label="indicatorSampleCopy.navigationLabel"
                            :item-aria-label="indicatorSampleCopy.itemLabel"
                            :total="indicatorSampleCopy.items.length"
                            :current="indicatorCurrent"
                            @update:current="indicatorCurrent = $event"
                          />
                        </div>
                        <div>
                          <span>{{ indicatorSampleCopy.lines }}</span>
                          <component
                            :is="runtime.Indicator"
                            :aria-label="indicatorSampleCopy.navigationLabel"
                            :item-aria-label="indicatorSampleCopy.itemLabel"
                            :total="indicatorSampleCopy.items.length"
                            :current="indicatorCurrent"
                            type="line"
                            @update:current="indicatorCurrent = $event"
                          />
                        </div>
                      </div>
                    </section>
                  </template>

                  <template v-else-if="example === 'menu'">
                    <section class="platform-demo__nav-demo platform-demo__menu-demo">
                      <article class="platform-demo__menu-catalog">
                        <header>
                          <strong>{{ menuSampleCopy.title }}</strong>
                          <span>{{ menuSampleCopy.count }}</span>
                        </header>
                        <component
                          :is="runtime.Menu"
                          :active-name="menuActiveName"
                          @update:active-name="menuActiveName = $event"
                        >
                          <component
                            :is="runtime.MenuItem"
                            :model-value="menuValue"
                            name="sort"
                            :title="menuSampleCopy.sort"
                            :options="menuSampleCopy.sortOptions"
                            @update:model-value="menuValue = $event"
                          />
                          <component
                            :is="runtime.MenuItem"
                            :model-value="menuStockValue"
                            name="stock"
                            :title="menuSampleCopy.stock"
                            :options="menuSampleCopy.stockOptions"
                            @update:model-value="menuStockValue = $event"
                          />
                        </component>
                        <p class="platform-demo__menu-result" role="status">
                          <span>{{ menuSampleCopy.result }}</span>
                          <strong>{{ menuSortLabel }} · {{ menuStockLabel }}</strong>
                        </p>
                        <div class="platform-demo__menu-products">
                          <article v-for="product in menuSampleCopy.products" :key="product.name">
                            <div>
                              <strong>{{ product.name }}</strong>
                              <span>{{ product.meta }}</span>
                            </div>
                            <strong>{{ product.price }}</strong>
                          </article>
                        </div>
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'navbar'">
                    <section class="platform-demo__nav-demo platform-demo__navbar-demo">
                      <component
                        :is="runtime.Navbar"
                        :title="navbarSampleCopy.title"
                        :left-text="navbarSampleCopy.back"
                        :left-aria-label="navbarSampleCopy.back"
                        :right-text="navbarSampleCopy.help"
                        :right-aria-label="navbarSampleCopy.help"
                        left-arrow
                        @click-left="navbarAction = navbarSampleCopy.back"
                        @click-right="navbarAction = navbarSampleCopy.help"
                      />
                      <article class="platform-demo__navbar-order">
                        <header>
                          <span>{{ navbarSampleCopy.status }}</span>
                          <small>{{ navbarSampleCopy.statusHint }}</small>
                        </header>
                        <dl>
                          <div>
                            <dt>{{ navbarSampleCopy.order }}</dt>
                            <dd>{{ navbarSampleCopy.orderValue }}</dd>
                          </div>
                          <div>
                            <dt>{{ navbarSampleCopy.recipient }}</dt>
                            <dd>{{ navbarSampleCopy.recipientValue }}</dd>
                          </div>
                          <div>
                            <dt>{{ navbarSampleCopy.total }}</dt>
                            <dd>{{ navbarSampleCopy.totalValue }}</dd>
                          </div>
                        </dl>
                        <p v-if="navbarAction" role="status">
                          {{ navbarSampleCopy.action }}：{{ navbarAction }}
                        </p>
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'pagination'">
                    <section class="platform-demo__nav-demo platform-demo__pagination-demo">
                      <article class="platform-demo__pagination-orders">
                        <header>
                          <strong>{{ paginationSampleCopy.title }}</strong>
                          <span>{{ paginationSampleCopy.total }}</span>
                        </header>
                        <div>
                          <article v-for="order in paginationOrders" :key="order.id">
                            <div>
                              <strong>{{ order.id }}</strong>
                              <span>{{ order.status }}</span>
                            </div>
                            <strong>{{ order.amount }}</strong>
                          </article>
                        </div>
                        <p role="status">
                          {{ paginationSampleCopy.page }} {{ paginationPage }}
                          {{ paginationSampleCopy.pageSuffix }}
                        </p>
                        <component
                          :is="runtime.Pagination"
                          :aria-label="paginationSampleCopy.navigationLabel"
                          :item-aria-label="paginationSampleCopy.itemLabel"
                          :model-value="paginationPage"
                          :page-count="5"
                          @update:model-value="paginationPage = $event"
                        />
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'side-navbar'">
                    <section class="platform-demo__nav-demo platform-demo__side-navbar-demo">
                      <component
                        :is="runtime.SideNavbar"
                        :aria-label="sideNavbarSampleCopy.navigationLabel"
                        :model-value="sideNavActive"
                        @update:model-value="sideNavActive = $event"
                      >
                        <component
                          :is="runtime.SideNavbarItem"
                          v-for="item in sideNavbarSampleCopy.items"
                          :key="item.name"
                          :name="item.name"
                          :title="item.title"
                          :badge="item.badge"
                        />
                      </component>
                      <article class="platform-demo__side-navbar-panel">
                        <header>
                          <div>
                            <strong>{{ currentSideNavbarItem.heading }}</strong>
                            <span>{{ currentSideNavbarItem.body }}</span>
                          </div>
                          <strong>{{ currentSideNavbarItem.metric }}</strong>
                        </header>
                        <ul>
                          <li v-for="detail in currentSideNavbarItem.details" :key="detail">
                            {{ detail }}
                          </li>
                        </ul>
                      </article>
                    </section>
                  </template>

                  <template v-else-if="example === 'tabbar'">
                    <section class="platform-demo__nav-demo platform-demo__tabbar-demo">
                      <article class="platform-demo__tabbar-page">
                        <span>{{ currentTabbarItem.title }}</span>
                        <strong>{{ currentTabbarItem.title }}</strong>
                        <p>{{ currentTabbarItem.body }}</p>
                      </article>
                      <component
                        :is="runtime.Tabbar"
                        :aria-label="tabbarSampleCopy.navigationLabel"
                        :model-value="tabbarActive"
                        @update:model-value="tabbarActive = $event"
                      >
                        <component
                          :is="runtime.TabbarItem"
                          v-for="item in tabbarSampleCopy.items"
                          :key="item.name"
                          :name="item.name"
                          :badge="item.badge"
                          :dot="item.dot"
                        >
                          <template #icon>
                            <svg
                              class="platform-demo__tabbar-icon"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path :d="item.path" />
                            </svg>
                          </template>
                          {{ item.title }}
                        </component>
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'tabs'">
                    <section class="platform-demo__nav-demo platform-demo__tabs-demo">
                      <component
                        :is="runtime.Tabs"
                        :aria-label="tabsNavigationLabel"
                        :active="tabsActive"
                        @update:active="tabsActive = $event"
                      >
                        <component
                          :is="runtime.Tab"
                          v-for="item in copy.tabsItems"
                          :key="item.name"
                          :name="item.name"
                          :title="item.title"
                        >
                          <div class="platform-demo__tabs-panel">
                            <strong>{{ item.title }}</strong>
                            <span>{{ item.body }}</span>
                          </div>
                        </component>
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'overlay'">
                    <section class="platform-demo__overlay-demo">
                      <div class="platform-demo__card-head">
                        <span>{{ copy.overlayPanel }}</span>
                        <small>{{ platformDemo.overlayText }}</small>
                      </div>
                      <component :is="runtime.Button" size="sm" type="button" @click="overlayVisible = true">
                        {{ platformDemo.overlayOpenText }}
                      </component>
                      <component
                        :is="runtime.Overlay"
                        v-model:visible="overlayVisible"
                        class="platform-demo__inner-overlay"
                        :z-index="12"
                        :duration="0.18"
                      >
                        <span>{{ platformDemo.overlayText }}</span>
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'popup'">
                    <section class="platform-demo__popup-demo">
                      <div class="platform-demo__card-head">
                        <span>{{ copy.popupPanel }}</span>
                        <small>{{ platformDemo.popupTitle }}</small>
                      </div>
                      <component :is="runtime.Button" size="sm" type="button" @click="popupVisible = true">
                        {{ platformDemo.popupOpenText }}
                      </component>
                      <component
                        :is="runtime.Popup"
                        v-model:visible="popupVisible"
                        closeable
                        round
                        class="platform-demo__inner-popup"
                        :z-index="20"
                        :duration="0.18"
                      >
                        <div class="platform-demo__popup-body">
                          <h4>{{ platformDemo.popupTitle }}</h4>
                          <p>{{ platformDemo.popupBody }}</p>
                          <component :is="runtime.Button" size="sm" variant="outline" type="button" @click="popupVisible = false">
                            {{ platformDemo.popupCloseText }}
                          </component>
                        </div>
                      </component>
                    </section>
                  </template>

                  <template v-else-if="example === 'dialog'">
                    <section class="platform-demo__card platform-demo__card--dialog">
                      <div class="platform-demo__card-head">
                        <span>Dialog</span>
                        <small>{{ platformDemo.dialogHint }}</small>
                      </div>

                      <component :is="runtime.DialogRoot">
                        <component :is="runtime.DialogTrigger" class="platform-demo__trigger" type="button">
                          {{ platformDemo.dialogOpenText }}
                        </component>
                        <component :is="runtime.DialogOverlay" as="div" class="platform-demo__overlay" />
                        <component :is="runtime.DialogContent" as="div" class="platform-demo__dialog">
                          <h4>{{ platformDemo.dialogTitle }}</h4>
                          <p>{{ platformDemo.dialogBody }}</p>
                          <div class="platform-demo__dialog-actions">
                            <component :is="runtime.DialogClose" class="platform-demo__dialog-close" type="button">
                              {{ platformDemo.dialogCloseText }}
                            </component>
                          </div>
                        </component>
                      </component>
                    </section>
                  </template>

                  <template v-else>
                    <section class="platform-demo__card">
                      <label class="platform-demo__field">
                        <span>{{ platformDemo.controlledLabel }}</span>
                        <component
                          :is="runtime.Input"
                          v-model:value="inputValue"
                          clearable
                          :invalid="overviewInputInvalid"
                          :max-length="16"
                          :placeholder="platformDemo.placeholder"
                          show-word-limit
                        />
                      </label>
                      <small class="platform-demo__caption">
                        {{ copy.currentValueLabel }}: {{ inputValue || copy.emptyValue }}
                      </small>
                    </section>

                    <section class="platform-demo__card">
                      <div class="platform-demo__stack">
                        <component
                          :is="runtime.Button"
                          type="button"
                        >
                          {{ platformDemo.primaryText }}
                        </component>
                        <component :is="runtime.Button" size="sm" variant="outline" type="button">
                          {{ platformDemo.secondaryText }}
                        </component>
                      </div>
                    </section>

                    <section class="platform-demo__card platform-demo__card--dialog">
                      <div class="platform-demo__card-head">
                        <span>{{ copy.dialogSection }}</span>
                        <small>{{ platformDemo.dialogHint }}</small>
                      </div>

                      <component :is="runtime.DialogRoot">
                        <component :is="runtime.DialogTrigger" class="platform-demo__trigger" type="button">
                          {{ platformDemo.dialogOpenText }}
                        </component>
                        <component :is="runtime.DialogOverlay" as="div" class="platform-demo__overlay" />
                        <component :is="runtime.DialogContent" as="div" class="platform-demo__dialog">
                          <h4>{{ platformDemo.dialogTitle }}</h4>
                          <p>{{ platformDemo.dialogBody }}</p>
                          <div class="platform-demo__dialog-actions">
                            <component :is="runtime.DialogClose" class="platform-demo__dialog-close" type="button">
                              {{ platformDemo.dialogCloseText }}
                            </component>
                          </div>
                        </component>
                      </component>
                    </section>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="platform-demo__code-disclosure">
          <button
            class="platform-demo__code-toggle"
            :data-active="String(codeExpanded)"
            type="button"
            :aria-controls="codePanelId"
            :aria-expanded="codeExpanded"
            :aria-label="codeToggleLabel"
            @click="toggleCodeExpanded"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" class="platform-demo__code-toggle-icon">
              <path
                d="M9 9.75V8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1.75"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              />
              <rect
                x="4"
                y="7"
                width="10"
                height="12"
                rx="2"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              />
            </svg>
            <span>{{ codeToggleLabel }}</span>
          </button>
        </div>

        <div v-if="codeExpanded" class="platform-demo__code-shell">
          <div class="platform-demo__code-head-row">
            <div class="platform-demo__code-tabs" role="tablist" :aria-label="copy.codeTitle">
              <button
                v-for="codeExample in codeExamples"
                :id="codeTabId(codeExample.key)"
                :key="codeExample.key"
                class="platform-demo__code-tab"
                :data-platform="codeExample.key"
                :data-active="activePlatform === codeExample.key"
                type="button"
                role="tab"
                :aria-controls="codePanelId"
                :aria-selected="activePlatform === codeExample.key"
                :tabindex="activePlatform === codeExample.key ? 0 : -1"
                @click="setPlatform(codeExample.key)"
                @keydown="handlePlatformTabKeydown"
              >
                {{ codeExample.title }}
              </button>
            </div>
            <button
              class="platform-demo__code-copy"
              type="button"
              :data-state="copyState"
              :aria-label="copyLabel"
              @click="copySnippet"
            >
              <span class="platform-demo__code-copy-icon" aria-hidden="true" />
              <span class="platform-demo__code-copy-label">{{ copyLabel }}</span>
            </button>
          </div>

          <section
            :id="codePanelId"
            class="platform-demo__code-section"
            role="tabpanel"
            :aria-labelledby="codeTabId(activePlatform)"
          >
            <div class="platform-demo__code-head">
              <strong>{{ activeCodeExample.title }}</strong>
              <span>{{ activeCodeExample.packageName }}</span>
            </div>
            <pre><code>{{ activeCodeExample.code }}</code></pre>
            <p
              v-if="copyState !== 'idle'"
              class="platform-demo__code-toast"
              :data-state="copyState"
              role="status"
              aria-live="polite"
            >
              {{ copyState === 'copied' ? copy.copySuccess : copy.copyUnsupported }}
            </p>
          </section>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
/* Shell: phone frame + dual column + dark-mode tokens */

.platform-demo {
  --demo-surface: var(--varo-demo-surface);
  --demo-surface-strong: var(--varo-demo-surface-strong);
  --demo-border: var(--varo-demo-border);
  --demo-text-muted: var(--varo-demo-text-muted);
  --demo-brand: var(--varo-demo-brand);
  --demo-phone-shell: var(--varo-demo-phone-shell);
  --demo-phone-screen: var(--varo-demo-phone-screen);
  --demo-phone-card: var(--varo-demo-phone-card);
  --demo-shadow: var(--varo-demo-shadow);
  --demo-code-bg: #0f1722;
  --demo-code-surface: #172231;
  --demo-code-border: #304056;
  --demo-code-text: #e8eef5;
  --demo-code-muted: #9eacc0;
  --demo-duration-instant: 100ms;
  --demo-duration-fast: 160ms;
  --demo-duration-enter: 180ms;
  --demo-ease-out: cubic-bezier(0.23, 1, 0.32, 1);

  padding: 0;
  margin: 24px 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

:where(.platform-demo button) {
  transition: transform var(--demo-duration-fast) var(--demo-ease-out);
}

.platform-demo__head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.platform-demo__head h2 {
  margin: 0;
  letter-spacing: -0.03em;
}

.platform-demo__platform-switch {
  display: inline-flex;
  flex-shrink: 0;
  gap: 3px;
  padding: 3px;
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
  border-radius: 10px;
}

.platform-demo__platform-tab {
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
  transition:
    background var(--demo-duration-instant) var(--demo-ease-out),
    color var(--demo-duration-instant) var(--demo-ease-out),
    transform var(--demo-duration-instant) var(--demo-ease-out);
}

.platform-demo__platform-tab:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--demo-brand) 70%, transparent);
  outline-offset: 2px;
}

.platform-demo__platform-tab[data-active='true'] {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 14%, var(--demo-surface-strong));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--demo-brand) 24%, transparent);
}

.platform-demo__stage {
  display: grid;
  gap: 16px;
  align-items: start;
  padding: 16px;
  background: color-mix(in srgb, var(--demo-surface-strong) 92%, transparent);
  border: 1px solid var(--demo-border);
  border-radius: var(--varo-demo-radius-lg);
  box-shadow: var(--demo-shadow);
}

.platform-demo__stage[data-layout='controls-preview'] {
  grid-template-columns: minmax(220px, 272px) minmax(0, 1fr);
  gap: 18px;
}

.platform-demo__stage[data-layout='preview-only'] {
  grid-template-columns: minmax(0, 1fr);
}

.platform-demo__panel {
  min-width: 0;
}

.platform-demo__panel--controls {
  display: grid;
  gap: 12px;
  align-content: start;
}

.platform-demo__controls {
  display: grid;
  gap: 12px;
  padding: 14px;
  background: color-mix(in srgb, var(--demo-surface-strong) 88%, transparent);
  border: 1px solid var(--demo-border);
  border-radius: 12px;
}

.platform-demo__panel--preview {
  display: grid;
  gap: 14px;
}

.platform-demo__phone-frame {
  display: flex;
  justify-content: center;
  padding: 12px 0 6px;
}

.platform-demo__phone-bezel {
  position: relative;
  box-sizing: border-box;
  width: min(100%, 397px);
  padding: 10px;
  background: linear-gradient(145deg, #34363a 0%, #111214 34%, #050506 100%);
  border: 1px solid color-mix(in srgb, #fff 18%, transparent);
  border-radius: 54px;
  box-shadow:
    0 24px 56px rgb(0 0 0 / 28%),
    inset 0 0 0 1px rgb(255 255 255 / 6%);
}

.platform-demo__phone-bezel::before {
  position: absolute;
  top: 18px;
  left: 50%;
  z-index: 3;
  width: 96px;
  height: 25px;
  content: '';
  background: #050506;
  border-radius: 999px;
  transform: translateX(-50%);
}

.platform-demo__phone-bezel::after {
  position: absolute;
  bottom: 17px;
  left: 50%;
  z-index: 3;
  width: 112px;
  height: 4px;
  content: '';
  background: color-mix(in srgb, var(--vp-c-text-1) 58%, transparent);
  border-radius: 999px;
  transform: translateX(-50%);
}

.platform-demo__phone-screen {
  position: relative;
  min-height: 667px;
  overflow: hidden;
  color: var(--vp-c-text-1);
  background: var(--demo-phone-screen);
  border-radius: 44px;
}

.platform-demo__phone-content {
  position: relative;
  z-index: 1;
  padding: 52px 16px 38px;
}

.platform-demo__preview-content {
  display: grid;
  gap: 12px;
}

.platform-demo__phone-bezel .platform-demo__button-sample,
.platform-demo__phone-bezel .platform-demo__badge-sample,
.platform-demo__phone-bezel .platform-demo__popover-sample,
.platform-demo__phone-bezel .platform-demo__input-sample {
  padding: 16px;
}

.platform-demo__phone-bezel .platform-demo__button-row {
  gap: 8px;
}

.platform-demo__phone-bezel .platform-demo__badge-counts,
.platform-demo__phone-bezel .platform-demo__input-state-grid {
  grid-template-columns: minmax(0, 1fr);
}

.platform-demo__phone-bezel .platform-demo__badge-statuses,
.platform-demo__phone-bezel .platform-demo__badge-variants {
  gap: 12px;
}

.platform-demo__phone-bezel .platform-demo__popover-canvas {
  min-height: 250px;
  padding: 18px;
}

.platform-demo__phone-bezel .platform-demo__popover-placements {
  gap: 28px;
  min-height: 132px;
  padding: 26px 40px;
}

.platform-demo__phone-bezel .platform-demo__popover-tip[data-side='right'] {
  top: calc(100% + 8px);
  right: auto;
  left: 50%;
  transform: translateX(-50%);
}

.platform-demo__card,
.platform-demo__nav-demo,
.platform-demo__cell-demo,
.platform-demo__image-demo,
.platform-demo__divider-demo,
.platform-demo__grid-demo,
.platform-demo__layout-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo,
.platform-demo__overlay-demo,
.platform-demo__popup-demo {
  background: var(--demo-phone-card);
  border: 1px solid var(--demo-border);
  border-radius: 18px;
  box-shadow: 0 10px 28px color-mix(in srgb, var(--varo-foreground) 8%, transparent);
}

.platform-demo__code-disclosure {
  display: flex;
  justify-content: flex-end;
}

.platform-demo__code-toggle {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: color-mix(in srgb, var(--demo-surface-strong) 92%, transparent);
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  transition:
    color var(--demo-duration-fast) var(--demo-ease-out),
    border-color var(--demo-duration-fast) var(--demo-ease-out),
    background var(--demo-duration-fast) var(--demo-ease-out),
    transform var(--demo-duration-fast) var(--demo-ease-out);
}

.platform-demo__code-toggle:hover,
.platform-demo__code-toggle[data-active='true'] {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 10%, transparent);
  border-color: color-mix(in srgb, var(--demo-brand) 46%, var(--demo-border));
  transform: translateY(-1px);
}

.platform-demo__code-toggle-icon {
  flex: none;
  width: 16px;
  height: 16px;
}

.platform-demo__code-shell {
  overflow: hidden;
  color: var(--demo-code-text);
  background: var(--demo-code-bg);
  border: 1px solid var(--demo-code-border);
  border-radius: 14px;
  box-shadow: 0 12px 28px color-mix(in srgb, #020617 22%, transparent);
}

.platform-demo__code-head-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 0;
}

.platform-demo__code-tabs {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  background: var(--demo-code-surface);
  border: 1px solid var(--demo-code-border);
  border-radius: 10px;
}

.platform-demo__code-tab {
  min-height: 36px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--demo-code-muted);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  transition:
    border-color var(--demo-duration-instant) var(--demo-ease-out),
    background var(--demo-duration-instant) var(--demo-ease-out),
    color var(--demo-duration-instant) var(--demo-ease-out);
}

.platform-demo__code-tab[data-active='true'] {
  color: #0f1722;
  background: #f8fafc;
  border-color: #cbd5e1;
}

.platform-demo__code-tab:hover:not([data-active='true']) {
  color: var(--demo-code-text);
  background: color-mix(in srgb, var(--demo-brand) 10%, transparent);
}

.platform-demo__code-copy {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--demo-code-text);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--demo-code-border);
  border-radius: 999px;
  transition:
    border-color var(--demo-duration-fast) var(--demo-ease-out),
    background var(--demo-duration-fast) var(--demo-ease-out),
    color var(--demo-duration-fast) var(--demo-ease-out),
    transform var(--demo-duration-fast) var(--demo-ease-out);
}

.platform-demo__code-copy:hover {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 10%, transparent);
  border-color: color-mix(in srgb, var(--demo-brand) 46%, var(--demo-code-border));
}

.platform-demo__code-copy[data-state='copied'] {
  color: var(--varo-color-success, #16a34a);
  background: color-mix(in srgb, var(--varo-color-success, #16a34a) 14%, transparent);
  border-color: color-mix(in srgb, var(--varo-color-success, #16a34a) 48%, var(--demo-code-border));
}

.platform-demo__code-copy[data-state='unsupported'] {
  color: var(--varo-color-warning, #d97706);
  background: color-mix(in srgb, var(--varo-color-warning, #d97706) 14%, transparent);
  border-color: color-mix(in srgb, var(--varo-color-warning, #d97706) 48%, var(--demo-code-border));
}

.platform-demo__code-copy-icon {
  position: relative;
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
}

.platform-demo__code-copy-icon::before,
.platform-demo__code-copy-icon::after {
  position: absolute;
  width: 8px;
  height: 10px;
  content: '';
  border: 1.5px solid currentcolor;
  border-radius: 2px;
}

.platform-demo__code-copy-icon::before {
  top: 0;
  right: 0;
}

.platform-demo__code-copy-icon::after {
  bottom: 0;
  left: 0;
  background: currentcolor;
  opacity: 0.18;
}

.platform-demo__code-copy-label {
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.platform-demo__code-section {
  padding: 0;
  margin: 0;
  color: var(--demo-code-text);
  background: var(--demo-code-bg);
  border: 0;
  border-top: 1px solid var(--demo-code-border);
}

.platform-demo__code-section .platform-demo__code-head {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 12px 14px 0;
  font-size: 0.78rem;
  color: var(--demo-code-muted);
}

.platform-demo__code-section pre {
  max-height: 280px;
  padding: 12px 14px 16px;
  margin: 0;
  overflow: auto;
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--demo-code-text);
  background: transparent;
}

.platform-demo__code-toast {
  padding: 8px 14px;
  margin: 0;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1.3;
  border-top: 1px solid var(--demo-border);
}

.platform-demo__code-toast[data-state='copied'] {
  color: var(--varo-color-success, #16a34a);
  background: color-mix(in srgb, var(--varo-color-success, #16a34a) 12%, transparent);
}

.platform-demo__code-toast[data-state='unsupported'] {
  color: var(--varo-color-warning, #d97706);
  background: color-mix(in srgb, var(--varo-color-warning, #d97706) 12%, transparent);
}

@media (max-width: 960px) {
  .platform-demo__stage[data-layout='controls-preview'] {
    grid-template-columns: minmax(0, 1fr);
  }

  .platform-demo__head {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .platform-demo__phone-bezel {
    width: 100%;
  }

  .platform-demo__phone-screen {
    min-height: 480px;
  }
}

/* Content demos + control chips + component deep styles */

.platform-demo__platform-tab:hover:not([data-active='true']) {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 8%, transparent);
}

.platform-demo__head > div,
.platform-demo__stage > *,
.platform-demo__panel,
.platform-demo__control-group,
.platform-demo__preview-content,
.platform-demo__field,
.platform-demo__stack {
  min-width: 0;
}

.platform-demo__control-group {
  padding: 14px;
  background: var(--demo-surface-strong);
  border: 1px solid var(--demo-border);
  border-radius: 18px;
}

.platform-demo__control-group span {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--varo-muted, var(--vp-c-text-2));
  text-transform: none;
  letter-spacing: 0;
}

.platform-demo__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.platform-demo__chip {
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  transition:
    border-color var(--demo-duration-instant) var(--demo-ease-out),
    background var(--demo-duration-instant) var(--demo-ease-out),
    color var(--demo-duration-instant) var(--demo-ease-out),
    box-shadow var(--demo-duration-instant) var(--demo-ease-out),
    transform var(--demo-duration-instant) var(--demo-ease-out);
}

.platform-demo__chip[data-active='true'] {
  color: var(--demo-brand);
  background: color-mix(in srgb, var(--demo-brand) 12%, transparent);
  border-color: color-mix(in srgb, var(--demo-brand) 32%, var(--demo-border));
  box-shadow: none;
}

.platform-demo__chip:hover {
  color: var(--demo-brand);
  border-color: color-mix(in srgb, var(--demo-brand) 40%, var(--demo-border));
}

.platform-demo__code-tab:focus-visible,
.platform-demo__code-toggle:focus-visible,
.platform-demo__code-copy:focus-visible,
.platform-demo__chip:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--demo-brand) 70%, transparent);
  outline-offset: 2px;
}

.platform-demo__card {
  padding: 14px;
  background: color-mix(in srgb, var(--varo-card-solid) 78%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 22px;
  box-shadow: var(--varo-shadow-sm);
}

.platform-demo__card--dialog {
  position: relative;
  min-height: 210px;
}

.platform-demo__card-head {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.platform-demo__card-head small,
.platform-demo__caption {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.platform-demo__field {
  display: grid;
  gap: 8px;
}

.platform-demo__field span {
  font-size: 0.82rem;
}

.platform-demo__caption {
  display: block;
  margin-top: 10px;
}

.platform-demo__stack {
  display: grid;
  gap: 10px;
}

.platform-demo__image-demo {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.platform-demo__divider-demo,
.platform-demo__grid-demo,
.platform-demo__image-item,
.platform-demo__layout-demo,
.platform-demo__nav-demo,
.platform-demo__overlay-demo,
.platform-demo__popup-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo {
  background: color-mix(in srgb, var(--varo-card-solid) 78%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 18px;
  box-shadow: var(--varo-shadow-sm);
}

.platform-demo__divider-demo,
.platform-demo__grid-demo,
.platform-demo__layout-demo,
.platform-demo__nav-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.platform-demo__nav-demo {
  position: relative;
  align-content: start;
  min-height: 260px;
  overflow: hidden;
}

.platform-demo__elevator-demo {
  min-height: 420px;
}

.platform-demo__elevator-directory {
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 14px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__elevator-directory > header {
  display: grid;
  gap: 8px;
}

.platform-demo__elevator-directory > header > div {
  display: grid;
  gap: 2px;
}

.platform-demo__elevator-directory > header strong {
  font-size: 0.88rem;
  color: var(--varo-text-primary);
}

.platform-demo__elevator-directory > header span {
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__elevator-directory output {
  width: fit-content;
  padding: 5px 8px;
  font-size: 0.7rem;
  font-weight: 650;
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  border-radius: 999px;
}

:deep(.varo-elevator) {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 30px;
  gap: 8px;
  width: 100%;
}

:deep(.varo-elevator__content) {
  display: grid;
  grid-auto-rows: max-content;
  gap: 8px;
  align-content: start;
  max-height: 310px;
  padding-right: 3px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

:deep(.varo-elevator__group) {
  overflow: hidden;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border-light);
  border-radius: 12px;
}

:deep(.varo-elevator__title) {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 7px 11px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
}

:deep(.varo-elevator__item) {
  display: block;
  width: 100%;
  min-height: 38px;
  padding: 0 11px;
  color: var(--varo-text-primary);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--varo-border-light);
}

:deep(.varo-elevator__item:hover) {
  color: var(--varo-primary);
  background: var(--varo-card-solid);
}

:deep(.varo-elevator__item:focus-visible) {
  outline: 2px solid var(--varo-primary);
  outline-offset: -2px;
}

:deep(.varo-elevator__indexes) {
  display: grid;
  gap: 4px;
  place-self: center end;
  padding: 6px 3px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 999px;
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-elevator__index) {
  width: 23px;
  height: 23px;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--varo-text-secondary);
  cursor: pointer;
  background: var(--varo-fill-light);
  border: 0;
  border-radius: 999px;
}

:deep(.varo-elevator__index[data-active='true']) {
  color: var(--varo-primary-foreground);
  background: var(--varo-primary);
}

:deep(.varo-elevator__index:focus-visible) {
  outline: 2px solid var(--varo-primary);
  outline-offset: 2px;
}

.platform-demo__fixed-nav-demo {
  min-height: 340px;
}

.platform-demo__fixed-nav-product {
  display: grid;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--varo-primary) 16%, transparent), transparent 40%),
    var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__fixed-nav-product > span {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--varo-primary);
}

.platform-demo__fixed-nav-product h3,
.platform-demo__fixed-nav-product p {
  margin: 0;
}

.platform-demo__fixed-nav-product h3 {
  font-size: 1.15rem;
  color: var(--varo-text-primary);
}

.platform-demo__fixed-nav-product > p {
  font-size: 0.74rem;
  line-height: 1.45;
  color: var(--varo-text-secondary);
}

.platform-demo__fixed-nav-product > div {
  display: flex;
  gap: 4px;
  align-items: baseline;
}

.platform-demo__fixed-nav-product > div strong {
  font-size: 1.2rem;
  font-variant-numeric: tabular-nums;
  color: var(--varo-primary);
}

.platform-demo__fixed-nav-product > div span {
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__fixed-nav-product ul {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 0;
  margin: 4px 0 0;
  list-style: none;
}

.platform-demo__fixed-nav-product li {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 8px;
  margin: 0;
  font-size: 0.66rem;
  line-height: 1.2;
  color: var(--varo-text-secondary);
  white-space: nowrap;
  background: var(--varo-fill-light);
  border-radius: 8px;
}

.platform-demo__fixed-nav-product .platform-demo__fixed-nav-result {
  font-weight: 650;
  color: var(--varo-success);
}

:deep(.varo-fixed-nav) {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  align-items: flex-end;
}

:deep(.varo-fixed-nav__trigger) {
  min-width: 52px;
  height: 44px;
  padding: 0 12px;
  font-weight: 700;
  color: var(--varo-primary-foreground);
  cursor: pointer;
  background: var(--varo-primary);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 12px 28px color-mix(in srgb, var(--varo-primary) 28%, transparent);
}

:deep(.varo-fixed-nav__trigger:focus-visible),
:deep(.varo-fixed-nav__item:focus-visible) {
  outline: 2px solid var(--varo-primary);
  outline-offset: 2px;
}

:deep(.varo-fixed-nav__list) {
  display: grid;
  gap: 6px;
}

:deep(.varo-fixed-nav__item) {
  position: relative;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 12px;
  color: var(--varo-text-primary);
  cursor: pointer;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 999px;
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-fixed-nav__item:hover) {
  color: var(--varo-primary);
  border-color: var(--varo-primary);
}

:deep(.varo-fixed-nav__badge),
:deep(.varo-side-navbar__badge),
:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  position: absolute;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 0.64rem;
  line-height: 16px;
  color: var(--varo-primary-foreground);
  background: var(--varo-danger);
  border-radius: 999px;
}

:deep(.varo-fixed-nav__badge) {
  top: -6px;
  right: -6px;
}

.platform-demo__indicator-demo {
  gap: 14px;
}

.platform-demo__indicator-slide {
  display: grid;
  gap: 10px;
  width: 100%;
  min-height: 158px;
  padding: 16px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--varo-primary) 18%, transparent), transparent 42%),
    var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
  transition: background var(--demo-duration-enter) var(--demo-ease-out);
}

.platform-demo__indicator-slide > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.platform-demo__indicator-slide > header span {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--varo-primary);
}

.platform-demo__indicator-slide > strong {
  font-size: 1rem;
  color: var(--varo-text-primary);
}

.platform-demo__indicator-slide > p {
  margin: 0;
  font-size: 0.74rem;
  line-height: 1.5;
  color: var(--varo-text-secondary);
}

.platform-demo__indicator-controls {
  display: grid;
  gap: 8px;
}

.platform-demo__indicator-controls > div {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 7px 10px;
  background: var(--varo-fill-light);
  border-radius: 10px;
}

.platform-demo__indicator-controls > div > span {
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

:deep(.varo-indicator) {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

:deep(.varo-indicator__item) {
  width: 8px;
  height: 8px;
  padding: 0;
  cursor: pointer;
  background: var(--varo-fill-darker);
  border: 0;
  border-radius: 999px;
  transition:
    width 140ms ease,
    background-color 140ms ease,
    transform 140ms ease;
}

:deep(.varo-indicator__item:hover) {
  transform: scale(1.14);
}

:deep(.varo-indicator__item:focus-visible) {
  outline: 2px solid var(--varo-primary);
  outline-offset: 2px;
}

:deep(.varo-indicator[data-type='line'] .varo-indicator__item) {
  width: 18px;
  height: 4px;
}

:deep(.varo-indicator__item[data-active='true']) {
  width: 20px;
  background: var(--varo-primary);
}

.platform-demo__menu-demo {
  min-height: 360px;
  overflow: visible;
}

.platform-demo__menu-catalog {
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 14px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__menu-catalog > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.platform-demo__menu-catalog > header strong {
  font-size: 0.88rem;
  color: var(--varo-text-primary);
}

.platform-demo__menu-catalog > header span {
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

:deep(.varo-menu) {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  min-height: 44px;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: 12px;
}

:deep(.varo-menu__item) {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
}

:deep(.varo-menu__item + .varo-menu__item) {
  border-left: 1px solid var(--varo-border);
}

:deep(.varo-menu__title) {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 44px;
  padding: 0 10px;
  font-weight: 700;
  color: var(--varo-text-primary);
  cursor: pointer;
  background: transparent;
  border: 0;
}

:deep(.varo-menu__title:focus-visible),
:deep(.varo-menu__option:focus-visible) {
  outline: 2px solid var(--varo-primary);
  outline-offset: -2px;
}

:deep(.varo-menu__title-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.varo-menu__arrow) {
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentcolor;
  border-bottom: 1.5px solid currentcolor;
  opacity: 0.68;
  transform: translateY(-2px) rotate(45deg);
  transition: transform 140ms ease;
}

:deep(.varo-menu__item[data-open='true'] .varo-menu__arrow) {
  color: var(--varo-primary);
  transform: translateY(2px) rotate(225deg);
}

:deep(.varo-menu__popup) {
  position: absolute;
  top: calc(100% + 7px);
  right: 0;
  left: 0;
  display: grid;
  min-width: 160px;
  overflow: hidden;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 12px;
  box-shadow: var(--varo-shadow-popover);
}

:deep(.varo-menu__option) {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  min-height: 42px;
  padding: 0 12px;
  color: var(--varo-text-primary);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--varo-border-light);
}

:deep(.varo-menu__option:first-child) {
  border-top: 0;
}

:deep(.varo-menu__option:not(:disabled):hover) {
  background: var(--varo-primary-soft);
}

:deep(.varo-menu__option[data-active='true']) {
  font-weight: 700;
  color: var(--varo-primary);
}

.platform-demo__menu-result {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: -2px 0 0;
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__menu-result > span {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  line-height: 1;
  white-space: nowrap;
}

.platform-demo__menu-result strong {
  font-size: 0.7rem;
  color: var(--varo-primary);
}

.platform-demo__menu-products {
  display: grid;
  gap: 7px;
}

.platform-demo__menu-products > article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 10px 11px;
  background: var(--varo-fill-light);
  border-radius: 11px;
}

.platform-demo__menu-products > article > div {
  display: grid;
  gap: 2px;
}

.platform-demo__menu-products strong {
  font-size: 0.74rem;
  color: var(--varo-text-primary);
}

.platform-demo__menu-products span {
  font-size: 0.66rem;
  color: var(--varo-text-tertiary);
}

:deep(.varo-navbar) {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 72px;
  align-items: center;
  min-height: 48px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 14px;
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-navbar__left),
:deep(.varo-navbar__right) {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 8px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--varo-primary);
  cursor: pointer;
  background: transparent;
  border: 0;
}

:deep(.varo-navbar__left:focus-visible),
:deep(.varo-navbar__right:focus-visible) {
  outline: 2px solid var(--varo-primary);
  outline-offset: -2px;
}

:deep(.varo-navbar__arrow) {
  font-size: 1.2rem;
}

:deep(.varo-navbar__title) {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.86rem;
  font-weight: 750;
  color: var(--varo-text-primary);
  text-align: center;
  white-space: nowrap;
}

.platform-demo__navbar-order {
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 14px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 14px;
}

.platform-demo__navbar-order > header {
  display: grid;
  gap: 3px;
  padding: 11px;
  background: var(--varo-primary-soft);
  border-radius: 11px;
}

.platform-demo__navbar-order > header span {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--varo-primary);
}

.platform-demo__navbar-order > header small {
  font-size: 0.68rem;
  color: var(--varo-text-secondary);
}

.platform-demo__navbar-order dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.platform-demo__navbar-order dl > div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.platform-demo__navbar-order dt,
.platform-demo__navbar-order dd {
  margin: 0;
  font-size: 0.72rem;
}

.platform-demo__navbar-order dt {
  color: var(--varo-text-tertiary);
}

.platform-demo__navbar-order dd {
  font-variant-numeric: tabular-nums;
  color: var(--varo-text-primary);
}

.platform-demo__navbar-order > p {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 650;
  color: var(--varo-success);
}

.platform-demo__pagination-demo {
  min-height: 390px;
}

.platform-demo__pagination-orders {
  display: grid;
  gap: 11px;
  width: 100%;
  padding: 14px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__pagination-orders > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.platform-demo__pagination-orders > header strong {
  font-size: 0.88rem;
  color: var(--varo-text-primary);
}

.platform-demo__pagination-orders > header span,
.platform-demo__pagination-orders > p {
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__pagination-orders > div {
  display: grid;
  gap: 7px;
}

.platform-demo__pagination-orders > div > article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 10px 11px;
  background: var(--varo-fill-light);
  border-radius: 11px;
}

.platform-demo__pagination-orders > div > article > div {
  display: grid;
  gap: 2px;
}

.platform-demo__pagination-orders > div strong {
  font-size: 0.74rem;
  font-variant-numeric: tabular-nums;
  color: var(--varo-text-primary);
}

.platform-demo__pagination-orders > div span {
  font-size: 0.66rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__pagination-orders > p {
  margin: -2px 0 0;
}

.platform-demo__side-navbar-demo {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 10px;
  min-height: 300px;
}

:deep(.varo-side-navbar) {
  display: grid;
  align-content: start;
  overflow: hidden;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: 14px;
}

:deep(.varo-side-navbar__item) {
  position: relative;
  min-height: 52px;
  padding: 0 8px 0 11px;
  font-size: 0.74rem;
  font-weight: 650;
  color: var(--varo-text-secondary);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-left: 3px solid transparent;
}

:deep(.varo-side-navbar__item[data-active='true']) {
  color: var(--varo-primary);
  background: var(--varo-card-solid);
  border-left-color: var(--varo-primary);
}

:deep(.varo-side-navbar__item:focus-visible) {
  outline: 2px solid var(--varo-primary);
  outline-offset: -2px;
}

:deep(.varo-side-navbar__badge) {
  top: 7px;
  right: 7px;
}

.platform-demo__side-navbar-panel {
  display: grid;
  gap: 14px;
  align-content: start;
  padding: 14px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 14px;
}

.platform-demo__side-navbar-panel > header {
  display: grid;
  gap: 8px;
}

.platform-demo__side-navbar-panel > header > div {
  display: grid;
  gap: 3px;
}

.platform-demo__side-navbar-panel > header strong {
  font-size: 0.82rem;
  color: var(--varo-text-primary);
}

.platform-demo__side-navbar-panel > header span {
  font-size: 0.68rem;
  line-height: 1.45;
  color: var(--varo-text-secondary);
}

.platform-demo__side-navbar-panel > header > strong {
  width: fit-content;
  padding: 5px 7px;
  font-size: 0.68rem;
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  border-radius: 8px;
}

.platform-demo__side-navbar-panel ul {
  display: grid;
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.platform-demo__side-navbar-panel li {
  padding: 8px 9px;
  font-size: 0.68rem;
  color: var(--varo-text-secondary);
  background: var(--varo-fill-light);
  border-radius: 9px;
}

.platform-demo__tabbar-demo {
  align-content: stretch;
  min-height: 320px;
}

.platform-demo__tabbar-page {
  display: grid;
  gap: 8px;
  align-content: center;
  min-height: 205px;
  padding: 16px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--varo-primary) 16%, transparent), transparent 44%),
    var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__tabbar-page > span {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--varo-primary);
}

.platform-demo__tabbar-page > strong {
  font-size: 1.1rem;
  color: var(--varo-text-primary);
}

.platform-demo__tabbar-page > p {
  margin: 0;
  font-size: 0.74rem;
  line-height: 1.5;
  color: var(--varo-text-secondary);
}

:deep(.varo-tabbar) {
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: 16px;
  display: flex;
  min-height: 62px;
  overflow: hidden;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 17px;
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-tabbar__item) {
  position: relative;
  display: grid;
  flex: 1;
  gap: 3px;
  place-items: center;
  min-width: 0;
  font-size: 0.7rem;
  color: var(--varo-text-secondary);
  cursor: pointer;
  background: transparent;
  border: 0;
}

:deep(.varo-tabbar__item[data-active='true']) {
  font-weight: 700;
  color: var(--varo-primary);
}

:deep(.varo-tabbar__item:focus-visible) {
  outline: 2px solid var(--varo-primary);
  outline-offset: -2px;
}

.platform-demo__tabbar-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  top: 6px;
  right: calc(50% - 22px);
}

:deep(.varo-tabbar__dot) {
  width: 8px;
  min-width: 8px;
  height: 8px;
  padding: 0;
}

:deep(.varo-tabs) {
  display: grid;
  gap: 14px;
}

:deep(.varo-tabs__nav) {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: color-mix(in srgb, var(--varo-muted) 10%, transparent);
  border-radius: 16px;
}

:deep(.varo-tabs__tab) {
  flex: 1;
  min-height: 36px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  background: transparent;
  border: 0;
  border-radius: 12px;
}

:deep(.varo-tabs__tab[data-active='true']) {
  color: var(--varo-primary-foreground);
  background: var(--vp-c-brand-1);
}

:deep(.varo-tabs__content) {
  min-height: 150px;
}

.platform-demo__tabs-panel {
  align-content: center;
  min-height: 150px;
}

.platform-demo__divider-inline {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

:deep(.varo-divider) {
  display: flex;
  align-items: center;
  margin: var(--varo-divider-spacing, 8px) 0;
  font-size: 0.76rem;
  color: var(--varo-text-tertiary);
}

:deep(.varo-divider::before),
:deep(.varo-divider::after) {
  flex: 1;
  content: '';
  border-top: 1px solid var(--varo-divider-line-color, var(--varo-border-light));
}

:deep(.varo-divider[data-dashed='true']::before),
:deep(.varo-divider[data-dashed='true']::after) {
  border-top-style: dashed;
}

:deep(.varo-divider[data-content-position='left']::before) {
  max-width: 8%;
}

:deep(.varo-divider[data-content-position='right']::after) {
  max-width: 8%;
}

:deep(.varo-divider[data-vertical='true']) {
  display: inline-block;
  width: 1px;
  height: 16px;
  margin: 0 14px;
  vertical-align: middle;
  background: var(--varo-divider-line-color, var(--varo-border));
}

:deep(.varo-divider[data-vertical='true']::before),
:deep(.varo-divider[data-vertical='true']::after) {
  content: none;
}

:deep(.varo-divider__text) {
  padding: 0 10px;
}

.platform-demo__divider-order {
  display: grid;
  width: 100%;
  padding: 16px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__divider-order > header,
.platform-demo__divider-total,
.platform-demo__divider-prices {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 16px;
  align-items: center;
}

.platform-demo__divider-order > header {
  margin-bottom: 12px;
}

.platform-demo__divider-order > header > strong,
.platform-demo__divider-total strong {
  color: var(--varo-text-primary);
}

.platform-demo__divider-order > header > span {
  padding: 4px 7px;
  font-size: 0.68rem;
  font-weight: 650;
  color: var(--varo-success);
  background: var(--varo-success-soft);
  border-radius: 999px;
}

.platform-demo__divider-prices {
  font-size: 0.78rem;
  color: var(--varo-text-secondary);
}

.platform-demo__divider-prices strong {
  font-variant-numeric: tabular-nums;
  color: var(--varo-text-primary);
  text-align: right;
}

.platform-demo__divider-prices .platform-demo__divider-discount {
  color: var(--varo-success);
}

.platform-demo__divider-total {
  font-size: 0.86rem;
}

.platform-demo__divider-total strong:last-child {
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  color: var(--varo-danger);
}

.platform-demo__divider-timeline {
  display: grid;
}

.platform-demo__divider-timeline > div {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.platform-demo__divider-timeline > div > span {
  width: 8px;
  height: 8px;
  margin-top: 5px;
  background: var(--varo-primary);
  border-radius: 999px;
  box-shadow: 0 0 0 4px var(--varo-primary-soft);
}

.platform-demo__divider-timeline p {
  display: grid;
  gap: 2px;
  margin: 0;
}

.platform-demo__divider-timeline strong {
  font-size: 0.78rem;
  color: var(--varo-text-primary);
}

.platform-demo__divider-timeline small {
  font-size: 0.7rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__divider-order > footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 12px;
  margin-top: 16px;
  border-top: 1px solid var(--varo-border-light);
}

.platform-demo__divider-order > footer button {
  min-height: 36px;
  padding: 0 8px;
  font-size: 0.76rem;
  font-weight: 650;
  color: var(--varo-primary);
  cursor: pointer;
  background: transparent;
  border: 0;
}

.platform-demo__divider-order > footer button:focus-visible {
  outline: 2px solid var(--varo-primary);
  outline-offset: 2px;
}

.platform-demo__grid-service {
  display: grid;
  gap: 14px;
  width: 100%;
  padding: 16px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__grid-service > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.platform-demo__grid-service > header > div {
  display: grid;
  gap: 2px;
}

.platform-demo__grid-service > header strong {
  font-size: 0.9rem;
  color: var(--varo-text-primary);
}

.platform-demo__grid-service > header span {
  font-size: 0.7rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__grid-service > header > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-weight: 700;
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  border-radius: 8px;
}

.platform-demo__grid-icon {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: var(--varo-primary);
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.platform-demo__grid-result {
  min-height: 18px;
  margin: -4px 0 0;
  font-size: 0.7rem;
  color: var(--varo-text-secondary);
}

:deep(.varo-row) {
  display: flex;
  flex-wrap: wrap;
  row-gap: var(--varo-row-gutter-y, 0);
  margin-inline: calc(var(--varo-row-gutter-x, 0px) / -2);
}

:deep(.varo-row[data-justify='center']) {
  justify-content: center;
}

:deep(.varo-row[data-justify='space-between']) {
  justify-content: space-between;
}

:deep(.varo-row[data-align='middle']) {
  align-items: center;
}

:deep(.varo-row[data-align='bottom']) {
  align-items: flex-end;
}

:deep(.varo-row[data-align='stretch']) {
  align-items: stretch;
}

:deep(.varo-col) {
  box-sizing: border-box;
  flex: 0 0 calc(var(--varo-col-span, 24) / 24 * 100%);
  max-width: calc(var(--varo-col-span, 24) / 24 * 100%);
  padding-inline: calc(var(--varo-row-gutter-x, 0px) / 2);
  margin-left: calc(var(--varo-col-offset, 0) / 24 * 100%);
}

.platform-demo__layout-overview {
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 16px;
  overflow: hidden;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__layout-overview > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.platform-demo__layout-overview > header strong {
  font-size: 0.9rem;
  color: var(--varo-text-primary);
}

.platform-demo__layout-overview > header span {
  font-size: 0.7rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__layout-card {
  display: grid;
  gap: 4px;
  align-content: center;
  min-height: 78px;
  padding: 11px;
  background: var(--varo-fill-light);
  border: 1px solid transparent;
  border-radius: 13px;
}

.platform-demo__layout-card > span {
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__layout-card > strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.96rem;
  font-variant-numeric: tabular-nums;
  color: var(--varo-text-primary);
  white-space: nowrap;
}

.platform-demo__layout-card > small {
  font-size: 0.66rem;
  font-weight: 650;
  color: var(--varo-success);
}

.platform-demo__layout-card--primary {
  background: var(--varo-primary-soft);
  border-color: color-mix(in srgb, var(--varo-primary) 26%, transparent);
}

.platform-demo__layout-card--primary > strong {
  font-size: 1.1rem;
  color: var(--varo-primary);
}

:deep(.varo-space) {
  display: flex;
  flex-direction: row;
  gap: var(--varo-space-gap-y, 8px) var(--varo-space-gap-x, 8px);
  align-items: flex-start;
}

:deep(.varo-space[data-direction='vertical']) {
  flex-direction: column;
}

:deep(.varo-space[data-wrap='true']) {
  flex-wrap: wrap;
}

:deep(.varo-space[data-fill='true'] > *) {
  width: 100%;
}

.platform-demo__space-filter {
  display: grid;
  gap: 14px;
  width: 100%;
  padding: 16px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__space-filter > header {
  display: grid;
  gap: 3px;
}

.platform-demo__space-filter > header strong {
  font-size: 0.9rem;
  color: var(--varo-text-primary);
}

.platform-demo__space-filter > header span {
  font-size: 0.7rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__space-filter :deep(.varo-space[data-direction='vertical']) {
  padding-top: 14px;
  border-top: 1px solid var(--varo-border-light);
}

.platform-demo__space-tags :deep(.varo-button) {
  width: auto;
}

.platform-demo__space-actions :deep(.varo-button) {
  width: 100%;
}

.platform-demo__space-filter > p {
  margin: -4px 0 0;
  font-size: 0.7rem;
  color: var(--varo-text-secondary);
}

.platform-demo__phone-frame:has(.platform-demo__sticky-demo) .platform-demo__phone-screen {
  overflow: visible;
}

.platform-demo__sticky-demo {
  overflow: visible;
}

.platform-demo__sticky-feed {
  display: grid;
  width: 100%;
  padding: 16px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.platform-demo__sticky-hint {
  margin: 0 0 12px;
  font-size: 0.7rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__sticky-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 12px;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease;
}

.platform-demo__sticky-bar > div {
  display: grid;
  gap: 2px;
}

.platform-demo__sticky-bar strong {
  font-size: 0.82rem;
  color: var(--varo-text-primary);
}

.platform-demo__sticky-bar span {
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__sticky-bar > span {
  padding: 4px 7px;
  font-weight: 650;
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  border-radius: 999px;
}

.platform-demo__sticky-bar[data-fixed='true'] {
  border-color: var(--varo-primary);
  box-shadow: var(--varo-shadow-popover);
}

.platform-demo__sticky-list {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.platform-demo__sticky-list > article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 10px 12px;
  background: var(--varo-fill-light);
  border-radius: 12px;
}

.platform-demo__sticky-list > article > div {
  display: grid;
  gap: 2px;
}

.platform-demo__sticky-list strong {
  font-size: 0.76rem;
  font-variant-numeric: tabular-nums;
  color: var(--varo-text-primary);
}

.platform-demo__sticky-list span {
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__sticky-result {
  margin: 10px 0 0;
  font-size: 0.7rem;
  color: var(--varo-text-secondary);
}

.platform-demo__image-feature {
  position: relative;
  overflow: hidden;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: 18px;
}

.platform-demo__image-feature :deep(.varo-image) {
  display: flex;
  width: 100%;
  background: var(--varo-fill-light);
}

.platform-demo__image-caption {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 9px 11px;
  color: #fff;
  background: rgb(16 21 29 / 76%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 11px;
  backdrop-filter: blur(10px);
}

.platform-demo__image-caption strong {
  font-size: 0.8rem;
  font-weight: 700;
}

.platform-demo__image-caption span {
  font-size: 0.7rem;
  color: rgb(255 255 255 / 72%);
}

.platform-demo__image-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 6px 12px;
  color: var(--varo-text-secondary);
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 14px;
}

.platform-demo__image-toolbar > span {
  flex: none;
  font-size: 0.76rem;
  font-weight: 650;
}

.platform-demo__image-fit-options {
  display: flex;
  gap: 4px;
  min-width: 0;
}

.platform-demo__image-fit-options :deep(.varo-button) {
  min-width: 0;
  padding-inline: 9px;
  white-space: nowrap;
}

.platform-demo__image-state-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.platform-demo__image-item {
  display: grid;
  gap: 10px;
  align-content: center;
  justify-items: center;
  min-height: 132px;
  padding: 16px;
  font-size: 0.76rem;
  font-weight: 650;
  color: var(--varo-text-secondary);
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

:deep(.varo-image) {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--varo-text-tertiary);
  background: var(--varo-fill-light);
}

:deep(.varo-image__img) {
  display: block;
  width: 100%;
  height: 100%;
}

:deep(.varo-image__loading),
:deep(.varo-image__error) {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--varo-text-tertiary);
  background: var(--varo-fill-light);
}

.platform-demo__image-item[data-state='error'] :deep(.varo-image) {
  background: var(--varo-fill-light);
  border: 1px dashed var(--varo-border);
  border-radius: 16px;
}

.platform-demo__image-item[data-state='error'] :deep(.varo-image__error) {
  background: transparent;
}

.platform-demo__image-item[data-state='error'] :deep(.varo-image[data-error='true'] .varo-image__img) {
  visibility: hidden;
}

.platform-demo__broken-image {
  width: 32px;
  height: 32px;
  color: var(--varo-text-tertiary);
}

.platform-demo__broken-image :is(path, circle) {
  stroke: currentcolor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.platform-demo__overlay-demo,
.platform-demo__popup-demo {
  position: relative;
  display: grid;
  gap: 14px;
  align-content: start;
  min-height: 260px;
  padding: 16px;
  overflow: hidden;
}

.platform-demo__overlay-demo :deep(.varo-overlay) {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--varo-primary-foreground);
  background: color-mix(in srgb, var(--varo-foreground) 58%, transparent);
  backdrop-filter: blur(4px);
}

.platform-demo__popup-demo :deep(.varo-popup) {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.platform-demo__popup-demo :deep(.varo-popup__overlay) {
  position: absolute;
  inset: 0;
  pointer-events: auto;
  background: color-mix(in srgb, var(--varo-foreground) 44%, transparent);
  backdrop-filter: blur(3px);
}

.platform-demo__popup-demo :deep(.varo-popup__content) {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 14px;
  pointer-events: auto;
  background: color-mix(in srgb, var(--varo-card-solid) 98%, transparent);
  border-radius: 22px 22px 0 0;
  box-shadow: var(--varo-shadow-popover);
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='top']) {
  top: 0;
  bottom: auto;
  border-radius: 0 0 22px 22px;
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='center']) {
  inset: 50% 20px auto;
  border-radius: 22px;
  transform: translateY(-50%);
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='left']),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='right']) {
  top: 0;
  bottom: 0;
  width: 72%;
  border-radius: 0 22px 22px 0;
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='right']) {
  right: 0;
  left: auto;
  border-radius: 22px 0 0 22px;
}

.platform-demo__popup-demo :deep(.varo-popup__close) {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-muted) 14%, transparent);
  border: 0;
  border-radius: 999px;
}

.platform-demo__popup-body {
  display: grid;
  gap: 8px;
  padding-right: 24px;
}

.platform-demo__popup-body h4,
.platform-demo__popup-body p {
  margin: 0;
}

.platform-demo__popup-body h4 {
  font-size: 1rem;
}

.platform-demo__popup-body p {
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}

.platform-demo__trigger,
.platform-demo__dialog-close,
:deep(.varo-button) {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 42px;
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 16px;
}

:deep(.varo-button[data-size='sm']) {
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  font-size: 0.82rem;
  border-radius: 12px;
}

:deep(.varo-button[data-size='md']) {
  min-height: 42px;
  padding: 0 16px;
  font-size: 0.92rem;
  border-radius: 16px;
}

:deep(.varo-button[data-size='lg']) {
  gap: 10px;
  min-height: 50px;
  padding: 0 20px;
  font-size: 1rem;
  border-radius: 18px;
}

.platform-demo__trigger,
.platform-demo__dialog-close {
  color: var(--varo-primary-foreground);
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
}

:deep(.varo-button[data-disabled='true']) {
  cursor: not-allowed;
  opacity: 0.72;
}

:deep(.varo-button[data-variant='outline']) {
  color: var(--vp-c-text-1);
  background: transparent;
  border-color: var(--vp-c-divider);
}

:deep(.varo-button[data-variant='ghost']) {
  color: var(--varo-foreground, var(--demo-brand));
  background: var(--varo-card-muted, color-mix(in srgb, var(--demo-brand) 10%, transparent));
}

:deep(.varo-button[data-shape='square']) {
  border-radius: 6px;
}

:deep(.varo-button[data-shape='round']) {
  border-radius: 999px;
}

:deep(.varo-button[data-hairline='true']) {
  border-width: 0.5px;
}

:deep(.varo-button__icon) {
  flex: none;
}

:deep(.varo-button__loading-icon) {
  flex: none;
  width: 1em;
  height: 1em;
  border: 2px solid currentcolor;
  border-right-color: transparent;
  border-radius: 999px;
  animation: platform-demo-spin 0.75s linear infinite;
}

@keyframes platform-demo-spin {
  to {
    transform: rotate(360deg);
  }
}

:deep(.varo-input) {
  display: grid;
  gap: 6px;
  width: 100%;
  color: var(--vp-c-text-1);
}

:deep(.varo-input__body) {
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  background: color-mix(in srgb, var(--varo-card-solid) 82%, transparent);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
}

:deep(.varo-input__control) {
  flex: 1;
  min-width: 0;
  font: inherit;
  color: inherit;
  outline: 0;
  background: transparent;
  border: 0;
}

:deep(textarea.varo-input__control) {
  padding: 10px 0;
  resize: none;
}

:deep(.varo-input__prefix),
:deep(.varo-input__suffix),
:deep(.varo-input__clear),
:deep(.varo-input__word-limit) {
  flex: none;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

:deep(.varo-input__clear) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-muted) 14%, transparent);
  border: 0;
  border-radius: 999px;
}

:deep(.varo-input[data-invalid='true'] .varo-input__body) {
  border-color: color-mix(in srgb, var(--varo-danger) 52%, transparent);
}

:deep(.varo-cell-group) {
  display: grid;
  gap: 8px;
}

.platform-demo__cell-demo {
  display: grid;
  gap: 18px;
  width: 100%;
  padding: 18px;
}

:deep(.varo-cell-group__header) {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 4px;
}

:deep(.varo-cell-group__title) {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--varo-text-primary);
  letter-spacing: 0.01em;
}

:deep(.varo-cell-group__desc) {
  font-size: 0.76rem;
  color: var(--varo-text-tertiary);
}

:deep(.varo-cell-group__body) {
  overflow: hidden;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-cell-round-radius, 16px);
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-cell) {
  box-sizing: border-box;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-height: 54px;
  padding: 12px 14px;
  color: var(--varo-text-primary);
  text-decoration: none;
  outline: none;
  transition:
    background-color 140ms ease,
    box-shadow 140ms ease;
}

:deep(.varo-cell + .varo-cell) {
  border-top: 1px solid var(--varo-border-light);
}

:deep(.varo-cell[data-center='true']) {
  align-items: center;
}

:deep(.varo-cell[data-clickable='true']) {
  cursor: pointer;
}

:deep(.varo-cell[data-clickable='true']:hover) {
  background: var(--varo-fill-light);
}

:deep(.varo-cell[data-clickable='true']:focus-visible) {
  box-shadow: inset 0 0 0 2px var(--varo-primary);
}

:deep(.varo-cell[data-size='large']) {
  min-height: 68px;
  padding-block: 13px;
}

:deep(.varo-cell__icon),
:deep(.varo-cell__link) {
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(--varo-primary);
}

:deep(.varo-cell__main) {
  flex: 1;
  min-width: 0;
}

:deep(.varo-cell__title) {
  font-size: 0.9rem;
  font-weight: 650;
  color: var(--varo-text-primary);
}

:deep(.varo-cell__subtitle) {
  margin-top: 3px;
  font-size: 0.76rem;
  line-height: 1.35;
  color: var(--varo-text-secondary);
}

:deep(.varo-cell__desc) {
  flex: none;
  max-width: 42%;
  font-size: 0.82rem;
  color: var(--varo-text-secondary);
  text-align: right;
}

:deep(.varo-cell[data-desc-align='left'] .varo-cell__desc) {
  text-align: left;
}

.platform-demo__cell-avatar,
.platform-demo__cell-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  border-radius: 10px;
}

.platform-demo__cell-avatar {
  font-size: 0.82rem;
  font-weight: 750;
  color: var(--varo-primary-foreground);
  background: var(--varo-primary);
}

.platform-demo__cell-icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.platform-demo__cell-status {
  font-size: 0.76rem;
  font-weight: 650;
  color: var(--varo-success);
}

.platform-demo__cell-feedback {
  min-height: 18px;
  margin: -4px 4px 0;
  font-size: 0.76rem;
  color: var(--varo-text-tertiary);
}

.platform-demo__overlay {
  position: absolute;
  inset: 0;
  display: block;
  background: color-mix(in srgb, var(--varo-foreground) 36%, transparent);
  border-radius: 18px;
  backdrop-filter: blur(4px);
}

.platform-demo__dialog {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  display: block;
  padding: 16px;
  background: color-mix(in srgb, var(--varo-card-solid) 95%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 20px;
  box-shadow: var(--varo-shadow-popover);
}

.platform-demo__dialog h4 {
  margin: 0;
  font-size: 0.95rem;
}

.platform-demo__dialog p {
  margin: 10px 0 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.platform-demo__dialog-actions {
  margin-top: 14px;
}

.platform-demo__head h2,
.platform-demo__meta-card span,
.platform-demo__control-group span,
.platform-demo__preview-label {
  letter-spacing: 0;
}

.platform-demo__panel,
.platform-demo__meta-card,
.platform-demo__control-group,
.platform-demo__card,
.platform-demo__divider-demo,
.platform-demo__grid-demo,
.platform-demo__layout-demo,
.platform-demo__nav-demo,
.platform-demo__overlay-demo,
.platform-demo__popup-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo {
  background: var(--varo-card-solid);
  border-color: var(--varo-border);
  border-radius: var(--varo-radius-lg);
  box-shadow: var(--varo-shadow-sm);
}

.platform-demo__chip,
.platform-demo__fixed-nav-copy,
.platform-demo__navbar-page,
.platform-demo__tabbar-page,
.platform-demo__side-navbar-panel,
.platform-demo__tabs-panel,
.platform-demo__indicator-slide,
.platform-demo__menu-result span,
.platform-demo__sticky-bar,
.platform-demo__sticky-list span,
.platform-demo__trigger,
.platform-demo__dialog-close,
.platform-demo__overlay,
.platform-demo__dialog,
:deep(.varo-button),
:deep(.varo-button[data-size='sm']),
:deep(.varo-button[data-size='md']),
:deep(.varo-button[data-size='lg']),
:deep(.varo-input__body),
:deep(.varo-input__clear),
:deep(.varo-elevator__group),
:deep(.varo-elevator__indexes),
:deep(.varo-elevator__index),
:deep(.varo-fixed-nav__trigger),
:deep(.varo-fixed-nav__item),
:deep(.varo-menu),
:deep(.varo-menu__popup),
:deep(.varo-navbar),
:deep(.varo-side-navbar),
:deep(.varo-tabbar),
:deep(.varo-tabs__nav),
:deep(.varo-tabs__tab),
:deep(.varo-col > span),
:deep(.varo-divider[data-vertical='true']),
:deep(.varo-popup__content),
:deep(.varo-popup__close),
:deep(.varo-cell-group__body) {
  border-radius: var(--varo-radius);
}

/* Solid fills only for true primary actions / selected component parts */
.platform-demo__trigger,
.platform-demo__dialog-close,
:deep(.varo-fixed-nav__trigger),
:deep(.varo-elevator__index[data-active='true']),
:deep(.varo-tabs__tab[data-active='true']) {
  color: var(--varo-primary-foreground);
  background: var(--varo-primary);
  border-color: var(--varo-primary);
  box-shadow: var(--varo-shadow-sm);
}

:deep(.varo-tabs[data-type='line'] .varo-tabs__tab[data-active='true']),
:deep(.varo-tabs[data-type='card'] .varo-tabs__tab[data-active='true']) {
  color: var(--varo-primary-foreground);
}

/* Quiet surfaces for outline/menu chrome — never force-fill chips/tabs */
:deep(.varo-button[data-variant='outline']),
:deep(.varo-menu),
:deep(.varo-menu__popup),
:deep(.varo-navbar),
:deep(.varo-fixed-nav__item),
:deep(.varo-cell-group__body) {
  color: var(--varo-foreground);
  background: var(--varo-card-solid);
  border-color: var(--varo-border);
}

:deep(.varo-menu__option:not(:disabled):hover),
:deep(.varo-col > span),
:deep(.varo-tabs__nav),
:deep(.varo-side-navbar),
.platform-demo__menu-result span,
.platform-demo__fixed-nav-copy,
.platform-demo__navbar-page,
.platform-demo__tabbar-page,
.platform-demo__side-navbar-panel,
.platform-demo__tabs-panel,
.platform-demo__sticky-list span {
  color: var(--varo-foreground);
  background: var(--varo-card-muted);
}

:deep(.varo-input__body),
:deep(.varo-cell-group__body),
:deep(.varo-menu__popup),
:deep(.varo-popup__content),
.platform-demo__dialog {
  background: var(--varo-card-solid);
  border-color: var(--varo-border);
  box-shadow: var(--varo-shadow-popover);
}

.platform-demo__overlay,
.platform-demo__overlay-demo :deep(.varo-overlay),
.platform-demo__popup-demo :deep(.varo-popup__overlay) {
  background: color-mix(in srgb, var(--varo-foreground) 58%, transparent);
}

.platform-demo__popup-demo :deep(.varo-popup__content),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='top']),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='center']),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='left']),
.platform-demo__popup-demo :deep(.varo-popup__content[data-position='right']) {
  border-radius: var(--varo-radius-lg);
}

:deep(.varo-menu__option[data-active='true']),
:deep(.varo-navbar__left),
:deep(.varo-navbar__right),
:deep(.varo-side-navbar__item[data-active='true']),
:deep(.varo-tabbar__item[data-active='true']),
.platform-demo__indicator-slide span {
  color: var(--varo-accent);
}

:deep(.varo-fixed-nav__badge),
:deep(.varo-side-navbar__badge),
:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  background: var(--varo-danger);
}

/* Button sample — practical states inside the shared iPhone preview. */
.platform-demo__button-sample {
  box-sizing: border-box;
  width: min(100%, 680px);
  padding: 20px;
  margin-inline: auto;
  color: var(--varo-foreground);
  background: var(--demo-phone-card);
  border: 1px solid var(--demo-border);
  border-radius: 16px;
}

.platform-demo__button-cases {
  display: grid;
}

.platform-demo__button-case {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  padding-block: 20px;
  border-top: 1px solid var(--demo-border);
}

.platform-demo__button-case:first-child {
  padding-top: 0;
  border-top: 0;
}

.platform-demo__button-case:last-child {
  padding-bottom: 0;
}

.platform-demo__button-case h3 {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--varo-foreground);
}

.platform-demo__button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.platform-demo__button-row--baseline {
  align-items: flex-end;
}

.platform-demo__button-sample :deep(.varo-button:not([data-block='true'])) {
  flex: 0 0 auto;
  width: auto;
}

.platform-demo__button-case[data-case='hierarchy'] :deep(.varo-button),
.platform-demo__button-case[data-case='tones'] :deep(.varo-button) {
  min-width: 112px;
}

.platform-demo__button-case[data-case='states'] :deep(.varo-button) {
  min-width: 120px;
}

.platform-demo__button-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.platform-demo__button-icon {
  width: 16px;
  height: 16px;
  stroke: currentcolor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.platform-demo__preview-content[data-example='button'] {
  display: block;
}

.platform-demo__stage:has(.platform-demo__preview-content[data-example='button']) .platform-demo__code-shell {
  --demo-code-bg: var(--demo-surface-strong);
  --demo-code-surface: var(--demo-surface);
  --demo-code-border: var(--demo-border);
  --demo-code-text: var(--varo-foreground);
  --demo-code-muted: var(--demo-text-muted);
}

@media (max-width: 640px) {
  .platform-demo__button-sample {
    padding: 16px;
  }

  .platform-demo__button-row {
    gap: 8px;
  }
}

/* Badge sample — compact counts and statuses without oversized pill treatments. */
.platform-demo__badge-sample {
  box-sizing: border-box;
  width: min(100%, 680px);
  padding: 20px;
  margin-inline: auto;
  color: var(--varo-foreground);
  background: var(--demo-phone-card);
  border: 1px solid var(--demo-border);
  border-radius: 16px;
}

.platform-demo__badge-cases {
  display: grid;
}

.platform-demo__badge-case {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  padding-block: 20px;
  border-top: 1px solid var(--demo-border);
}

.platform-demo__badge-case:first-child {
  padding-top: 0;
  border-top: 0;
}

.platform-demo__badge-case:last-child {
  padding-bottom: 0;
}

.platform-demo__badge-case h3 {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--varo-foreground);
}

.platform-demo__badge-anchors {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.platform-demo__badge-anchor {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 40px;
  padding: 0 14px;
  font-size: 0.8rem;
  font-weight: 680;
  color: var(--varo-foreground);
  background: var(--varo-card-muted);
  border-radius: 8px;
}

.platform-demo__badge-anchor-label {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.platform-demo__badge-anchor-mark {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  transform: translate(70%, -55%);
}

.platform-demo__badge-counts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.platform-demo__badge-counts > div {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  min-height: 42px;
  padding: 0 12px;
  background: var(--varo-card-muted);
  border-radius: 8px;
}

.platform-demo__badge-count-label {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.78rem;
  font-weight: 620;
  color: var(--varo-muted);
  white-space: nowrap;
}

.platform-demo__badge-statuses,
.platform-demo__badge-variants {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.platform-demo__badge-statuses > span {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 620;
  color: var(--varo-foreground);
}

.platform-demo__badge-sample :deep(.varo-badge) {
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
}

.platform-demo__preview-content[data-example='badge'] {
  display: block;
}

.platform-demo__stage:has(.platform-demo__preview-content[data-example='badge']) .platform-demo__code-shell {
  --demo-code-bg: var(--demo-surface-strong);
  --demo-code-surface: var(--demo-surface);
  --demo-code-border: var(--demo-border);
  --demo-code-text: var(--varo-foreground);
  --demo-code-muted: var(--demo-text-muted);
}

@media (max-width: 640px) {
  .platform-demo__badge-sample {
    padding: 16px;
  }

  .platform-demo__badge-counts {
    grid-template-columns: minmax(0, 1fr);
  }

  .platform-demo__badge-statuses,
  .platform-demo__badge-variants {
    gap: 12px;
  }
}

/* Popover sample — contextual actions, placement, and explicit dismiss behavior. */
.platform-demo__popover-sample {
  box-sizing: border-box;
  width: min(100%, 680px);
  padding: 20px;
  margin-inline: auto;
  color: var(--varo-foreground);
  background: var(--demo-phone-card);
  border: 1px solid var(--demo-border);
  border-radius: 16px;
}

.platform-demo__popover-cases {
  display: grid;
}

.platform-demo__popover-case {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  padding-block: 20px;
  border-top: 1px solid var(--demo-border);
}

.platform-demo__popover-case:first-child {
  padding-top: 0;
  border-top: 0;
}

.platform-demo__popover-case:last-child {
  padding-bottom: 0;
}

.platform-demo__popover-case h3 {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--varo-foreground);
}

.platform-demo__popover-canvas,
.platform-demo__popover-placements {
  background: var(--varo-card-muted);
  border-radius: 10px;
}

.platform-demo__popover-canvas {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 260px;
  padding: 24px;
}

.platform-demo__popover-trigger {
  min-height: 38px;
  padding: 0 14px;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--varo-foreground);
  cursor: pointer;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: 8px;
  transition:
    color 140ms ease,
    background 140ms ease,
    border-color 140ms ease;
}

.platform-demo__popover-trigger:hover {
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  border-color: var(--varo-primary);
}

.platform-demo__popover-trigger:focus-visible,
.platform-demo__popover-sample button:focus-visible {
  outline: 2px solid var(--varo-primary);
  outline-offset: 2px;
}

.platform-demo__popover-card {
  box-sizing: border-box;
  display: grid;
  width: 248px;
  padding: 0;
  overflow: hidden;
  background: var(--varo-surface);
  border-color: var(--varo-border);
  border-radius: 10px;
}

.platform-demo__popover-card header {
  display: grid;
  gap: 3px;
  padding: 13px 14px;
  border-bottom: 1px solid var(--varo-border-light);
}

.platform-demo__popover-card header strong {
  font-size: 0.85rem;
  color: var(--varo-foreground);
}

.platform-demo__popover-card header small {
  font-size: 0.72rem;
  color: var(--varo-muted);
}

.platform-demo__popover-actions {
  display: grid;
  padding: 6px;
}

.platform-demo__popover-actions button,
.platform-demo__popover-danger,
.platform-demo__popover-done,
.platform-demo__popover-tip button {
  min-height: 34px;
  padding: 0 9px;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 650;
  color: var(--varo-foreground);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
}

.platform-demo__popover-actions button:hover {
  background: var(--varo-fill-light);
}

.platform-demo__popover-actions .platform-demo__popover-danger {
  color: var(--varo-danger);
}

.platform-demo__popover-actions .platform-demo__popover-danger:hover {
  background: var(--varo-danger-soft);
}

.platform-demo__popover-done {
  margin: 0 6px 6px;
  color: var(--varo-primary);
  text-align: center;
  background: var(--varo-primary-soft);
}

.platform-demo__popover-placements {
  display: flex;
  gap: 72px;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  padding: 28px 72px;
}

.platform-demo__popover-tip {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 156px;
  padding: 8px 10px;
  color: var(--varo-foreground);
  background: var(--varo-surface);
  border-color: var(--varo-border);
}

.platform-demo__popover-tip span {
  font-size: 0.74rem;
  white-space: nowrap;
}

.platform-demo__popover-tip button {
  min-height: 28px;
  color: var(--varo-primary);
}

.platform-demo__preview-content[data-example='popover'] {
  display: block;
}

.platform-demo__stage:has(.platform-demo__preview-content[data-example='popover']) .platform-demo__code-shell {
  --demo-code-bg: var(--demo-surface-strong);
  --demo-code-surface: var(--demo-surface);
  --demo-code-border: var(--demo-border);
  --demo-code-text: var(--varo-foreground);
  --demo-code-muted: var(--demo-text-muted);
}

@media (max-width: 640px) {
  .platform-demo__popover-sample {
    padding: 16px;
  }

  .platform-demo__popover-canvas {
    min-height: 250px;
    padding: 18px;
  }

  .platform-demo__popover-placements {
    gap: 28px;
    min-height: 132px;
    padding: 26px 40px;
  }

  .platform-demo__popover-tip[data-side='right'] {
    top: calc(100% + 8px);
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }
}

/* Input sample — multiple practical cases, isolated from every other demo. */
.platform-demo__input-sample {
  --input-surface: var(--varo-ui-surface);
  --input-field: var(--varo-ui-fill-light);
  --input-field-hover: var(--varo-ui-fill);
  --input-border: var(--varo-ui-border);
  --input-border-strong: var(--varo-ui-border-strong);
  --input-text: var(--varo-ui-text);
  --input-muted: var(--varo-ui-text-muted);
  --input-accent: var(--varo-ui-primary);
  --input-accent-soft: var(--varo-ui-primary-soft);
  --input-danger: var(--varo-ui-danger);
  --input-danger-soft: var(--varo-ui-danger-soft);

  box-sizing: border-box;
  width: min(100%, 680px);
  padding: 20px;
  margin-inline: auto;
  color: var(--input-text);
  background: var(--input-surface);
  border: 1px solid var(--input-border);
  border-radius: 16px;
}

.platform-demo__input-cases {
  display: grid;
}

.platform-demo__input-case {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  align-content: start;
  min-width: 0;
  padding-block: 20px;
  border-top: 1px solid var(--input-border);
}

.platform-demo__input-case:first-child {
  padding-top: 0;
  border-top: 0;
}

.platform-demo__input-case:last-child {
  padding-bottom: 0;
}

.platform-demo__input-label {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
}

.platform-demo__input-label strong {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--input-text);
}

.platform-demo__input-label small,
.platform-demo__input-state-grid small {
  font-size: 0.72rem;
  color: var(--input-muted);
}

.platform-demo__input-state-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.platform-demo__input-state-grid label {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
  min-width: 0;
}

.platform-demo__input-affix {
  font-size: 0.76rem;
  color: var(--input-muted);
  white-space: nowrap;
}

.platform-demo__input-sample :deep(.varo-input) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
  width: 100%;
}

.platform-demo__input-sample :deep(.varo-input__body) {
  box-sizing: border-box;
  min-height: 52px;
  padding: 0 10px 0 14px;
  color: var(--input-text);
  background: var(--input-field);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  box-shadow: none;
  transition:
    background 140ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 140ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__body) {
  color: var(--input-text);
  background: var(--input-field);
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__control) {
  color: var(--input-text);
  background: transparent;
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__word-limit),
:global(.dark .vp-doc .platform-demo__input-sample .varo-input__prefix),
:global(.dark .vp-doc .platform-demo__input-sample .varo-input__suffix) {
  color: var(--input-muted);
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__clear) {
  color: transparent;
  background: transparent;
}

:global(.dark .vp-doc .platform-demo__input-sample .varo-input__error) {
  color: var(--input-danger);
}

.platform-demo__input-sample
  :deep(.varo-input:not([data-disabled='true'], [data-readonly='true']) .varo-input__body:hover) {
  background: var(--input-field-hover);
  border-color: var(--input-border-strong);
}

.platform-demo__input-sample :deep(.varo-input__body:focus-within) {
  background: var(--input-field);
  border-color: var(--input-accent);
  box-shadow: 0 0 0 3px var(--input-accent-soft);
}

.platform-demo__input-sample :deep(.varo-input[data-invalid='true'] .varo-input__body) {
  border-color: var(--input-danger);
  box-shadow: 0 0 0 3px var(--input-danger-soft);
}

.platform-demo__input-sample :deep(.varo-input[data-readonly='true'] .varo-input__body) {
  background: color-mix(in srgb, var(--input-field) 72%, var(--input-surface));
}

.platform-demo__input-sample :deep(.varo-input[data-disabled='true']) {
  opacity: 0.58;
}

.platform-demo__input-sample :deep(.varo-input__control) {
  min-width: 0;
  min-height: 50px;
  padding: 0;
  font-size: 1rem;
  line-height: 1.45;
  color: var(--input-text);
  caret-color: var(--input-accent);
  outline: 0;
  background: transparent;
  border: 0;
}

.platform-demo__input-sample :deep(.varo-input__control::placeholder) {
  color: var(--input-muted);
  opacity: 0.72;
}

.platform-demo__input-sample :deep(.varo-input__word-limit) {
  flex: none;
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  color: var(--input-muted);
}

.platform-demo__input-sample :deep(.varo-input__error) {
  min-height: 18px;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--input-danger);
}

.platform-demo__input-case[data-case='textarea'] :deep(.varo-input__body) {
  align-items: flex-start;
}

.platform-demo__input-case[data-case='textarea'] :deep(textarea.varo-input__control) {
  min-height: 84px;
  padding-block: 12px;
}

.platform-demo__input-case[data-case='textarea'] :deep(.varo-input__word-limit) {
  align-self: flex-end;
  margin-bottom: 14px;
}

.platform-demo__input-sample :deep(.varo-input__clear) {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  font-size: 0;
  color: transparent;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 999px;
}

.platform-demo__input-sample :deep(.varo-input__clear::before) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 1rem;
  line-height: 1;
  color: var(--input-muted);
  content: '×';
  background: transparent;
  border-radius: 999px;
  transition:
    color 120ms cubic-bezier(0.16, 1, 0.3, 1),
    background 120ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 80ms cubic-bezier(0.16, 1, 0.3, 1);
}

.platform-demo__input-sample :deep(.varo-input__clear:hover::before) {
  color: var(--input-text);
  background: var(--input-field-hover);
}

.platform-demo__input-sample :deep(.varo-input__clear:focus-visible) {
  outline: none;
}

.platform-demo__input-sample :deep(.varo-input__clear:focus-visible::before) {
  color: var(--input-accent);
  box-shadow: 0 0 0 2px var(--input-accent);
}

.platform-demo__input-sample :deep(.varo-input__clear:active::before) {
  transform: scale(0.94);
}

.platform-demo__preview-content[data-example='input'] {
  display: block;
}

.platform-demo__stage:has(.platform-demo__preview-content[data-example='input']) .platform-demo__code-shell {
  --demo-code-bg: var(--demo-surface-strong);
  --demo-code-surface: var(--demo-surface);
  --demo-code-border: var(--demo-border);
  --demo-code-text: var(--varo-foreground);
  --demo-code-muted: var(--demo-text-muted);
}

@media (max-width: 640px) {
  .platform-demo__input-sample {
    padding: 16px;
  }

  .platform-demo__input-state-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.platform-demo__phone-content
  > .platform-demo__preview-content
  > :is(
    .platform-demo__button-sample,
    .platform-demo__badge-sample,
    .platform-demo__popover-sample,
    .platform-demo__input-sample,
    .platform-demo__card,
    .platform-demo__cell-demo,
    .platform-demo__image-demo,
    .platform-demo__divider-demo,
    .platform-demo__grid-demo,
    .platform-demo__layout-demo,
    .platform-demo__space-demo,
    .platform-demo__sticky-demo,
    .platform-demo__nav-demo,
    .platform-demo__overlay-demo,
    .platform-demo__popup-demo
  ) {
  width: 100%;
  padding: 0;
  margin: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.platform-demo__phone-content
  :is(
    .platform-demo__divider-order,
    .platform-demo__grid-service,
    .platform-demo__layout-overview,
    .platform-demo__space-filter,
    .platform-demo__sticky-feed,
    .platform-demo__elevator-directory,
    .platform-demo__fixed-nav-product,
    .platform-demo__indicator-slide,
    .platform-demo__menu-catalog,
    .platform-demo__pagination-orders,
    .platform-demo__tabbar-page
  ) {
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

@media (prefers-reduced-motion: reduce) {
  .platform-demo__input-sample :deep(.varo-input__body),
  .platform-demo__input-sample :deep(.varo-input__clear::before) {
    transition-duration: 0ms;
  }
}

.platform-demo button:active:not(:disabled) {
  transform: scale(0.97);
}

.platform-demo__input-sample :deep(button:active:not(:disabled)) {
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .platform-demo button {
    transition: none;
  }
}
</style>
