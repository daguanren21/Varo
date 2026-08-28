<script setup lang="ts">
import { computed } from 'wevu'
import RetailCartItem from '../../components/retail/RetailCartItem.vue'
import VTag from '../../components/ui/tag.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import { navigateRetail } from '../../features/retail/navigation'
import { formatRetailMoney, useRetailStore } from '../../features/retail/store'

const {
  cartTotal,
  coupons,
  createOrder,
  defaultAddress,
  selectedCartItems,
} = useRetailStore()
const shipping = 0
const discount = 1000
const deliveryAddress = computed(() => defaultAddress.value ?? {
  city: '',
  detail: '请先添加收货地址',
  district: '',
  id: '',
  isDefault: false,
  name: '请选择地址',
  phone: '',
})

function submitOrder() {
  const order = createOrder()
  if (!order) {
    wx.showToast({ title: '购物车中没有可结算商品', icon: 'none' })
    return
  }
  navigateRetail('/retail-order/pay-result/index', { id: order.id })
}
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-32 text-slate-950">
    <view class="bg-[linear-gradient(135deg,#0f766e,#2dd4bf)] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+16px)] text-white">
      <text class="text-[10px] font-black tracking-[0.16em] text-white/70">
        CHECKOUT
      </text>
      <text class="mt-1 block text-2xl font-black">
        确认订单
      </text>
      <text class="mt-1 block text-[11px] text-white/75">
        地址、优惠和商品确认后即可提交。
      </text>
    </view>

    <view class="-mt-4 grid gap-3 px-3 pb-4">
      <VCard class-name="grid gap-2" interactive @click="navigateRetail('/retail-user/address/list/index')">
        <view class="flex items-center justify-between gap-3">
          <view class="grid min-w-0 gap-1">
            <view class="flex items-center gap-2">
              <text class="text-sm font-black">
                {{ deliveryAddress.name }}
              </text>
              <text class="text-xs text-slate-500">
                {{ deliveryAddress.phone }}
              </text>
              <VTag v-if="deliveryAddress.isDefault" tone="primary" variant="soft" size="sm">
                默认
              </VTag>
            </view>
            <text class="text-xs leading-5 text-slate-600">
              {{ deliveryAddress.city }} {{ deliveryAddress.district }} {{ deliveryAddress.detail }}
            </text>
          </view>
          <text class="flex-none text-slate-300">
            ›
          </text>
        </view>
      </VCard>

      <VCard class-name="grid gap-3" variant="default">
        <view class="flex items-center justify-between">
          <text class="text-sm font-black">
            Varo Retail 自营店
          </text>
          <VTag tone="success" variant="soft" size="sm">
            满 99 包邮
          </VTag>
        </view>
        <RetailCartItem
          v-for="item in selectedCartItems"
          :key="item.product.id"
          :product="item.product"
          :quantity="item.quantity"
          selected
          @view="navigateRetail('/retail-goods/details/index', { id: item.product.id })"
        />
      </VCard>

      <VCard class-name="grid gap-1" variant="default">
        <VButton
          block
          variant="ghost"
          tone="default"
          class-name="!flex !min-h-12 !w-full !items-center !justify-between !rounded-none !border-0 !border-b !border-slate-100 !bg-transparent !p-0 !shadow-none"
          @click="navigateRetail('/retail-coupon/coupon-list/index')"
        >
          <text class="text-sm font-bold">
            优惠券
          </text>
          <text class="text-xs font-semibold text-[#f04438]">
            {{ coupons.length }} 张可用 ›
          </text>
        </VButton>
        <VButton
          block
          variant="ghost"
          tone="default"
          class-name="!flex !min-h-12 !w-full !items-center !justify-between !rounded-none !border-0 !border-b !border-slate-100 !bg-transparent !p-0 !shadow-none"
          @click="navigateRetail('/retail-order/invoice/index')"
        >
          <text class="text-sm font-bold">
            发票
          </text>
          <text class="text-xs text-slate-400">
            暂不开具 ›
          </text>
        </VButton>
        <view class="flex min-h-12 items-center justify-between">
          <text class="text-sm font-bold">
            配送方式
          </text>
          <text class="text-xs text-slate-600">
            快递配送 · 明日达
          </text>
        </view>
      </VCard>

      <VCard class-name="grid gap-2" variant="default">
        <view class="flex items-center justify-between text-xs">
          <text>商品金额</text><text>¥{{ formatRetailMoney(cartTotal) }}</text>
        </view>
        <view class="flex items-center justify-between text-xs">
          <text>运费</text><text>¥{{ formatRetailMoney(shipping) }}</text>
        </view>
        <view class="flex items-center justify-between text-xs">
          <text>活动优惠</text><text class="text-[#f04438]">
            -¥{{ formatRetailMoney(discount) }}
          </text>
        </view>
      </VCard>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      <view class="flex items-center justify-between gap-3">
        <view class="grid gap-0.5">
          <text class="text-[10px] text-slate-400">
            应付金额
          </text>
          <text class="text-xl font-black text-[#f04438]">
            ¥{{ formatRetailMoney(Math.max(0, cartTotal - discount)) }}
          </text>
        </view>
        <VButton size="lg" tone="danger" shape="round" @click="submitOrder">
          提交订单
        </VButton>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "确认订单",
  "navigationBarBackgroundColor": "#0f766e",
  "navigationBarTextStyle": "white",
  "usingComponents": {}
}
</json>
