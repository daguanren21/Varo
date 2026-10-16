<script setup lang="ts">
import { computed, onBeforeUnmount, onHide, onShow, onUnload, shallowRef } from 'wevu'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VIcon from '../../components/ui/v-icon.vue'
import VImage from '../../components/ui/v-image.vue'
import VIndicator from '../../components/ui/v-indicator.vue'
import VMenuItem from '../../components/ui/v-menu-item.vue'
import VMenu from '../../components/ui/v-menu.vue'
import VNavbar from '../../components/ui/v-navbar.vue'
import VPagination from '../../components/ui/v-pagination.vue'
import VSteps from '../../components/ui/v-steps.vue'
import VTab from '../../components/ui/v-tab.vue'
import VTabbarItem from '../../components/ui/v-tabbar-item.vue'
import VTabbar from '../../components/ui/v-tabbar.vue'
import VTabs from '../../components/ui/v-tabs.vue'
import { useDocsDemo } from '../../lib/docs-demo'
import agentChatImage from '../assets/agent-chat.png?url'
import retailCategoryImage from '../assets/retail-category.png?url'
import retailHomeImage from '../assets/retail-home.png?url'
import retailOrderListImage from '../assets/retail-order-list.png?url'

type NavigationName = string | number
type MenuSelection = [value: NavigationName, option: { text: string, value: NavigationName }]

const { component, en, theme } = useDocsDemo('indicator')
const indicatorCurrent = shallowRef(0)
const menuActiveName = shallowRef<NavigationName | undefined>(undefined)
const menuValue = shallowRef<NavigationName>('recommended')
const menuStockValue = shallowRef<NavigationName>('all')
const navbarAction = shallowRef<'back' | 'help' | ''>('')
const paginationPage = shallowRef(2)
const stepsCurrent = shallowRef(0)
const tabbarActive = shallowRef<NavigationName>('home')
const tabsActive = shallowRef<NavigationName>('overview')

const indicatorCopy = computed(() => ({
  dots: en.value ? 'Dots' : '圆点',
  lines: en.value ? 'Lines' : '线条',
  navigationLabel: en.value ? 'Feature carousel pagination' : '功能轮播分页',
  itemLabel: en.value ? 'Feature {index} of {total}' : '第 {index} 个功能，共 {total} 个',
  items: en.value
    ? [
        { tag: 'Registry', title: 'Own the source', body: 'Install editable target-correct components into your project.', image: retailHomeImage },
        { tag: 'Dual runtime', title: 'One public API', body: 'Use the same contracts on H5 and Wevu mini-programs.', image: retailCategoryImage },
        { tag: 'Agent UI', title: 'Model-neutral', body: 'Render streaming, tools, reasoning, and approvals.', image: agentChatImage },
        { tag: 'Release', title: 'Production ready', body: 'Validate types, tests, builds, Registry paths, and docs.', image: retailOrderListImage },
      ]
    : [
        { tag: 'Registry', title: '源码归属业务', body: '把可编辑、目标正确的组件源码安装进项目。', image: retailHomeImage },
        { tag: '双端运行', title: '一套公共 API', body: 'H5 与 Wevu 小程序共享组件契约。', image: retailCategoryImage },
        { tag: 'Agent UI', title: '模型无关', body: '覆盖流式文本、工具、推理与审批。', image: agentChatImage },
        { tag: '发布保障', title: '生产可用', body: '验证类型、测试、构建、Registry 路径与文档。', image: retailOrderListImage },
      ],
}))
const currentIndicatorItem = computed(() => indicatorCopy.value.items[indicatorCurrent.value]!)
const indicatorPosition = computed(() => `${String(indicatorCurrent.value + 1).padStart(2, '0')} / 04`)

const menuCopy = computed(() => ({
  title: en.value ? 'Product catalog' : '商品列表',
  count: en.value ? '128 products' : '128 件商品',
  sort: en.value ? 'Sort' : '排序',
  stock: en.value ? 'Availability' : '库存',
  result: en.value ? 'Filters' : '当前筛选',
  sortOptions: en.value
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
  stockOptions: en.value
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
  products: en.value
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
const menuSortLabel = computed(() => menuCopy.value.sortOptions.find(option => option.value === menuValue.value)?.text ?? '')
const menuStockLabel = computed(() => menuCopy.value.stockOptions.find(option => option.value === menuStockValue.value)?.text ?? '')

function selectMenuSort([value]: MenuSelection) {
  menuValue.value = value
}

function selectMenuStock([value]: MenuSelection) {
  menuStockValue.value = value
}

const navbarCopy = computed(() => ({
  title: en.value ? 'Order details' : '订单详情',
  back: en.value ? 'Back' : '返回',
  help: en.value ? 'Help' : '帮助',
  status: en.value ? 'Shipped' : '已发货',
  statusHint: en.value ? 'Expected tomorrow before 18:00' : '预计明日 18:00 前送达',
  order: en.value ? 'Order number' : '订单编号',
  orderValue: '1042',
  recipient: en.value ? 'Recipient' : '收货人',
  recipientValue: en.value ? 'Lin · 138****2042' : '林默 · 138****2042',
  total: en.value ? 'Paid' : '实付款',
  totalValue: '¥279',
  action: en.value ? 'Action' : '操作',
}))
const navbarActionLabel = computed(() => navbarAction.value ? navbarCopy.value[navbarAction.value] : '')

const paginationCopy = computed(() => ({
  title: en.value ? 'All orders' : '全部订单',
  total: en.value ? '15 orders' : '共 15 笔',
  page: en.value ? 'Page' : '第',
  pageSuffix: en.value ? 'of 5' : '页 / 共 5 页',
  navigationLabel: en.value ? 'Order pages' : '订单分页',
  itemLabel: en.value ? 'Page {page} of {total}' : '第 {page} 页，共 {total} 页',
  previous: en.value ? 'Previous' : '上一页',
  next: en.value ? 'Next' : '下一页',
  statuses: en.value ? ['Shipped', 'Completed', 'Pending payment'] : ['已发货', '已完成', '待付款'],
}))
const paginationOrders = computed(() => {
  const page = paginationPage.value
  const base = 1048 - page * 3
  const amounts = [`¥${279 - page * 10}`, `¥${168 + page * 5}`, `¥${99 + page}`]
  return paginationCopy.value.statuses.map((status, index) => ({
    id: `#${base - index}`,
    status,
    amount: amounts[index]!,
  }))
})

// Steps has no published H5 demo; retain the Registry catalog's Start/Complete data.
const stepsCopy = computed(() => ({
  basic: en.value ? 'Basic usage' : '基础用法',
  clickable: en.value ? 'Clickable steps' : '可点击步骤',
  vertical: en.value ? 'Vertical steps' : '竖向步骤',
  current: en.value ? 'Current step' : '当前步骤',
  items: en.value ? ['Start', 'Complete'] : ['开始', '完成'],
}))
const currentStepTitle = computed(() => stepsCopy.value.items[stepsCurrent.value]!)

const tabbarIcons = [
  'M3 11 12 3l9 8 M5 10v10h14V10 M9 20v-6h6v6',
  'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  'M4 5h16v12H8l-4 4z M8 9h8 M8 13h5',
  'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M5 21a7 7 0 0 1 14 0',
].map((path) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`
  const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  return {
    'backgroundColor': 'currentColor',
    'maskImage': mask,
    'maskPosition': 'center',
    'maskRepeat': 'no-repeat',
    'maskSize': 'contain',
    '-webkit-mask-image': mask,
    '-webkit-mask-position': 'center',
    '-webkit-mask-repeat': 'no-repeat',
    '-webkit-mask-size': 'contain',
  }
})
const tabbarCopy = computed(() => ({
  navigationLabel: en.value ? 'Primary navigation' : '主要导航',
  items: en.value
    ? [
        { name: 'home', title: 'Home', body: 'Overview, recommendations, and recent activity.', iconStyle: tabbarIcons[0] },
        { name: 'category', title: 'Catalog', body: 'Browse components, Blocks, and templates.', iconStyle: tabbarIcons[1] },
        { name: 'messages', title: 'Messages', body: 'Two unread release and support updates.', iconStyle: tabbarIcons[2], badge: 2 },
        { name: 'profile', title: 'Profile', body: 'Subscription, settings, and account security.', iconStyle: tabbarIcons[3], dot: true },
      ]
    : [
        { name: 'home', title: '首页', body: '概览、推荐内容和最近动态。', iconStyle: tabbarIcons[0] },
        { name: 'category', title: '分类', body: '浏览组件、Blocks 与模板。', iconStyle: tabbarIcons[1] },
        { name: 'messages', title: '消息', body: '有 2 条发布和支持消息未读。', iconStyle: tabbarIcons[2], badge: 2 },
        { name: 'profile', title: '我的', body: '订阅、设置与账号安全。', iconStyle: tabbarIcons[3], dot: true },
      ],
}))
const currentTabbarItem = computed(() => tabbarCopy.value.items.find(item => item.name === tabbarActive.value)!)
const tabsCopy = computed(() => ({
  navigationLabel: en.value ? 'Product detail sections' : '产品详情分区',
  items: en.value
    ? [
        { title: 'Overview', name: 'overview', body: 'Key metrics and recent activity' },
        { title: 'Details', name: 'detail', body: 'Lists, filters, and status switching' },
        { title: 'Config', name: 'config', body: 'Basic settings and rules' },
      ]
    : [
        { title: '概览', name: 'overview', body: '核心数据和最近动态' },
        { title: '明细', name: 'detail', body: '列表、筛选和状态切换' },
        { title: '配置', name: 'config', body: '基础设置与策略' },
      ],
}))

let indicatorTimer: ReturnType<typeof setInterval> | undefined

function stopIndicator() {
  if (indicatorTimer === undefined) { return }
  clearInterval(indicatorTimer)
  indicatorTimer = undefined
}

onShow(() => {
  stopIndicator()
  if (component.value !== 'indicator') { return }
  indicatorTimer = setInterval(() => {
    indicatorCurrent.value = (indicatorCurrent.value + 1) % indicatorCopy.value.items.length
  }, 1800)
})
onHide(stopIndicator)
onUnload(stopIndicator)
onBeforeUnmount(stopIndicator)
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <view class="docs-navigation min-w-0">
      <view v-if="component === 'indicator'" class="docs-demo__section grid gap-3.5">
        <view class="relative box-border grid min-h-[158px] content-center gap-2.5 overflow-hidden rounded-2xl border border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)] p-4" data-docs-case="indicator-carousel">
          <view class="absolute inset-0" aria-hidden="true">
            <VImage :src="currentIndicatorItem.image" fit="cover" width="100%" height="100%" />
          </view>
          <view class="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,8,10,0.92),rgba(5,8,10,0.58))]" />
          <view class="relative flex items-center justify-between gap-2 text-[11px] font-bold text-[var(--varo-ui-primary)]">
            <text>{{ currentIndicatorItem.tag }}</text>
            <text>{{ indicatorPosition }}</text>
          </view>
          <text class="relative text-base font-bold text-white">
            {{ currentIndicatorItem.title }}
          </text>
          <text class="relative text-xs leading-normal text-white/80">
            {{ currentIndicatorItem.body }}
          </text>
        </view>
        <view class="grid gap-2">
          <view class="flex min-h-9 items-center justify-between gap-3 rounded-[10px] bg-[var(--varo-ui-fill-light)] px-2.5 py-2" data-docs-case="indicator-dots">
            <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ indicatorCopy.dots }}
            </text>
            <VIndicator :aria-label="indicatorCopy.navigationLabel" :item-aria-label="indicatorCopy.itemLabel" :total="indicatorCopy.items.length" :current="indicatorCurrent" @update:current="indicatorCurrent = $event" />
          </view>
          <view class="flex min-h-9 items-center justify-between gap-3 rounded-[10px] bg-[var(--varo-ui-fill-light)] px-2.5 py-2" data-docs-case="indicator-lines">
            <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ indicatorCopy.lines }}
            </text>
            <VIndicator :aria-label="indicatorCopy.navigationLabel" :item-aria-label="indicatorCopy.itemLabel" :total="indicatorCopy.items.length" :current="indicatorCurrent" type="line" @update:current="indicatorCurrent = $event" />
          </view>
        </view>
      </view>

      <view v-else-if="component === 'menu'" class="docs-demo__section min-h-[360px]" data-docs-case="menu-catalog">
        <view class="docs-demo__card grid gap-3">
          <view class="flex flex-wrap items-center justify-between gap-2">
            <text class="text-sm font-bold">
              {{ menuCopy.title }}
            </text>
            <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ menuCopy.count }}
            </text>
          </view>
          <VMenu :active-name="menuActiveName" @update:active-name="menuActiveName = $event">
            <VMenuItem :model-value="menuValue" name="sort" :title="menuCopy.sort" :options="menuCopy.sortOptions" @select="selectMenuSort" />
            <VMenuItem :model-value="menuStockValue" name="stock" :title="menuCopy.stock" :options="menuCopy.stockOptions" @select="selectMenuStock" />
          </VMenu>
          <view class="flex flex-wrap items-center gap-2 text-[11px]" role="status" aria-live="polite" data-docs-case="menu-filters">
            <text class="rounded-md bg-[var(--varo-ui-fill-light)] px-1.5 py-1 text-[var(--varo-ui-text-muted)]">
              {{ menuCopy.result }}
            </text>
            <text class="font-bold text-[var(--varo-ui-primary)]">
              {{ menuSortLabel }} · {{ menuStockLabel }}
            </text>
          </view>
          <view class="grid gap-2">
            <view v-for="product in menuCopy.products" :key="product.name" class="flex items-center justify-between gap-2 rounded-[10px] border border-[var(--varo-ui-border)] px-2.5 py-2">
              <view class="grid min-w-0 gap-0.5">
                <text class="text-xs font-bold">
                  {{ product.name }}
                </text>
                <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
                  {{ product.meta }}
                </text>
              </view>
              <text class="shrink-0 text-xs font-bold">
                {{ product.price }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="component === 'navbar'" class="docs-demo__section grid gap-3" data-docs-case="navbar-order">
        <VNavbar :title="navbarCopy.title" :left-text="navbarCopy.back" :left-aria-label="navbarCopy.back" :right-text="navbarCopy.help" :right-aria-label="navbarCopy.help" left-arrow @click-left="navbarAction = 'back'" @click-right="navbarAction = 'help'" />
        <view class="docs-demo__card grid gap-3">
          <view class="grid gap-1 rounded-[10px] bg-[var(--varo-ui-primary-soft)] p-3">
            <text class="text-[13px] font-bold text-[var(--varo-ui-primary)]">
              {{ navbarCopy.status }}
            </text>
            <text class="text-[11px] text-[var(--varo-ui-text-regular)]">
              {{ navbarCopy.statusHint }}
            </text>
          </view>
          <view class="grid gap-2 text-xs">
            <view class="flex flex-wrap items-center justify-between gap-2">
              <text class="text-[var(--varo-ui-text-muted)]">
                {{ navbarCopy.order }}
              </text>
              <text>{{ navbarCopy.orderValue }}</text>
            </view>
            <view class="flex flex-wrap items-center justify-between gap-2">
              <text class="text-[var(--varo-ui-text-muted)]">
                {{ navbarCopy.recipient }}
              </text>
              <text>{{ navbarCopy.recipientValue }}</text>
            </view>
            <view class="flex flex-wrap items-center justify-between gap-2">
              <text class="text-[var(--varo-ui-text-muted)]">
                {{ navbarCopy.total }}
              </text>
              <text>{{ navbarCopy.totalValue }}</text>
            </view>
          </view>
          <text v-if="navbarAction" class="text-xs font-bold text-[var(--varo-ui-primary)]" role="status" aria-live="polite" data-docs-case="navbar-action">
            {{ navbarCopy.action }}：{{ navbarActionLabel }}
          </text>
        </view>
      </view>

      <view v-else-if="component === 'pagination'" class="docs-demo__section min-h-[390px]" data-docs-case="pagination-orders">
        <view class="docs-demo__card grid min-w-0 gap-3">
          <view class="flex flex-wrap items-center justify-between gap-2">
            <text class="text-sm font-bold">
              {{ paginationCopy.title }}
            </text>
            <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ paginationCopy.total }}
            </text>
          </view>
          <view class="grid gap-2">
            <view v-for="order in paginationOrders" :key="order.id" class="flex items-center justify-between gap-2 rounded-[10px] border border-[var(--varo-ui-border)] px-2.5 py-2">
              <view class="grid gap-0.5">
                <text class="text-xs font-bold">
                  {{ order.id }}
                </text>
                <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
                  {{ order.status }}
                </text>
              </view>
              <text class="text-xs font-bold">
                {{ order.amount }}
              </text>
            </view>
          </view>
          <text class="text-[11px] text-[var(--varo-ui-text-muted)]" role="status" aria-live="polite">
            {{ paginationCopy.page }} {{ paginationPage }} {{ paginationCopy.pageSuffix }}
          </text>
          <VPagination :aria-label="paginationCopy.navigationLabel" :item-aria-label="paginationCopy.itemLabel" :model-value="paginationPage" :page-count="5" :prev-text="paginationCopy.previous" :next-text="paginationCopy.next" @update:model-value="paginationPage = $event" />
        </view>
      </view>

      <template v-else-if="component === 'steps'">
        <view class="docs-demo__section docs-demo__stack" data-docs-case="steps-basic">
          <text class="docs-demo__heading">
            {{ stepsCopy.basic }}
          </text>
          <VSteps :items="stepsCopy.items" />
        </view>
        <view class="docs-demo__section docs-demo__stack" data-docs-case="steps-clickable">
          <text class="docs-demo__heading">
            {{ stepsCopy.clickable }}
          </text>
          <VSteps :items="stepsCopy.items" :current="stepsCurrent" clickable @update:current="stepsCurrent = $event" />
          <text class="docs-demo__value" role="status" aria-live="polite">
            {{ stepsCopy.current }}：{{ currentStepTitle }}
          </text>
        </view>
        <view class="docs-demo__section docs-demo__stack" data-docs-case="steps-vertical">
          <text class="docs-demo__heading">
            {{ stepsCopy.vertical }}
          </text>
          <VSteps :items="stepsCopy.items" :current="1" direction="vertical" />
        </view>
      </template>

      <view v-else-if="component === 'tabbar'" class="docs-demo__section relative grid min-h-[320px] content-start gap-3" data-docs-case="tabbar-navigation">
        <view class="docs-demo__card grid min-h-[205px] content-center gap-2" role="status" aria-live="polite" data-docs-case="tabbar-content">
          <text class="text-[11px] font-bold text-[var(--varo-ui-primary)]">
            {{ currentTabbarItem.title }}
          </text>
          <text class="text-lg font-bold">
            {{ currentTabbarItem.title }}
          </text>
          <text class="text-xs leading-normal text-[var(--varo-ui-text-regular)]">
            {{ currentTabbarItem.body }}
          </text>
        </view>
        <view class="mt-3" :aria-label="tabbarCopy.navigationLabel" role="navigation">
          <VTabbar :model-value="tabbarActive" @update:model-value="tabbarActive = $event">
            <VTabbarItem v-for="item in tabbarCopy.items" :key="item.name" :name="item.name" :badge="item.badge" :dot="item.dot">
              <template #icon>
                <VIcon :size="20">
                  <view class="block h-full w-full" :style="item.iconStyle" aria-hidden="true" />
                </VIcon>
              </template>
              {{ item.title }}
            </VTabbarItem>
          </VTabbar>
        </view>
      </view>

      <view v-else-if="component === 'tabs'" class="docs-demo__section" data-docs-case="tabs-sections">
        <VTabs :aria-label="tabsCopy.navigationLabel" :active="tabsActive" @update:active="tabsActive = $event">
          <VTab v-for="item in tabsCopy.items" :key="item.name" :name="item.name" :title="item.title">
            <view class="grid min-h-[150px] content-center gap-2 rounded-2xl bg-[var(--varo-ui-fill-light)] p-4">
              <text class="text-sm font-bold">
                {{ item.title }}
              </text>
              <text class="text-xs text-[var(--varo-ui-text-regular)]">
                {{ item.body }}
              </text>
            </view>
          </VTab>
        </VTabs>
      </view>
    </view>
  </DocsDemoPage>
</template>

<style>
.docs-navigation .varo-menu__popup {
  min-width: 0;
}

.docs-navigation .varo-menu__option.varo-menu__option {
  display: flex;
  justify-content: space-between;
  padding: 8px;
}

.docs-navigation .varo-menu__option-text {
  white-space: normal;
}

.docs-navigation .varo-navbar {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 60px;
  align-items: center;
  min-height: 48px;
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 14px;
}

.docs-navigation .varo-navbar__left.varo-navbar__left,
.docs-navigation .varo-navbar__right.varo-navbar__right {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  font-size: 12px;
  color: var(--varo-ui-primary);
  background: transparent;
  border: 0;
}

.docs-navigation .varo-navbar__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.docs-navigation .varo-pagination {
  flex-wrap: wrap;
  font-size: 11px;
}

.docs-navigation .varo-tabbar {
  display: flex;
  min-height: 62px;
  overflow: hidden;
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: 17px;
  box-shadow: var(--varo-ui-shadow-sm);
}

.docs-navigation .varo-tabbar__item.varo-tabbar__item {
  position: relative;
  display: grid;
  flex: 1;
  gap: 3px;
  place-content: center;
  place-items: center;
  min-width: 0;
  min-height: 62px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--varo-ui-text-regular);
  background: transparent;
  border: 0;
}

.docs-navigation .varo-tabbar__item[data-active='true'] {
  font-weight: 700;
  color: var(--varo-ui-primary);
}

.docs-navigation .varo-tabbar__badge,
.docs-navigation .varo-tabbar__dot {
  position: absolute;
  top: 6px;
  right: calc(50% - 22px);
  box-sizing: border-box;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 16px;
  color: var(--varo-ui-primary-foreground);
  background: var(--varo-ui-primary);
  border-radius: 999px;
}

.docs-navigation .varo-tabbar__dot {
  width: 8px;
  min-width: 8px;
  height: 8px;
  padding: 0;
}

.docs-navigation .varo-tabs__nav {
  gap: 8px;
  padding: 6px;
  background: var(--varo-ui-fill-light);
  border: 0;
  border-radius: 16px;
}

.docs-navigation .varo-tabs__tab.varo-tabs__tab {
  flex: 1;
  min-width: 0;
  min-height: 36px;
  padding: 8px 4px;
  font-size: 12px;
  font-weight: 700;
  border: 0;
  border-radius: 12px;
}

.docs-navigation .varo-tabs[data-type='line'] .varo-tabs__tab[data-active='true'] {
  color: var(--varo-ui-primary-foreground);
  background: var(--varo-ui-primary);
}
</style>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Navigation",
  "usingComponents": {}
}
</json>
