<script setup lang="ts">
import type { RetailCartLine, RetailOrderSummary } from '../../lib/retail'
import { computed, onLoad, shallowRef, watch } from 'wevu'
import bannerImage from '../../assets/retail/banner.jpg'
import AgentChat from '../../components/blocks/agent-chat.vue'
import LoginForm from '../../components/blocks/login-form.vue'
import OrderFilter from '../../components/blocks/order-filter.vue'
import ProductList from '../../components/blocks/product-list.vue'
import ProfileCard from '../../components/blocks/profile-card.vue'
import ProfileEdit from '../../components/blocks/profile-edit.vue'
import VButton from '../../components/ui/v-button.vue'
import { retailCategories } from '../../features/retail/data'
import { errorMessage } from '../../features/retail/service'
import { useRetailStore } from '../../features/retail/store'
import { normalizeRetailProduct } from '../../lib/retail'
import RetailCart from '../components/retail-cart.vue'
import RetailCategory from '../components/retail-category.vue'
import RetailCheckout from '../components/retail-checkout.vue'
import RetailHome from '../components/retail-home.vue'
import RetailOrderList from '../components/retail-order-list.vue'
import RetailProductDetail from '../components/retail-product-detail.vue'
import RetailProfile from '../components/retail-profile.vue'

type BlockId
  = | 'agent-chat'
    | 'login-form'
    | 'order-filter'
    | 'product-list'
    | 'profile-card'
    | 'profile-edit'
    | 'retail-cart'
    | 'retail-category'
    | 'retail-checkout'
    | 'retail-home'
    | 'retail-order-list'
    | 'retail-product-detail'
    | 'retail-profile'

const blockDefinitions: { id: BlockId, label: string }[] = [
  { id: 'login-form', label: '登录' },
  { id: 'profile-card', label: '资料卡' },
  { id: 'profile-edit', label: '资料编辑' },
  { id: 'product-list', label: '商品列表' },
  { id: 'order-filter', label: '订单筛选' },
  { id: 'agent-chat', label: 'Agent' },
  { id: 'retail-home', label: '零售首页' },
  { id: 'retail-category', label: '零售分类' },
  { id: 'retail-cart', label: '购物车' },
  { id: 'retail-product-detail', label: '商品详情' },
  { id: 'retail-checkout', label: '结算' },
  { id: 'retail-order-list', label: '订单' },
  { id: 'retail-profile', label: '我的' },
]

const active = shallowRef<BlockId>('retail-home')
const captureMode = shallowRef(false)
const activeCategory = shallowRef(retailCategories[0].id)
const quantity = shallowRef(1)
const retail = useRetailStore()
const retailProducts = computed(() => retail.products.value)
const primaryProduct = computed(() => retailProducts.value[0])
const safeAddressCount = computed(() => retail.addresses.value.length)
const safeCartCount = computed(() => retail.cartCount.value)
const safeCartTotal = computed(() => retail.cartTotal.value)
const safeCouponCount = computed(() => retail.coupons.value.length)
const safeSelectedCount = computed(() => retail.selectedCartItems.value.length)
const checkoutLoading = computed(() => retail.loading.value || retail.checkoutLoading.value)
const checkoutSubmitting = computed(() => retail.submitting.value)
const checkoutError = computed(() => retail.loadError.value || retail.checkoutError.value || retail.submitError.value)
const checkoutUnavailable = computed(() => !retail.checkoutQuote.value)
const checkoutDiscount = computed(() => retail.checkoutQuote.value?.discount ?? 0)
const checkoutShipping = computed(() => retail.checkoutQuote.value?.shipping ?? 0)
const checkoutTotal = computed(() => retail.checkoutQuote.value?.subtotal ?? retail.cartTotal.value)
const tabs = computed(() => blockDefinitions.map(tab => ({
  ...tab,
  variant: active.value === tab.id ? 'solid' as const : 'ghost' as const,
})))
const rootClass = computed(() => captureMode.value
  ? 'min-h-screen bg-[#e8edf2] p-4 text-slate-950'
  : 'min-h-screen bg-[#e8edf2] pb-8 text-slate-950')
const contentClass = computed(() => captureMode.value ? '' : 'p-4')
const initialProfile = {
  bio: '用源码组装稳定的产品界面。',
  city: 'hangzhou',
  name: 'Varo Member',
  phone: '13800138000',
}
const showcaseProducts = computed(() => retail.products.value.slice(0, 3).map(product => ({
  badge: product.tags[0],
  description: product.description,
  id: product.id,
  image: product.image,
  inventory: product.stock,
  name: product.name,
  price: product.price,
})))
const profile = {
  fallback: 'VA',
  name: 'Varo Member',
  status: '已认证',
  statusTone: 'success' as const,
  subtitle: '可维护的本地组件与业务 Blocks',
}
const profileStats = [
  { label: '收藏', value: 28 },
  { label: '订单', value: 12 },
  { label: '积分', value: 2680 },
]
const cities = [
  { label: '上海', value: 'shanghai' },
  { label: '杭州', value: 'hangzhou' },
  { label: '深圳', value: 'shenzhen' },
]
const agentMessages = [
  { content: '今天想找什么？我可以比较商品、整理订单并在操作前请你确认。', id: 'welcome', label: 'Varo Agent', role: 'assistant' as const },
]
const agentSuggestions = ['推荐三件通勤单品', '查看待收货订单']
const cartLines = computed(() => retail.cartItems.value.map(item => ({
  product: item.product,
  quantity: item.quantity,
  selected: item.selected,
})))
const checkoutAddress = computed(() => {
  const address = retail.checkoutQuote.value?.address ?? retail.selectedAddress.value
  return address
    ? {
        detail: `${address.city} ${address.district} ${address.detail}`,
        isDefault: address.isDefault,
        name: address.name,
        phone: address.phone,
      }
    : undefined
})
const checkoutLines = computed<RetailCartLine[]>(() => (retail.checkoutQuote.value?.items ?? []).map(item => ({
  product: normalizeRetailProduct({
    ...retail.products.value.find(product => product.id === item.productId),
    id: item.productId,
    name: item.name,
    image: item.image,
    price: item.unitPrice,
  }),
  quantity: item.quantity,
  selected: true,
})))
const orderSummaries = computed<RetailOrderSummary[]>(() => retail.orders.value.map(order => ({
  createdAt: order.createdAt,
  id: order.id,
  itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
  preview: normalizeRetailProduct({
    id: order.items[0]?.productId,
    name: order.items[0]?.name,
    image: order.items[0]?.image,
    price: order.items[0]?.unitPrice,
  }),
  status: order.status,
  total: order.total,
})))
const orderCounts = computed(() => retail.orders.value.reduce<Record<string, number>>((counts, order) => ({
  ...counts,
  [order.status]: (counts[order.status] ?? 0) + 1,
}), {}))

onLoad(async (options) => {
  try {
    await retail.load()
  }
  catch (error) {
    notify(errorMessage(error))
  }
  const requested = String(options?.block ?? '')
  const matched = blockDefinitions.find(tab => tab.id === requested)
  if (matched) { active.value = matched.id }
  captureMode.value = String(options?.capture ?? '') === '1'
})

watch(active, (block) => {
  if (block === 'retail-checkout') { void prepareCheckout() }
})

async function prepareCheckout() {
  try {
    await retail.load()
    await retail.prepareCheckout()
  }
  catch (error) {
    notify(errorMessage(error))
  }
}

async function submitOrder() {
  try {
    await retail.createOrder()
    active.value = 'retail-order-list'
  }
  catch (error) {
    notify(errorMessage(error))
  }
}

function addProduct(productId: string, quantity = 1, openCheckout = false) {
  try {
    retail.addToCart(productId, quantity)
    if (openCheckout) { active.value = 'retail-checkout' }
  }
  catch (error) {
    notify(errorMessage(error))
  }
}

function changeQuantity(productId: string, quantity: number) {
  try {
    if (quantity === 0) { retail.removeCartItem(productId) }
    else { retail.updateCartQuantity(productId, quantity) }
  }
  catch (error) {
    notify(errorMessage(error))
  }
}

function toggleCartItem(productId: string) {
  try {
    retail.toggleCartItem(productId)
  }
  catch (error) {
    notify(errorMessage(error))
  }
}

function selectCategory(category: { id: string }) {
  activeCategory.value = category.id
  active.value = 'retail-category'
}

function notify(title: string) {
  wx.showToast({ title, icon: 'none' })
}
</script>

<template>
  <view :class="rootClass">
    <scroll-view v-if="!captureMode" scroll-x class="sticky top-0 z-30 whitespace-nowrap bg-white px-2 py-2 shadow-sm">
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

    <view :class="contentClass">
      <LoginForm
        v-if="active === 'login-form'"
        initial-phone="13800138000"
        @forgot-password="notify('找回密码')"
        @submit="notify(`欢迎 ${$event.phone}`)"
      />
      <ProfileCard
        v-else-if="active === 'profile-card'"
        :user="profile"
        :stats="profileStats"
        @edit="notify('编辑资料')"
        @select-stat="notify($event.stat.label)"
      />
      <ProfileEdit
        v-else-if="active === 'profile-edit'"
        :cities="cities"
        :initial-profile="initialProfile"
        @submit="notify(`已保存 ${$event.name}`)"
      />
      <ProductList
        v-else-if="active === 'product-list'"
        title="精选好物"
        description="直接安装到项目并继续修改的商品列表 Block。"
        :items="showcaseProducts"
        @select="notify($event.item.name)"
        @add-to-cart="addProduct($event.item.id)"
      />
      <OrderFilter
        v-else-if="active === 'order-filter'"
        :result-count="128"
        @apply="notify(`找到 128 条订单`)"
        @reset="notify('已重置')"
      />
      <AgentChat
        v-else-if="active === 'agent-chat'"
        :messages="agentMessages"
        :suggestions="agentSuggestions"
        @submit="notify($event)"
      />
      <RetailHome
        v-else-if="active === 'retail-home'"
        title="Varo Retail Blocks"
        :banner="bannerImage"
        :cart-count="safeCartCount"
        :categories="retailCategories"
        :products="retailProducts"
        @search="notify(`搜索：${$event}`)"
        @cart="active = 'retail-cart'"
        @category="selectCategory"
        @select="notify($event.name)"
        @add="addProduct($event.id)"
      />
      <RetailCategory
        v-else-if="active === 'retail-category'"
        v-model:active-id="activeCategory"
        :categories="retailCategories"
        :products="retailProducts"
        @select="notify($event.name)"
        @add="addProduct($event.id)"
      />
      <RetailCart
        v-else-if="active === 'retail-cart'"
        :items="cartLines"
        :selected-count="safeSelectedCount"
        :total="safeCartTotal"
        @select="toggleCartItem($event.productId)"
        @quantity-change="changeQuantity($event.productId, $event.quantity)"
        @view="notify($event)"
        @checkout="active = 'retail-checkout'"
        @continue="active = 'retail-home'"
      />
      <RetailProductDetail
        v-else-if="active === 'retail-product-detail'"
        v-model:quantity="quantity"
        :product="primaryProduct"
        :cart-count="safeCartCount"
        @back="active = 'retail-home'"
        @cart="active = 'retail-cart'"
        @add="addProduct($event.product.id, $event.quantity)"
        @buy="addProduct($event.product.id, $event.quantity, true)"
      />
      <RetailCheckout
        v-else-if="active === 'retail-checkout'"
        :address="checkoutAddress"
        :coupon-count="safeCouponCount"
        :discount="checkoutDiscount"
        :shipping="checkoutShipping"
        :loading="checkoutLoading"
        :submitting="checkoutSubmitting"
        :error="checkoutError"
        :disabled="checkoutUnavailable"
        :items="checkoutLines"
        :total="checkoutTotal"
        @address="notify('选择地址')"
        @coupon="notify('选择优惠券')"
        @invoice="notify('填写发票')"
        @view="notify($event)"
        @retry="prepareCheckout"
        @submit="submitOrder"
      />
      <RetailOrderList
        v-else-if="active === 'retail-order-list'"
        :orders="orderSummaries"
        @view="notify($event.id)"
        @action="notify($event.id)"
      />
      <RetailProfile
        v-else
        name="Varo 用户"
        level="PLUS"
        :points="2680"
        :address-count="safeAddressCount"
        :coupon-count="safeCouponCount"
        :order-counts="orderCounts"
        @action="notify($event)"
      />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Retail Blocks",
  "usingComponents": {}
}
</json>
