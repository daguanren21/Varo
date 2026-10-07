<script setup lang="ts">
import { computed } from 'wevu'
import VAvatar from '../ui/avatar.vue'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'

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
const safeAddressCount = computed(() => Number(props.addressCount) || 0)
const safeCouponCount = computed(() => Number(props.couponCount) || 0)
const displayLevel = computed(() => props.level || 'PLUS')
const displayName = computed(() => props.name || 'Varo 用户')
const safeOrderCounts = computed(() => props.orderCounts && typeof props.orderCounts === 'object' ? props.orderCounts : {})
const safePoints = computed(() => Number(props.points) || 0)
const avatarFallback = computed(() => displayName.value.slice(0, 1))

const orderActions = computed(() => [
  { count: safeOrderCounts.value['pending-payment'] ?? 0, id: 'pending-payment', label: '待付款' },
  { count: safeOrderCounts.value['pending-delivery'] ?? 0, id: 'pending-delivery', label: '待发货' },
  { count: safeOrderCounts.value['pending-receipt'] ?? 0, id: 'pending-receipt', label: '待收货' },
  { count: safeOrderCounts.value.completed ?? 0, id: 'completed', label: '待评价' },
  { count: safeOrderCounts.value['after-sale'] ?? 0, id: 'after-sale', label: '退款/售后' },
])
</script>

<template>
  <view class="grid grid-cols-1 gap-6 bg-[var(--varo-ui-surface)] px-4 py-6 text-sm leading-6 text-[var(--varo-ui-text)]">
    <view class="flex items-start gap-3">
      <VAvatar :alt="displayName" :fallback="avatarFallback" :size="48" shape="rounded" />
      <view class="grid min-w-0 flex-1 grid-cols-1 gap-2">
        <text class="break-words text-xl font-semibold leading-7">
          {{ displayName }}
        </text>
        <view class="flex flex-wrap items-center gap-2">
          <VTag :label="displayLevel" tone="default" variant="soft" class-name="!max-w-full !break-all !whitespace-normal" />
          <text class="text-xs leading-6 text-[var(--varo-ui-text-regular)]">
            Varo Retail 会员
          </text>
        </view>
      </view>
      <VButton variant="outline" tone="default" class-name="!min-h-11 !shrink-0 !rounded-lg !border-[var(--varo-ui-border-lighter)] !px-3 !text-sm !shadow-none" @click="emit('action', 'settings')">
        设置
      </VButton>
    </view>

    <view class="grid grid-cols-3 gap-2 border-y border-[var(--varo-ui-border-lighter)] py-3">
      <VButton block variant="ghost" tone="default" class-name="!min-h-16 !w-full !min-w-0 !rounded-lg !px-1 !py-2 !shadow-none" @click="emit('action', 'points')">
        <view class="grid w-full min-w-0 gap-1">
          <text class="break-all text-xl font-semibold tabular-nums leading-7">
            {{ safePoints }}
          </text>
          <text class="text-xs font-normal leading-6 text-[var(--varo-ui-text-regular)]">
            会员积分
          </text>
        </view>
      </VButton>
      <VButton block variant="ghost" tone="default" class-name="!min-h-16 !w-full !min-w-0 !rounded-lg !px-1 !py-2 !shadow-none" @click="emit('action', 'addresses')">
        <view class="grid w-full min-w-0 gap-1">
          <text class="break-all text-xl font-semibold tabular-nums leading-7">
            {{ safeAddressCount }}
          </text>
          <text class="text-xs font-normal leading-6 text-[var(--varo-ui-text-regular)]">
            收货地址
          </text>
        </view>
      </VButton>
      <VButton block variant="ghost" tone="default" class-name="!min-h-16 !w-full !min-w-0 !rounded-lg !px-1 !py-2 !shadow-none" @click="emit('action', 'coupons')">
        <view class="grid w-full min-w-0 gap-1">
          <text class="break-all text-xl font-semibold tabular-nums leading-7">
            {{ safeCouponCount }}
          </text>
          <text class="text-xs font-normal leading-6 text-[var(--varo-ui-text-regular)]">
            可用优惠券
          </text>
        </view>
      </VButton>
    </view>

    <view class="grid gap-3">
      <view class="flex flex-wrap items-center justify-between gap-3">
        <text class="text-sm font-semibold leading-6">
          我的订单
        </text>
        <VButton tone="default" class-name="!min-h-11 !rounded-lg !bg-[var(--varo-ui-text)] !px-4 !text-sm !text-[var(--varo-ui-surface)] !shadow-none" @click="emit('action', 'orders')">
          全部订单
        </VButton>
      </view>
      <view class="grid gap-1">
        <VButton
          v-for="action in orderActions"
          :key="action.id"
          block
          variant="ghost"
          tone="default"
          class-name="!min-h-12 !w-full !rounded-lg !px-0 !py-2 !text-left !shadow-none"
          @click="emit('action', action.id)"
        >
          <view class="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,80px)] items-center gap-4">
            <text class="text-sm font-normal leading-6">
              {{ action.label }}
            </text>
            <text v-if="action.count" class="break-all text-right text-base font-semibold tabular-nums leading-6">
              {{ action.count }}
            </text>
          </view>
        </VButton>
      </view>
    </view>

    <view class="grid gap-3 border-t border-[var(--varo-ui-border-lighter)] pt-6">
      <text class="text-sm font-semibold leading-6">
        账户与服务
      </text>
      <view class="grid gap-3">
        <VButton block variant="ghost" tone="default" class-name="!min-h-16 !w-full !rounded-lg !p-0 !text-left !shadow-none" @click="emit('action', 'addresses')">
          <view class="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,80px)] items-center gap-4">
            <view class="grid min-w-0 gap-1">
              <text class="text-sm font-medium leading-6">
                收货地址
              </text>
              <text class="text-xs font-normal leading-6 text-[var(--varo-ui-text-regular)]">
                管理常用收件信息
              </text>
            </view>
            <text class="break-all text-right text-xs font-normal tabular-nums leading-6 text-[var(--varo-ui-text-regular)]">
              {{ safeAddressCount }} 个
            </text>
          </view>
        </VButton>
        <VButton block variant="ghost" tone="default" class-name="!min-h-16 !w-full !rounded-lg !p-0 !text-left !shadow-none" @click="emit('action', 'coupons')">
          <view class="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,80px)] items-center gap-4">
            <view class="grid min-w-0 gap-1">
              <text class="text-sm font-medium leading-6">
                优惠券
              </text>
              <text class="text-xs font-normal leading-6 text-[var(--varo-ui-text-regular)]">
                查看可用权益与使用条件
              </text>
            </view>
            <text class="break-all text-right text-xs font-normal tabular-nums leading-6 text-[var(--varo-ui-text-regular)]">
              {{ safeCouponCount }} 张
            </text>
          </view>
        </VButton>
        <VButton block variant="ghost" tone="default" class-name="!min-h-16 !w-full !rounded-lg !p-0 !text-left !shadow-none" @click="emit('action', 'service')">
          <view class="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,80px)] items-center gap-4">
            <view class="grid min-w-0 gap-1">
              <text class="text-sm font-medium leading-6">
                售后与客服
              </text>
              <text class="text-xs font-normal leading-6 text-[var(--varo-ui-text-regular)]">
                退款、退换货与服务记录
              </text>
            </view>
            <text class="text-right text-sm font-medium leading-6">
              查看
            </text>
          </view>
        </VButton>
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
