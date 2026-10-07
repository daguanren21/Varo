<script setup lang="ts">
import { computed, onLoad, shallowRef } from 'wevu'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VButton from '../../components/ui/v-button.vue'
import { useWeappChrome } from '../../composables/useWeappChrome'
import { navigateRetail, switchRetailTab } from '../../features/retail/navigation'
import { formatRetailMoney } from '../../features/retail/store'
import { useRetailPage } from '../../features/retail/use-retail-page'

const orderId = shallowRef('')
const { contentTopStyle } = useWeappChrome()
const { orders, loading, loadError, retryLoad } = useRetailPage()
const order = computed(() => orders.value.find(item => item.id === orderId.value))
onLoad((options) => { orderId.value = String(options?.id ?? '') })
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] px-[18px] pb-8 text-[#292722]" :style="contentTopStyle">
    <view class="mx-auto grid max-w-xl gap-3">
      <RetailRequestState :loading="loading" :error="loadError" :empty="!order" empty-title="未找到该模拟订单" @retry="retryLoad" />
      <view v-if="order && !loading && !loadError" class="grid gap-6">
        <view class="grid gap-3 pb-2 pt-6">
          <text class="retail-heading text-[26px] leading-9">
            模拟订单已创建
          </text>
          <text class="text-[15px] leading-7 text-[#625e55]">
            这不是支付成功。没有调用支付接口、扣款或安排发货。
          </text>
        </view>
        <view class="grid gap-5 border-y border-[#dcd6cb] py-5 text-[15px] leading-7">
          <view class="grid gap-1">
            <text class="text-[#625e55]">
              订单编号
            </text>
            <text class="break-all">
              {{ order.id }}
            </text>
          </view>
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <text class="text-[#625e55]">
              模拟订单金额
            </text>
            <text class="retail-price text-[26px] leading-9">
              ¥{{ formatRetailMoney(order.total) }}
            </text>
          </view>
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <text class="text-[#625e55]">
              收货人快照
            </text>
            <text class="break-words">
              {{ order.address.name }}
            </text>
          </view>
          <text class="text-[#625e55]">
            默认本地服务仅在本次运行保留订单，重新启动会重置。
          </text>
        </view>
        <VButton block size="lg" class-name="!min-h-12 !rounded-[3px] !text-base" @click="navigateRetail('/retail-order/order-detail/index', { id: order.id })">
          查看订单快照
        </VButton>
      </view>
      <VButton block variant="outline" size="lg" class-name="!min-h-12 !rounded-[3px] !text-base" @click="switchRetailTab('home')">
        返回首页
      </VButton>
      <VButton block variant="ghost" class-name="!min-h-11 !text-[15px]" @click="navigateRetail('/retail-order/order-list/index')">
        查看订单列表
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "$schema": "https://vite.icebreaker.top/page.json", "navigationBarTitleText": "模拟订单结果", "navigationStyle": "custom", "usingComponents": {} }
</json>
