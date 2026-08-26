<script setup lang="ts">
import VButton from '../ui/v-button.vue'
import VTag from '../ui/tag.vue'
import type { MallHistoryItem, MallOrder, MallOrderStatus } from '../../features/mall/useMallAgent'

withDefaults(
  defineProps<{
    history?: MallHistoryItem[]
    orders?: MallOrder[]
  }>(),
  {
    history: () => [],
    orders: () => []
  }
)

const emit = defineEmits<{
  return: [order: MallOrder]
}>()

const STATUS_LABEL: Record<MallOrderStatus, string> = {
  delivered: '已送达',
  paid: '待发货',
  returned: '已退货',
  shipping: '配送中'
}
</script>

<template>
  <view class="grid gap-4">
    <view>
      <text class="mb-2 block text-xs font-extrabold tracking-[.12em] text-slate-400">订单</text>
      <view class="grid gap-2">
        <view v-for="order in orders" :key="order.id" class="grid gap-2.5 rounded-xl border border-slate-200 bg-white p-3">
          <view class="flex items-start justify-between gap-3">
            <view class="grid min-w-0 gap-1">
              <text class="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-slate-900">{{ order.productName }}</text>
              <text class="text-[10px] text-slate-400">{{ order.id }} · {{ order.createdAt }}</text>
            </view>
            <VTag :tone="order.status === 'returned' ? 'default' : 'primary'" variant="soft" size="sm">
              {{ STATUS_LABEL[order.status] }}
            </VTag>
          </view>
          <view class="flex items-end justify-between gap-3 border-t border-slate-100 pt-2">
            <view class="grid gap-0.5">
              <text class="text-[10px] text-slate-400">{{ order.quantity }} 件 · {{ order.address }}</text>
              <text class="text-sm font-black text-[#e1251b]">¥{{ (order.total / 100).toFixed(2) }}</text>
            </view>
            <VButton v-if="order.status === 'delivered' || order.status === 'shipping'" size="sm" variant="outline" @click="emit('return', order)">
              申请退货
            </VButton>
          </view>
        </view>
      </view>
    </view>

    <view>
      <text class="mb-2 block text-xs font-extrabold tracking-[.12em] text-slate-400">Agent 操作记录</text>
      <view class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <view v-for="item in history" :key="item.id" class="flex min-h-[54px] items-start gap-2.5 border-b border-slate-100 px-3 py-2.5 last:border-b-0">
          <text
            :class="[
              'mt-1 h-2 w-2 flex-none rounded-full',
              item.type === 'return' ? 'bg-orange-500' : item.type === 'address' ? 'bg-blue-600' : 'bg-green-600'
            ]"
            aria-hidden="true"
          />
          <view class="grid min-w-0 flex-1 gap-0.5">
            <view class="flex justify-between gap-2">
              <text class="text-xs font-bold text-slate-700">{{ item.title }}</text>
              <text class="text-[10px] text-slate-400">{{ item.time }}</text>
            </view>
            <text class="text-[11px] leading-4 text-slate-500">{{ item.detail }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
