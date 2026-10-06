<script setup lang="ts">
import type { RetailOrder, RetailOrderStatus } from '../../features/retail/types'
import { computed } from 'wevu'
import { retailConfig } from '../../features/retail/config'
import { formatRetailMoney } from '../../features/retail/store'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VImage from '../ui/v-image.vue'

const props = defineProps<{
  order: RetailOrder
}>()

const emit = defineEmits<{
  action: [order: RetailOrder]
  view: [order: RetailOrder]
}>()

const STATUS_COPY: Record<RetailOrderStatus, { label: string, tone: 'default' | 'primary' | 'success' | 'warning' | 'danger' }> = {
  'pending-payment': { label: '模拟待付款', tone: 'danger' },
  'pending-delivery': { label: '待发货', tone: 'warning' },
  'pending-receipt': { label: '待收货', tone: 'primary' },
  'completed': { label: '已完成', tone: 'success' },
  'after-sale': { label: '售后中', tone: 'default' },
}

const firstProduct = computed(() => props.order.items[0])
const brand = retailConfig.brand
const itemCount = computed(() => props.order.items.reduce((total, item) => total + item.quantity, 0))
const actionLabel = computed(() => props.order.status === 'completed' ? '再次浏览' : '查看模拟订单')
</script>

<template>
  <VCard class-name="grid gap-3" @click="emit('view', props.order)">
    <view class="flex items-center justify-between gap-3">
      <view class="grid min-w-0 gap-0.5">
        <text class="text-xs font-bold text-slate-900">
          {{ brand.name }} · 模拟订单
        </text>
        <text class="truncate text-[9px] text-slate-400">
          {{ order.id }} · {{ order.createdAt }}
        </text>
      </view>
      <VTag :tone="STATUS_COPY[order.status].tone" variant="soft" size="sm">
        {{ STATUS_COPY[order.status].label }}
      </VTag>
    </view>

    <view v-if="firstProduct" class="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-xl bg-slate-50 p-2">
      <VImage :src="firstProduct.image" :alt="firstProduct.name" fit="cover" width="72px" height="72px" radius="12px" />
      <view class="grid min-w-0 content-between gap-2">
        <text class="line-clamp-2 text-xs font-semibold leading-[18px] text-slate-800">
          {{ firstProduct.name }}
        </text>
        <view class="flex items-center justify-between text-[10px] text-slate-400">
          <text>共 {{ itemCount }} 件</text>
          <text class="text-sm font-black text-slate-950">
            ¥{{ formatRetailMoney(order.total) }}
          </text>
        </view>
      </view>
    </view>

    <view class="flex justify-end gap-2">
      <VButton size="sm" variant="outline" tone="default" @click="emit('view', props.order)">
        订单详情
      </VButton>
      <VButton size="sm" @click="emit('action', props.order)">
        {{ actionLabel }}
      </VButton>
    </view>
  </VCard>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
