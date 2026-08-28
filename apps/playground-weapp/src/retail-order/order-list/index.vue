<script setup lang="ts">
import type { RetailOrder, RetailOrderStatus } from '../../features/retail/types'
import { computed, onLoad, shallowRef } from 'wevu'
import RetailOrderCard from '../../components/retail/RetailOrderCard.vue'
import VEmpty from '../../components/ui/empty.vue'
import VButton from '../../components/ui/v-button.vue'
import { navigateRetail } from '../../features/retail/navigation'
import { useRetailStore } from '../../features/retail/store'

const activeStatus = shallowRef<'all' | RetailOrderStatus>('all')
const { orders } = useRetailStore()
const tabs: Array<{ label: string, value: 'all' | RetailOrderStatus }> = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 'pending-payment' },
  { label: '待发货', value: 'pending-delivery' },
  { label: '待收货', value: 'pending-receipt' },
  { label: '售后', value: 'after-sale' },
]
const visibleOrders = computed(() => activeStatus.value === 'all' ? orders.value : orders.value.filter(order => order.status === activeStatus.value))

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
  <view class="min-h-screen bg-[#f4f6f8] pb-8 text-slate-950">
    <scroll-view scroll-x class="sticky top-0 z-20 whitespace-nowrap border-b border-slate-100 bg-white pt-[env(safe-area-inset-top)]">
      <view class="inline-flex min-w-full px-2">
        <VButton
          v-for="tab in tabs"
          :key="tab.value"
          size="sm"
          variant="ghost"
          tone="default"
          class-name="relative !min-h-12 !min-w-20 !rounded-none !px-3 !text-xs !font-semibold !text-slate-400"
          :class="activeStatus === tab.value ? '!font-black !text-teal-700' : ''"
          @click="activeStatus = tab.value"
        >
          {{ tab.label }}
          <text v-if="activeStatus === tab.value" class="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-teal-600" />
        </VButton>
      </view>
    </scroll-view>

    <view v-if="visibleOrders.length" class="grid gap-3 px-3 py-3">
      <RetailOrderCard v-for="order in visibleOrders" :key="order.id" :order="order" @view="openOrder" @action="runAction" />
    </view>
    <view v-else class="grid min-h-[70vh] place-items-center px-6">
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
