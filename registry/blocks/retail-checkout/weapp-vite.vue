<script setup lang="ts">
import type { RetailAddressSummary, RetailCartLine } from '../../lib/retail'
import { formatRetailMoney } from '../../lib/retail'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VImage from '../ui/v-image.vue'

withDefaults(
  defineProps<{
    address?: RetailAddressSummary
    couponCount?: number
    discount?: number
    items?: RetailCartLine[]
    shipping?: number
    total?: number
  }>(),
  {
    address: () => ({ detail: '请选择收货地址', isDefault: false, name: '未选择地址', phone: '' }),
    couponCount: 0,
    discount: 0,
    items: () => [],
    shipping: 0,
    total: 0,
  },
)

const emit = defineEmits<{
  address: []
  coupon: []
  invoice: []
  submit: []
  view: [productId: string]
}>()
</script>

<template>
  <view class="grid gap-3 bg-[#f4f6f8] p-3 pb-24 text-slate-950">
    <VCard interactive class-name="grid gap-2" variant="elevated" @click="emit('address')">
      <view class="flex items-center gap-2">
        <text class="text-sm font-black">
          {{ address.name }}
        </text>
        <text class="text-xs text-slate-500">
          {{ address.phone }}
        </text>
        <VTag v-if="address.isDefault" tone="primary" variant="soft" size="sm">
          默认
        </VTag>
      </view>
      <text class="text-xs leading-5 text-slate-600">
        {{ address.detail }}
      </text>
    </VCard>

    <VCard class-name="grid gap-3">
      <text class="text-sm font-black">
        Varo Retail 自营店
      </text>
      <VButton
        v-for="item in items"
        :key="item.product.id"
        block
        variant="ghost"
        tone="default"
        class-name="!grid !min-h-0 !grid-cols-[72px_minmax(0,1fr)] !gap-3 !rounded-xl !bg-slate-50 !p-2 !text-left"
        @click="emit('view', item.product.id)"
      >
        <VImage :src="item.product.image" :alt="item.product.name" fit="cover" width="72px" height="72px" radius="12px" />
        <view class="grid min-w-0 content-between gap-2">
          <text class="line-clamp-2 text-xs font-semibold leading-[18px]">
            {{ item.product.name }}
          </text>
          <view class="flex items-center justify-between text-[10px] text-slate-400">
            <text>¥{{ formatRetailMoney(item.product.price) }}</text>
            <text>× {{ item.quantity }}</text>
          </view>
        </view>
      </VButton>
    </VCard>

    <VCard class-name="grid gap-1">
      <VButton block variant="ghost" tone="default" class-name="!flex !min-h-12 !w-full !justify-between !rounded-none !border-b !border-slate-100 !p-0" @click="emit('coupon')">
        <text>优惠券</text><text class="text-[#f04438]">
          {{ couponCount }} 张可用 ›
        </text>
      </VButton>
      <VButton block variant="ghost" tone="default" class-name="!flex !min-h-12 !w-full !justify-between !rounded-none !p-0" @click="emit('invoice')">
        <text>发票</text><text class="text-slate-400">
          暂不开具 ›
        </text>
      </VButton>
    </VCard>

    <VCard class-name="grid gap-2 text-xs">
      <view class="flex justify-between">
        <text>商品金额</text><text>¥{{ formatRetailMoney(total) }}</text>
      </view>
      <view class="flex justify-between">
        <text>运费</text><text>¥{{ formatRetailMoney(shipping) }}</text>
      </view>
      <view class="flex justify-between">
        <text>活动优惠</text><text class="text-[#f04438]">
          -¥{{ formatRetailMoney(discount) }}
        </text>
      </view>
    </VCard>

    <view class="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      <text class="text-xl font-black text-[#f04438]">
        ¥{{ formatRetailMoney(Math.max(0, total + shipping - discount)) }}
      </text>
      <VButton size="lg" tone="danger" shape="round" @click="emit('submit')">
        提交订单
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
