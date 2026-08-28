<script setup lang="ts">
import { onLoad, shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import { navigateRetail, switchRetailTab } from '../../features/retail/navigation'

const orderId = shallowRef('')

onLoad((options) => {
  orderId.value = String(options?.id ?? '')
})
</script>

<template>
  <view class="grid min-h-screen content-start gap-4 bg-[#f4f6f8] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+52px)] text-slate-950">
    <view class="grid justify-items-center gap-3 text-center">
      <view class="grid h-20 w-20 place-items-center rounded-[28px] bg-emerald-500 text-sm font-black text-white shadow-[0_18px_42px_rgba(16,185,129,.25)]">
        完成
      </view>
      <text class="text-2xl font-black">
        支付成功
      </text>
      <text class="text-xs text-slate-400">
        订单已创建，仓库正在准备商品。
      </text>
    </view>

    <VCard class-name="grid gap-3" variant="elevated">
      <view class="flex items-center justify-between text-xs">
        <text class="text-slate-400">
          订单编号
        </text>
        <text class="font-semibold text-slate-800">
          {{ orderId || 'VR2026' }}
        </text>
      </view>
      <view class="flex items-center justify-between text-xs">
        <text class="text-slate-400">
          支付方式
        </text>
        <text class="font-semibold text-slate-800">
          微信支付
        </text>
      </view>
      <view class="flex items-center justify-between text-xs">
        <text class="text-slate-400">
          预计送达
        </text>
        <text class="font-semibold text-teal-700">
          明日 18:00 前
        </text>
      </view>
    </VCard>

    <view class="grid grid-cols-2 gap-2">
      <VButton variant="outline" size="lg" @click="switchRetailTab('home')">
        返回首页
      </VButton>
      <VButton size="lg" @click="navigateRetail('/retail-order/order-detail/index', { id: orderId })">
        查看订单
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "支付结果",
  "navigationStyle": "custom",
  "usingComponents": {}
}
</json>
