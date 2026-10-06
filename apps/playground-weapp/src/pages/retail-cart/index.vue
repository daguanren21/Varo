<script setup lang="ts">
import { computed } from 'wevu'
import RetailCartItem from '../../components/retail/RetailCartItem.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import RetailSectionHeader from '../../components/retail/RetailSectionHeader.vue'
import VEmpty from '../../components/ui/empty.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
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
  <view class="retail-page-enter min-h-screen bg-[#f4f6f8] pb-36 text-slate-950">
    <view class="sticky top-0 z-20 bg-white px-4 pb-3 shadow-sm" :style="rootStyle">
      <view class="flex items-center justify-between gap-3" :style="navigationStyle">
        <view class="grid gap-0.5">
          <text class="text-xl font-black">
            购物车
          </text>
          <text class="text-[10px] text-slate-400">
            {{ cartItems.length }} 种商品
          </text>
        </view>
        <VButton size="sm" variant="ghost" @click="switchRetailTab('home')">
          继续购物
        </VButton>
      </view>
    </view>

    <RetailRequestState :loading="loading" :error="loadError" @retry="retryLoad" />
    <view v-if="!loading && !loadError && cartItems.length" class="retail-section-enter grid gap-3 px-3 py-3">
      <VCard variant="default">
        <view class="flex items-center justify-between gap-3">
          <view class="flex items-center gap-2">
            <text class="grid h-8 w-8 place-items-center rounded-xl bg-teal-700 text-[10px] font-black text-white">
              V
            </text>
            <view class="grid gap-0.5">
              <text class="text-xs font-black">
                Varo Retail 自营店
              </text>
              <text class="text-[9px] text-slate-400">
                本地模拟购物车 · 无真实配送
              </text>
            </view>
          </view>
          <text class="text-[10px] font-bold text-[#f04438]">
            优惠券
          </text>
        </view>
      </VCard>

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

      <RetailSectionHeader title="猜你喜欢" subtitle="根据购物车内容为你推荐" />
    </view>

    <view v-else-if="!loading && !loadError" class="grid min-h-[70vh] place-items-center px-6">
      <VEmpty title="购物车还是空的" description="去首页挑选几件喜欢的商品吧">
        <VButton @click="switchRetailTab('home')">
          去逛逛
        </VButton>
      </VEmpty>
    </view>

    <view v-if="cartItems.length" class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 shadow-[0_-8px_26px_rgba(15,23,42,.08)]">
      <view class="flex items-center justify-between gap-3">
        <VCheckbox v-model:checked="allSelected" :disabled="submitting">
          全选
        </VCheckbox>
        <view class="flex min-w-0 flex-1 items-center justify-end gap-3">
          <view class="grid justify-items-end gap-0.5">
            <text class="text-[10px] text-slate-400">
              合计（不含运费）
            </text>
            <text class="text-lg font-black text-[#f04438]">
              ¥{{ formatRetailMoney(cartTotal) }}
            </text>
          </view>
          <VButton size="lg" tone="danger" shape="round" :disabled="selectedCount === 0 || submitting" @click="checkout">
            去结算（{{ selectedCount }}）
          </VButton>
        </view>
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
