<script setup lang="ts">
import type { PropType } from 'wevu'
import { computed } from 'wevu'
import VAvatar from '../ui/avatar.vue'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'

const props = defineProps({
  addressCount: { type: null as unknown as PropType<number>, default: 0 },
  couponCount: { type: null as unknown as PropType<number>, default: 0 },
  level: { type: null as unknown as PropType<string>, default: 'PLUS' },
  name: { type: null as unknown as PropType<string>, default: 'Varo 用户' },
  orderCounts: { type: null as unknown as PropType<Record<string, number>>, default: () => ({}) },
  points: { type: null as unknown as PropType<number>, default: 0 },
})
const emit = defineEmits<{
  action: [actionId: string]
}>()
const safeAddressCount = computed(() => Number(props.addressCount) || 0)
const safeCouponCount = computed(() => Number(props.couponCount) || 0)
const displayLevel = computed(() => props.level || 'PLUS')
const displayName = computed(() => props.name || 'Varo 用户')
const safeOrderCounts = computed(() => props.orderCounts && typeof props.orderCounts === 'object' ? props.orderCounts : {})
const safePoints = computed(() => Number(props.points) || 0)
const avatarFallback = computed(() => displayName.value.slice(0, 1))

const orderActions = computed(() => [
  { count: safeOrderCounts.value['pending-payment'] ?? 0, id: 'pending-payment', label: '待付款', mark: '付' },
  { count: safeOrderCounts.value['pending-delivery'] ?? 0, id: 'pending-delivery', label: '待发货', mark: '发' },
  { count: safeOrderCounts.value['pending-receipt'] ?? 0, id: 'pending-receipt', label: '待收货', mark: '收' },
  { count: safeOrderCounts.value.completed ?? 0, id: 'completed', label: '待评价', mark: '评' },
  { count: safeOrderCounts.value['after-sale'] ?? 0, id: 'after-sale', label: '退款/售后', mark: '退' },
])
</script>

<template>
  <view class="grid gap-4 bg-[#f1f4f6] p-3 text-slate-950">
    <VCard :padding="false" class-name="overflow-hidden bg-slate-950 text-white" variant="elevated">
      <view class="grid gap-5 bg-[linear-gradient(145deg,#082f35,#0f766e)] p-5">
        <view class="flex items-center gap-3">
          <VAvatar :alt="displayName" :fallback="avatarFallback" :size="60" shape="rounded" />
          <view class="grid min-w-0 flex-1 gap-1">
            <view class="flex items-center gap-2">
              <text class="truncate text-xl font-black text-white">
                {{ displayName }}
              </text>
              <VTag :label="displayLevel" tone="primary" variant="solid" size="sm" />
            </view>
            <text class="text-[10px] text-teal-100">
              Varo Retail 会员
            </text>
          </view>
          <VButton size="sm" tone="default" variant="ghost" class-name="!border !border-white/20 !bg-white/10 !px-3 !text-white" @click="emit('action', 'settings')">
            设置
          </VButton>
        </view>

        <view class="grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3">
          <VButton variant="ghost" tone="default" class-name="!grid !min-h-14 !gap-1 !bg-black/15 !p-0 !text-white" @click="emit('action', 'points')">
            <text class="text-base font-black">
              {{ safePoints }}
            </text>
            <text class="text-[9px] text-teal-100">
              会员积分
            </text>
          </VButton>
          <VButton variant="ghost" tone="default" class-name="!grid !min-h-14 !gap-1 !bg-black/15 !p-0 !text-white" @click="emit('action', 'addresses')">
            <text class="text-base font-black">
              {{ safeAddressCount }}
            </text>
            <text class="text-[9px] text-teal-100">
              收货地址
            </text>
          </VButton>
          <VButton variant="ghost" tone="default" class-name="!grid !min-h-14 !gap-1 !bg-black/15 !p-0 !text-white" @click="emit('action', 'coupons')">
            <text class="text-base font-black">
              {{ safeCouponCount }}
            </text>
            <text class="text-[9px] text-teal-100">
              可用优惠券
            </text>
          </VButton>
        </view>
      </view>
    </VCard>

    <VCard>
      <view class="grid gap-4">
        <view class="flex items-center justify-between">
          <view class="grid gap-0.5">
            <text class="text-base font-black">
              我的订单
            </text>
            <text class="text-[9px] text-slate-400">
              查看订单与履约进度
            </text>
          </view>
          <VButton size="sm" variant="ghost" tone="default" class-name="!min-h-8 !px-2 !text-[10px] !text-teal-700" @click="emit('action', 'orders')">
            全部订单
          </VButton>
        </view>
        <view class="grid grid-cols-5 gap-2">
          <VButton
            v-for="action in orderActions"
            :key="action.id"
            size="sm"
            variant="ghost"
            tone="default"
            class-name="relative !grid !min-h-[72px] !w-full !place-items-center !gap-1 !rounded-xl !bg-slate-50 !p-1"
            @click="emit('action', action.id)"
          >
            <text class="grid h-9 w-9 place-items-center rounded-xl bg-white text-xs font-black text-slate-700 shadow-sm">
              {{ action.mark }}
            </text>
            <text v-if="action.count" class="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
              {{ action.count }}
            </text>
            <text class="text-[9px] text-slate-500">
              {{ action.label }}
            </text>
          </VButton>
        </view>
      </view>
    </VCard>

    <VCard>
      <view class="grid divide-y divide-slate-100">
        <VButton block variant="ghost" tone="default" class-name="!flex !min-h-16 !w-full !items-center !justify-between !rounded-none !bg-white !p-0 !text-left" @click="emit('action', 'addresses')">
          <view class="grid gap-0.5">
            <text class="text-sm font-black">
              收货地址
            </text>
            <text class="text-[9px] text-slate-400">
              管理常用收件信息
            </text>
          </view>
          <text class="text-xs font-semibold text-slate-400">
            {{ safeAddressCount }} 个
          </text>
        </VButton>
        <VButton block variant="ghost" tone="default" class-name="!flex !min-h-16 !w-full !items-center !justify-between !rounded-none !bg-white !p-0 !text-left" @click="emit('action', 'coupons')">
          <view class="grid gap-0.5">
            <text class="text-sm font-black">
              优惠券
            </text>
            <text class="text-[9px] text-slate-400">
              查看可用权益与使用条件
            </text>
          </view>
          <text class="text-xs font-semibold text-slate-400">
            {{ safeCouponCount }} 张
          </text>
        </VButton>
        <VButton block variant="ghost" tone="default" class-name="!flex !min-h-16 !w-full !items-center !justify-between !rounded-none !bg-white !p-0 !text-left" @click="emit('action', 'service')">
          <view class="grid gap-0.5">
            <text class="text-sm font-black">
              售后与客服
            </text>
            <text class="text-[9px] text-slate-400">
              退款、退换货与服务记录
            </text>
          </view>
          <text class="text-xs font-semibold text-teal-700">
            查看
          </text>
        </VButton>
      </view>
    </VCard>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
