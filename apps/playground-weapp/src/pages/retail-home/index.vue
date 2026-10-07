<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { computed, shallowRef } from 'wevu'
import RetailProductCard from '../../components/retail/RetailProductCard.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VButton from '../../components/ui/v-button.vue'
import VImage from '../../components/ui/v-image.vue'
import VInput from '../../components/ui/v-input.vue'
import { useWeappChrome } from '../../composables/useWeappChrome'
import { retailConfig } from '../../features/retail/config'
import { retailCategories } from '../../features/retail/data'
import { navigateRetail, switchRetailTab } from '../../features/retail/navigation'
import { runRetailAction, useRetailPage } from '../../features/retail/use-retail-page'

const keyword = shallowRef('')
const { addToCart, cartCount, products, loading, loadError, retryLoad } = useRetailPage()
const brand = retailConfig.brand
const brandStyle = `color: ${brand.accent}`
const { navigationStyle, rootStyle } = useWeappChrome()
const featuredProducts = computed(() => products.value.slice(0, 8))

function search() {
  navigateRetail('/retail-goods/result/index', { keyword: keyword.value || '精选推荐' })
}

function openCategory(category: string) {
  navigateRetail('/retail-goods/list/index', { category })
}

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
    <view class="sticky top-0 z-30 border-b border-[#dcd6cb] bg-[#f7f4ee]" :style="rootStyle">
      <view class="mx-auto grid box-border w-full max-w-[1160px] gap-3 px-[18px] pb-3 md:px-9">
        <view class="flex items-center justify-between gap-3" :style="navigationStyle">
          <view class="flex min-w-0 flex-1 items-center gap-2">
            <view class="h-8 w-8 shrink-0">
              <VImage :src="brand.logo" :alt="brand.name" fit="contain" width="32px" height="32px" />
            </view>
            <text class="retail-heading min-w-0 text-xl leading-7" :style="brandStyle">
              {{ brand.name }}
            </text>
          </view>
          <VButton
            variant="ghost"
            tone="default"
            class-name="!min-h-11 !shrink-0 !rounded-[3px] !px-2 !text-[15px] !font-normal !text-[#292722]"
            @click="switchRetailTab('cart')"
          >
            购物车 {{ cartCount }}
          </VButton>
        </view>
        <view class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <VInput
            :value="keyword"
            aria-label="搜索商品"
            placeholder="搜索商品"
            confirm-type="search"
            clearable
            class-name="!min-h-11 !rounded-[3px]"
            @update:value="keyword = $event"
            @confirm="search"
          />
          <VButton variant="ghost" class-name="!min-h-11 !rounded-[3px] !px-3 !text-[15px] !text-[#86543c]" @click="search">
            搜索
          </VButton>
        </view>
      </view>
    </view>

    <view class="mx-auto box-border w-full max-w-[1160px] px-[18px] md:px-9">
      <view class="grid grid-cols-6 border-b border-[#dcd6cb] py-1">
        <VButton
          variant="ghost"
          tone="default"
          class-name="!min-h-11 !w-full !rounded-none !border-0 !border-b-2 !border-[#86543c] !px-1 !text-[15px] !font-semibold !text-[#86543c]"
          @click="navigateRetail('/retail-goods/list/index')"
        >
          全部
        </VButton>
        <VButton
          v-for="category in retailCategories"
          :key="category.id"
          variant="ghost"
          tone="default"
          class-name="!min-h-11 !w-full !rounded-none !px-1 !text-[15px] !font-normal !text-[#625e55]"
          @click="openCategory(category.id)"
        >
          {{ category.label }}
        </VButton>
      </view>
      <RetailRequestState :loading="loading" :error="loadError" :empty="products.length === 0" empty-title="暂无商品" @retry="retryLoad" />
      <view v-if="!loading && !loadError && products.length" class="retail-section-enter py-6">
        <view class="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4 md:gap-x-6 md:gap-y-9">
          <RetailProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
            @select="openProduct"
            @add="addProduct"
          />
        </view>
        <view class="mt-8 border-t border-[#dcd6cb] pt-4">
          <VButton
            block
            variant="ghost"
            class-name="!min-h-11 !w-full !rounded-[3px] !text-base !text-[#86543c]"
            @click="navigateRetail('/retail-goods/list/index')"
          >
            浏览全部商品
          </VButton>
        </view>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Varo 零售",
  "navigationStyle": "custom",
  "enablePullDownRefresh": false,
  "usingComponents": {}
}
</json>
