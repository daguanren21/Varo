<script setup lang="ts">
import { computed, onLoad, shallowRef } from 'wevu'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
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
  <view class="retail-page-enter grid min-h-screen content-start gap-4 bg-[#f4f6f8] px-4 pb-8 text-slate-950" :style="contentTopStyle">
    <RetailRequestState :loading="loading" :error="loadError" :empty="!order" empty-title="未找到该模拟订单" @retry="retryLoad" />
    <view v-if="order && !loading && !loadError" class="grid gap-4">
      <view class="grid justify-items-center gap-3 text-center">
        <text class="text-2xl font-black">
          模拟订单已创建
        </text>
        <text class="text-sm leading-6 text-slate-500">
          这不是支付成功。没有调用支付接口、扣款或安排发货。
        </text>
      </view>
      <VCard class-name="grid gap-3" variant="elevated">
        <view class="flex justify-between gap-3 text-xs">
          <text>订单编号</text><text>{{ order.id }}</text>
        </view>
        <view class="flex justify-between text-xs">
          <text>模拟订单金额</text><text class="font-black">
            ¥{{ formatRetailMoney(order.total) }}
          </text>
        </view>
        <view class="flex justify-between text-xs">
          <text>收货人快照</text><text>{{ order.address.name }}</text>
        </view>
        <text class="text-xs leading-5 text-slate-500">
          默认本地服务仅在本次运行保留订单，重新启动会重置。
        </text>
      </VCard>
      <VButton size="lg" @click="navigateRetail('/retail-order/order-detail/index', { id: order.id })">
        查看订单快照
      </VButton>
    </view>
    <VButton variant="outline" size="lg" @click="switchRetailTab('home')">
      返回首页
    </VButton>
    <VButton variant="ghost" @click="navigateRetail('/retail-order/order-list/index')">
      查看订单列表
    </VButton>
  </view>
</template>

<json lang="jsonc">
{ "$schema": "https://vite.icebreaker.top/page.json", "navigationBarTitleText": "模拟订单结果", "navigationStyle": "custom", "usingComponents": {} }
</json>
