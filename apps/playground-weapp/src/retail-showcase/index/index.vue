<script setup lang="ts">
import type { RetailOrderSummary } from '../../lib/retail'
import { computed, shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import { retailCategories } from '../../features/retail/data'
import { useRetailStore } from '../../features/retail/store'
import RetailCart from '../components/retail-cart.vue'
import RetailCategory from '../components/retail-category.vue'
import RetailCheckout from '../components/retail-checkout.vue'
import RetailHome from '../components/retail-home.vue'
import RetailOrderList from '../components/retail-order-list.vue'
import RetailProductDetail from '../components/retail-product-detail.vue'
import RetailProfile from '../components/retail-profile.vue'

const active = shallowRef('home')
const activeCategory = shallowRef(retailCategories[0].id)
const quantity = shallowRef(1)
const retail = useRetailStore()
const tabs = computed(() => [
  { id: 'home', label: '首页', variant: active.value === 'home' ? 'solid' as const : 'ghost' as const },
  { id: 'category', label: '分类', variant: active.value === 'category' ? 'solid' as const : 'ghost' as const },
  { id: 'cart', label: '购物车', variant: active.value === 'cart' ? 'solid' as const : 'ghost' as const },
  { id: 'detail', label: '详情', variant: active.value === 'detail' ? 'solid' as const : 'ghost' as const },
  { id: 'checkout', label: '结算', variant: active.value === 'checkout' ? 'solid' as const : 'ghost' as const },
  { id: 'orders', label: '订单', variant: active.value === 'orders' ? 'solid' as const : 'ghost' as const },
  { id: 'profile', label: '我的', variant: active.value === 'profile' ? 'solid' as const : 'ghost' as const },
])
const cartLines = computed(() => retail.cartItems.value.map(item => ({
  product: item.product,
  quantity: item.quantity,
  selected: item.selected,
})))
const checkoutAddress = computed(() => {
  const address = retail.defaultAddress.value
  return {
    detail: address ? `${address.city} ${address.district} ${address.detail}` : '请选择收货地址',
    isDefault: Boolean(address?.isDefault),
    name: address?.name ?? '未选择地址',
    phone: address?.phone ?? '',
  }
})
const orderSummaries = computed<RetailOrderSummary[]>(() => retail.orders.value.map(order => ({
  createdAt: order.createdAt,
  id: order.id,
  itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
  preview: retail.products.value.find(product => product.id === order.items[0]?.productId) ?? retail.products.value[0],
  status: order.status,
  total: order.total,
})))
const orderCounts = computed(() => retail.orders.value.reduce<Record<string, number>>((counts, order) => ({
  ...counts,
  [order.status]: (counts[order.status] ?? 0) + 1,
}), {}))

function notify(title: string) {
  wx.showToast({ title, icon: 'none' })
}
</script>

<template>
  <view class="min-h-screen bg-[#e2e8f0] pb-8 text-slate-950">
    <scroll-view scroll-x class="sticky top-0 z-30 whitespace-nowrap bg-white px-2 py-2 shadow-sm">
      <view class="inline-flex gap-1">
        <VButton
          v-for="tab in tabs"
          :key="tab.id"
          size="sm"
          :variant="tab.variant"
          @click="active = tab.id"
        >
          {{ tab.label }}
        </VButton>
      </view>
    </scroll-view>

    <RetailHome
      v-if="active === 'home'"
      title="Varo Retail Blocks"
      banner="https://tdesign.gtimg.com/miniprogram/template/retail/home/v2/banner1.png"
      :cart-count="retail.cartCount.value"
      :categories="retailCategories"
      :products="retail.products.value"
      @search="notify(`搜索：${$event}`)"
      @cart="active = 'cart'"
      @category="activeCategory = $event.id; active = 'category'"
      @select="notify($event.name)"
      @add="retail.addToCart($event.id)"
    />
    <RetailCategory
      v-else-if="active === 'category'"
      v-model:active-id="activeCategory"
      :categories="retailCategories"
      :products="retail.products.value"
      @select="notify($event.name)"
      @add="retail.addToCart($event.id)"
    />
    <RetailCart
      v-else-if="active === 'cart'"
      :items="cartLines"
      :selected-count="retail.selectedCartItems.value.length"
      :total="retail.cartTotal.value"
      @select="retail.toggleCartItem($event.productId)"
      @quantity-change="retail.updateCartQuantity($event.productId, $event.quantity)"
      @view="notify($event)"
      @checkout="active = 'checkout'"
      @continue="active = 'home'"
    />
    <RetailProductDetail
      v-else-if="active === 'detail'"
      v-model:quantity="quantity"
      :product="retail.products.value[0]"
      :cart-count="retail.cartCount.value"
      @back="active = 'home'"
      @cart="active = 'cart'"
      @add="retail.addToCart($event.product.id, $event.quantity)"
      @buy="retail.addToCart($event.product.id, $event.quantity); active = 'checkout'"
    />
    <RetailCheckout
      v-else-if="active === 'checkout'"
      :address="checkoutAddress"
      :coupon-count="retail.coupons.value.length"
      :discount="1000"
      :items="cartLines.filter(item => item.selected)"
      :total="retail.cartTotal.value"
      @address="notify('选择地址')"
      @coupon="notify('选择优惠券')"
      @invoice="notify('填写发票')"
      @view="notify($event)"
      @submit="retail.createOrder(); active = 'orders'"
    />
    <RetailOrderList
      v-else-if="active === 'orders'"
      :orders="orderSummaries"
      @view="notify($event.id)"
      @action="notify($event.id)"
    />
    <RetailProfile
      v-else
      name="Varo 用户"
      level="PLUS"
      :points="2680"
      :address-count="retail.addresses.value.length"
      :coupon-count="retail.coupons.value.length"
      :order-counts="orderCounts"
      @action="notify($event)"
    />
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Retail Blocks",
  "usingComponents": {}
}
</json>
