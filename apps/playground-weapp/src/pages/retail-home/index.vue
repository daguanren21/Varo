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
import { retailCategories } from '../../features/retail/data'
import { navigateRetail, switchRetailTab } from '../../features/retail/navigation'
import { useRetailStore } from '../../features/retail/store'

const keyword = shallowRef('')
const { addToCart, cartCount, products } = useRetailStore()
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
  addToCart(product.id)
  wx.showToast({ title: '已加入购物车', icon: 'success' })
}
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-24 text-slate-950">
    <view class="sticky top-0 z-30 grid gap-2 bg-white/95 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+10px)] shadow-sm backdrop-blur">
      <view class="flex items-center justify-between gap-3">
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

    <view class="grid gap-4 px-3 py-3">
      <VCard :padding="false" class-name="relative overflow-hidden bg-slate-950 text-white">
        <VImage
          src="https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner1.png"
          alt="Varo 零售生活馆"
          fit="cover"
          width="100%"
          height="196px"
          :show-error="false"
        />
        <view class="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,.88),rgba(15,23,42,.18))]" />
        <view class="absolute inset-y-0 left-0 grid w-[68%] content-center gap-2 p-5">
          <text class="text-[10px] font-black tracking-[0.16em] text-teal-200">
            NEW RETAIL EXPERIENCE
          </text>
          <text class="text-[24px] font-black leading-8">
            好物、订单与服务，一套 Varo 组件完成
          </text>
          <text class="text-[11px] leading-[18px] text-white/75">
            参考 TDesign 零售黄金链路，以可维护的小程序原生 SFC 重新实现。
          </text>
          <VButton size="sm" class-name="mt-1 w-fit" @click="openCategory('women')">
            立即逛逛
          </VButton>
        </view>
      </VCard>

      <VCard class-name="grid grid-cols-5 gap-2" variant="default">
        <VButton
          v-for="category in retailCategories"
          :key="category.id"
          size="sm"
          variant="ghost"
          tone="default"
          class-name="!grid !min-h-16 !w-full !place-items-center !gap-1 !p-0"
          @click="openCategory(category.id)"
        >
          <text class="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-xs font-black text-teal-700">
            {{ category.shortLabel.slice(0, 1) }}
          </text>
          <text class="text-[10px] font-semibold text-slate-600">
            {{ category.label }}
          </text>
        </VButton>
      </VCard>

      <VCard class-name="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-[linear-gradient(135deg,#ecfdf5,#f0fdfa)]" variant="outline">
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
