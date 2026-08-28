<script setup lang="ts">
import { computed } from 'wevu'
import VAvatar from '../ui/avatar.vue'
import VBadge from '../ui/badge.vue'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'

const props = withDefaults(
  defineProps<{
    addressCount?: number
    couponCount?: number
    level?: string
    name?: string
    orderCounts?: Record<string, number>
    points?: number
  }>(),
  {
    addressCount: 0,
    couponCount: 0,
    level: 'PLUS',
    name: 'Varo 用户',
    orderCounts: () => ({}),
    points: 0,
  },
)

const emit = defineEmits<{
  action: [actionId: string]
}>()

const orderActions = computed(() => [
  { count: props.orderCounts['pending-payment'] ?? 0, id: 'pending-payment', label: '待付款', mark: '付' },
  { count: props.orderCounts['pending-delivery'] ?? 0, id: 'pending-delivery', label: '待发货', mark: '发' },
  { count: props.orderCounts['pending-receipt'] ?? 0, id: 'pending-receipt', label: '待收货', mark: '收' },
  { count: props.orderCounts.completed ?? 0, id: 'completed', label: '待评价', mark: '评' },
  { count: props.orderCounts['after-sale'] ?? 0, id: 'after-sale', label: '退款/售后', mark: '退' },
])
</script>

<template>
  <view class="grid gap-3 bg-[#f4f6f8] p-3 text-slate-950">
    <VCard class-name="flex items-center gap-3 bg-[linear-gradient(145deg,#ccfbf1,#ffffff)]" variant="elevated">
      <VAvatar :alt="name" :fallback="name.slice(0, 1)" :size="56" shape="rounded" />
      <view class="grid min-w-0 flex-1 gap-1">
        <view class="flex items-center gap-2">
          <text class="text-xl font-black">
            {{ name }}
          </text>
          <VTag tone="primary" variant="solid" size="sm">
            {{ level }}
          </VTag>
        </view>
        <text class="text-[10px] text-slate-500">
          {{ points }} 积分
        </text>
      </view>
      <VButton size="sm" variant="ghost" @click="emit('action', 'settings')">
        设置
      </VButton>
    </VCard>

    <VCard class-name="grid gap-4">
      <view class="flex justify-between">
        <text class="text-base font-black">
          我的订单
        </text>
        <VButton size="sm" variant="ghost" class-name="!p-0 !text-[10px] !text-slate-400" @click="emit('action', 'orders')">
          全部订单 ›
        </VButton>
      </view>
      <view class="grid grid-cols-5 gap-2">
        <VButton
          v-for="action in orderActions"
          :key="action.id"
          size="sm"
          variant="ghost"
          tone="default"
          class-name="relative !grid !min-h-16 !w-full !place-items-center !gap-1 !p-0"
          @click="emit('action', action.id)"
        >
          <text class="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-xs font-black">
            {{ action.mark }}
          </text>
          <VBadge v-if="action.count" :content="action.count" class="absolute right-0 top-0" />
          <text class="text-[9px] text-slate-500">
            {{ action.label }}
          </text>
        </VButton>
      </view>
    </VCard>

    <VCard class-name="grid gap-1">
      <VButton block variant="ghost" tone="default" class-name="!flex !min-h-12 !w-full !justify-between !rounded-none !border-b !border-slate-100 !p-0" @click="emit('action', 'addresses')">
        <text>收货地址</text><text class="text-slate-400">
          {{ addressCount }} 个 ›
        </text>
      </VButton>
      <VButton block variant="ghost" tone="default" class-name="!flex !min-h-12 !w-full !justify-between !rounded-none !border-b !border-slate-100 !p-0" @click="emit('action', 'coupons')">
        <text>优惠券</text><text class="text-slate-400">
          {{ couponCount }} 张 ›
        </text>
      </VButton>
      <VButton block variant="ghost" tone="default" class-name="!flex !min-h-12 !w-full !justify-between !rounded-none !p-0" @click="emit('action', 'service')">
        <text>售后与客服</text><text class="text-teal-700">
          查看 ›
        </text>
      </VButton>
    </VCard>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
