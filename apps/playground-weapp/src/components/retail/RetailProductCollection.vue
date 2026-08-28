<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { computed, onLoad, shallowRef } from 'wevu'
import { navigateRetail } from '../../features/retail/navigation'
import { useRetailStore } from '../../features/retail/store'
import VEmpty from '../ui/empty.vue'
import VButton from '../ui/v-button.vue'
import VInput from '../ui/v-input.vue'
import RetailProductCard from './RetailProductCard.vue'

withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
  }>(),
  {
    eyebrow: 'PRODUCTS',
    title: '商品列表',
  },
)

const category = shallowRef('')
const keyword = shallowRef('')
const sort = shallowRef<'default' | 'price' | 'sales'>('default')
const sortOptions = computed(() => [
  { label: '综合', value: 'default' as const, variant: sort.value === 'default' ? 'solid' as const : 'ghost' as const },
  { label: '销量', value: 'sales' as const, variant: sort.value === 'sales' ? 'solid' as const : 'ghost' as const },
  { label: '价格', value: 'price' as const, variant: sort.value === 'price' ? 'solid' as const : 'ghost' as const },
])
const { addToCart, products } = useRetailStore()
const visibleProducts = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  const filtered = products.value.filter((product) => {
    const categoryMatch = !category.value || product.category === category.value
    const keywordMatch = !query || `${product.name}${product.description}`.toLowerCase().includes(query)
    return categoryMatch && keywordMatch
  })
  if (sort.value === 'price') { return [...filtered].sort((left, right) => left.price - right.price) }
  if (sort.value === 'sales') { return [...filtered].sort((left, right) => right.sales - left.sales) }
  return filtered
})

onLoad((options) => {
  category.value = String(options?.category ?? '')
  keyword.value = String(options?.keyword ?? '')
})

function openProduct(product: RetailProduct) {
  navigateRetail('/retail-goods/details/index', { id: product.id })
}

function addProduct(product: RetailProduct) {
  addToCart(product.id)
  wx.showToast({ title: '已加入购物车', icon: 'success' })
}
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-8 text-slate-950">
    <view class="sticky top-0 z-20 grid gap-3 border-b border-slate-100 bg-white px-3 pb-3 pt-3">
      <view class="grid gap-0.5">
        <text class="text-[9px] font-black tracking-[0.16em] text-teal-700">
          {{ eyebrow }}
        </text>
        <text class="text-xl font-black">
          {{ title }}
        </text>
      </view>
      <VInput :value="keyword" placeholder="搜索当前商品" clearable @update:value="keyword = $event" />
      <view class="grid grid-cols-3 gap-2">
        <VButton
          v-for="option in sortOptions"
          :key="option.value"
          size="sm"
          :variant="option.variant"
          @click="sort = option.value"
        >
          {{ option.label }}
        </VButton>
      </view>
    </view>

    <view v-if="visibleProducts.length" class="grid grid-cols-2 gap-3 px-3 py-3">
      <RetailProductCard
        v-for="product in visibleProducts"
        :key="product.id"
        :product="product"
        @select="openProduct"
        @add="addProduct"
      />
    </view>
    <view v-else class="grid min-h-[65vh] place-items-center px-6">
      <VEmpty title="没有找到商品" description="换个关键词或分类再试试" />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
