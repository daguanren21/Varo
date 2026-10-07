<script setup lang="ts">
import { computed, onLoad, shallowRef } from 'wevu'
import RetailOrderItems from '../../components/retail/RetailOrderItems.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VButton from '../../components/ui/v-button.vue'
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
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-32 text-[#292722]">
    <RetailRequestState :loading="loading" :error="loadError" :empty="!order" empty-title="未找到该订单" @retry="retryLoad" />
    <view v-if="order && !loading && !loadError" class="mx-auto max-w-4xl px-[18px]">
      <view class="pb-5 pt-6">
        <text class="retail-heading block text-[26px] leading-9">
          模拟订单详情
        </text>
        <text class="mt-3 block text-[15px] leading-7 text-[#625e55]">
          未进行真实支付、扣款或发货。以下内容为创建时的快照。
        </text>
      </view>
      <view class="grid gap-6">
        <view class="grid gap-3 border-y border-[#dcd6cb] py-5">
          <text class="retail-heading text-xl">
            收货地址快照
          </text>
          <view class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base leading-7">
            <text class="break-words font-semibold">
              {{ order.address.name }}
            </text>
            <text>{{ order.address.phone }}</text>
          </view>
          <text class="break-words text-[15px] leading-7 text-[#625e55]">
            {{ order.address.city }} {{ order.address.district }} {{ order.address.detail }}
          </text>
        </view>
        <view>
          <text class="retail-heading text-xl">
            {{ brand.name }} · 商品快照
          </text>
          <RetailOrderItems :items="order.items" />
        </view>
        <view class="grid gap-3 text-[15px] leading-7">
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <text class="text-[#625e55]">
              商品金额
            </text>
            <text class="retail-price text-xl">
              ¥{{ formatRetailMoney(order.subtotal) }}
            </text>
          </view>
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <text class="text-[#625e55]">
              运费
            </text>
            <text class="retail-price text-xl">
              ¥{{ formatRetailMoney(order.shipping) }}
            </text>
          </view>
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <text class="text-[#625e55]">
              模拟优惠
            </text>
            <text class="retail-price text-xl">
              -¥{{ formatRetailMoney(order.discount) }}
            </text>
          </view>
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[#dcd6cb] pt-4">
            <text>模拟订单金额</text>
            <text class="retail-price text-[26px] leading-9">
              ¥{{ formatRetailMoney(order.total) }}
            </text>
          </view>
        </view>
        <view class="grid gap-4 border-t border-[#dcd6cb] pt-5 text-[15px] leading-7">
          <view class="grid gap-1">
            <text class="text-[#625e55]">
              订单编号
            </text>
            <text class="break-all">
              {{ order.id }}
            </text>
          </view>
          <view class="grid gap-1">
            <text class="text-[#625e55]">
              创建时间
            </text>
            <text class="break-words">
              {{ order.createdAt }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <view class="fixed inset-x-0 bottom-0 z-30 border-t border-[#dcd6cb] bg-[#f7f4ee] px-[18px] pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
      <view class="mx-auto max-w-4xl">
        <VButton block class-name="!min-h-12 !rounded-[3px] !text-base" @click="navigateRetail('/retail-order/order-list/index')">
          查看订单列表
        </VButton>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "$schema": "https://vite.icebreaker.top/page.json", "navigationBarTitleText": "模拟订单详情", "usingComponents": {} }
</json>
