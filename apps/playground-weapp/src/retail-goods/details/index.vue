<script setup lang="ts">
import { computed, onLoad, shallowRef } from 'wevu'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import InputNumber from '../../components/ui/input-number.vue'
import VButton from '../../components/ui/v-button.vue'
import VImage from '../../components/ui/v-image.vue'
import { useWeappChrome } from '../../composables/useWeappChrome'
import { navigateRetail, switchRetailTab } from '../../features/retail/navigation'
import { formatRetailMoney } from '../../features/retail/store'
import { runRetailAction, useRetailPage } from '../../features/retail/use-retail-page'

const productId = shallowRef('dress-white')
const quantity = shallowRef(1)
const { addToCart, cartCount, products, loading, loadError, retryLoad, submitting } = useRetailPage()
const product = computed(() => products.value.find(item => item.id === productId.value))
const unavailable = computed(() => !product.value || product.value.stock === 0 || submitting.value)
const quantityMax = computed(() => Math.max(1, product.value?.stock ?? 0))
const { navigationStyle, rootStyle } = useWeappChrome()

onLoad((options) => {
  productId.value = String(options?.id ?? productId.value)
})

function add() {
  return runRetailAction(() => {
    addToCart(productId.value, quantity.value)
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  })
}

function buy() {
  return runRetailAction(() => {
    addToCart(productId.value, quantity.value)
    navigateRetail('/retail-order/order-confirm/index')
  })
}

function back() {
  wx.navigateBack({ fail: () => wx.showToast({ title: '返回失败，可从购物车或首页继续浏览', icon: 'none' }) })
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-[calc(env(safe-area-inset-bottom)+132px)] text-[#292722]">
    <view class="border-b border-[#dcd6cb]" :style="rootStyle">
      <view class="mx-auto box-border w-full max-w-[1000px] px-[18px] md:px-9">
        <view class="flex items-center justify-between gap-3" :style="navigationStyle">
          <VButton
            variant="ghost"
            tone="default"
            class-name="!min-h-11 !rounded-[3px] !px-2 !text-[15px] !font-normal !text-[#292722]"
            @click="back"
          >
            返回
          </VButton>
          <VButton
            variant="ghost"
            tone="default"
            class-name="!min-h-11 !rounded-[3px] !px-2 !text-[15px] !font-normal !text-[#292722]"
            @click="switchRetailTab('cart')"
          >
            购物车 {{ cartCount }}
          </VButton>
        </view>
      </view>
    </view>
    <RetailRequestState :loading="loading" :error="loadError" :empty="!product" empty-title="商品不存在或已下架" @retry="retryLoad" />
    <VButton v-if="!product" variant="ghost" class-name="!min-h-11 !rounded-[3px] !text-base" @click="switchRetailTab('home')">
      返回首页
    </VButton>
    <view v-if="product && !loading && !loadError">
      <view class="retail-section-enter mx-auto grid box-border w-full max-w-[1000px] gap-6 px-[18px] py-6 md:grid-cols-2 md:gap-12 md:px-9 md:py-9">
        <view class="h-[280px] min-w-0 overflow-hidden rounded-[3px] md:h-[420px]">
          <VImage :src="product.image" :alt="product.name" fit="contain" width="100%" height="100%" radius="3px" />
        </view>

        <view class="grid min-w-0 content-start gap-5">
          <text class="retail-heading text-[25px] leading-9 md:text-[30px]">
            {{ product.name }}
          </text>
          <text class="retail-price text-[30px] leading-9">
            ¥{{ formatRetailMoney(product.price) }}
          </text>
          <text class="text-base leading-7 text-[#625e55]">
            {{ product.description }}
          </text>
          <view class="flex flex-wrap items-center justify-between gap-2 border-y border-[#dcd6cb] py-4 text-[15px] leading-6">
            <text class="text-[#625e55]">
              库存
            </text>
            <text v-if="product.stock === 0" class="text-[#86543c]">
              暂时缺货
            </text>
            <text v-else>
              {{ product.stock }} 件
            </text>
          </view>
          <view class="flex flex-wrap items-center justify-between gap-3">
            <text class="text-base leading-7">
              购买数量
            </text>
            <InputNumber
              v-model:value="quantity"
              :min="1"
              :max="quantityMax"
              :disabled="unavailable"
              decrease-aria-label="减少购买数量"
              increase-aria-label="增加购买数量"
              input-aria-label="购买数量"
            />
          </view>
          <view class="grid grid-cols-[44px_minmax(0,1fr)] gap-x-4 gap-y-3 border-t border-[#dcd6cb] pt-5 text-[15px] leading-7">
            <text class="text-[#625e55]">
              服务
            </text>
            <text>
              本地模拟商品，不提供真实售后服务
            </text>
            <text class="text-[#625e55]">
              配送
            </text>
            <text>
              未接入配送服务
            </text>
          </view>
        </view>
      </view>

      <view class="fixed inset-x-0 bottom-0 z-30 border-t border-[#dcd6cb] bg-[#f7f4ee] pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <view class="mx-auto grid box-border w-full max-w-[1000px] grid-cols-2 gap-3 px-[18px] md:px-9">
          <view class="min-w-0">
            <VButton block size="lg" variant="outline" class-name="!min-h-12 !w-full !rounded-[3px] !px-2 !text-base" :disabled="unavailable" @click="add">
              加入购物车
            </VButton>
          </view>
          <view class="min-w-0">
            <VButton block size="lg" class-name="!min-h-12 !w-full !rounded-[3px] !px-2 !text-base" :disabled="unavailable" @click="buy">
              立即购买
            </VButton>
          </view>
        </view>
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
