<script setup lang="ts">
import { computed, onHide, onShow, onUnload } from 'wevu'
import RetailOrderItems from '../../components/retail/RetailOrderItems.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VButton from '../../components/ui/v-button.vue'
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
  }, () => loadError.value || checkoutError.value)
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
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-40 text-[#292722]">
    <view class="mx-auto max-w-4xl px-[18px] pb-5 pt-6">
      <text class="retail-heading block text-[26px] leading-9">
        确认模拟订单
      </text>
      <text class="mt-3 block text-[15px] leading-7 text-[#625e55]">
        仅创建模拟订单，不扣款、不发货，不代表支付成功。
      </text>
    </view>
    <RetailRequestState :loading="loading" :error="loadError" @retry="refresh" />
    <view v-if="!loading && !loadError" class="mx-auto grid max-w-4xl gap-6 px-[18px]">
      <view class="grid gap-4 border-y border-[#dcd6cb] py-5">
        <text class="retail-heading text-xl">
          收货地址
        </text>
        <view v-if="deliveryAddress" class="grid gap-2">
          <view class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base leading-7">
            <text class="break-words font-semibold">
              {{ deliveryAddress.name }}
            </text>
            <text>{{ deliveryAddress.phone }}</text>
          </view>
          <text class="break-words text-[15px] leading-7 text-[#625e55]">
            {{ deliveryAddress.city }} {{ deliveryAddress.district }} {{ deliveryAddress.detail }}
          </text>
        </view>
        <text v-else class="text-[15px] leading-7 text-[#625e55]">
          请先添加并选择有效收货地址
        </text>
        <view>
          <VButton variant="outline" class-name="!min-h-11 !rounded-[3px] !text-[15px]" :disabled="submitting" @click="chooseAddress">
            选择收货地址
          </VButton>
        </view>
      </view>
      <RetailRequestState :loading="checkoutLoading" :error="checkoutError" @retry="refresh" />
      <view v-if="checkoutQuote">
        <text class="retail-heading text-xl">
          {{ brand.name }} · 商品快照
        </text>
        <RetailOrderItems :items="checkoutQuote.items" />
        <view class="grid gap-3 pt-5 text-[15px] leading-7">
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <text class="text-[#625e55]">
              商品金额
            </text>
            <text class="retail-price text-xl">
              ¥{{ formatRetailMoney(checkoutQuote.subtotal) }}
            </text>
          </view>
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <text class="text-[#625e55]">
              运费
            </text>
            <text class="retail-price text-xl">
              ¥{{ formatRetailMoney(checkoutQuote.shipping) }}
            </text>
          </view>
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <text class="text-[#625e55]">
              模拟优惠
            </text>
            <text class="retail-price text-xl">
              -¥{{ formatRetailMoney(checkoutQuote.discount) }}
            </text>
          </view>
        </view>
      </view>
      <RetailRequestState :empty="selectedCartItems.length === 0" empty-title="没有可结算商品" />
      <VButton variant="ghost" class-name="!min-h-11 !text-[15px]" :disabled="submitting" @click="switchRetailTab('cart')">
        返回购物车调整商品
      </VButton>
      <view v-if="submitError" class="grid gap-3 border-l-2 border-[#a12116] py-2 pl-4">
        <text class="text-base leading-7 text-[#a12116]">
          {{ submitError }}
        </text>
        <text class="text-[15px] leading-7 text-[#625e55]">
          购物车保持不变。确认金额后可重新提交。
        </text>
        <view>
          <VButton variant="outline" class-name="!min-h-11 !rounded-[3px] !text-[15px]" :disabled="submitting" @click="refresh">
            重新确认金额
          </VButton>
        </view>
      </view>
    </view>
    <view class="fixed inset-x-0 bottom-0 z-30 border-t border-[#dcd6cb] bg-[#f7f4ee] px-[18px] pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
      <view class="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <view class="grid min-w-0 gap-1">
          <text class="text-[15px] leading-6 text-[#625e55]">
            模拟订单金额
          </text>
          <text class="retail-price break-words text-[26px] leading-8">
            {{ payableLabel }}
          </text>
        </view>
        <VButton size="lg" class-name="!min-h-12 !rounded-[3px] !px-4 !text-base" :disabled="submitDisabled" :loading="submitting" :loading-text="submitLabel" @click="submitOrder">
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
  "navigationBarBackgroundColor": "#f7f4ee",
  "navigationBarTextStyle": "black",
  "usingComponents": {}
}
</json>
