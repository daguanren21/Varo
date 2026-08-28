<script setup lang="ts">
import { computed, onLoad, shallowRef } from 'wevu'
import InputNumber from '../../components/ui/input-number.vue'
import VTag from '../../components/ui/tag.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VImage from '../../components/ui/v-image.vue'
import { navigateRetail, switchRetailTab } from '../../features/retail/navigation'
import { findRetailProduct, formatRetailMoney, useRetailStore } from '../../features/retail/store'

const productId = shallowRef('dress-white')
const quantity = shallowRef(1)
const product = computed(() => findRetailProduct(productId.value))
const { addToCart, cartCount } = useRetailStore()

onLoad((options) => {
  productId.value = String(options?.id ?? productId.value)
})

function add() {
  addToCart(product.value.id, quantity.value)
  wx.showToast({ title: '已加入购物车', icon: 'success' })
}

function buy() {
  addToCart(product.value.id, quantity.value)
  navigateRetail('/retail-order/order-confirm/index')
}

function back() {
  wx.navigateBack()
}
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-28 text-slate-950">
    <view class="relative h-[420px] overflow-hidden bg-white">
      <VImage :src="product.image" :alt="product.name" fit="cover" width="100%" height="420px" />
      <view class="absolute left-3 top-[calc(env(safe-area-inset-top)+10px)] flex gap-2">
        <VButton
          size="sm"
          shape="round"
          tone="default"
          class-name="!h-10 !min-h-10 !bg-black/45 !px-3 !text-[10px] !text-white !backdrop-blur"
          @click="back"
        >
          返回
        </VButton>
      </view>
      <VButton
        size="sm"
        shape="round"
        tone="default"
        class-name="absolute right-3 top-[calc(env(safe-area-inset-top)+10px)] !h-10 !min-h-10 !bg-black/45 !px-3 !text-[10px] !text-white !backdrop-blur"
        @click="switchRetailTab('cart')"
      >
        购物车 {{ cartCount }}
      </VButton>
    </view>

    <view class="grid gap-3 px-3 py-3">
      <VCard class-name="grid gap-3" variant="elevated">
        <view class="flex items-baseline gap-1">
          <text class="text-sm font-black text-[#f04438]">
            ¥
          </text>
          <text class="text-[30px] font-black tracking-tight text-[#f04438]">
            {{ formatRetailMoney(product.price) }}
          </text>
          <text class="text-xs text-slate-300 line-through">
            ¥{{ formatRetailMoney(product.linePrice) }}
          </text>
        </view>
        <view class="flex flex-wrap gap-1.5">
          <VTag v-for="tag in product.tags" :key="tag" tone="danger" variant="soft" size="sm">
            {{ tag }}
          </VTag>
        </view>
        <text class="text-lg font-black leading-7">
          {{ product.name }}
        </text>
        <text class="text-xs leading-5 text-slate-500">
          {{ product.description }}
        </text>
        <view class="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400">
          <text>已售 {{ product.sales }}</text>
          <text>库存 {{ product.stock }}</text>
          <text>运费 ¥0.00</text>
        </view>
      </VCard>

      <VCard class-name="grid gap-3" variant="default">
        <view class="flex items-center justify-between">
          <text class="text-sm font-black">
            购买数量
          </text>
          <InputNumber v-model:value="quantity" :min="1" :max="Math.max(1, product.stock)" />
        </view>
        <view class="grid grid-cols-[70px_minmax(0,1fr)] gap-2 text-xs">
          <text class="text-slate-400">
            服务
          </text>
          <text class="text-slate-700">
            七天无理由 · 极速退款 · 正品保障
          </text>
          <text class="text-slate-400">
            配送
          </text>
          <text class="text-slate-700">
            预计明日送达
          </text>
        </view>
      </VCard>

      <VCard class-name="grid gap-2" variant="default">
        <text class="text-sm font-black">
          商品详情
        </text>
        <text class="text-xs leading-6 text-slate-500">
          Varo Retail 使用可维护的原生 SFC 和 Headless 状态契约重建零售黄金链路。商品数据为本地 Mock，可直接替换为业务接口。
        </text>
      </VCard>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 shadow-[0_-8px_28px_rgba(15,23,42,.08)]">
      <view class="grid grid-cols-2 gap-2">
        <VButton size="lg" variant="outline" tone="danger" @click="add">
          加入购物车
        </VButton>
        <VButton size="lg" tone="danger" @click="buy">
          立即购买
        </VButton>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "商品详情",
  "navigationStyle": "custom",
  "usingComponents": {}
}
</json>
