<script setup lang="ts">
import { shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import ComparisonDemo from './ComparisonDemo.vue'
import CouponsDemo from './CouponsDemo.vue'
import FiltersDemo from './FiltersDemo.vue'
import ReceiptDemo from './ReceiptDemo.vue'
import ReviewsDemo from './ReviewsDemo.vue'
import WishlistDemo from './WishlistDemo.vue'

const active = shallowRef('coupons')
const entries = [
  { id: 'coupons', label: '优惠券示例' },
  { id: 'receipt', label: '凭证示例' },
  { id: 'reviews', label: '评价示例' },
  { id: 'wishlist', label: '收藏示例' },
  { id: 'comparison', label: '比较示例' },
  { id: 'filters', label: '筛选示例' },
]
</script>

<template>
  <view class="box-border grid min-h-screen min-w-0 gap-5 bg-[var(--varo-ui-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+32px)] text-sm leading-6 text-[var(--varo-ui-text)]">
    <view class="grid gap-2">
      <text class="text-2xl font-semibold">
        零售工具 · 本地数据
      </text><text>所有变更仅保存在当前示例内存中。没有真实领取、付款、退款、上传、下载或商品服务。切换示例会重新初始化数据。</text>
    </view>
    <view class="flex flex-wrap gap-2">
      <VButton v-for="item in entries" :key="item.id" variant="outline" :disabled="active === item.id" @click="active = item.id">
        {{ item.label }}
      </VButton>
    </view>
    <CouponsDemo v-if="active === 'coupons'" />
    <ReceiptDemo v-else-if="active === 'receipt'" />
    <ReviewsDemo v-else-if="active === 'reviews'" />
    <WishlistDemo v-else-if="active === 'wishlist'" />
    <ComparisonDemo v-else-if="active === 'comparison'" />
    <FiltersDemo v-else-if="active === 'filters'" />
  </view>
</template>

<json lang="jsonc">
{ "navigationBarTitleText": "零售工具", "usingComponents": {} }
</json>
