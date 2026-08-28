<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { computed, shallowRef } from 'wevu'
import RetailProductCard from '../../components/retail/RetailProductCard.vue'
import RetailSectionHeader from '../../components/retail/RetailSectionHeader.vue'
import Badge from '../../components/ui/badge.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VImage from '../../components/ui/v-image.vue'
import VInput from '../../components/ui/v-input.vue'
import { useWeappChrome } from '../../composables/useWeappChrome'
import { retailCategories } from '../../features/retail/data'
import { navigateRetail, switchRetailTab } from '../../features/retail/navigation'
import { formatRetailMoney, useRetailStore } from '../../features/retail/store'

const keyword = shallowRef('')
const { addToCart, cartCount, products } = useRetailStore()
const { navigationStyle, rootStyle } = useWeappChrome()
const featuredProducts = computed(() => products.value.slice(0, 8))
const heroProducts = computed(() => products.value.slice(0, 3).map(product => ({
  ...product,
  priceLabel: formatRetailMoney(product.price),
})))

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
  addToCart(product.id)
  wx.showToast({ title: '已加入购物车', icon: 'success' })
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f4f6f8] pb-24 text-slate-950">
    <view class="sticky top-0 z-30 grid gap-2 bg-white/95 px-3 pb-3 shadow-sm backdrop-blur" :style="rootStyle">
      <view class="flex items-center justify-between gap-3" :style="navigationStyle">
        <view class="grid gap-0.5">
          <text class="text-[10px] font-black uppercase tracking-[0.18em] text-teal-700">
            VARO RETAIL
          </text>
          <text class="text-lg font-black">
            零售生活馆
          </text>
        </view>
        <VButton
          size="sm"
          shape="round"
          tone="default"
          class-name="relative !h-10 !min-h-10 !w-10 !p-0 !bg-slate-950 !text-[9px] !text-white"
          @click="switchRetailTab('cart')"
        >
          购物车
          <Badge v-if="cartCount" :content="cartCount" tone="danger" class="absolute -right-1 -top-1" />
        </VButton>
      </view>
      <view class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <VInput :value="keyword" placeholder="搜索商品、品牌或活动" clearable @update:value="keyword = $event" />
        <VButton size="sm" @click="search">
          搜索
        </VButton>
      </view>
    </view>

    <view class="retail-section-enter grid gap-4 px-3 py-3">
      <swiper
        class="h-[220px] overflow-hidden rounded-2xl bg-slate-950"
        autoplay
        circular
        indicator-dots
        indicator-color="rgba(255,255,255,.38)"
        indicator-active-color="#5eead4"
        :interval="4500"
        :duration="420"
      >
        <swiper-item v-for="product in heroProducts" :key="product.id">
          <view class="relative h-[220px] overflow-hidden">
            <VImage :src="product.image" :alt="product.name" fit="cover" width="100%" height="220px" />
            <view class="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,15,20,.94)_0%,rgba(3,15,20,.78)_48%,rgba(3,15,20,.16)_100%)]" />
            <view class="absolute inset-y-0 left-0 grid w-[72%] content-center gap-2 p-5 pb-7 text-white">
              <text class="text-[9px] font-black tracking-[0.18em] text-teal-200">
                FEATURED PRODUCT
              </text>
              <text class="line-clamp-2 text-[22px] font-black leading-7">
                {{ product.name }}
              </text>
              <text class="line-clamp-2 text-[10px] leading-[17px] text-white/80">
                {{ product.description }}
              </text>
              <text class="text-lg font-black text-white">
                ¥{{ product.priceLabel }}
              </text>
              <VButton size="sm" class-name="mt-2 w-fit !bg-teal-600 !px-4" @click="openProduct(product)">
                查看商品
              </VButton>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <VCard variant="default">
        <view class="grid grid-cols-5 gap-2 pb-2">
          <VButton
            v-for="category in retailCategories"
            :key="category.id"
            size="sm"
            variant="ghost"
            tone="default"
            class-name="!grid !min-h-18 !w-full !place-items-center !gap-1 !p-0 !pb-2"
            @click="openCategory(category.id)"
          >
            <text class="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-xs font-black text-teal-700">
              {{ category.shortLabel.slice(0, 1) }}
            </text>
            <text class="text-[10px] font-semibold text-slate-600">
              {{ category.label }}
            </text>
          </VButton>
        </view>
      </VCard>

      <VCard class-name="bg-[linear-gradient(135deg,#ecfdf5,#f0fdfa)]" variant="outline">
        <view class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <view class="grid gap-1">
            <text class="text-sm font-black text-teal-950">
              会员本周权益
            </text>
            <text class="text-[10px] text-teal-700">
              新人券、会员券与满减活动已准备好
            </text>
          </view>
          <VButton size="sm" variant="outline" @click="navigateRetail('/retail-coupon/coupon-list/index')">
            领券
          </VButton>
        </view>
      </VCard>

      <RetailSectionHeader
        eyebrow="CURATED"
        title="精选推荐"
        subtitle="真实商品状态 · Varo 原生组件"
        action="查看全部"
        @action="navigateRetail('/retail-goods/list/index')"
      />

      <view class="grid grid-cols-2 gap-3">
        <RetailProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
          @select="openProduct"
          @add="addProduct"
        />
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
