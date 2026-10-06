<script setup lang="ts">
import { computed, onHide, onShow, onUnload } from 'wevu'
import RetailOrderItems from '../../components/retail/RetailOrderItems.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import { retailConfig } from '../../features/retail/config'
import { navigateRetail, switchRetailTab } from '../../features/retail/navigation'
import { formatRetailMoney, useRetailStore } from '../../features/retail/store'
import { runRetailAction } from '../../features/retail/use-retail-page'

const { load, loading, loadError, selectedAddress, selectedCartItems, checkoutQuote, checkoutLoading, checkoutError, prepareCheckout, createOrder, submitting, submitError } = useRetailStore()
const brand = retailConfig.brand
const deliveryAddress = computed(() => checkoutQuote.value?.address ?? selectedAddress.value)
const submitDisabled = computed(() => !checkoutQuote.value || checkoutLoading.value || submitting.value)
const payableLabel = computed(() => checkoutQuote.value ? `¥${formatRetailMoney(checkoutQuote.value.total)}` : '待确认')
const submitLabel = computed(() => submitting.value ? '正在提交…' : '创建模拟订单')
let visible = false

function refresh() {
  return runRetailAction(async () => {
    await load()
    if (!submitting.value) { await prepareCheckout() }
  })
}
onShow(() => {
  visible = true
  return refresh()
})
onHide(() => { visible = false })
onUnload(() => { visible = false })

function chooseAddress() {
  if (!submitting.value) { navigateRetail('/retail-user/address/list/index', { select: '1' }) }
}

function submitOrder() {
  if (submitDisabled.value) { return }
  return runRetailAction(async () => {
    const order = await createOrder()
    if (visible) { navigateRetail('/retail-order/pay-result/index', { id: order.id }) }
  })
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f4f6f8] pb-32 text-slate-950">
    <view class="bg-slate-950 px-4 pb-8 pt-7 text-white">
      <text class="text-[10px] font-black tracking-[0.16em] text-white/70">
        CHECKOUT
      </text>
      <text class="mt-1 block text-2xl font-black">
        确认模拟订单
      </text>
      <text class="mt-1 block text-xs text-white/75">
        仅演示订单创建，不扣款、不发货，不代表支付成功。
      </text>
    </view>
    <RetailRequestState :loading="loading" :error="loadError" @retry="refresh" />
    <view v-if="!loading && !loadError" class="grid gap-3 px-3 py-3">
      <VCard class-name="grid gap-2" variant="default">
        <view v-if="deliveryAddress" class="grid gap-1">
          <text class="text-sm font-black">
            {{ deliveryAddress.name }} {{ deliveryAddress.phone }}
          </text>
          <text class="text-xs leading-5 text-slate-600">
            {{ deliveryAddress.city }} {{ deliveryAddress.district }} {{ deliveryAddress.detail }}
          </text>
        </view>
        <text v-else class="text-sm text-slate-500">
          请先添加并选择有效收货地址
        </text>
        <VButton size="sm" variant="outline" :disabled="submitting" @click="chooseAddress">
          选择收货地址
        </VButton>
      </VCard>
      <RetailRequestState :loading="checkoutLoading" :error="checkoutError" @retry="refresh" />
      <VCard v-if="checkoutQuote" class-name="grid gap-3" variant="default">
        <text class="text-sm font-black">
          {{ brand.name }} · 商品快照
        </text>
        <RetailOrderItems :items="checkoutQuote.items" />
        <view class="flex justify-between text-xs">
          <text>商品金额</text><text>¥{{ formatRetailMoney(checkoutQuote.subtotal) }}</text>
        </view>
        <view class="flex justify-between text-xs">
          <text>运费</text><text>¥{{ formatRetailMoney(checkoutQuote.shipping) }}</text>
        </view>
        <view class="flex justify-between text-xs">
          <text>模拟优惠</text><text>-¥{{ formatRetailMoney(checkoutQuote.discount) }}</text>
        </view>
      </VCard>
      <RetailRequestState :empty="selectedCartItems.length === 0" empty-title="没有可结算商品" />
      <VButton variant="ghost" :disabled="submitting" @click="switchRetailTab('cart')">
        返回购物车调整商品
      </VButton>
      <VCard v-if="submitError" class-name="grid gap-2" variant="default">
        <text class="text-sm text-red-600">
          {{ submitError }}
        </text>
        <text class="text-xs text-slate-500">
          购物车保持不变。确认金额后可重新提交。
        </text>
        <VButton size="sm" variant="outline" :disabled="submitting" @click="refresh">
          重新确认金额
        </VButton>
      </VCard>
    </view>
    <view class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      <view class="flex items-center justify-between gap-3">
        <view class="grid gap-0.5">
          <text class="text-xs text-slate-500">
            模拟订单金额
          </text><text class="text-xl font-black text-[#f04438]">
            {{ payableLabel }}
          </text>
        </view>
        <VButton size="lg" tone="danger" shape="round" :disabled="submitDisabled" :loading="submitting" @click="submitOrder">
          {{ submitLabel }}
        </VButton>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "确认模拟订单",
  "navigationBarBackgroundColor": "#0f766e",
  "navigationBarTextStyle": "white",
  "usingComponents": {}
}
</json>
