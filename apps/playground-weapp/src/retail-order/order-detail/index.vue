<script setup lang="ts">
import { computed, onLoad, shallowRef } from 'wevu'
import VTag from '../../components/ui/tag.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VImage from '../../components/ui/v-image.vue'
import { navigateRetail } from '../../features/retail/navigation'
import { findRetailProduct, formatRetailMoney, useRetailStore } from '../../features/retail/store'

const orderId = shallowRef('')
const { defaultAddress, orders } = useRetailStore()
const order = computed(() => orders.value.find(item => item.id === orderId.value) ?? orders.value[0])
const products = computed(() => order.value?.items.map(item => ({ ...item, product: findRetailProduct(item.productId) })) ?? [])

onLoad((options) => {
  orderId.value = String(options?.id ?? '')
})
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-28 text-slate-950">
    <view class="bg-[linear-gradient(135deg,#0f766e,#14b8a6)] px-4 pb-10 pt-6 text-white">
      <text class="text-2xl font-black">
        订单处理中
      </text>
      <text class="mt-2 block text-xs text-white/75">
        预计明日送达，请留意配送通知。
      </text>
      <view class="mt-4 flex items-center gap-2 text-[10px] text-white/80">
        <text class="rounded-full bg-white/15 px-2 py-1">
          已付款
        </text>
        <text>—</text>
        <text class="rounded-full bg-white/15 px-2 py-1">
          仓库处理中
        </text>
        <text>—</text>
        <text class="rounded-full bg-white/10 px-2 py-1">
          待配送
        </text>
      </view>
    </view>

    <view class="-mt-4 grid gap-3 px-3 pb-4">
      <VCard class-name="grid gap-2" variant="elevated">
        <view class="flex items-center gap-2">
          <VTag tone="primary" variant="soft" size="sm">
            收货
          </VTag>
          <text class="text-sm font-black">
            {{ defaultAddress?.name }} {{ defaultAddress?.phone }}
          </text>
        </view>
        <text class="text-xs leading-5 text-slate-500">
          {{ defaultAddress?.city }} {{ defaultAddress?.district }} {{ defaultAddress?.detail }}
        </text>
      </VCard>

      <VCard class-name="grid gap-3" variant="default">
        <view class="flex items-center justify-between">
          <text class="text-sm font-black">
            Varo Retail 自营店
          </text>
          <text class="text-[10px] text-teal-700">
            联系商家
          </text>
        </view>
        <view v-for="item in products" :key="item.product.id" class="grid grid-cols-[76px_minmax(0,1fr)] gap-3 rounded-xl bg-slate-50 p-2">
          <VImage :src="item.product.image" :alt="item.product.name" fit="cover" width="76px" height="76px" radius="12px" />
          <view class="grid min-w-0 content-between gap-2">
            <text class="line-clamp-2 text-xs font-semibold leading-[18px]">
              {{ item.product.name }}
            </text>
            <view class="flex items-center justify-between text-[10px] text-slate-400">
              <text>¥{{ formatRetailMoney(item.product.price) }}</text>
              <text>× {{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </VCard>

      <VCard class-name="grid gap-2 text-xs" variant="default">
        <view class="flex justify-between">
          <text class="text-slate-400">
            订单编号
          </text><text>{{ order?.id }}</text>
        </view>
        <view class="flex justify-between">
          <text class="text-slate-400">
            创建时间
          </text><text>{{ order?.createdAt }}</text>
        </view>
        <view class="flex justify-between">
          <text class="text-slate-400">
            支付方式
          </text><text>微信支付</text>
        </view>
        <view class="flex justify-between border-t border-slate-100 pt-2">
          <text class="font-bold">
            实付金额
          </text><text class="text-base font-black text-[#f04438]">
            ¥{{ formatRetailMoney(order?.total ?? 0) }}
          </text>
        </view>
      </VCard>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      <VButton variant="outline" @click="navigateRetail('/retail-order/apply-service/index', { id: order?.id ?? '' })">
        申请售后
      </VButton>
      <VButton @click="navigateRetail('/retail-order/delivery-detail/index', { id: order?.id ?? '' })">
        查看物流
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "订单详情",
  "usingComponents": {}
}
</json>
