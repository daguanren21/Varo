<script setup lang="ts">
import type { RetailOrderSummary } from '../../lib/retail'
import { computed } from 'wevu'
import { formatRetailMoney } from '../../lib/retail'
import VEmpty from '../ui/empty.vue'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
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
  'pending-payment': { action: '立即付款', label: '待付款', tone: 'warning' },
  'pending-delivery': { action: '查看进度', label: '待发货', tone: 'default' },
  'pending-receipt': { action: '确认收货', label: '待收货', tone: 'default' },
  'completed': { action: '再次购买', label: '已完成', tone: 'default' },
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
  <view class="grid grid-cols-1 gap-6 bg-[var(--varo-ui-surface)] px-4 py-6 text-sm leading-6 text-[var(--varo-ui-text)]">
    <text class="text-xl font-semibold leading-7">
      我的订单
    </text>

    <view v-for="order in visibleOrders" :key="order.id" class="grid gap-4 border-b border-[var(--varo-ui-border-lighter)] pb-6">
      <view class="flex flex-wrap items-start justify-between gap-3">
        <view class="grid min-w-0 flex-1 grid-cols-1 gap-1">
          <text class="break-all text-sm font-semibold leading-6">
            订单 {{ order.id }}
          </text>
          <text class="break-words text-xs tabular-nums leading-5 text-[var(--varo-ui-text-regular)]">
            {{ order.createdAt }}
          </text>
        </view>
        <VTag :label="order.statusLabel" :tone="order.tone" variant="soft" />
      </view>

      <VButton block variant="ghost" tone="default" :aria-label="order.preview.name" class-name="!min-h-11 !w-full !min-w-0 !rounded-lg !p-0 !text-left !shadow-none" @click="emit('view', order)">
        <view class="grid w-full min-w-0 grid-cols-[72px_minmax(0,1fr)] items-start gap-3">
          <VImage :src="order.preview.image" :alt="order.preview.name" fit="cover" width="72px" height="72px" radius="8px" />
          <view class="grid min-w-0 grid-cols-1 gap-2">
            <text class="break-words text-sm font-medium leading-6">
              {{ order.preview.name }}
            </text>
            <text class="break-words text-xs leading-6 text-[var(--varo-ui-text-regular)]">
              共 {{ order.itemCount }} 件
            </text>
          </view>
        </view>
      </VButton>

      <view class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4">
        <text class="text-sm leading-6 text-[var(--varo-ui-text-regular)]">
          订单金额
        </text>
        <text class="break-all text-right text-lg font-semibold tabular-nums leading-7">
          ¥{{ formatRetailMoney(order.total) }}
        </text>
      </view>

      <view class="grid grid-cols-2 gap-3">
        <VButton block variant="outline" tone="default" class-name="!min-h-11 !rounded-lg !border-[var(--varo-ui-border-lighter)] !text-sm !shadow-none" @click="emit('view', order)">
          订单详情
        </VButton>
        <VButton block tone="default" class-name="!min-h-11 !rounded-lg !bg-[var(--varo-ui-text)] !text-sm !text-[var(--varo-ui-surface)] !shadow-none" @click="emit('action', order)">
          {{ order.actionLabel }}
        </VButton>
      </view>
    </view>

    <VEmpty v-if="visibleOrders.length === 0" title="暂无相关订单" description="订单状态变化后会自动出现在这里" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
