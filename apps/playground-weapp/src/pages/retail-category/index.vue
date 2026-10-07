<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { computed, shallowRef } from 'wevu'
import RetailProductCard from '../../components/retail/RetailProductCard.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VButton from '../../components/ui/v-button.vue'
import VInput from '../../components/ui/v-input.vue'
import { useWeappChrome } from '../../composables/useWeappChrome'
import { retailCategories } from '../../features/retail/data'
import { navigateRetail } from '../../features/retail/navigation'
import { runRetailAction, useRetailPage } from '../../features/retail/use-retail-page'

const activeCategory = shallowRef(retailCategories[0].id)
const keyword = shallowRef('')
const { addToCart, products, loading, loadError, retryLoad } = useRetailPage()
const { navigationStyle, rootStyle } = useWeappChrome()
const visibleProducts = computed(() => {
  const categoryProducts = products.value.filter(product => product.category === activeCategory.value)
  const source = categoryProducts
  const query = keyword.value.trim().toLowerCase()
  return query ? source.filter(product => product.name.toLowerCase().includes(query)) : source
})
const activeLabel = computed(() => retailCategories.find(category => category.id === activeCategory.value)?.label ?? '全部')
const categoryOptions = computed(() => retailCategories.map(category => ({
  ...category,
  ariaLabel: activeCategory.value === category.id ? `${category.label}，当前分类` : category.label,
  className: activeCategory.value === category.id
    ? '!min-h-11 !w-full !rounded-none !border-0 !border-b-2 !border-[#86543c] !px-2 !text-[15px] !font-semibold !text-[#86543c]'
    : '!min-h-11 !w-full !rounded-none !px-2 !text-[15px] !font-normal !text-[#625e55]',
})))

function openProduct(product: RetailProduct) {
  navigateRetail('/retail-goods/details/index', { id: product.id })
}

function addProduct(product: RetailProduct) {
  return runRetailAction(() => {
    addToCart(product.id)
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  })
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-32 text-[#292722]">
    <view class="sticky top-0 z-20 border-b border-[#dcd6cb] bg-[#f7f4ee]" :style="rootStyle">
      <view class="mx-auto grid box-border w-full max-w-[1160px] gap-3 px-[18px] pb-3 md:px-9">
        <view class="flex items-center justify-between gap-3" :style="navigationStyle">
          <text class="retail-heading text-[24px] leading-8">
            分类
          </text>
          <VButton
            variant="ghost"
            class-name="!min-h-11 !rounded-[3px] !px-2 !text-[15px] !text-[#86543c]"
            @click="navigateRetail('/retail-goods/search/index')"
          >
            搜索全部
          </VButton>
        </view>
        <VInput
          :value="keyword"
          aria-label="搜索当前分类"
          placeholder="搜索当前分类"
          clearable
          class-name="!min-h-11 !rounded-[3px]"
          @update:value="keyword = $event"
        />
      </view>
    </view>

    <view class="mx-auto box-border w-full max-w-[1160px] px-[18px] md:px-9">
      <view class="grid grid-cols-5 border-b border-[#dcd6cb] py-1">
        <VButton
          v-for="category in categoryOptions"
          :key="category.id"
          variant="ghost"
          tone="default"
          :class-name="category.className"
          :aria-label="category.ariaLabel"
          @click="activeCategory = category.id"
        >
          {{ category.label }}
        </VButton>
      </view>
      <RetailRequestState :loading="loading" :error="loadError" @retry="retryLoad" />
      <view v-if="!loading && !loadError" class="retail-section-enter py-6">
        <view class="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <text class="retail-heading text-[22px] leading-8">
            {{ activeLabel }}
          </text>
          <text class="text-[15px] leading-6 text-[#625e55]">
            {{ visibleProducts.length }} 件商品
          </text>
        </view>
        <view v-if="visibleProducts.length" class="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4 md:gap-x-6 md:gap-y-9">
          <RetailProductCard
            v-for="product in visibleProducts"
            :key="product.id"
            :product="product"
            @select="openProduct"
            @add="addProduct"
          />
        </view>
        <view v-else class="grid min-h-64 content-center justify-items-center gap-3 text-center">
          <text class="retail-heading text-xl leading-7">
            当前分类暂无商品
          </text>
          <text class="text-[15px] leading-6 text-[#625e55]">
            试试其他分类或搜索词
          </text>
        </view>
      </view>
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
