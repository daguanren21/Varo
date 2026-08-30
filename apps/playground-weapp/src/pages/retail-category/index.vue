<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { computed, shallowRef } from 'wevu'
import RetailProductCard from '../../components/retail/RetailProductCard.vue'
import VButton from '../../components/ui/v-button.vue'
import VInput from '../../components/ui/v-input.vue'
import { useWeappChrome } from '../../composables/useWeappChrome'
import { retailCategories } from '../../features/retail/data'
import { navigateRetail } from '../../features/retail/navigation'
import { useRetailStore } from '../../features/retail/store'

const activeCategory = shallowRef(retailCategories[0].id)
const keyword = shallowRef('')
const { addToCart, products } = useRetailStore()
const { navigationStyle, rootStyle } = useWeappChrome()
const visibleProducts = computed(() => {
  const categoryProducts = products.value.filter(product => product.category === activeCategory.value)
  const source = categoryProducts.length > 0 ? categoryProducts : products.value
  const query = keyword.value.trim().toLowerCase()
  return query ? source.filter(product => product.name.toLowerCase().includes(query)) : source
})
const activeLabel = computed(() => retailCategories.find(category => category.id === activeCategory.value)?.label ?? '全部')

function openProduct(product: RetailProduct) {
  navigateRetail('/retail-goods/details/index', { id: product.id })
}

function addProduct(product: RetailProduct) {
  addToCart(product.id)
  wx.showToast({ title: '已加入购物车', icon: 'success' })
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-white pb-20 text-slate-950">
    <view class="sticky top-0 z-20 grid gap-3 border-b border-slate-100 bg-white px-3 pb-3 shadow-sm" :style="rootStyle">
      <view class="flex items-center justify-between gap-3" :style="navigationStyle">
        <text class="text-xl font-black">
          分类
        </text>
        <VButton size="sm" variant="ghost" @click="navigateRetail('/retail-goods/search/index')">
          筛选
        </VButton>
      </view>
      <VInput :value="keyword" placeholder="搜索当前分类" clearable @update:value="keyword = $event" />
    </view>

    <view class="grid min-h-[calc(100vh-132px)] grid-cols-[92px_minmax(0,1fr)]">
      <scroll-view scroll-y class="h-full bg-slate-50">
        <VButton
          v-for="category in retailCategories"
          :key="category.id"
          size="sm"
          variant="ghost"
          tone="default"
          class-name="relative !flex !min-h-14 !w-full !items-center !justify-center !rounded-none !border-0 !px-2 !text-xs !font-semibold !text-slate-500"
          :class="activeCategory === category.id ? '!bg-white !font-black !text-teal-700' : ''"
          @click="activeCategory = category.id"
        >
          <text v-if="activeCategory === category.id" class="absolute inset-y-3 left-0 w-1 rounded-r-full bg-teal-600" />
          {{ category.label }}
        </VButton>
      </scroll-view>

      <scroll-view scroll-y class="h-full bg-white">
        <view class="retail-section-enter grid gap-3 p-3">
          <view class="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0f766e,#2dd4bf)] p-4 text-white">
            <text class="text-[10px] font-black tracking-[0.16em] text-white/70">
              {{ activeLabel.toUpperCase() }}
            </text>
            <text class="mt-1 block text-lg font-black">
              {{ activeLabel }}精选
            </text>
            <text class="mt-1 block text-[10px] text-white/75">
              从高复购商品到当季新品，一次浏览。
            </text>
          </view>

          <view v-if="visibleProducts.length" class="grid grid-cols-2 gap-3">
            <RetailProductCard
              v-for="product in visibleProducts"
              :key="product.id"
              :product="product"
              @select="openProduct"
              @add="addProduct"
            />
          </view>
          <view v-else class="grid min-h-64 place-items-center text-xs text-slate-400">
            当前分类暂无商品
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "商品分类",
  "navigationStyle": "custom",
  "usingComponents": {}
}
</json>
