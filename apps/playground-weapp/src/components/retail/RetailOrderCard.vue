<script setup lang="ts">
import type { RetailOrder, RetailOrderStatus } from '../../features/retail/types'
import { computed } from 'wevu'
import { retailConfig } from '../../features/retail/config'
import { formatRetailMoney } from '../../features/retail/store'
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

const STATUS_LABEL: Record<RetailOrderStatus, string> = {
  'pending-payment': '模拟待付款',
  'pending-delivery': '待发货',
  'pending-receipt': '待收货',
  'completed': '已完成',
  'after-sale': '售后中',
}

const firstProduct = computed(() => props.order.items[0])
const brand = retailConfig.brand
const itemCount = computed(() => props.order.items.reduce((total, item) => total + item.quantity, 0))
const actionLabel = computed(() => props.order.status === 'completed' ? '再次浏览' : '查看模拟订单')
</script>

<template>
  <VCard class-name="!rounded-none !border-x-0 !border-t-0 !border-b !border-[#dcd6cb] !bg-transparent !p-0 !shadow-none" @click="emit('view', props.order)">
    <view class="grid gap-4 py-6 text-[#292722]">
      <view class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <text class="text-[15px] font-semibold">
          {{ brand.name }} · 模拟订单
        </text>
        <text class="text-[15px] text-[#86543c]">
          {{ STATUS_LABEL[order.status] }}
        </text>
      </view>

      <view v-if="firstProduct" class="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-3">
        <VImage :src="firstProduct.image" :alt="firstProduct.name" fit="cover" width="72px" height="72px" radius="3px" />
        <view class="grid min-w-0 gap-3">
          <text class="retail-heading break-words text-[17px] leading-7">
            {{ firstProduct.name }}
          </text>
          <view class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <text class="text-[15px] text-[#625e55]">
              共 {{ itemCount }} 件
            </text>
            <text class="retail-price text-[22px]">
              ¥{{ formatRetailMoney(order.total) }}
            </text>
          </view>
        </view>
      </view>

      <view class="grid gap-1 text-[15px] leading-6 text-[#625e55]">
        <text class="break-all">
          订单编号 {{ order.id }}
        </text>
        <text class="break-words">
          创建时间 {{ order.createdAt }}
        </text>
      </view>
      <view class="flex flex-wrap justify-end gap-2">
        <VButton variant="outline" tone="default" class-name="!min-h-11 !rounded-[3px] !text-[15px]" @click="emit('view', props.order)">
          订单详情
        </VButton>
        <VButton class-name="!min-h-11 !rounded-[3px] !text-[15px]" @click="emit('action', props.order)">
          {{ actionLabel }}
        </VButton>
      </view>
    </view>
  </VCard>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
