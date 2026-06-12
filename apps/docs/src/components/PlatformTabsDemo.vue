<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  VButton as H5Button,
  VCell as H5Cell,
  VCellGroup as H5CellGroup,
  VDialogClose as H5DialogClose,
  VDialogContent as H5DialogContent,
  VDialogOverlay as H5DialogOverlay,
  VDialogRoot as H5DialogRoot,
  VDialogTrigger as H5DialogTrigger,
  VDivider as H5Divider,
  VElevator as H5Elevator,
  VFixedNav as H5FixedNav,
  VGrid as H5Grid,
  VGridItem as H5GridItem,
  VImage as H5Image,
  VIndicator as H5Indicator,
  VInput as H5Input,
  VCol as H5Col,
  VMenu as H5Menu,
  VMenuItem as H5MenuItem,
  VNavbar as H5Navbar,
  VOverlay as H5Overlay,
  VPagination as H5Pagination,
  VPopup as H5Popup,
  VRow as H5Row,
  VSideNavbar as H5SideNavbar,
  VSideNavbarItem as H5SideNavbarItem,
  VSpace as H5Space,
  VSticky as H5Sticky,
  VTabbar as H5Tabbar,
  VTabbarItem as H5TabbarItem,
  VTab as H5Tab,
  VTabs as H5Tabs
} from '@varo/ui-h5'

type DemoKind =
  | 'button'
  | 'cell'
  | 'divider'
  | 'elevator'
  | 'fixed-nav'
  | 'grid'
  | 'image'
  | 'indicator'
  | 'input'
  | 'layout'
  | 'menu'
  | 'navbar'
  | 'overlay'
  | 'pagination'
  | 'popup'
  | 'side-navbar'
  | 'space'
  | 'sticky'
  | 'tabbar'
  | 'tabs'
  | 'dialog'
  | 'overview'
type Locale = 'zh' | 'en'
type Platform = 'h5' | 'weapp'

type PlatformContent = {
  runtime: string
  packageName: string
  appTitle: string
  appSubtitle: string
  statusRight: string
  code: string
  primaryText?: string
  secondaryText?: string
  disabledText?: string
  controlledLabel?: string
  uncontrolledLabel?: string
  placeholder?: string
  defaultValue?: string
  cellGroupTitle?: string
  cellGroupDesc?: string
  cellTitle?: string
  cellSubTitle?: string
  cellDesc?: string
  cellLinkTitle?: string
  cellLinkDesc?: string
  dialogHint?: string
  dialogOpenText?: string
  dialogCloseText?: string
  dialogTitle?: string
  dialogBody?: string
  popupTitle?: string
  popupBody?: string
  popupOpenText?: string
  popupCloseText?: string
  overlayOpenText?: string
  overlayText?: string
}

type DemoContent = {
  title: string
  description: string
  platforms: Record<Platform, PlatformContent>
}

const props = withDefaults(
  defineProps<{
    example: DemoKind
    locale?: Locale
  }>(),
  {
    locale: 'zh'
  }
)

const variants = ['solid', 'outline', 'ghost'] as const
const sizes = ['sm', 'md', 'lg'] as const

const selectedVariant = ref<(typeof variants)[number]>('solid')
const selectedSize = ref<(typeof sizes)[number]>('md')
const buttonLoading = ref(false)

const inputValue = ref('Varo')
const inputInvalid = ref(false)
const activeCodePlatform = ref<Platform>('h5')
const codeExpanded = ref(false)
const overlayVisible = ref(true)
const popupVisible = ref(true)
const elevatorActive = ref('A')
const indicatorCurrent = ref(0)
const fixedNavVisible = ref(true)
const menuActiveName = ref<string | number | undefined>()
const menuValue = ref<string | number>('all')
const menuStockValue = ref<string | number>('all')
const paginationPage = ref(2)
const sideNavActive = ref<string | number>('orders')
const tabbarActive = ref<string | number>('home')
const tabsActive = ref<string | number>('overview')

const cellDemoCopy = computed(() => {
  if (props.locale === 'en') {
    return {
      basicGroup: 'Basic Usage',
      title: 'Title',
      desc: 'Description',
      subTitle: 'Subtitle description',
      clickable: 'Click feedback',
      zeroRadius: 'Radius 0',
      largeGroup: 'Large Size',
      linkGroup: 'Link / Group',
      linkStyle: 'Link style',
      routeLink: 'Route link "/"',
      customGroup: 'Custom Areas',
      iconTitle: 'Icon prop',
      person: 'Alex',
      switchTitle: 'Switch',
      descOnlyGroup: 'Description Only',
      centerGroup: 'Vertical Center'
    }
  }

  return {
    basicGroup: '基础用法',
    title: '我是标题',
    desc: '描述文字',
    subTitle: '副标题描述',
    clickable: '点击测试',
    zeroRadius: '圆角设置 0',
    largeGroup: 'large 尺寸',
    linkGroup: '链接 / 分组用法',
    linkStyle: '链接样式',
    routeLink: '路由跳转 “/”',
    customGroup: '自定义区域',
    iconTitle: 'icon 属性',
    person: '张三',
    switchTitle: 'Switch',
    descOnlyGroup: '只展示描述',
    centerGroup: '垂直居中'
  }
})

const runtime = {
  Button: H5Button,
  Cell: H5Cell,
  CellGroup: H5CellGroup,
  DialogClose: H5DialogClose,
  DialogContent: H5DialogContent,
  DialogOverlay: H5DialogOverlay,
  DialogRoot: H5DialogRoot,
  DialogTrigger: H5DialogTrigger,
  Divider: H5Divider,
  Elevator: H5Elevator,
  FixedNav: H5FixedNav,
  Grid: H5Grid,
  GridItem: H5GridItem,
  Image: H5Image,
  Indicator: H5Indicator,
  Input: H5Input,
  Col: H5Col,
  Menu: H5Menu,
  MenuItem: H5MenuItem,
  Navbar: H5Navbar,
  Overlay: H5Overlay,
  Pagination: H5Pagination,
  Popup: H5Popup,
  Row: H5Row,
  SideNavbar: H5SideNavbar,
  SideNavbarItem: H5SideNavbarItem,
  Space: H5Space,
  Sticky: H5Sticky,
  Tabbar: H5Tabbar,
  TabbarItem: H5TabbarItem,
  Tab: H5Tab,
  Tabs: H5Tabs
} as const

const zhCopy = {
  codeTitle: '示例代码',
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

const enCopy = {
  codeTitle: 'Example Code',
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

const demoContent: Record<Locale, Partial<Record<DemoKind, DemoContent>>> = {
  zh: {
    button: {
      title: 'Button 跨端示例与演示',
      description: '同一块区域内切换 H5 与小程序 wrapper，代码和实时效果一起看，不再拆成两段文档。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 页面',
          appSubtitle: '浏览器组件预览',
          statusRight: '5G · H5',
          primaryText: '提交',
          secondaryText: '次要操作',
          disabledText: '禁用态',
          code: `
<script setup lang="ts">
import { VButton } from '@varo/ui-h5'
<\/script>

<template>
  <VButton variant="solid" size="md">提交</VButton>
  <VButton variant="outline" size="sm">次要操作</VButton>
  <VButton variant="ghost" :disabled="true">禁用态</VButton>
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: '小程序页面',
          appSubtitle: '跨端组件预览',
          statusRight: '微信 · 小程序',
          primaryText: '提交',
          secondaryText: '取消',
          disabledText: '禁用态',
          code: `
<script setup lang="ts">
import { VButton } from '@varo/ui-weapp'
<\/script>

<template>
  <view class="stack">
    <VButton size="lg">提交</VButton>
    <VButton variant="outline">取消</VButton>
    <VButton variant="ghost" :disabled="true">禁用态</VButton>
  </view>
</template>
          `.trim()
        }
      }
    },
    input: {
      title: 'Input 跨端示例与演示',
      description: '统一展示 H5 和小程序输入框的值同步、非法状态与非受控用法。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 表单',
          appSubtitle: '浏览器输入体验',
          statusRight: '5G · H5',
          controlledLabel: '受控输入',
          uncontrolledLabel: '非受控输入',
          placeholder: '请输入内容',
          defaultValue: '默认内容',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-h5'

const value = ref('')
<\/script>

<template>
  <VInput v-model:value="value" placeholder="请输入内容" />
  <VInput default-value="默认内容" />
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: '小程序表单',
          appSubtitle: '跨端输入体验',
          statusRight: '微信 · 小程序',
          controlledLabel: '手机号输入',
          uncontrolledLabel: '备注输入',
          placeholder: '请输入手机号',
          defaultValue: '留言备注',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-weapp'

const mobile = ref('')
<\/script>

<template>
  <VInput v-model:value="mobile" placeholder="请输入手机号" />
  <VInput default-value="留言备注" />
</template>
          `.trim()
        }
      }
    },
    cell: {
      title: 'Cell 跨端示例与演示',
      description: '按 NutUI Cell 的信息项结构展示标题、描述、右侧内容、箭头和分组。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 列表',
          appSubtitle: '浏览器信息项预览',
          statusRight: '5G · H5',
          cellGroupTitle: '账户信息',
          cellGroupDesc: '基础资料',
          cellTitle: '昵称',
          cellSubTitle: '公开展示',
          cellDesc: 'Varo',
          cellLinkTitle: '收货地址',
          cellLinkDesc: '去设置',
          code: `
<script setup lang="ts">
import { VCell, VCellGroup } from '@varo/ui-h5'
<\/script>

<template>
  <VCellGroup title="账户信息" desc="基础资料">
    <VCell title="昵称" sub-title="公开展示" desc="Varo" />
    <VCell title="收货地址" desc="去设置" is-link />
  </VCellGroup>
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: '小程序列表',
          appSubtitle: '跨端信息项预览',
          statusRight: '微信 · 小程序',
          cellGroupTitle: '订单信息',
          cellGroupDesc: '常用入口',
          cellTitle: '订单状态',
          cellSubTitle: '最近更新',
          cellDesc: '已完成',
          cellLinkTitle: '物流详情',
          cellLinkDesc: '查看',
          code: `
<script setup lang="ts">
import { VCell, VCellGroup } from '@varo/ui-weapp'
<\/script>

<template>
  <VCellGroup title="订单信息" desc="常用入口">
    <VCell title="订单状态" sub-title="最近更新" desc="已完成" />
    <VCell title="物流详情" desc="查看" is-link />
  </VCellGroup>
</template>
          `.trim()
        }
      }
    },
    image: {
      title: 'Image 跨端示例与演示',
      description: '对齐 Vant / NutUI 图片能力，展示填充模式、圆形图片、加载占位与失败态。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 图片',
          appSubtitle: '图片状态与裁剪预览',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import { VImage } from '@varo/ui-h5'
<\/script>

<template>
  <VImage src="/logo.png" width="96" height="96" fit="cover" radius="12px" />
  <VImage src="/logo.png" width="64" height="64" round />
  <VImage src="/not-found.png" width="96" height="96" error-text="加载失败" />
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: '小程序图片',
          appSubtitle: '跨端图片状态预览',
          statusRight: '微信 · 小程序',
          code: `
<script setup lang="ts">
import { VImage } from '@varo/ui-weapp'
<\/script>

<template>
  <VImage src="/logo.png" width="96" height="96" fit="cover" radius="12px" />
  <VImage src="/logo.png" width="64" height="64" round />
  <VImage src="/not-found.png" width="96" height="96" error-text="加载失败" />
</template>
          `.trim()
        }
      }
    },
    overlay: {
      title: 'Overlay 跨端示例与演示',
      description: '展示显隐控制、点击遮罩关闭、层级和滚动锁定这些弹层基础能力。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 遮罩',
          appSubtitle: '遮罩层行为预览',
          statusRight: '5G · H5',
          overlayOpenText: '打开遮罩',
          overlayText: '点击遮罩关闭',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VOverlay } from '@varo/ui-h5'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">打开遮罩</VButton>
  <VOverlay v-model:visible="visible" :z-index="2000" />
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: '小程序遮罩',
          appSubtitle: '跨端遮罩行为预览',
          statusRight: '微信 · 小程序',
          overlayOpenText: '打开遮罩',
          overlayText: '点击遮罩关闭',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VOverlay } from '@varo/ui-weapp'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">打开遮罩</VButton>
  <VOverlay v-model:visible="visible" :z-index="2000" />
</template>
          `.trim()
        }
      }
    },
    popup: {
      title: 'Popup 跨端示例与演示',
      description: '在同一演示里展示遮罩、底部弹出、圆角、关闭按钮与受控显隐。',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 弹出层',
          appSubtitle: '底部弹出预览',
          statusRight: '5G · H5',
          popupTitle: '配送方式',
          popupBody: '展示遮罩、圆角和关闭按钮。',
          popupOpenText: '打开弹出层',
          popupCloseText: '关闭',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VPopup } from '@varo/ui-h5'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">打开弹出层</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <div class="popup-body">弹层内容</div>
  </VPopup>
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序 wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: '小程序弹出层',
          appSubtitle: '跨端弹出预览',
          statusRight: '微信 · 小程序',
          popupTitle: '配送方式',
          popupBody: '展示遮罩、圆角和关闭按钮。',
          popupOpenText: '打开弹出层',
          popupCloseText: '关闭',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VPopup } from '@varo/ui-weapp'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">打开弹出层</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <view class="popup-body">弹层内容</view>
  </VPopup>
</template>
          `.trim()
        }
      }
    },
    dialog: {
      title: 'Dialog 跨端示例与演示',
      description: '在同一页里切换 H5 和小程序的 parts 组合方式，直接比较触发器、遮罩和内容区的组织方式。',
      platforms: {
        h5: {
          runtime: 'H5 parts',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 弹层',
          appSubtitle: 'parts 组合预览',
          statusRight: '5G · H5',
          dialogHint: '浏览器侧弹层',
          dialogOpenText: '打开弹层',
          dialogCloseText: '关闭',
          dialogTitle: 'H5 对话框',
          dialogBody: '这里展示的是基于 primitives parts 组装出来的官方 wrapper。',
          code: `
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo/ui-h5'
<\/script>

<template>
  <VDialogRoot>
    <VDialogTrigger>打开弹层</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <p>Dialog 内容</p>
      <VDialogClose>关闭</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序 parts',
          packageName: '@varo/ui-weapp',
          appTitle: '小程序弹层',
          appSubtitle: 'parts 组合预览',
          statusRight: '微信 · 小程序',
          dialogHint: '小程序侧弹层',
          dialogOpenText: '打开弹层',
          dialogCloseText: '关闭',
          dialogTitle: '小程序对话框',
          dialogBody: '这里展示统一的交互模型，实际业务可继续封装自己的容器与动画。',
          code: `
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo/ui-weapp'
<\/script>

<template>
  <VDialogRoot>
    <VDialogTrigger>打开弹层</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <text>Dialog 内容</text>
      <VDialogClose>关闭</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
          `.trim()
        }
      }
    },
    overview: {
      title: '跨端总览示例与演示',
      description: '统一入口里切换 H5 和小程序整体示例，直接对照安装包、代码和最终视觉效果。',
      platforms: {
        h5: {
          runtime: 'H5 官方 UI',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 Demo',
          appSubtitle: '浏览器端组合示例',
          statusRight: '5G · H5',
          controlledLabel: '姓名',
          uncontrolledLabel: '备注',
          placeholder: '请输入姓名',
          defaultValue: 'Design primitives, theme, docs',
          primaryText: '提交',
          secondaryText: '次要操作',
          dialogHint: '组合式弹层',
          dialogOpenText: '打开弹层',
          dialogCloseText: '关闭',
          dialogTitle: 'H5 组合示例',
          dialogBody: '这里同时使用 Button、Input 和 Dialog，展示官方 wrapper 的组合效果。',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput
} from '@varo/ui-h5'

const name = ref('')
<\/script>

<template>
  <section class="demo-stack">
    <VInput v-model:value="name" placeholder="请输入姓名" />
    <VButton variant="solid">提交</VButton>

    <VDialogRoot>
      <VDialogTrigger>打开弹层</VDialogTrigger>
      <VDialogOverlay class="overlay" />
      <VDialogContent class="content">
        <p>你好，{{ name || 'Varo' }}</p>
        <VDialogClose>关闭</VDialogClose>
      </VDialogContent>
    </VDialogRoot>
  </section>
</template>
          `.trim()
        },
        weapp: {
          runtime: '小程序官方 UI',
          packageName: '@varo/ui-weapp',
          appTitle: 'Weapp Demo',
          appSubtitle: '小程序端组合示例',
          statusRight: '微信 · 小程序',
          controlledLabel: '手机号',
          uncontrolledLabel: '备注',
          placeholder: '请输入手机号',
          defaultValue: '可继续二次封装',
          primaryText: '提交',
          secondaryText: '取消',
          dialogHint: '组合式弹层',
          dialogOpenText: '打开弹层',
          dialogCloseText: '关闭',
          dialogTitle: '小程序组合示例',
          dialogBody: '这里展示和 H5 对齐的交互契约，方便做跨端组件文档。',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput
} from '@varo/ui-weapp'

const mobile = ref('')
<\/script>

<template>
  <view class="demo-stack">
    <VInput v-model:value="mobile" placeholder="请输入手机号" />
    <VButton size="lg">提交</VButton>

    <VDialogRoot>
      <VDialogTrigger>打开弹层</VDialogTrigger>
      <VDialogOverlay class="overlay" />
      <VDialogContent class="content">
        <text>手机号：{{ mobile || '未填写' }}</text>
        <VDialogClose>关闭</VDialogClose>
      </VDialogContent>
    </VDialogRoot>
  </view>
</template>
          `.trim()
        }
      }
    }
  },
  en: {
    button: {
      title: 'Button Cross-platform Example and Preview',
      description: 'Switch between the H5 and mini-program wrappers in one place so code and rendered output stay aligned.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 Page',
          appSubtitle: 'Browser wrapper preview',
          statusRight: '5G · H5',
          primaryText: 'Submit',
          secondaryText: 'Secondary',
          disabledText: 'Disabled',
          code: `
<script setup lang="ts">
import { VButton } from '@varo/ui-h5'
<\/script>

<template>
  <VButton variant="solid" size="md">Submit</VButton>
  <VButton variant="outline" size="sm">Secondary</VButton>
  <VButton variant="ghost" :disabled="true">Disabled</VButton>
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: 'Mini-program Page',
          appSubtitle: 'Cross-platform wrapper preview',
          statusRight: 'WeChat · Mini-program',
          primaryText: 'Submit',
          secondaryText: 'Cancel',
          disabledText: 'Disabled',
          code: `
<script setup lang="ts">
import { VButton } from '@varo/ui-weapp'
<\/script>

<template>
  <view class="stack">
    <VButton size="lg">Submit</VButton>
    <VButton variant="outline">Cancel</VButton>
    <VButton variant="ghost" :disabled="true">Disabled</VButton>
  </view>
</template>
          `.trim()
        }
      }
    },
    input: {
      title: 'Input Cross-platform Example and Preview',
      description: 'The same section now documents controlled input, invalid state, and uncontrolled usage for both runtimes.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 Form',
          appSubtitle: 'Browser input preview',
          statusRight: '5G · H5',
          controlledLabel: 'Controlled input',
          uncontrolledLabel: 'Uncontrolled input',
          placeholder: 'Type here',
          defaultValue: 'Default content',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-h5'

const value = ref('')
<\/script>

<template>
  <VInput v-model:value="value" placeholder="Type here" />
  <VInput default-value="Default content" />
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: 'Mini-program Form',
          appSubtitle: 'Cross-platform input preview',
          statusRight: 'WeChat · Mini-program',
          controlledLabel: 'Phone input',
          uncontrolledLabel: 'Notes',
          placeholder: 'Phone number',
          defaultValue: 'Additional notes',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-weapp'

const mobile = ref('')
<\/script>

<template>
  <VInput v-model:value="mobile" placeholder="Phone number" />
  <VInput default-value="Additional notes" />
</template>
          `.trim()
        }
      }
    },
    cell: {
      title: 'Cell Cross-platform Example and Preview',
      description: 'Preview title, subtitle, desc, right content, link affordance, and groups with a NutUI-style cell structure.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 List',
          appSubtitle: 'Browser cell preview',
          statusRight: '5G · H5',
          cellGroupTitle: 'Account',
          cellGroupDesc: 'Profile',
          cellTitle: 'Nickname',
          cellSubTitle: 'Public display',
          cellDesc: 'Varo',
          cellLinkTitle: 'Address',
          cellLinkDesc: 'Configure',
          code: `
<script setup lang="ts">
import { VCell, VCellGroup } from '@varo/ui-h5'
<\/script>

<template>
  <VCellGroup title="Account" desc="Profile">
    <VCell title="Nickname" sub-title="Public display" desc="Varo" />
    <VCell title="Address" desc="Configure" is-link />
  </VCellGroup>
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: 'Mini-program List',
          appSubtitle: 'Cross-platform cell preview',
          statusRight: 'WeChat · Mini-program',
          cellGroupTitle: 'Order',
          cellGroupDesc: 'Common entry',
          cellTitle: 'Order status',
          cellSubTitle: 'Updated recently',
          cellDesc: 'Completed',
          cellLinkTitle: 'Logistics',
          cellLinkDesc: 'View',
          code: `
<script setup lang="ts">
import { VCell, VCellGroup } from '@varo/ui-weapp'
<\/script>

<template>
  <VCellGroup title="Order" desc="Common entry">
    <VCell title="Order status" sub-title="Updated recently" desc="Completed" />
    <VCell title="Logistics" desc="View" is-link />
  </VCellGroup>
</template>
          `.trim()
        }
      }
    },
    image: {
      title: 'Image Cross-platform Example and Preview',
      description: 'Aligned with Vant and NutUI image capabilities: fit modes, round image, loading placeholder, and error state.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 Image',
          appSubtitle: 'Image state preview',
          statusRight: '5G · H5',
          code: `
<script setup lang="ts">
import { VImage } from '@varo/ui-h5'
<\/script>

<template>
  <VImage src="/logo.png" width="96" height="96" fit="cover" radius="12px" />
  <VImage src="/logo.png" width="64" height="64" round />
  <VImage src="/not-found.png" width="96" height="96" error-text="Load failed" />
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: 'Mini-program Image',
          appSubtitle: 'Cross-platform image preview',
          statusRight: 'WeChat · Mini-program',
          code: `
<script setup lang="ts">
import { VImage } from '@varo/ui-weapp'
<\/script>

<template>
  <VImage src="/logo.png" width="96" height="96" fit="cover" radius="12px" />
  <VImage src="/logo.png" width="64" height="64" round />
  <VImage src="/not-found.png" width="96" height="96" error-text="Load failed" />
</template>
          `.trim()
        }
      }
    },
    overlay: {
      title: 'Overlay Cross-platform Example and Preview',
      description: 'Shows the shared base behavior for visibility control, overlay click close, z-index, and scroll lock.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 Overlay',
          appSubtitle: 'Overlay behavior preview',
          statusRight: '5G · H5',
          overlayOpenText: 'Open overlay',
          overlayText: 'Click overlay to close',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VOverlay } from '@varo/ui-h5'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">Open overlay</VButton>
  <VOverlay v-model:visible="visible" :z-index="2000" />
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: 'Mini-program Overlay',
          appSubtitle: 'Cross-platform overlay preview',
          statusRight: 'WeChat · Mini-program',
          overlayOpenText: 'Open overlay',
          overlayText: 'Click overlay to close',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VOverlay } from '@varo/ui-weapp'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">Open overlay</VButton>
  <VOverlay v-model:visible="visible" :z-index="2000" />
</template>
          `.trim()
        }
      }
    },
    popup: {
      title: 'Popup Cross-platform Example and Preview',
      description: 'One preview covers overlay, bottom placement, rounded content, close button, and controlled visibility.',
      platforms: {
        h5: {
          runtime: 'H5 wrapper',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 Popup',
          appSubtitle: 'Bottom popup preview',
          statusRight: '5G · H5',
          popupTitle: 'Shipping Method',
          popupBody: 'Overlay, round corners, and close button.',
          popupOpenText: 'Open popup',
          popupCloseText: 'Close',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VPopup } from '@varo/ui-h5'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">Open popup</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <div class="popup-body">Popup content</div>
  </VPopup>
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program wrapper',
          packageName: '@varo/ui-weapp',
          appTitle: 'Mini-program Popup',
          appSubtitle: 'Cross-platform popup preview',
          statusRight: 'WeChat · Mini-program',
          popupTitle: 'Shipping Method',
          popupBody: 'Overlay, round corners, and close button.',
          popupOpenText: 'Open popup',
          popupCloseText: 'Close',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VPopup } from '@varo/ui-weapp'

const visible = ref(false)
<\/script>

<template>
  <VButton @click="visible = true">Open popup</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <view class="popup-body">Popup content</view>
  </VPopup>
</template>
          `.trim()
        }
      }
    },
    dialog: {
      title: 'Dialog Cross-platform Example and Preview',
      description: 'H5 and mini-program parts composition now live under one tab switcher instead of being described separately.',
      platforms: {
        h5: {
          runtime: 'H5 parts',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 Dialog',
          appSubtitle: 'Parts composition preview',
          statusRight: '5G · H5',
          dialogHint: 'Browser dialog flow',
          dialogOpenText: 'Open dialog',
          dialogCloseText: 'Close',
          dialogTitle: 'H5 Dialog',
          dialogBody: 'This preview is composed from the official wrapper parts built on top of primitives.',
          code: `
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo/ui-h5'
<\/script>

<template>
  <VDialogRoot>
    <VDialogTrigger>Open dialog</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <p>Dialog body</p>
      <VDialogClose>Close</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Mini-program parts',
          packageName: '@varo/ui-weapp',
          appTitle: 'Mini-program Dialog',
          appSubtitle: 'Parts composition preview',
          statusRight: 'WeChat · Mini-program',
          dialogHint: 'Mini-program dialog flow',
          dialogOpenText: 'Open dialog',
          dialogCloseText: 'Close',
          dialogTitle: 'Mini-program Dialog',
          dialogBody: 'The preview shows the shared open and close contract, while leaving room for your own runtime-specific container layer.',
          code: `
<script setup lang="ts">
import {
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger
} from '@varo/ui-weapp'
<\/script>

<template>
  <VDialogRoot>
    <VDialogTrigger>Open dialog</VDialogTrigger>
    <VDialogOverlay class="overlay" />
    <VDialogContent class="content">
      <text>Dialog body</text>
      <VDialogClose>Close</VDialogClose>
    </VDialogContent>
  </VDialogRoot>
</template>
          `.trim()
        }
      }
    },
    overview: {
      title: 'Cross-platform Overview Example and Preview',
      description: 'One overview page now switches between H5 and mini-program demos instead of splitting them into two separate documents.',
      platforms: {
        h5: {
          runtime: 'Official H5 UI',
          packageName: '@varo/ui-h5',
          appTitle: 'H5 Demo',
          appSubtitle: 'Browser composition example',
          statusRight: '5G · H5',
          controlledLabel: 'Name',
          uncontrolledLabel: 'Description',
          placeholder: 'Type your name',
          defaultValue: 'Design primitives, theme, docs',
          primaryText: 'Submit',
          secondaryText: 'Secondary',
          dialogHint: 'Composable dialog',
          dialogOpenText: 'Open dialog',
          dialogCloseText: 'Close',
          dialogTitle: 'H5 Composition Demo',
          dialogBody: 'Button, Input, and Dialog are rendered together here so the official wrapper composition is visible at a glance.',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput
} from '@varo/ui-h5'

const name = ref('')
<\/script>

<template>
  <section class="demo-stack">
    <VInput v-model:value="name" placeholder="Type your name" />
    <VButton variant="solid">Submit</VButton>

    <VDialogRoot>
      <VDialogTrigger>Open dialog</VDialogTrigger>
      <VDialogOverlay class="overlay" />
      <VDialogContent class="content">
        <p>Hello, {{ name || 'Varo' }}</p>
        <VDialogClose>Close</VDialogClose>
      </VDialogContent>
    </VDialogRoot>
  </section>
</template>
          `.trim()
        },
        weapp: {
          runtime: 'Official mini-program UI',
          packageName: '@varo/ui-weapp',
          appTitle: 'Weapp Demo',
          appSubtitle: 'Mini-program composition example',
          statusRight: 'WeChat · Mini-program',
          controlledLabel: 'Phone',
          uncontrolledLabel: 'Notes',
          placeholder: 'Phone number',
          defaultValue: 'Ready for downstream wrapping',
          primaryText: 'Submit',
          secondaryText: 'Cancel',
          dialogHint: 'Composable dialog',
          dialogOpenText: 'Open dialog',
          dialogCloseText: 'Close',
          dialogTitle: 'Mini-program Composition Demo',
          dialogBody: 'This tab keeps the same interaction model visible while switching the wrapper package to @varo/ui-weapp.',
          code: `
<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput
} from '@varo/ui-weapp'

const mobile = ref('')
<\/script>

<template>
  <view class="demo-stack">
    <VInput v-model:value="mobile" placeholder="Phone number" />
    <VButton size="lg">Submit</VButton>

    <VDialogRoot>
      <VDialogTrigger>Open dialog</VDialogTrigger>
      <VDialogOverlay class="overlay" />
      <VDialogContent class="content">
        <text>Phone: {{ mobile || 'Empty' }}</text>
        <VDialogClose>Close</VDialogClose>
      </VDialogContent>
    </VDialogRoot>
  </view>
</template>
          `.trim()
        }
      }
    }
  }
}

const componentDemoContent: Record<DemoKind, DemoContent> = {
  button: {
    title: 'Button 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.button!.platforms
  },
  cell: {
    title: 'Cell 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.cell!.platforms
  },
  divider: {
    title: 'Divider 跨端示例与演示',
    description: '展示基础分割线、带文字分割线、虚线和纵向分割线。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 分割线',
        appSubtitle: '内容分隔预览',
        statusRight: '5G · H5',
        code: `
<template>
  <VDivider />
  <VDivider>文本分割线</VDivider>
  <VDivider dashed content-position="left">虚线</VDivider>
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序分割线',
        appSubtitle: '跨端分隔预览',
        statusRight: '微信 · 小程序',
        code: `
<template>
  <VDivider />
  <VDivider>文本分割线</VDivider>
  <VDivider dashed content-position="left">虚线</VDivider>
</template>
        `.trim()
      }
    }
  },
  elevator: {
    title: 'Elevator 跨端示例与演示',
    description: '展示楼层索引、分组列表和索引点击切换。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 电梯楼层',
        appSubtitle: '索引导航预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VElevator } from '@varo/ui-h5'

const activeIndex = ref('A')
const indexes = [
  { title: 'A', items: ['安徽', '澳门', '安庆'] },
  { title: 'B', items: ['北京', '保定', '包头'] },
  { title: 'C', items: ['成都', '重庆', '长沙'] },
  { title: 'D', items: ['大连', '东莞', '德州'] }
]
<\/script>

<template>
  <VElevator v-model:active-index="activeIndex" :indexes="indexes" />
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序电梯楼层',
        appSubtitle: '跨端索引导航',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VElevator } from '@varo/ui-weapp'

const activeIndex = ref('A')
const indexes = [
  { title: 'A', items: ['安徽', '澳门', '安庆'] },
  { title: 'B', items: ['北京', '保定', '包头'] },
  { title: 'C', items: ['成都', '重庆', '长沙'] },
  { title: 'D', items: ['大连', '东莞', '德州'] }
]
<\/script>

<template>
  <VElevator v-model:active-index="activeIndex" :indexes="indexes" />
</template>
        `.trim()
      }
    }
  },
  'fixed-nav': {
    title: 'FixedNav 跨端示例与演示',
    description: '展示悬浮入口、展开菜单、徽标和点击选择。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 悬浮导航',
        appSubtitle: '快捷入口预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VFixedNav } from '@varo/ui-h5'

const visible = ref(true)
const navList = [
  { text: '首页', icon: '⌂' },
  { text: '消息', icon: '✉', num: 2 }
]
<\/script>

<template>
  <VFixedNav v-model:visible="visible" :nav-list="navList" active-text="导航" />
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序悬浮导航',
        appSubtitle: '跨端快捷入口',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VFixedNav } from '@varo/ui-weapp'

const visible = ref(true)
const navList = [
  { text: '首页', icon: '⌂' },
  { text: '消息', icon: '✉', num: 2 }
]
<\/script>

<template>
  <VFixedNav v-model:visible="visible" :nav-list="navList" active-text="导航" />
</template>
        `.trim()
      }
    }
  },
  grid: {
    title: 'Grid 跨端示例与演示',
    description: '按常见宫格入口展示列数、徽标、图标、点击态和间距。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 宫格',
        appSubtitle: '功能入口预览',
        statusRight: '5G · H5',
        code: `
<template>
  <VGrid :column-num="4" :gutter="8" clickable>
    <VGridItem icon="◎" text="文字" />
    <VGridItem icon="◎" text="物流" badge="3" />
  </VGrid>
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序宫格',
        appSubtitle: '跨端入口预览',
        statusRight: '微信 · 小程序',
        code: `
<template>
  <VGrid :column-num="4" :gutter="8" clickable>
    <VGridItem icon="◎" text="文字" />
    <VGridItem icon="◎" text="物流" badge="3" />
  </VGrid>
</template>
        `.trim()
      }
    }
  },
  image: {
    title: 'Image 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.image!.platforms
  },
  indicator: {
    title: 'Indicator 跨端示例与演示',
    description: '展示点状和线状进度指示能力。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 指示器',
        appSubtitle: '轮播进度预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VIndicator } from '@varo/ui-h5'

const current = ref(0)
<\/script>

<template>
  <VIndicator v-model:current="current" :total="4" />
  <VIndicator v-model:current="current" :total="4" type="line" />
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序指示器',
        appSubtitle: '跨端进度预览',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VIndicator } from '@varo/ui-weapp'

const current = ref(0)
<\/script>

<template>
  <VIndicator v-model:current="current" :total="4" />
  <VIndicator v-model:current="current" :total="4" type="line" />
</template>
        `.trim()
      }
    }
  },
  input: {
    title: 'Input 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.input!.platforms
  },
  layout: {
    title: 'Layout 跨端示例与演示',
    description: '展示 24 栅格、列偏移、行间距和主轴对齐。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 布局',
        appSubtitle: '24 栅格预览',
        statusRight: '5G · H5',
        code: `
<template>
  <VRow :gutter="[8, 8]">
    <VCol :span="8">8</VCol>
    <VCol :span="8">8</VCol>
    <VCol :span="8">8</VCol>
  </VRow>
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序布局',
        appSubtitle: '跨端栅格预览',
        statusRight: '微信 · 小程序',
        code: `
<template>
  <VRow :gutter="[8, 8]">
    <VCol :span="8">8</VCol>
    <VCol :span="8">8</VCol>
    <VCol :span="8">8</VCol>
  </VRow>
</template>
        `.trim()
      }
    }
  },
  menu: {
    title: 'Menu 跨端示例与演示',
    description: '展示下拉菜单、选项选择和受控展开状态。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 菜单',
        appSubtitle: '筛选菜单预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VMenu, VMenuItem } from '@varo/ui-h5'

const activeName = ref()
const value = ref('all')
const stock = ref('all')
const options = [
  { text: '全部商品', value: 'all' },
  { text: '新品优先', value: 'new' },
  { text: '价格排序', value: 'price' }
]
const stockOptions = [
  { text: '全部库存', value: 'all' },
  { text: '仅看有货', value: 'in-stock' },
  { text: '预售商品', value: 'presale' }
]
<\/script>

<template>
  <VMenu v-model:active-name="activeName">
    <VMenuItem v-model="value" name="sort" title="排序" :options="options" />
    <VMenuItem v-model="stock" name="stock" title="库存" :options="stockOptions" />
  </VMenu>
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序菜单',
        appSubtitle: '跨端筛选菜单',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VMenu, VMenuItem } from '@varo/ui-weapp'

const activeName = ref()
const value = ref('all')
const stock = ref('all')
const options = [
  { text: '全部商品', value: 'all' },
  { text: '新品优先', value: 'new' },
  { text: '价格排序', value: 'price' }
]
const stockOptions = [
  { text: '全部库存', value: 'all' },
  { text: '仅看有货', value: 'in-stock' },
  { text: '预售商品', value: 'presale' }
]
<\/script>

<template>
  <VMenu v-model:active-name="activeName">
    <VMenuItem v-model="value" name="sort" title="排序" :options="options" />
    <VMenuItem v-model="stock" name="stock" title="库存" :options="stockOptions" />
  </VMenu>
</template>
        `.trim()
      }
    }
  },
  navbar: {
    title: 'Navbar 跨端示例与演示',
    description: '展示标题、左右区域、返回箭头和点击事件。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 头部导航',
        appSubtitle: '页面导航预览',
        statusRight: '5G · H5',
        code: `
<template>
  <VNavbar title="订单详情" left-text="返回" right-text="更多" left-arrow />
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序头部导航',
        appSubtitle: '跨端导航预览',
        statusRight: '微信 · 小程序',
        code: `
<template>
  <VNavbar title="订单详情" left-text="返回" right-text="更多" left-arrow />
</template>
        `.trim()
      }
    }
  },
  overlay: {
    title: 'Overlay 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.overlay!.platforms
  },
  pagination: {
    title: 'Pagination 跨端示例与演示',
    description: '展示上一页、下一页、多页码和简单模式。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 分页',
        appSubtitle: '翻页控制预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VPagination } from '@varo/ui-h5'

const page = ref(2)
<\/script>

<template>
  <VPagination v-model="page" :page-count="5" />
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序分页',
        appSubtitle: '跨端翻页控制',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VPagination } from '@varo/ui-weapp'

const page = ref(2)
<\/script>

<template>
  <VPagination v-model="page" :page-count="5" />
</template>
        `.trim()
      }
    }
  },
  popup: {
    title: 'Popup 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.popup!.platforms
  },
  'side-navbar': {
    title: 'SideNavbar 跨端示例与演示',
    description: '展示侧边栏分组导航、选中态和徽标。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 侧边栏导航',
        appSubtitle: '分组入口预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VSideNavbar, VSideNavbarItem } from '@varo/ui-h5'

const active = ref('orders')
<\/script>

<template>
  <VSideNavbar v-model="active">
    <VSideNavbarItem name="orders" title="订单" />
    <VSideNavbarItem name="assets" title="资产" badge="3" />
  </VSideNavbar>
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序侧边栏导航',
        appSubtitle: '跨端分组入口',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VSideNavbar, VSideNavbarItem } from '@varo/ui-weapp'

const active = ref('orders')
<\/script>

<template>
  <VSideNavbar v-model="active">
    <VSideNavbarItem name="orders" title="订单" />
    <VSideNavbarItem name="assets" title="资产" badge="3" />
  </VSideNavbar>
</template>
        `.trim()
      }
    }
  },
  space: {
    title: 'Space 跨端示例与演示',
    description: '展示横向间距、纵向间距、换行和填充宽度。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 间距',
        appSubtitle: '元素间距预览',
        statusRight: '5G · H5',
        code: `
<template>
  <VSpace :size="8" wrap>
    <VButton size="sm">按钮</VButton>
    <VButton size="sm">按钮</VButton>
  </VSpace>
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序间距',
        appSubtitle: '跨端间距预览',
        statusRight: '微信 · 小程序',
        code: `
<template>
  <VSpace :size="8" wrap>
    <VButton size="sm">按钮</VButton>
    <VButton size="sm">按钮</VButton>
  </VSpace>
</template>
        `.trim()
      }
    }
  },
  sticky: {
    title: 'Sticky 跨端示例与演示',
    description: '展示吸顶容器、顶部偏移和固定态标记。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 粘性布局',
        appSubtitle: '滚动吸顶预览',
        statusRight: '5G · H5',
        code: `
<template>
  <VSticky :offset-top="12">
    <div class="sticky-bar">吸顶区域</div>
  </VSticky>
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序粘性布局',
        appSubtitle: '跨端吸顶预览',
        statusRight: '微信 · 小程序',
        code: `
<template>
  <VSticky :offset-top="12">
    <view class="sticky-bar">吸顶区域</view>
  </VSticky>
</template>
        `.trim()
      }
    }
  },
  tabbar: {
    title: 'Tabbar 跨端示例与演示',
    description: '展示底部标签栏、图标、徽标和选中态。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 标签栏',
        appSubtitle: '底部导航预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VTabbar, VTabbarItem } from '@varo/ui-h5'

const active = ref('home')
<\/script>

<template>
  <VTabbar v-model="active">
    <VTabbarItem name="home" icon="⌂">首页</VTabbarItem>
    <VTabbarItem name="profile" icon="○" dot>我的</VTabbarItem>
  </VTabbar>
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序标签栏',
        appSubtitle: '跨端底部导航',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VTabbar, VTabbarItem } from '@varo/ui-weapp'

const active = ref('home')
<\/script>

<template>
  <VTabbar v-model="active">
    <VTabbarItem name="home" icon="⌂">首页</VTabbarItem>
    <VTabbarItem name="profile" icon="○" dot>我的</VTabbarItem>
  </VTabbar>
</template>
        `.trim()
      }
    }
  },
  tabs: {
    title: 'Tabs 跨端示例与演示',
    description: '展示顶部选项卡、内容面板和受控选中态。',
    platforms: {
      h5: {
        runtime: 'H5 wrapper',
        packageName: '@varo/ui-h5',
        appTitle: 'H5 选项卡',
        appSubtitle: '内容切换预览',
        statusRight: '5G · H5',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from '@varo/ui-h5'

const active = ref('overview')
<\/script>

<template>
  <VTabs v-model:active="active">
    <VTab name="overview" title="概览">核心数据</VTab>
    <VTab name="detail" title="明细">明细列表</VTab>
  </VTabs>
</template>
        `.trim()
      },
      weapp: {
        runtime: '小程序 wrapper',
        packageName: '@varo/ui-weapp',
        appTitle: '小程序选项卡',
        appSubtitle: '跨端内容切换',
        statusRight: '微信 · 小程序',
        code: `
<script setup lang="ts">
import { ref } from 'vue'
import { VTab, VTabs } from '@varo/ui-weapp'

const active = ref('overview')
<\/script>

<template>
  <VTabs v-model:active="active">
    <VTab name="overview" title="概览">核心数据</VTab>
    <VTab name="detail" title="明细">明细列表</VTab>
  </VTabs>
</template>
        `.trim()
      }
    }
  },
  dialog: {
    title: 'Dialog 跨端示例与演示',
    description: '',
    platforms: demoContent.zh.dialog!.platforms
  },
  overview: {
    title: '跨端总览示例与演示',
    description: '',
    platforms: demoContent.zh.overview!.platforms
  }
}

const copy = computed(() => (props.locale === 'en' ? enCopy : zhCopy))
const demo = computed(() => demoContent[props.locale][props.example] ?? componentDemoContent[props.example])
const platformDemo = computed(() => demo.value.platforms.h5)
const currentIndicatorLabel = computed(() => copy.value.indicatorSlides[indicatorCurrent.value] ?? copy.value.indicatorSlides[0])
const codeExamples = computed(() => [
  {
    key: 'h5' as Platform,
    title: copy.value.h5CodeTitle,
    packageName: demo.value.platforms.h5.packageName,
    code: demo.value.platforms.h5.code
  },
  {
    key: 'weapp' as Platform,
    title: copy.value.weappCodeTitle,
    packageName: demo.value.platforms.weapp.packageName,
    code: demo.value.platforms.weapp.code
  }
])
const activeCodeExample = computed(() => codeExamples.value.find((item) => item.key === activeCodePlatform.value) ?? codeExamples.value[0]!)
const hasControls = computed(() => props.example === 'button' || props.example === 'input' || props.example === 'overview')

let indicatorTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (props.example !== 'indicator') {
    return
  }

  indicatorTimer = setInterval(() => {
    indicatorCurrent.value = (indicatorCurrent.value + 1) % copy.value.indicatorSlides.length
  }, 1800)
})

onBeforeUnmount(() => {
  if (indicatorTimer) {
    clearInterval(indicatorTimer)
  }
})
</script>

<template>
  <section class="platform-demo">
    <header class="platform-demo__head">
      <div>
        <h2>{{ demo.title }}</h2>
        <p>{{ demo.description }}</p>
      </div>
    </header>

    <div class="platform-demo__stage" :data-layout="hasControls ? 'controls-preview' : 'preview-only'">
      <section v-if="hasControls" class="platform-demo__panel">
        <div v-if="example === 'button'" class="platform-demo__controls">
          <div class="platform-demo__control-group">
            <span>{{ copy.variantLabel }}</span>
            <div class="platform-demo__chips">
              <button
                v-for="variant in variants"
                :key="variant"
                class="platform-demo__chip"
                :data-active="selectedVariant === variant"
                type="button"
                @click="selectedVariant = variant"
              >
                {{ variant }}
              </button>
            </div>
          </div>

          <div class="platform-demo__control-group">
            <span>{{ copy.sizeLabel }}</span>
            <div class="platform-demo__chips">
              <button
                v-for="size in sizes"
                :key="size"
                class="platform-demo__chip"
                :data-active="selectedSize === size"
                type="button"
                @click="selectedSize = size"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <div class="platform-demo__control-group">
            <span>{{ copy.loadingLabel }}</span>
            <button class="platform-demo__chip" type="button" data-active="true" @click="buttonLoading = !buttonLoading">
              {{ buttonLoading ? copy.loadingOn : copy.loadingOff }}
            </button>
          </div>
        </div>

        <div v-if="example === 'input' || example === 'overview'" class="platform-demo__controls">
          <div class="platform-demo__control-group">
            <span>{{ copy.invalidLabel }}</span>
            <button class="platform-demo__chip" type="button" data-active="true" @click="inputInvalid = !inputInvalid">
              {{ inputInvalid ? copy.invalidOn : copy.invalidOff }}
            </button>
          </div>
        </div>

      </section>

      <section class="platform-demo__panel platform-demo__panel--preview">
        <span class="platform-demo__preview-label">{{ copy.previewTitle }}</span>

        <div class="platform-demo__preview-content" :data-example="example">
                <template v-if="example === 'button'">
                  <section class="platform-demo__card">
                    <div class="platform-demo__stack">
                      <component
                        :is="runtime.Button"
                        :loading="buttonLoading"
                        :size="selectedSize"
                        :variant="selectedVariant"
                        type="button"
                      >
                        {{ platformDemo.primaryText }}
                      </component>
                      <component :is="runtime.Button" size="sm" variant="outline" type="button">
                        {{ platformDemo.secondaryText }}
                      </component>
                      <component :is="runtime.Button" :disabled="true" variant="ghost" type="button">
                        {{ platformDemo.disabledText }}
                      </component>
                    </div>
                  </section>
                </template>

                <template v-else-if="example === 'input'">
                  <section class="platform-demo__card">
                    <label class="platform-demo__field">
                      <span>{{ platformDemo.controlledLabel }}</span>
                      <component
                        :is="runtime.Input"
                        v-model:value="inputValue"
                        clearable
                        :invalid="inputInvalid"
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
                    <label class="platform-demo__field">
                      <span>{{ platformDemo.uncontrolledLabel }}</span>
                      <component :is="runtime.Input" :default-value="platformDemo.defaultValue" />
                    </label>
                  </section>
                </template>

                <template v-else-if="example === 'cell'">
                  <div class="platform-demo__cell-demo">
                    <component :is="runtime.CellGroup" :title="cellDemoCopy.basicGroup">
                      <component
                        :is="runtime.Cell"
                        :desc="cellDemoCopy.desc"
                        :title="cellDemoCopy.title"
                      />
                      <component
                        :is="runtime.Cell"
                        :desc="cellDemoCopy.desc"
                        :sub-title="cellDemoCopy.subTitle"
                        :title="cellDemoCopy.title"
                      />
                      <component :is="runtime.Cell" clickable :title="cellDemoCopy.clickable" />
                      <component
                        :is="runtime.Cell"
                        :desc="cellDemoCopy.desc"
                        round-radius="0"
                        :title="cellDemoCopy.zeroRadius"
                      />
                    </component>

                    <component :is="runtime.CellGroup" :title="cellDemoCopy.largeGroup">
                      <component
                        :is="runtime.Cell"
                        :desc="cellDemoCopy.desc"
                        size="large"
                        :sub-title="cellDemoCopy.subTitle"
                        :title="cellDemoCopy.title"
                      />
                    </component>

                    <component :is="runtime.CellGroup" :title="cellDemoCopy.linkGroup">
                      <component
                        :is="runtime.Cell"
                        :desc="cellDemoCopy.desc"
                        is-link
                        :title="cellDemoCopy.linkStyle"
                      />
                      <component
                        :is="runtime.Cell"
                        :desc="cellDemoCopy.desc"
                        is-link
                        :title="cellDemoCopy.routeLink"
                        to="/"
                      />
                    </component>

                    <component :is="runtime.CellGroup" :title="cellDemoCopy.customGroup">
                      <component :is="runtime.Cell" icon="◎" :desc="cellDemoCopy.person" :title="cellDemoCopy.iconTitle" />
                      <component :is="runtime.Cell" :title="cellDemoCopy.switchTitle">
                        <template #link>
                          <span class="platform-demo__switch" aria-hidden="true" />
                        </template>
                      </component>
                    </component>

                    <component :is="runtime.CellGroup" :title="cellDemoCopy.descOnlyGroup">
                      <component :is="runtime.Cell" :desc="cellDemoCopy.person" desc-text-align="left" />
                    </component>

                    <component :is="runtime.CellGroup" :title="cellDemoCopy.centerGroup">
                      <component
                        :is="runtime.Cell"
                        center
                        :desc="cellDemoCopy.desc"
                        :sub-title="cellDemoCopy.subTitle"
                        :title="cellDemoCopy.title"
                      />
                    </component>
                  </div>
                </template>

                <template v-else-if="example === 'image'">
                  <section class="platform-demo__image-demo">
                    <div class="platform-demo__image-item">
                      <component
                        :is="runtime.Image"
                        src="/logo.png"
                        alt="Varo"
                        width="96"
                        height="96"
                        fit="cover"
                        radius="14px"
                      />
                      <span>{{ copy.imageBasic }}</span>
                    </div>
                    <div class="platform-demo__image-item">
                      <component
                        :is="runtime.Image"
                        src="/logo.png"
                        alt="Varo"
                        width="72"
                        height="72"
                        fit="cover"
                        round
                      />
                      <span>{{ copy.imageRound }}</span>
                    </div>
                    <div class="platform-demo__image-item">
                      <component
                        :is="runtime.Image"
                        src="/not-found.png"
                        alt=""
                        width="96"
                        height="96"
                        fit="cover"
                        error-text="!"
                      />
                      <span>{{ copy.imageError }}</span>
                    </div>
                  </section>
                </template>

                <template v-else-if="example === 'divider'">
                  <section class="platform-demo__divider-demo">
                    <component :is="runtime.Divider" />
                    <component :is="runtime.Divider">{{ copy.dividerText }}</component>
                    <component :is="runtime.Divider" dashed content-position="left">Dashed</component>
                    <div class="platform-demo__divider-inline">
                      <span>Text</span>
                      <component :is="runtime.Divider" vertical />
                      <span>Link</span>
                    </div>
                  </section>
                </template>

                <template v-else-if="example === 'grid'">
                  <section class="platform-demo__grid-demo">
                    <component :is="runtime.Grid" :column-num="4" :gutter="8" clickable>
                      <component
                        :is="runtime.GridItem"
                        v-for="(item, index) in copy.gridItems"
                        :key="item"
                        icon="◎"
                        :text="item"
                        :badge="index === 1 ? '3' : undefined"
                        :dot="index === 2"
                      />
                    </component>
                  </section>
                </template>

                <template v-else-if="example === 'layout'">
                  <section class="platform-demo__layout-demo">
                    <component :is="runtime.Row" :gutter="[8, 8]">
                      <component :is="runtime.Col" :span="8"><span>span 8</span></component>
                      <component :is="runtime.Col" :span="8"><span>span 8</span></component>
                      <component :is="runtime.Col" :span="8"><span>span 8</span></component>
                    </component>
                    <component :is="runtime.Row" :gutter="[8, 8]">
                      <component :is="runtime.Col" :span="6"><span>6</span></component>
                      <component :is="runtime.Col" :span="10" :offset="2"><span>offset 2</span></component>
                    </component>
                    <component :is="runtime.Row" :gutter="[8, 8]" justify="space-between">
                      <component :is="runtime.Col" :span="6"><span>left</span></component>
                      <component :is="runtime.Col" :span="6"><span>right</span></component>
                    </component>
                  </section>
                </template>

                <template v-else-if="example === 'space'">
                  <section class="platform-demo__space-demo">
                    <component :is="runtime.Space" :size="8" wrap>
                      <component :is="runtime.Button" size="sm" type="button">A</component>
                      <component :is="runtime.Button" size="sm" variant="outline" type="button">B</component>
                      <component :is="runtime.Button" size="sm" variant="ghost" type="button">C</component>
                    </component>
                    <component :is="runtime.Space" direction="vertical" :size="[8, 10]" fill>
                      <component :is="runtime.Button" size="sm" type="button">Vertical</component>
                      <component :is="runtime.Button" size="sm" variant="outline" type="button">Fill</component>
                    </component>
                  </section>
                </template>

                <template v-else-if="example === 'sticky'">
                  <section class="platform-demo__sticky-demo">
                    <component :is="runtime.Sticky" :offset-top="10" :z-index="4">
                      <div class="platform-demo__sticky-bar">{{ copy.stickyText }}</div>
                    </component>
                    <div class="platform-demo__sticky-list">
                      <span v-for="item in 8" :key="item">List item {{ item }}</span>
                    </div>
                  </section>
                </template>

                <template v-else-if="example === 'elevator'">
                  <section class="platform-demo__nav-demo platform-demo__elevator-demo">
                    <component
                      :is="runtime.Elevator"
                      :active-index="elevatorActive"
                      :indexes="copy.elevatorGroups"
                      @update:active-index="elevatorActive = $event"
                    />
                  </section>
                </template>

                <template v-else-if="example === 'fixed-nav'">
                  <section class="platform-demo__nav-demo platform-demo__fixed-nav-demo">
                    <div class="platform-demo__fixed-nav-copy">
                      <span>{{ platformDemo.appTitle }}</span>
                      <small>{{ platformDemo.appSubtitle }}</small>
                    </div>
                    <component
                      :is="runtime.FixedNav"
                      :visible="fixedNavVisible"
                      :nav-list="copy.fixedNavItems"
                      active-text="导航"
                      @update:visible="fixedNavVisible = $event"
                    />
                  </section>
                </template>

                <template v-else-if="example === 'indicator'">
                  <section class="platform-demo__nav-demo platform-demo__indicator-demo">
                    <div class="platform-demo__indicator-slide">
                      <span>{{ String(indicatorCurrent + 1).padStart(2, '0') }}</span>
                      <strong>{{ currentIndicatorLabel }}</strong>
                      <small>{{ platformDemo.appTitle }}</small>
                    </div>
                    <component
                      :is="runtime.Indicator"
                      :total="copy.indicatorSlides.length"
                      :current="indicatorCurrent"
                      @update:current="indicatorCurrent = $event"
                    />
                    <component
                      :is="runtime.Indicator"
                      :total="copy.indicatorSlides.length"
                      :current="indicatorCurrent"
                      type="line"
                      @update:current="indicatorCurrent = $event"
                    />
                  </section>
                </template>

                <template v-else-if="example === 'menu'">
                  <section class="platform-demo__nav-demo platform-demo__menu-demo">
                    <component
                      :is="runtime.Menu"
                      :active-name="menuActiveName"
                      @update:active-name="menuActiveName = $event"
                    >
                      <component
                        :is="runtime.MenuItem"
                        :model-value="menuValue"
                        name="sort"
                        title="排序"
                        :options="copy.menuOptions"
                        @update:model-value="menuValue = $event"
                      />
                      <component
                        :is="runtime.MenuItem"
                        :model-value="menuStockValue"
                        name="stock"
                        title="库存"
                        :options="copy.menuStockOptions"
                        @update:model-value="menuStockValue = $event"
                      />
                    </component>
                    <div class="platform-demo__menu-result">
                      <span>{{ menuValue }}</span>
                      <span>{{ menuStockValue }}</span>
                    </div>
                  </section>
                </template>

                <template v-else-if="example === 'navbar'">
                  <section class="platform-demo__nav-demo platform-demo__navbar-demo">
                    <component
                      :is="runtime.Navbar"
                      :title="copy.navTitle"
                      :left-text="copy.navLeft"
                      :right-text="copy.navRight"
                      left-arrow
                    />
                    <div class="platform-demo__navbar-page">
                      <strong>{{ platformDemo.appTitle }}</strong>
                      <span>{{ platformDemo.appSubtitle }}</span>
                    </div>
                  </section>
                </template>

                <template v-else-if="example === 'pagination'">
                  <section class="platform-demo__nav-demo platform-demo__pagination-demo">
                    <component
                      :is="runtime.Pagination"
                      :model-value="paginationPage"
                      :page-count="5"
                      @update:model-value="paginationPage = $event"
                    />
                    <component
                      :is="runtime.Pagination"
                      mode="simple"
                      :model-value="paginationPage"
                      :page-count="5"
                      @update:model-value="paginationPage = $event"
                    />
                  </section>
                </template>

                <template v-else-if="example === 'side-navbar'">
                  <section class="platform-demo__nav-demo platform-demo__side-navbar-demo">
                    <component
                      :is="runtime.SideNavbar"
                      :model-value="sideNavActive"
                      @update:model-value="sideNavActive = $event"
                    >
                      <component
                        :is="runtime.SideNavbarItem"
                        v-for="item in copy.sideNavItems"
                        :key="item.name"
                        :name="item.name"
                        :title="item.title"
                        :badge="item.badge"
                      />
                    </component>
                    <div class="platform-demo__side-navbar-panel">
                      <strong>{{ sideNavActive }}</strong>
                      <span>{{ platformDemo.appSubtitle }}</span>
                    </div>
                  </section>
                </template>

                <template v-else-if="example === 'tabbar'">
                  <section class="platform-demo__nav-demo platform-demo__tabbar-demo">
                    <div class="platform-demo__tabbar-page">
                      <strong>{{ tabbarActive }}</strong>
                      <span>{{ platformDemo.appSubtitle }}</span>
                    </div>
                    <component
                      :is="runtime.Tabbar"
                      :model-value="tabbarActive"
                      @update:model-value="tabbarActive = $event"
                    >
                      <component
                        :is="runtime.TabbarItem"
                        v-for="(item, index) in copy.tabbarItems"
                        :key="item.name"
                        :name="item.name"
                        :icon="item.icon"
                        :badge="index === 1 ? '2' : undefined"
                        :dot="index === 2"
                      >
                        {{ item.title }}
                      </component>
                    </component>
                  </section>
                </template>

                <template v-else-if="example === 'tabs'">
                  <section class="platform-demo__nav-demo platform-demo__tabs-demo">
                    <component
                      :is="runtime.Tabs"
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
                        :invalid="inputInvalid"
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
                        :loading="buttonLoading"
                        :variant="selectedVariant"
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

        <div class="platform-demo__code-actions">
          <button
            class="platform-demo__code-toggle"
            :data-active="String(codeExpanded)"
            type="button"
            :aria-expanded="codeExpanded"
            :aria-label="copy.codeTitle"
            @click="codeExpanded = !codeExpanded"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" class="platform-demo__code-icon">
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
            <span>{{ copy.codeTitle }}</span>
          </button>
        </div>

        <div v-if="codeExpanded" class="platform-demo__code-block platform-demo__code-block--inline">
          <div class="platform-demo__code-tabs" role="tablist" :aria-label="copy.codeTitle">
            <button
              v-for="codeExample in codeExamples"
              :key="codeExample.key"
              class="platform-demo__code-tab"
              :data-active="activeCodePlatform === codeExample.key"
              type="button"
              role="tab"
              :aria-selected="activeCodePlatform === codeExample.key"
              @click="activeCodePlatform = codeExample.key"
            >
              {{ codeExample.title }}
            </button>
          </div>
          <section class="platform-demo__code-section">
            <div class="platform-demo__code-head">
              <strong>{{ activeCodeExample.title }}</strong>
              <span>{{ activeCodeExample.packageName }}</span>
            </div>
            <pre><code>{{ activeCodeExample.code }}</code></pre>
          </section>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.platform-demo {
  margin: 24px 0;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.94)),
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 34%);
}

.platform-demo__head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.platform-demo__head > div,
.platform-demo__stage > *,
.platform-demo__panel,
.platform-demo__meta-grid,
.platform-demo__control-group,
.platform-demo__code-block,
.platform-demo__preview-content,
.platform-demo__field,
.platform-demo__stack {
  min-width: 0;
}

.platform-demo__head h2 {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: -0.03em;
}

.platform-demo__head p {
  margin: 8px 0 0;
  max-width: 56ch;
}

.platform-demo__stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.platform-demo__stage[data-layout='preview-only'] {
  grid-template-columns: minmax(0, 1fr);
}

.platform-demo__panel {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.58);
}

.platform-demo__stage[data-layout='preview-only'] .platform-demo__panel--preview {
  justify-items: stretch;
}

.platform-demo__meta-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.platform-demo__meta-card,
.platform-demo__control-group {
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
}

.platform-demo__meta-card span,
.platform-demo__control-group span,
.platform-demo__preview-label {
  display: block;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.platform-demo__meta-card strong {
  display: block;
  margin-top: 8px;
  font-size: 1rem;
  word-break: break-word;
}

.platform-demo__controls {
  display: grid;
  gap: 12px;
}

.platform-demo__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.platform-demo__chip {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  cursor: pointer;
}

.platform-demo__chip[data-active='true'] {
  border-color: rgba(15, 118, 110, 0.18);
  background: rgba(15, 118, 110, 0.1);
  color: var(--vp-c-brand-1);
}

.platform-demo__code-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}

.platform-demo__code-toggle {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  background: rgba(100, 116, 139, 0.08);
  color: var(--vp-c-text-2);
  padding: 0 12px;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.platform-demo__code-toggle:hover,
.platform-demo__code-toggle[data-active='true'] {
  border-color: rgba(15, 118, 110, 0.22);
  background: rgba(15, 118, 110, 0.1);
  color: var(--vp-c-brand-1);
}

.platform-demo__code-icon {
  width: 16px;
  height: 16px;
}

.platform-demo__code-toggle span {
  font-size: 12px;
  font-weight: 700;
}

.platform-demo__code-toggle[data-active='true'] {
  box-shadow: 0 8px 22px rgba(15, 118, 110, 0.14);
  transform: translateY(-1px);
}

.platform-demo__code-block {
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
}

.platform-demo__code-block--inline {
  animation: platform-demo-code-reveal 0.2s ease-out;
}

@keyframes platform-demo-code-reveal {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.platform-demo__code-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
  width: fit-content;
  max-width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42);
}

.platform-demo__code-tab {
  position: relative;
  min-height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.platform-demo__code-tab:hover {
  background: rgba(15, 118, 110, 0.08);
  color: var(--vp-c-text-1);
}

.platform-demo__code-tab[data-active='true'] {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  box-shadow: 0 8px 22px rgba(15, 118, 110, 0.2);
  color: #fff;
  transform: translateY(-1px);
}

.platform-demo__code-section {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.platform-demo__code-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: baseline;
  justify-content: space-between;
}

.platform-demo__code-head strong {
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.platform-demo__code-head span {
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-family: var(--vp-font-family-mono);
}

.platform-demo__code-block pre {
  margin: 12px 0 0;
  padding: 14px;
  max-width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
  border-radius: 16px;
  background: #0f172a;
  color: #e2e8f0;
}

.platform-demo__code-block code {
  font-size: 0.82rem;
  line-height: 1.75;
}

.platform-demo__preview-content {
  display: grid;
  gap: 14px;
  width: 100%;
  padding: 4px 0 0;
}

.platform-demo__preview-content[data-example='cell'] {
  max-height: 680px;
  overflow-y: auto;
  align-content: start;
  gap: 12px;
}

.platform-demo__card {
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 40px rgba(148, 163, 184, 0.14);
}

.platform-demo__card--dialog {
  position: relative;
  min-height: 210px;
}

.platform-demo__card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 12px;
}

.platform-demo__card-head small,
.platform-demo__caption {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
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
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 30px rgba(148, 163, 184, 0.14);
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
  min-height: 260px;
  align-content: start;
  overflow: hidden;
}

.platform-demo__elevator-demo {
  min-height: 360px;
}

:deep(.varo-elevator) {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px;
  gap: 8px;
  width: 100%;
}

:deep(.varo-elevator__content) {
  display: grid;
  align-content: start;
  gap: 10px;
  grid-auto-rows: max-content;
  max-height: 336px;
  overflow-y: auto;
  padding-right: 4px;
  scroll-behavior: smooth;
}

:deep(.varo-elevator__group) {
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.92);
}

:deep(.varo-elevator__title) {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 12px;
  background: rgba(15, 118, 110, 0.1);
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

:deep(.varo-elevator__item) {
  display: block;
  width: 100%;
  min-height: 38px;
  padding: 0 12px;
  border: 0;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  background: transparent;
  color: var(--vp-c-text-1);
  text-align: left;
}

:deep(.varo-elevator__indexes) {
  display: grid;
  align-self: center;
  justify-self: end;
  gap: 6px;
  padding: 8px 4px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(12px);
}

:deep(.varo-elevator__index) {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.12);
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  font-weight: 700;
}

:deep(.varo-elevator__index[data-active='true']) {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.platform-demo__fixed-nav-demo {
  min-height: 300px;
}

.platform-demo__fixed-nav-copy,
.platform-demo__navbar-page,
.platform-demo__tabbar-page,
.platform-demo__side-navbar-panel,
.platform-demo__tabs-panel {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(100, 116, 139, 0.1);
}

.platform-demo__fixed-nav-copy small,
.platform-demo__navbar-page span,
.platform-demo__tabbar-page span,
.platform-demo__side-navbar-panel span,
.platform-demo__tabs-panel span {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

:deep(.varo-fixed-nav) {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: row-reverse;
  gap: 10px;
  align-items: flex-end;
}

:deep(.varo-fixed-nav__trigger) {
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 14px 36px rgba(15, 118, 110, 0.26);
}

:deep(.varo-fixed-nav__list) {
  display: grid;
  gap: 8px;
}

:deep(.varo-fixed-nav__item) {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: var(--vp-c-text-1);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.1);
}

:deep(.varo-fixed-nav__badge),
:deep(.varo-side-navbar__badge),
:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  position: absolute;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-size: 0.64rem;
  line-height: 16px;
}

:deep(.varo-fixed-nav__badge) {
  top: -6px;
  right: -6px;
}

.platform-demo__indicator-demo {
  justify-items: center;
}

.platform-demo__indicator-slide {
  display: grid;
  place-items: center;
  gap: 8px;
  width: 100%;
  min-height: 148px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 22% 22%, rgba(14, 165, 233, 0.18), transparent 28%),
    linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(14, 165, 233, 0.14));
  transition:
    background 0.24s ease,
    transform 0.24s ease;
}

.platform-demo__indicator-slide span {
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  font-weight: 700;
}

.platform-demo__indicator-slide small {
  color: var(--vp-c-text-2);
  font-size: 0.76rem;
}

:deep(.varo-indicator) {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

:deep(.varo-indicator__item) {
  width: 7px;
  height: 7px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.28);
  cursor: pointer;
  transition:
    width 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

:deep(.varo-indicator__item:hover) {
  transform: scale(1.12);
}

:deep(.varo-indicator[data-type='line'] .varo-indicator__item) {
  width: 18px;
  height: 4px;
}

:deep(.varo-indicator__item[data-active='true']) {
  width: 18px;
  background: var(--vp-c-brand-1);
}

.platform-demo__menu-demo {
  min-height: 260px;
  overflow: visible;
}

:deep(.varo-menu) {
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  min-height: 46px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

:deep(.varo-menu__item) {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
}

:deep(.varo-menu__item + .varo-menu__item) {
  border-left: 1px solid rgba(148, 163, 184, 0.14);
}

:deep(.varo-menu__title) {
  display: inline-flex;
  width: 100%;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font-weight: 700;
}

:deep(.varo-menu__title-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.varo-menu__arrow) {
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  opacity: 0.68;
  transform: translateY(-2px) rotate(45deg);
  transition: transform 0.2s ease;
}

:deep(.varo-menu__item[data-open='true'] .varo-menu__arrow) {
  transform: translateY(2px) rotate(225deg);
}

:deep(.varo-menu__popup) {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  display: grid;
  overflow: hidden;
  min-width: 160px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.16);
}

:deep(.varo-menu__option) {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  background: transparent;
  color: var(--vp-c-text-1);
  text-align: left;
}

:deep(.varo-menu__option:first-child) {
  border-top: 0;
}

:deep(.varo-menu__option:not(:disabled):hover) {
  background: rgba(15, 118, 110, 0.06);
}

:deep(.varo-menu__option[data-active='true']) {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.platform-demo__menu-result {
  display: inline-flex;
  justify-content: center;
  gap: 8px;
}

.platform-demo__menu-result {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  text-align: center;
}

.platform-demo__menu-result span {
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.1);
}

:deep(.varo-navbar) {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) 92px;
  align-items: center;
  min-height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

:deep(.varo-navbar__left),
:deep(.varo-navbar__right) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 48px;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

:deep(.varo-navbar__title) {
  overflow: hidden;
  font-weight: 750;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.platform-demo__pagination-demo {
  align-content: center;
}

:deep(.varo-pagination) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

:deep(.varo-pagination button) {
  min-width: 34px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.86);
  color: var(--vp-c-text-1);
}

:deep(.varo-pagination__prev),
:deep(.varo-pagination__next) {
  min-width: 72px;
  padding-right: 16px;
  padding-left: 16px;
}

:deep(.varo-pagination button[data-active='true']) {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
}

:deep(.varo-pagination button:disabled) {
  opacity: 0.45;
}

:deep(.varo-pagination__simple) {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  color: var(--vp-c-text-2);
}

.platform-demo__side-navbar-demo {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  min-height: 280px;
}

:deep(.varo-side-navbar) {
  display: grid;
  align-content: start;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(100, 116, 139, 0.1);
}

:deep(.varo-side-navbar__item) {
  position: relative;
  min-height: 48px;
  border: 0;
  border-left: 3px solid transparent;
  background: transparent;
  color: var(--vp-c-text-2);
  font-weight: 650;
}

:deep(.varo-side-navbar__item[data-active='true']) {
  border-left-color: var(--vp-c-brand-1);
  background: rgba(255, 255, 255, 0.78);
  color: var(--vp-c-brand-1);
}

:deep(.varo-side-navbar__badge) {
  top: 8px;
  right: 10px;
}

.platform-demo__side-navbar-panel {
  align-content: center;
}

.platform-demo__tabbar-demo {
  align-content: stretch;
  min-height: 300px;
}

.platform-demo__tabbar-page {
  align-content: center;
  min-height: 180px;
}

:deep(.varo-tabbar) {
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: 16px;
  display: flex;
  min-height: 58px;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 -8px 28px rgba(15, 23, 42, 0.08);
}

:deep(.varo-tabbar__item) {
  position: relative;
  display: grid;
  flex: 1;
  place-items: center;
  gap: 2px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.76rem;
}

:deep(.varo-tabbar__item[data-active='true']) {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  top: 7px;
  right: calc(50% - 22px);
}

:deep(.varo-tabbar__dot) {
  min-width: 8px;
  width: 8px;
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
  border-radius: 16px;
  background: rgba(100, 116, 139, 0.1);
}

:deep(.varo-tabs__tab) {
  flex: 1;
  min-height: 36px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-weight: 700;
}

:deep(.varo-tabs__tab[data-active='true']) {
  background: var(--vp-c-brand-1);
  color: #fff;
}

:deep(.varo-tabs__content) {
  min-height: 150px;
}

.platform-demo__tabs-panel {
  min-height: 150px;
  align-content: center;
}

.platform-demo__divider-inline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
}

:deep(.varo-divider) {
  display: flex;
  align-items: center;
  margin: var(--varo-divider-spacing, 8px) 0;
  color: var(--varo-divider-text-color, var(--vp-c-text-2));
  font-size: 0.82rem;
}

:deep(.varo-divider::before),
:deep(.varo-divider::after) {
  flex: 1;
  border-top: 1px solid var(--varo-divider-line-color, rgba(148, 163, 184, 0.34));
  content: '';
}

:deep(.varo-divider[data-dashed='true']::before),
:deep(.varo-divider[data-dashed='true']::after) {
  border-top-style: dashed;
}

:deep(.varo-divider[data-content-position='left']::before) {
  max-width: 10%;
}

:deep(.varo-divider[data-content-position='right']::after) {
  max-width: 10%;
}

:deep(.varo-divider[data-vertical='true']) {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin: 0 4px;
  background: var(--varo-divider-line-color, rgba(148, 163, 184, 0.44));
  vertical-align: middle;
}

:deep(.varo-divider[data-vertical='true']::before),
:deep(.varo-divider[data-vertical='true']::after) {
  content: none;
}

:deep(.varo-divider__text) {
  padding: 0 12px;
}

:deep(.varo-grid) {
  display: grid;
  grid-template-columns: repeat(var(--varo-grid-columns, 4), minmax(0, 1fr));
  gap: var(--varo-grid-gutter, 0);
}

:deep(.varo-grid__item) {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 8px;
  min-height: 72px;
  padding: 12px 6px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.88);
  color: var(--vp-c-text-1);
  text-align: center;
  text-decoration: none;
  box-sizing: border-box;
}

:deep(.varo-grid__icon-wrap) {
  position: relative;
  display: inline-flex;
}

:deep(.varo-grid__icon) {
  color: var(--vp-c-brand-1);
  font-size: 1.1rem;
}

:deep(.varo-grid__text) {
  font-size: 0.75rem;
}

:deep(.varo-grid__badge),
:deep(.varo-grid__dot) {
  position: absolute;
  top: -8px;
  right: -12px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-size: 0.65rem;
  line-height: 16px;
}

:deep(.varo-grid__dot) {
  min-width: 8px;
  width: 8px;
  height: 8px;
  padding: 0;
}

:deep(.varo-row) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--varo-row-gutter-y, 0) var(--varo-row-gutter-x, 0);
}

:deep(.varo-row[data-justify='center']) {
  justify-content: center;
}

:deep(.varo-row[data-justify='space-between']) {
  justify-content: space-between;
}

:deep(.varo-col) {
  box-sizing: border-box;
  flex: 0 0 calc(var(--varo-col-span, 24) / 24 * 100%);
  max-width: calc(var(--varo-col-span, 24) / 24 * 100%);
  margin-left: calc(var(--varo-col-offset, 0) / 24 * 100%);
}

:deep(.varo-col > span) {
  display: block;
  padding: 10px 0;
  border-radius: 12px;
  background: rgba(15, 118, 110, 0.12);
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
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

.platform-demo__sticky-demo {
  max-height: 260px;
  overflow-y: auto;
}

.platform-demo__sticky-bar {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
}

.platform-demo__sticky-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.platform-demo__sticky-list span {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(100, 116, 139, 0.12);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

.platform-demo__image-item {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 16px;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

.platform-demo__image-item:first-child {
  grid-row: span 2;
  align-content: center;
}

:deep(.varo-image) {
  position: relative;
  display: inline-flex;
  flex: none;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background: rgba(100, 116, 139, 0.12);
  color: var(--vp-c-text-2);
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
  background: rgba(241, 245, 249, 0.94);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 700;
}

.platform-demo__overlay-demo,
.platform-demo__popup-demo {
  position: relative;
  display: grid;
  align-content: start;
  gap: 14px;
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
  background: rgba(15, 23, 42, 0.58);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
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
  background: rgba(15, 23, 42, 0.44);
  pointer-events: auto;
  backdrop-filter: blur(3px);
}

.platform-demo__popup-demo :deep(.varo-popup__content) {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 14px;
  border-radius: 22px 22px 0 0;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -18px 54px rgba(15, 23, 42, 0.18);
  pointer-events: auto;
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='top']) {
  top: 0;
  bottom: auto;
  border-radius: 0 0 22px 22px;
}

.platform-demo__popup-demo :deep(.varo-popup__content[data-position='center']) {
  top: 50%;
  right: 20px;
  bottom: auto;
  left: 20px;
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
  border: 0;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.14);
  color: var(--vp-c-text-2);
  cursor: pointer;
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
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  line-height: 1.45;
}

.platform-demo__trigger,
.platform-demo__dialog-close,
:deep(.varo-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  width: 100%;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
}

:deep(.varo-button[data-size='sm']) {
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 0.82rem;
}

:deep(.varo-button[data-size='md']) {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 16px;
  font-size: 0.92rem;
}

:deep(.varo-button[data-size='lg']) {
  gap: 10px;
  min-height: 50px;
  padding: 0 20px;
  border-radius: 18px;
  font-size: 1rem;
}

.platform-demo__trigger,
.platform-demo__dialog-close,
:deep(.varo-button[data-variant='solid']) {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
}

:deep(.varo-button[data-loading='true']),
:deep(.varo-button[data-disabled='true']) {
  opacity: 0.72;
  cursor: not-allowed;
}

:deep(.varo-button[data-variant='outline']) {
  background: transparent;
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

:deep(.varo-button[data-variant='ghost']) {
  background: rgba(15, 118, 110, 0.1);
  color: var(--vp-c-brand-1);
}

:deep(.varo-button[data-tone='success'][data-variant='solid']) {
  background: #16a34a;
}

:deep(.varo-button[data-tone='warning'][data-variant='solid']) {
  background: #d97706;
}

:deep(.varo-button[data-tone='danger'][data-variant='solid']) {
  background: #dc2626;
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
  border: 2px solid currentColor;
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
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  box-sizing: border-box;
}

:deep(.varo-input__control) {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
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
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

:deep(.varo-input__clear) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.14);
  cursor: pointer;
}

:deep(.varo-input[data-invalid='true'] .varo-input__body) {
  border-color: rgba(185, 28, 28, 0.52);
}

:deep(.varo-cell-group) {
  display: grid;
  gap: 8px;
}

.platform-demo__cell-demo {
  display: grid;
  gap: 14px;
  width: 100%;
}

:deep(.varo-cell-group__header) {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  padding: 0 4px;
}

:deep(.varo-cell-group__title) {
  font-size: 0.86rem;
  font-weight: 700;
}

:deep(.varo-cell-group__desc) {
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
}

:deep(.varo-cell-group__body) {
  overflow: hidden;
  border-radius: var(--varo-cell-round-radius, 16px);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

:deep(.varo-cell) {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 52px;
  padding: 12px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  box-sizing: border-box;
}

:deep(.varo-cell + .varo-cell) {
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

:deep(.varo-cell[data-center='true']) {
  align-items: center;
}

:deep(.varo-cell[data-clickable='true']) {
  cursor: pointer;
}

:deep(.varo-cell[data-size='large']) {
  min-height: 64px;
  padding-block: 14px;
}

:deep(.varo-cell__icon),
:deep(.varo-cell__link) {
  flex: none;
  color: var(--vp-c-brand-1);
}

:deep(.varo-cell__main) {
  flex: 1;
  min-width: 0;
}

:deep(.varo-cell__title) {
  font-size: 0.9rem;
  font-weight: 650;
}

:deep(.varo-cell__subtitle) {
  margin-top: 3px;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
}

:deep(.varo-cell__desc) {
  flex: none;
  max-width: 42%;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
  text-align: right;
}

:deep(.varo-cell[data-desc-align='left'] .varo-cell__desc) {
  text-align: left;
}

.platform-demo__switch {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
}

.platform-demo__switch::after {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #fff;
  content: '';
}

.platform-demo__overlay {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(4px);
}

.platform-demo__dialog {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  display: block;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.22);
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

@media (max-width: 960px) {
  .platform-demo__head,
  .platform-demo__stage {
    grid-template-columns: 1fr;
    display: grid;
  }

  .platform-demo__head {
    gap: 14px;
  }
}

@media (max-width: 640px) {
  .platform-demo {
    padding: 18px;
    border-radius: 24px;
  }

  .platform-demo__panel {
    padding: 16px;
  }

  .platform-demo__meta-grid {
    grid-template-columns: 1fr;
  }
}

.platform-demo {
  border-color: var(--varo-border);
  border-radius: var(--varo-radius-lg);
  background: var(--varo-card);
  box-shadow: var(--varo-shadow-sm);
}

.platform-demo__head h2,
.platform-demo__meta-card span,
.platform-demo__control-group span,
.platform-demo__preview-label {
  letter-spacing: 0;
}

.platform-demo__meta-card span,
.platform-demo__control-group span,
.platform-demo__preview-label {
  color: var(--varo-muted);
  text-transform: none;
}

.platform-demo__panel,
.platform-demo__meta-card,
.platform-demo__control-group,
.platform-demo__code-block,
.platform-demo__card,
.platform-demo__divider-demo,
.platform-demo__grid-demo,
.platform-demo__image-item,
.platform-demo__layout-demo,
.platform-demo__nav-demo,
.platform-demo__overlay-demo,
.platform-demo__popup-demo,
.platform-demo__space-demo,
.platform-demo__sticky-demo {
  border-color: var(--varo-border);
  border-radius: var(--varo-radius-lg);
  background: var(--varo-card-solid);
  box-shadow: var(--varo-shadow-sm);
}

.platform-demo__chip,
.platform-demo__code-toggle,
.platform-demo__code-tabs,
.platform-demo__code-tab,
.platform-demo__code-block pre,
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
:deep(.varo-pagination button),
:deep(.varo-side-navbar),
:deep(.varo-tabbar),
:deep(.varo-tabs__nav),
:deep(.varo-tabs__tab),
:deep(.varo-grid__item),
:deep(.varo-col > span),
:deep(.varo-divider[data-vertical='true']),
:deep(.varo-popup__content),
:deep(.varo-popup__close),
:deep(.varo-cell-group__body) {
  border-radius: var(--varo-radius);
}

.platform-demo__chip[data-active='true'],
.platform-demo__code-tab[data-active='true'],
.platform-demo__trigger,
.platform-demo__dialog-close,
.platform-demo__sticky-bar,
:deep(.varo-button[data-variant='solid']),
:deep(.varo-fixed-nav__trigger),
:deep(.varo-elevator__index[data-active='true']),
:deep(.varo-pagination button[data-active='true']),
:deep(.varo-tabs__tab[data-active='true']) {
  border-color: var(--varo-primary);
  background: var(--varo-primary);
  color: var(--varo-primary-foreground);
  box-shadow: var(--varo-shadow-sm);
}

.platform-demo__chip,
.platform-demo__code-toggle,
.platform-demo__code-tabs,
:deep(.varo-button[data-variant='outline']),
:deep(.varo-menu),
:deep(.varo-menu__popup),
:deep(.varo-navbar),
:deep(.varo-pagination button),
:deep(.varo-fixed-nav__item),
:deep(.varo-cell-group__body) {
  border-color: var(--varo-border);
  background: var(--varo-card-solid);
  color: var(--varo-foreground);
}

.platform-demo__code-toggle:hover,
.platform-demo__code-toggle[data-active='true'],
.platform-demo__code-tab:hover,
:deep(.varo-menu__option:not(:disabled):hover),
:deep(.varo-grid__item),
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
  background: var(--varo-card-muted);
  color: var(--varo-foreground);
}

:deep(.varo-button[data-variant='ghost']) {
  background: var(--varo-card-muted);
  color: var(--varo-foreground);
}

:deep(.varo-input__body),
:deep(.varo-cell-group__body),
:deep(.varo-menu__popup),
:deep(.varo-popup__content),
.platform-demo__dialog {
  border-color: var(--varo-border);
  background: var(--varo-card-solid);
  box-shadow: var(--varo-shadow-popover);
}

.platform-demo__overlay,
.platform-demo__overlay-demo :deep(.varo-overlay),
.platform-demo__popup-demo :deep(.varo-popup__overlay) {
  background: rgba(24, 24, 27, 0.58);
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
:deep(.varo-grid__icon),
.platform-demo__indicator-slide span {
  color: var(--varo-accent);
}

:deep(.varo-side-navbar__item[data-active='true']) {
  border-left-color: var(--varo-accent);
  background: var(--varo-card-solid);
}

:deep(.varo-tabbar) {
  border: 1px solid var(--varo-border);
}

:deep(.varo-grid__badge),
:deep(.varo-grid__dot),
:deep(.varo-fixed-nav__badge),
:deep(.varo-side-navbar__badge),
:deep(.varo-tabbar__badge),
:deep(.varo-tabbar__dot) {
  background: var(--varo-danger);
}

.platform-demo__code-tab[data-active='true'] {
  transform: none;
}

@media (max-width: 640px) {
  .platform-demo {
    border-radius: var(--varo-radius-lg);
  }
}
</style>
