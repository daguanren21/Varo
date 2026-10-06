<script setup lang="ts">
import { computed, onLoad, shallowRef } from 'wevu'
import RetailOrderItems from '../../components/retail/RetailOrderItems.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import { retailConfig } from '../../features/retail/config'
import { navigateRetail } from '../../features/retail/navigation'
import { formatRetailMoney } from '../../features/retail/store'
import { useRetailPage } from '../../features/retail/use-retail-page'

const orderId = shallowRef('')
const { orders, loading, loadError, retryLoad } = useRetailPage()
const order = computed(() => orders.value.find(item => item.id === orderId.value))
const brand = retailConfig.brand
onLoad((options) => { orderId.value = String(options?.id ?? '') })
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-28 text-slate-950">
    <RetailRequestState :loading="loading" :error="loadError" :empty="!order" empty-title="未找到该订单" @retry="retryLoad" />
    <view v-if="order && !loading && !loadError">
      <view class="bg-slate-950 px-4 pb-8 pt-6 text-white">
        <text class="text-2xl font-black">
          模拟订单详情
        </text>
        <text class="mt-2 block text-xs text-white/75">
          未进行真实支付、扣款或发货。以下内容为创建时的快照。
        </text>
      </view>
      <view class="grid gap-3 px-3 py-3">
        <VCard class-name="grid gap-2" variant="default">
          <text class="text-sm font-black">
            {{ order.address.name }} {{ order.address.phone }}
          </text>
          <text class="text-xs leading-5 text-slate-500">
            {{ order.address.city }} {{ order.address.district }} {{ order.address.detail }}
          </text>
        </VCard>
        <VCard class-name="grid gap-3" variant="default">
          <text class="text-sm font-black">
            {{ brand.name }} · 商品快照
          </text>
          <RetailOrderItems :items="order.items" />
        </VCard>
        <VCard class-name="grid gap-3 text-xs" variant="default">
          <view class="flex justify-between gap-3">
            <text>订单编号</text><text>{{ order.id }}</text>
          </view>
          <view class="flex justify-between gap-3">
            <text>创建时间</text><text>{{ order.createdAt }}</text>
          </view>
          <view class="flex justify-between">
            <text>商品金额</text><text>¥{{ formatRetailMoney(order.subtotal) }}</text>
          </view>
          <view class="flex justify-between">
            <text>运费</text><text>¥{{ formatRetailMoney(order.shipping) }}</text>
          </view>
          <view class="flex justify-between">
            <text>模拟优惠</text><text>-¥{{ formatRetailMoney(order.discount) }}</text>
          </view>
          <view class="flex justify-between border-t border-slate-100 pt-3">
            <text>模拟订单金额</text><text class="text-base font-black text-[#f04438]">
              ¥{{ formatRetailMoney(order.total) }}
            </text>
          </view>
        </VCard>
      </view>
    </view>
    <view class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      <VButton block @click="navigateRetail('/retail-order/order-list/index')">
        查看订单列表
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "$schema": "https://vite.icebreaker.top/page.json", "navigationBarTitleText": "模拟订单详情", "usingComponents": {} }
</json>
