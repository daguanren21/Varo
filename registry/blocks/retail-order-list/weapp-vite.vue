<script setup lang="ts">
import type { RetailOrderSummary } from '../../lib/retail'
import { computed } from 'wevu'
import { formatRetailMoney } from '../../lib/retail'
import VEmpty from '../ui/empty.vue'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VImage from '../ui/v-image.vue'

const props = withDefaults(
  defineProps<{
    orders?: RetailOrderSummary[]
    status?: 'all' | RetailOrderSummary['status']
  }>(),
  {
    orders: () => [],
    status: 'all',
  },
)

const emit = defineEmits<{
  action: [order: RetailOrderSummary]
  view: [order: RetailOrderSummary]
}>()

const STATUS_COPY: Record<RetailOrderSummary['status'], { action: string, label: string, tone: 'default' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  'pending-payment': { action: '立即付款', label: '待付款', tone: 'danger' },
  'pending-delivery': { action: '查看进度', label: '待发货', tone: 'warning' },
  'pending-receipt': { action: '确认收货', label: '待收货', tone: 'primary' },
  'completed': { action: '再次购买', label: '已完成', tone: 'success' },
  'after-sale': { action: '查看售后', label: '售后中', tone: 'default' },
}
const visibleOrders = computed(() =>
  (props.status === 'all' ? props.orders : props.orders.filter(order => order.status === props.status)).map(order => ({
    ...order,
    actionLabel: STATUS_COPY[order.status].action,
    statusLabel: STATUS_COPY[order.status].label,
    tone: STATUS_COPY[order.status].tone,
  })),
)
</script>

<template>
  <view class="grid gap-3 bg-[#f4f6f8] p-3 text-slate-950">
    <VCard v-for="order in visibleOrders" :key="order.id" class-name="grid gap-3">
      <view class="flex items-center justify-between gap-3">
        <view class="grid min-w-0 gap-0.5">
          <text class="text-xs font-black">
            Varo Retail 自营店
          </text>
          <text class="truncate text-[9px] text-slate-400">
            {{ order.id }} · {{ order.createdAt }}
          </text>
        </view>
        <VTag :label="order.statusLabel" :tone="order.tone" variant="soft" size="sm" />
      </view>

      <VButton block variant="ghost" tone="default" class-name="!grid !min-h-0 !grid-cols-[72px_minmax(0,1fr)] !gap-3 !rounded-xl !bg-slate-50 !p-2 !text-left" @click="emit('view', order)">
        <VImage :src="order.preview.image" :alt="order.preview.name" fit="cover" width="72px" height="72px" radius="12px" />
        <view class="grid min-w-0 content-between gap-2">
          <text class="line-clamp-2 text-xs font-semibold leading-[18px]">
            {{ order.preview.name }}
          </text>
          <view class="flex justify-between text-[10px] text-slate-400">
            <text>共 {{ order.itemCount }} 件</text>
            <text class="text-sm font-black text-slate-950">
              ¥{{ formatRetailMoney(order.total) }}
            </text>
          </view>
        </view>
      </VButton>

      <view class="flex justify-end gap-2">
        <VButton size="sm" variant="outline" tone="default" @click="emit('view', order)">
          订单详情
        </VButton>
        <VButton size="sm" @click="emit('action', order)">
          {{ order.actionLabel }}
        </VButton>
      </view>
    </VCard>

    <VEmpty v-if="visibleOrders.length === 0" title="暂无相关订单" description="订单状态变化后会自动出现在这里" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
