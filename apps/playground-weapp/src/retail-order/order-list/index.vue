<script setup lang="ts">
import type { RetailOrder, RetailOrderStatus } from '../../features/retail/types'
import { computed, onLoad, shallowRef } from 'wevu'
import RetailOrderCard from '../../components/retail/RetailOrderCard.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VEmpty from '../../components/ui/empty.vue'
import VButton from '../../components/ui/v-button.vue'
import { navigateRetail } from '../../features/retail/navigation'
import { useRetailPage } from '../../features/retail/use-retail-page'

const activeStatus = shallowRef<'all' | RetailOrderStatus>('all')
const { orders, loading, loadError, retryLoad } = useRetailPage()
const tabs: Array<{ label: string, value: 'all' | RetailOrderStatus }> = [
  { label: '全部', value: 'all' },
  { label: '模拟待付款', value: 'pending-payment' },
  { label: '待发货', value: 'pending-delivery' },
  { label: '待收货', value: 'pending-receipt' },
  { label: '售后', value: 'after-sale' },
]
const visibleOrders = computed(() => activeStatus.value === 'all' ? orders.value : orders.value.filter(order => order.status === activeStatus.value))
const displayTabs = computed(() => tabs.map(tab => ({
  ...tab,
  active: activeStatus.value === tab.value,
  className: `relative !min-h-12 !shrink-0 !rounded-none !px-4 !text-[15px] ${activeStatus.value === tab.value ? '!font-semibold !text-[#86543c]' : '!text-[#625e55]'}`,
})))

onLoad((options) => {
  const requested = String(options?.status ?? 'all') as 'all' | RetailOrderStatus
  if (tabs.some(tab => tab.value === requested)) { activeStatus.value = requested }
})

function openOrder(order: RetailOrder) {
  navigateRetail('/retail-order/order-detail/index', { id: order.id })
}

function runAction(order: RetailOrder) {
  if (order.status === 'completed') {
    navigateRetail('/retail-goods/details/index', { id: order.items[0]?.productId ?? '' })
    return
  }
  openOrder(order)
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-8 text-[#292722]">
    <view class="mx-auto max-w-4xl px-[18px] pb-5 pt-6">
      <text class="retail-heading block text-[26px] leading-9">
        我的订单
      </text>
      <text class="mt-3 block text-[15px] leading-7 text-[#625e55]">
        仅展示模拟订单，不代表真实支付或发货。
      </text>
    </view>
    <scroll-view scroll-x class="sticky top-0 z-20 whitespace-nowrap border-y border-[#dcd6cb] bg-[#f7f4ee]">
      <view class="mx-auto max-w-4xl">
        <view class="inline-flex box-border min-w-full px-1">
          <VButton
            v-for="tab in displayTabs"
            :key="tab.value"
            variant="ghost"
            tone="default"
            :class-name="tab.className"
            @click="activeStatus = tab.value"
          >
            {{ tab.label }}
            <text v-if="tab.active" class="absolute inset-x-4 bottom-0 h-0.5 bg-[#86543c]" />
          </VButton>
        </view>
      </view>
    </scroll-view>

    <RetailRequestState :loading="loading" :error="loadError" @retry="retryLoad" />
    <view v-if="!loading && !loadError && visibleOrders.length" class="mx-auto max-w-4xl px-[18px]">
      <RetailOrderCard v-for="order in visibleOrders" :key="order.id" :order="order" @view="openOrder" @action="runAction" />
    </view>
    <view v-else-if="!loading && !loadError" class="grid min-h-[60vh] place-items-center px-6">
      <VEmpty title="暂无相关订单" description="订单状态变化后会自动出现在这里" />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "我的订单",
  "usingComponents": {}
}
</json>
