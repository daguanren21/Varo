<script setup lang="ts">
import { computed } from 'wevu'
import RetailCartItem from '../../components/retail/RetailCartItem.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VEmpty from '../../components/ui/empty.vue'
import VButton from '../../components/ui/v-button.vue'
import VCheckbox from '../../components/ui/v-checkbox.vue'
import { useWeappChrome } from '../../composables/useWeappChrome'
import { navigateRetail, switchRetailTab } from '../../features/retail/navigation'
import { formatRetailMoney } from '../../features/retail/store'
import { runRetailAction, useRetailPage } from '../../features/retail/use-retail-page'

const {
  cartItems,
  cartTotal,
  selectAllCartItems,
  toggleCartItem,
  updateCartQuantity,
  removeCartItem,
  loading,
  loadError,
  retryLoad,
  submitting,
} = useRetailPage()
const { navigationStyle, rootStyle } = useWeappChrome()

const allSelected = computed({
  get: () => cartItems.value.length > 0 && cartItems.value.every(item => item.selected),
  set: (value) => { void runRetailAction(() => selectAllCartItems(value)) },
})
const selectedCount = computed(() => cartItems.value.filter(item => item.selected).reduce((total, item) => total + item.quantity, 0))

function changeQuantity(productId: string, quantity: number) {
  return runRetailAction(() => updateCartQuantity(productId, quantity))
}

function toggleProduct(productId: string) {
  return runRetailAction(() => toggleCartItem(productId))
}

function removeProduct(productId: string) {
  return runRetailAction(() => removeCartItem(productId))
}

function checkout() {
  if (selectedCount.value === 0) {
    wx.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  navigateRetail('/retail-order/order-confirm/index')
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-40 text-[#292722]">
    <view class="sticky top-0 z-20 border-b border-[#dcd6cb] bg-[#f7f4ee] px-[18px] pb-3" :style="rootStyle">
      <view class="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3" :style="navigationStyle">
        <view class="grid gap-1">
          <text class="retail-heading text-[26px] leading-9">
            购物车
          </text>
          <text class="text-[15px] text-[#625e55]">
            {{ cartItems.length }} 种商品
          </text>
        </view>
        <VButton variant="ghost" class-name="!min-h-11 !px-2 !text-[15px]" @click="switchRetailTab('home')">
          继续购物
        </VButton>
      </view>
    </view>

    <RetailRequestState :loading="loading" :error="loadError" @retry="retryLoad" />
    <view v-if="!loading && !loadError && cartItems.length" class="retail-section-enter mx-auto max-w-4xl px-[18px]">
      <view class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[#dcd6cb] py-3">
        <VCheckbox v-model:checked="allSelected" :disabled="submitting">
          全选
        </VCheckbox>
        <text class="text-[15px] leading-6 text-[#625e55]">
          已选 {{ selectedCount }} 件
        </text>
      </view>
      <RetailCartItem
        v-for="item in cartItems"
        :key="item.product.id"
        :product="item.product"
        :quantity="item.quantity"
        :selected="item.selected"
        :disabled="submitting"
        @select="toggleProduct(item.product.id)"
        @quantity-change="changeQuantity(item.product.id, $event)"
        @remove="removeProduct(item.product.id)"
        @view="navigateRetail('/retail-goods/details/index', { id: item.product.id })"
      />
      <text class="block py-5 text-[15px] leading-7 text-[#625e55]">
        本地模拟购物，不扣款、不发货。
      </text>
    </view>

    <view v-else-if="!loading && !loadError" class="grid min-h-[60vh] place-items-center px-6">
      <VEmpty title="购物车还是空的" description="去首页挑选几件喜欢的商品吧">
        <VButton class-name="!min-h-11 !rounded-[3px] !text-base" @click="switchRetailTab('home')">
          去逛逛
        </VButton>
      </VEmpty>
    </view>

    <view v-if="cartItems.length" class="fixed inset-x-0 bottom-0 z-30 border-t border-[#dcd6cb] bg-[#f7f4ee] px-[18px] pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
      <view class="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <view class="grid min-w-0 gap-1">
          <text class="text-[15px] leading-6 text-[#625e55]">
            合计 · 不含运费
          </text>
          <text class="retail-price break-words text-[26px] leading-8">
            ¥{{ formatRetailMoney(cartTotal) }}
          </text>
        </view>
        <VButton size="lg" class-name="!min-h-12 !rounded-[3px] !px-5 !text-base" :disabled="selectedCount === 0 || submitting" @click="checkout">
          去结算（{{ selectedCount }}）
        </VButton>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "购物车",
  "navigationStyle": "custom",
  "usingComponents": {}
}
</json>
