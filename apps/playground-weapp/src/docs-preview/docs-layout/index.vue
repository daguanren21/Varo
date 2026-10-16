<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'wevu'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VAvatar from '../../components/ui/avatar.vue'
import VBreadcrumb from '../../components/ui/v-breadcrumb.vue'
import VButton from '../../components/ui/v-button.vue'
import VCellGroup from '../../components/ui/v-cell-group.vue'
import VCell from '../../components/ui/v-cell.vue'
import VCol from '../../components/ui/v-col.vue'
import VDivider from '../../components/ui/v-divider.vue'
import VGridItem from '../../components/ui/v-grid-item.vue'
import VGrid from '../../components/ui/v-grid.vue'
import VIcon from '../../components/ui/v-icon.vue'
import VList from '../../components/ui/v-list.vue'
import VRow from '../../components/ui/v-row.vue'
import VSafeArea from '../../components/ui/v-safe-area.vue'
import VSpace from '../../components/ui/v-space.vue'
import VSticky from '../../components/ui/v-sticky.vue'
import VSwitch from '../../components/ui/v-switch.vue'
import { useDocsDemo } from '../../lib/docs-demo'

const { component, en, theme } = useDocsDemo('cell')
const gap: [number, number] = [8, 8]
const allEdges: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left']
const opened = computed(() => en.value ? 'Opened' : '已打开')

function iconMask(path: string, strokeWidth = 1.7) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`
  const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  return {
    'width': '100%',
    'height': '100%',
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
}

const securityIcon = iconMask('M12 3 5.5 5.7v5.1c0 4.2 2.7 8.1 6.5 9.2 3.8-1.1 6.5-5 6.5-9.2V5.7L12 3Z M9.2 11.7l1.8 1.8 3.8-4', 1.8)
const notificationIcon = iconMask('M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Z M10 21h4', 1.8)
const serviceIcons = [
  'M5 7h14v12H5z M8 4h8v3 M8 11h8 M8 15h5',
  'M3 7h11v9H3z M14 10h4l3 3v3h-7z M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  'M4 7h16v10H4z M8 7a2 2 0 0 0 0 4 M16 13a2 2 0 0 0 0 4 M12 7v10',
  'M12 20S4 15.5 4 9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 15.5 12 20 12 20Z',
  'M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  'M4 13v-2a8 8 0 0 1 16 0v2 M4 13h3v6H4z M17 13h3v6h-3z M17 19c0 1-2 2-5 2',
  'M6 3h9l3 3v15H6z M14 3v4h4 M9 12h6 M9 16h6',
  'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19 12l2-1-2-4-2 .5L15 5l-.5-2h-5L9 5 7 7.5 5 7l-2 4 2 1 .5 2L4 16l3 3 2-.5 1 2.5h4l1-2.5 2 .5 3-3-1.5-2Z',
].map(path => iconMask(path))

const breadcrumbCopy = computed(() => en.value
  ? { basic: 'Basic usage', clickable: 'Clickable ancestors', custom: 'Custom separator and content', disabled: 'Disabled ancestor', label: 'Breadcrumb', items: ['Home', 'Orders', 'Detail'], selected: 'Selected' }
  : { basic: '基础用法', clickable: '可点击层级', custom: '自定义分隔符与内容', disabled: '禁用层级', label: '面包屑', items: ['首页', '订单', '详情'], selected: '已选择' })
const breadcrumbItems = computed(() => breadcrumbCopy.value.items.map((label, index) => ({
  label,
  href: ['/', '/orders', undefined][index],
})))
const disabledBreadcrumbItems = computed(() => breadcrumbItems.value.map((item, index) => ({ ...item, disabled: index === 1 })))
const breadcrumbSelection = shallowRef<number | undefined>(undefined)
const breadcrumbMessage = computed(() => breadcrumbSelection.value === undefined
  ? ''
  : `${breadcrumbCopy.value.selected}：${breadcrumbCopy.value.items[breadcrumbSelection.value]}`)
function selectBreadcrumb(payload: { index: number }) {
  breadcrumbSelection.value = payload.index
}

const cellNotificationsEnabled = shallowRef(true)
const cellLastAction = shallowRef('')
const cellCopy = computed(() => en.value
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
      languageValue: 'English',
      privacy: 'Privacy',
      standard: 'Standard',
      avatar: 'A',
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
      languageValue: '简体中文',
      privacy: '隐私',
      standard: '标准',
      avatar: '林',
    })
const cellMessage = computed(() => cellLastAction.value ? `${opened.value}：${cellLastAction.value}` : '')

const dividerAction = shallowRef('')
const dividerCopy = computed(() => en.value
  ? {
      order: 'Order #1042',
      paid: 'Paid',
      goods: 'Items',
      discount: 'Discount',
      total: 'Total',
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
      discount: '优惠',
      total: '实付款',
      logistics: '物流进度',
      shipped: '已发货',
      shippedHint: '16:20 已从杭州仓发出',
      arrival: '预计送达',
      arrivalHint: '明日 18:00 前',
      contact: '联系商家',
      track: '查看物流',
    })
const dividerMessage = computed(() => dividerAction.value ? `${opened.value}：${dividerAction.value}` : '')

const gridLastAction = shallowRef('')
const gridCopy = computed(() => ({
  title: en.value ? 'Quick services' : '常用服务',
  hint: en.value ? 'Account shortcuts' : '账户快捷入口',
  items: (en.value
    ? ['Orders', 'Delivery', 'Coupons', 'Favorites', 'Addresses', 'Support', 'Invoices', 'Settings']
    : ['我的订单', '物流', '优惠券', '收藏', '收货地址', '客服', '发票', '设置'])
    .map((label, index) => ({
      label,
      icon: serviceIcons[index],
      badge: index === 0 ? '2' : index === 2 ? '3' : undefined,
      dot: index === 1,
      selector: `docs-grid-service-${index}`,
    })),
}))
const gridMessage = computed(() => gridLastAction.value ? `${opened.value}：${gridLastAction.value}` : '')

const layoutCopy = computed(() => en.value
  ? {
      title: 'Business overview',
      period: 'This week',
      revenue: 'Revenue',
      orders: 'Orders',
      visitors: 'Visitors',
      conversion: 'Conversion',
      refunds: 'Refunds',
    }
  : {
      title: '经营概览',
      period: '本周',
      revenue: '成交金额',
      orders: '订单',
      visitors: '访客',
      conversion: '转化率',
      refunds: '退款',
    })
const layoutMetrics = computed(() => [
  { label: layoutCopy.value.visitors, value: '2,846' },
  { label: layoutCopy.value.conversion, value: '4.5%' },
  { label: layoutCopy.value.refunds, value: '6' },
])

const spaceDraft = shallowRef('all')
const spaceApplied = shallowRef('all')
const spaceCopy = computed(() => ({
  title: en.value ? 'Order filters' : '订单筛选',
  hint: en.value ? 'Wrap tags and stack full-width actions' : '标签自动换行，操作纵向填充',
  apply: en.value ? 'Apply filters' : '应用筛选',
  reset: en.value ? 'Reset' : '重置',
  current: en.value ? 'Current' : '当前筛选',
  filters: (en.value
    ? [{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending payment' }, { value: 'shipping', label: 'To ship' }, { value: 'refund', label: 'Refunds' }]
    : [{ value: 'all', label: '全部' }, { value: 'pending', label: '待付款' }, { value: 'shipping', label: '待发货' }, { value: 'refund', label: '退款/售后' }])
    .map(filter => ({
      ...filter,
      selected: spaceDraft.value === filter.value,
      tone: spaceDraft.value === filter.value ? 'primary' as const : 'default' as const,
      variant: spaceDraft.value === filter.value ? 'ghost' as const : 'outline' as const,
      className: spaceDraft.value === filter.value
        ? `docs-space-filter-${filter.value} !bg-[var(--varo-ui-primary-soft)]`
        : `docs-space-filter-${filter.value}`,
    })),
}))
const spaceAppliedLabel = computed(() => spaceCopy.value.filters.find(filter => filter.value === spaceApplied.value)?.label ?? '')
function resetFilters() {
  spaceDraft.value = 'all'
  spaceApplied.value = 'all'
}

const listItems = shallowRef(Array.from({ length: 8 }, (_, index) => index + 1))
const listLoading = shallowRef(false)
const listFinished = shallowRef(false)
let listTimer: ReturnType<typeof setTimeout> | undefined
const listCopy = computed(() => en.value
  ? { finished: 'No more records', hint: 'Scroll to the bottom to load the next page.', loading: 'Loading next page', row: 'Record' }
  : { finished: '没有更多了', hint: '滚动到底部加载下一页。', loading: '正在加载下一页', row: '记录' })
function loadList() {
  if (listLoading.value || listFinished.value) { return }
  listLoading.value = true
  listTimer = setTimeout(() => {
    const start = listItems.value.length
    listItems.value = [...listItems.value, ...Array.from({ length: 5 }, (_, index) => start + index + 1)]
    listLoading.value = false
    listFinished.value = listItems.value.length >= 18
    listTimer = undefined
  }, 400)
}
onBeforeUnmount(() => {
  if (listTimer !== undefined) { clearTimeout(listTimer) }
})

const safeAreaSaved = shallowRef(false)
const safeAreaCopy = computed(() => en.value
  ? { bottom: 'Bottom actions', all: 'All edges', content: 'Page content', hint: 'Keep actions clear of the home indicator.', allHint: 'Content respects the top, right, bottom, and left safe areas.', save: 'Save changes', saved: 'Changes saved', edit: 'Edit again' }
  : { bottom: '底部操作', all: '四周安全区', content: '页面内容', hint: '底部操作避开手势指示条。', allHint: '内容避开顶部、右侧、底部和左侧安全区。', save: '保存修改', saved: '修改已保存', edit: '继续编辑' })
const safeAreaAction = computed(() => safeAreaSaved.value ? safeAreaCopy.value.edit : safeAreaCopy.value.save)

const stickyFixed = shallowRef(false)
const stickyScrollTop = shallowRef(0)
const stickyCopy = computed(() => ({
  title: en.value ? 'May 2026' : '2026 年 5 月',
  count: en.value ? '8 orders' : '8 笔订单',
  hint: en.value ? 'Scroll the page to pin the month summary' : '滚动页面查看月份摘要吸顶',
  normal: en.value ? 'Following page' : '跟随页面',
  fixed: en.value ? 'Pinned' : '已吸顶',
  scroll: en.value ? 'Page scroll' : '页面滚动',
  items: en.value
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
const stickyStateLabel = computed(() => stickyFixed.value ? stickyCopy.value.fixed : stickyCopy.value.normal)
const stickyBarClass = computed(() => [
  'flex items-center justify-between gap-2 rounded-xl border border-solid bg-[var(--varo-ui-surface)] px-3 py-2.5',
  stickyFixed.value ? 'border-[var(--varo-ui-primary)] shadow-sm' : 'border-[var(--varo-ui-border)]',
].join(' '))
function updateStickyScroll(event: { scrollTop: number }) {
  stickyScrollTop.value = Math.round(event.scrollTop)
}
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <view v-if="component === 'breadcrumb'">
      <view class="docs-demo__section" data-docs-case="basic">
        <text class="docs-demo__heading">
          {{ breadcrumbCopy.basic }}
        </text>
        <VBreadcrumb :items="breadcrumbCopy.items" :label="breadcrumbCopy.label" @select="selectBreadcrumb" />
      </view>
      <view class="docs-demo__section" data-docs-case="clickable-ancestors">
        <text class="docs-demo__heading">
          {{ breadcrumbCopy.clickable }}
        </text>
        <VBreadcrumb :items="breadcrumbItems" :label="breadcrumbCopy.label" @select="selectBreadcrumb" />
      </view>
      <view class="docs-demo__section" data-docs-case="custom-slots">
        <text class="docs-demo__heading">
          {{ breadcrumbCopy.custom }}
        </text>
        <VBreadcrumb :items="breadcrumbItems" :label="breadcrumbCopy.label" @select="selectBreadcrumb">
          <template #item="{ item }">
            <text class="font-semibold">
              {{ item.label }}
            </text>
          </template>
          <template #separator>
            <text>/</text>
          </template>
        </VBreadcrumb>
      </view>
      <view class="docs-demo__section" data-docs-case="disabled-ancestor">
        <text class="docs-demo__heading">
          {{ breadcrumbCopy.disabled }}
        </text>
        <VBreadcrumb :items="disabledBreadcrumbItems" :label="breadcrumbCopy.label" @select="selectBreadcrumb" />
      </view>
      <text v-if="breadcrumbMessage" class="docs-demo__value" role="status" data-docs-result="breadcrumb">
        {{ breadcrumbMessage }}
      </text>
    </view>

    <view v-else-if="component === 'cell'" class="grid gap-[18px]">
      <view data-docs-case="account-security">
        <VCellGroup :title="cellCopy.accountGroup" :desc="cellCopy.accountGroupDesc">
          <VCell class-name="docs-cell-profile" center is-link size="large" :title="cellCopy.profile" :sub-title="cellCopy.profileSubtitle" :desc="cellCopy.edit" @click="cellLastAction = cellCopy.profile">
            <template #icon>
              <VAvatar :fallback="cellCopy.avatar" :alt="cellCopy.profile" :size="32" shape="rounded" />
            </template>
          </VCell>
          <VCell class-name="docs-cell-security" center is-link :title="cellCopy.security" :sub-title="cellCopy.securitySubtitle" @click="cellLastAction = cellCopy.security">
            <template #icon>
              <view class="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--varo-ui-primary-soft)]">
                <VIcon :size="18" tone="primary">
                  <view :style="securityIcon" />
                </VIcon>
              </view>
            </template>
            <template #desc>
              <text class="text-xs font-semibold text-[var(--varo-ui-success)]">
                {{ cellCopy.secure }}
              </text>
            </template>
          </VCell>
          <VCell center :title="cellCopy.notifications" :sub-title="cellCopy.notificationsSubtitle">
            <template #icon>
              <view class="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--varo-ui-primary-soft)]">
                <VIcon :size="18" tone="primary">
                  <view :style="notificationIcon" />
                </VIcon>
              </view>
            </template>
            <template #link>
              <VSwitch v-model="cellNotificationsEnabled" :aria-label="cellCopy.notifications" />
            </template>
          </VCell>
        </VCellGroup>
      </view>
      <view data-docs-case="preferences">
        <VCellGroup :title="cellCopy.preferencesGroup" :desc="cellCopy.preferencesGroupDesc">
          <VCell class-name="docs-cell-appearance" is-link :title="cellCopy.appearance" :desc="cellCopy.system" @click="cellLastAction = cellCopy.appearance" />
          <VCell class-name="docs-cell-language" is-link :title="cellCopy.language" :desc="cellCopy.languageValue" @click="cellLastAction = cellCopy.language" />
          <VCell class-name="docs-cell-privacy" is-link :title="cellCopy.privacy" :desc="cellCopy.standard" @click="cellLastAction = cellCopy.privacy" />
        </VCellGroup>
      </view>
      <text v-if="cellMessage" class="docs-demo__muted" role="status" data-docs-result="cell">
        {{ cellMessage }}
      </text>
    </view>

    <view v-else-if="component === 'divider'" class="docs-demo__card p-4" data-docs-case="order-summary">
      <view class="mb-3 flex items-center justify-between gap-2">
        <text class="text-sm font-bold">
          {{ dividerCopy.order }}
        </text>
        <text class="rounded-full bg-[var(--varo-ui-success-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--varo-ui-success)]">
          {{ dividerCopy.paid }}
        </text>
      </view>
      <view class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-xs">
        <text class="text-[var(--varo-ui-text-regular)]">
          {{ dividerCopy.goods }}
        </text><text class="text-right font-semibold">
          ¥299
        </text>
        <text class="text-[var(--varo-ui-text-regular)]">
          {{ dividerCopy.discount }}
        </text><text class="text-right font-semibold text-[var(--varo-ui-success)]">
          −¥20
        </text>
      </view>
      <VDivider :spacing="12" />
      <view class="flex items-center justify-between gap-2 text-sm font-bold">
        <text>{{ dividerCopy.total }}</text><text class="text-base text-[var(--varo-ui-danger)]">
          ¥279
        </text>
      </view>
      <view data-docs-case="delivery-progress">
        <VDivider content-position="left" dashed :spacing="16">
          {{ dividerCopy.logistics }}
        </VDivider>
        <view class="flex items-start gap-2.5">
          <VIcon name="dot" :size="12" tone="primary" />
          <view class="grid min-w-0 gap-0.5">
            <text class="text-xs font-semibold">
              {{ dividerCopy.shipped }}
            </text><text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ dividerCopy.shippedHint }}
            </text>
          </view>
        </view>
        <VDivider :spacing="8" />
        <view class="flex items-start gap-2.5">
          <VIcon name="dot" :size="12" tone="primary" />
          <view class="grid min-w-0 gap-0.5">
            <text class="text-xs font-semibold">
              {{ dividerCopy.arrival }}
            </text><text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ dividerCopy.arrivalHint }}
            </text>
          </view>
        </view>
      </view>
      <view class="mt-4 flex items-center justify-center" data-docs-case="vertical-actions">
        <VButton class-name="docs-divider-contact" size="sm" variant="text" @click="dividerAction = dividerCopy.contact">
          {{ dividerCopy.contact }}
        </VButton>
        <VDivider vertical />
        <VButton class-name="docs-divider-track" size="sm" variant="text" @click="dividerAction = dividerCopy.track">
          {{ dividerCopy.track }}
        </VButton>
      </view>
      <text v-if="dividerMessage" class="docs-demo__muted" role="status" data-docs-result="divider">
        {{ dividerMessage }}
      </text>
    </view>

    <view v-else-if="component === 'grid'" class="docs-demo__card grid gap-3.5 p-4" data-docs-case="quick-services">
      <view class="flex items-center justify-between gap-2">
        <view class="grid gap-0.5">
          <text class="text-sm font-bold">
            {{ gridCopy.title }}
          </text><text class="text-[11px] text-[var(--varo-ui-text-muted)]">
            {{ gridCopy.hint }}
          </text>
        </view>
        <text class="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--varo-ui-primary-soft)] text-xs font-bold text-[var(--varo-ui-primary)]">
          8
        </text>
      </view>
      <VGrid :border="false" :column-num="4" :gutter="8" clickable>
        <VGridItem v-for="item in gridCopy.items" :key="item.label" :class-name="item.selector" :text="item.label" :badge="item.badge" :dot="item.dot" @click="gridLastAction = item.label">
          <template #icon>
            <VIcon :size="21" tone="primary">
              <view :style="item.icon" />
            </VIcon>
          </template>
        </VGridItem>
      </VGrid>
      <text v-if="gridMessage" class="docs-demo__muted" role="status" data-docs-result="grid">
        {{ gridMessage }}
      </text>
    </view>

    <view v-else-if="component === 'layout'" class="docs-demo__card grid gap-3 overflow-hidden p-4" data-docs-case="business-overview">
      <view class="flex items-center justify-between gap-2">
        <text class="text-sm font-bold">
          {{ layoutCopy.title }}
        </text><text class="text-[11px] text-[var(--varo-ui-text-muted)]">
          {{ layoutCopy.period }}
        </text>
      </view>
      <VRow :gutter="gap" align="stretch">
        <VCol :span="16">
          <view class="box-border grid h-full min-h-[78px] content-center gap-1 rounded-[13px] border border-solid border-[var(--varo-ui-primary-soft)] bg-[var(--varo-ui-primary-soft)] p-[11px]">
            <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ layoutCopy.revenue }}
            </text>
            <text class="min-w-0 truncate text-lg font-bold text-[var(--varo-ui-primary)]">
              ¥86,420
            </text>
            <text class="text-[11px] font-semibold text-[var(--varo-ui-success)]">
              +12.8%
            </text>
          </view>
        </VCol>
        <VCol :span="8">
          <view class="box-border grid h-full min-h-[78px] content-center gap-1 rounded-[13px] bg-[var(--varo-ui-surface-muted)] p-[11px]">
            <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ layoutCopy.orders }}
            </text><text class="min-w-0 truncate text-base font-bold">
              128
            </text>
          </view>
        </VCol>
        <VCol v-for="item in layoutMetrics" :key="item.label" :span="8">
          <view class="box-border grid h-full min-h-[78px] content-center gap-1 rounded-[13px] bg-[var(--varo-ui-surface-muted)] p-[11px]">
            <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ item.label }}
            </text><text class="min-w-0 truncate text-base font-bold">
              {{ item.value }}
            </text>
          </view>
        </VCol>
      </VRow>
    </view>

    <view v-else-if="component === 'list'" class="grid gap-2" data-docs-case="incremental-loading">
      <text class="docs-demo__muted">
        {{ listCopy.hint }}
      </text>
      <scroll-view scroll-y class="h-[240px] rounded-2xl border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)]">
        <VList :finished="listFinished" :finished-text="listCopy.finished" :immediate="false" :loading="listLoading" :loading-text="listCopy.loading" @load="loadList">
          <view v-for="item in listItems" :key="item" class="box-border min-h-[52px] border-b border-solid border-[var(--varo-ui-border)] px-4 py-3.5 text-sm" data-docs-list-row="true">
            {{ listCopy.row }} {{ item }}
          </view>
        </VList>
      </scroll-view>
    </view>

    <view v-else-if="component === 'safe-area'">
      <view class="docs-demo__section" data-docs-case="bottom-actions">
        <text class="docs-demo__heading">
          {{ safeAreaCopy.bottom }}
        </text>
        <view class="docs-demo__card overflow-hidden">
          <view class="grid min-h-[140px] content-center gap-2 p-4">
            <text class="text-sm font-semibold">
              {{ safeAreaCopy.content }}
            </text><text class="docs-demo__muted">
              {{ safeAreaCopy.hint }}
            </text>
            <text v-if="safeAreaSaved" class="docs-demo__value" role="status" data-docs-result="safe-area">
              {{ safeAreaCopy.saved }}
            </text>
          </view>
          <VSafeArea class-name="border-t border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)]">
            <view class="p-3">
              <VButton block class-name="docs-safe-area-save" @click="safeAreaSaved = !safeAreaSaved">
                {{ safeAreaAction }}
              </VButton>
            </view>
          </VSafeArea>
        </view>
      </view>
      <view class="docs-demo__section" data-docs-case="all-edges">
        <text class="docs-demo__heading">
          {{ safeAreaCopy.all }}
        </text>
        <VSafeArea :edges="allEdges" class-name="rounded-xl border border-solid border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface-muted)]">
          <view class="p-4 text-sm">
            {{ safeAreaCopy.allHint }}
          </view>
        </VSafeArea>
      </view>
    </view>

    <view v-else-if="component === 'space'" class="docs-demo__card grid gap-3.5 p-4" data-docs-case="order-filters">
      <view class="grid gap-1">
        <text class="text-sm font-bold">
          {{ spaceCopy.title }}
        </text><text class="text-[11px] text-[var(--varo-ui-text-muted)]">
          {{ spaceCopy.hint }}
        </text>
      </view>
      <view data-docs-case="wrapping-tags">
        <VSpace :size="gap" wrap>
          <VButton v-for="filter in spaceCopy.filters" :key="filter.value" :class-name="filter.className" :aria-label="filter.label" :aria-pressed="filter.selected" size="sm" :tone="filter.tone" :variant="filter.variant" @click="spaceDraft = filter.value">
            {{ filter.label }}
          </VButton>
        </VSpace>
      </view>
      <view class="border-t border-solid border-[var(--varo-ui-border-light)] pt-3.5" data-docs-case="vertical-actions">
        <VSpace direction="vertical" fill :size="gap">
          <VButton block class-name="docs-space-apply" size="sm" @click="spaceApplied = spaceDraft">
            {{ spaceCopy.apply }}
          </VButton>
          <VButton block class-name="docs-space-reset" size="sm" tone="default" variant="outline" @click="resetFilters">
            {{ spaceCopy.reset }}
          </VButton>
        </VSpace>
      </view>
      <text class="text-[11px] text-[var(--varo-ui-text-regular)]" role="status" data-docs-result="space">
        {{ spaceCopy.current }}：{{ spaceAppliedLabel }}
      </text>
    </view>

    <view v-else-if="component === 'sticky'" class="docs-demo__card p-4" data-docs-case="month-summary" data-docs-scroll="page">
      <view class="flex min-h-[88px] items-center pb-3">
        <text class="text-[11px] text-[var(--varo-ui-text-muted)]">
          {{ stickyCopy.hint }}
        </text>
      </view>
      <VSticky :offset-top="72" :z-index="4" @change="stickyFixed = $event" @scroll="updateStickyScroll">
        <view :class="stickyBarClass" :data-fixed="stickyFixed" data-docs-sticky-bar="true">
          <view class="grid gap-0.5">
            <text class="text-[13px] font-bold">
              {{ stickyCopy.title }}
            </text><text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ stickyCopy.count }}
            </text>
          </view>
          <text class="rounded-full bg-[var(--varo-ui-primary-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--varo-ui-primary)]">
            {{ stickyStateLabel }}
          </text>
        </view>
      </VSticky>
      <view class="mt-2.5 grid gap-2" data-docs-case="order-feed">
        <view v-for="item in stickyCopy.items" :key="item.id" class="box-border flex min-h-[74px] items-center justify-between gap-2 rounded-xl bg-[var(--varo-ui-surface-muted)] px-3 py-2.5" :data-docs-order="item.id">
          <view class="grid gap-0.5">
            <text class="text-xs font-bold">
              {{ item.id }}
            </text><text class="text-[11px] text-[var(--varo-ui-text-muted)]">
              {{ item.status }}
            </text>
          </view>
          <text class="text-xs font-bold">
            {{ item.amount }}
          </text>
        </view>
      </view>
      <text class="mt-2.5 block text-[11px] text-[var(--varo-ui-text-regular)]" role="status" data-docs-result="sticky">
        {{ stickyStateLabel }} · {{ stickyCopy.scroll }} {{ stickyScrollTop }}px
      </text>
    </view>
  </DocsDemoPage>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Varo",
  "usingComponents": {}
}
</json>
