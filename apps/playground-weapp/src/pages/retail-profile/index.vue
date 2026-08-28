<script setup lang="ts">
import RetailMenuRow from '../../components/retail/RetailMenuRow.vue'
import Avatar from '../../components/ui/avatar.vue'
import Badge from '../../components/ui/badge.vue'
import VTag from '../../components/ui/tag.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import { navigateRetail } from '../../features/retail/navigation'
import { useRetailStore } from '../../features/retail/store'

const { addresses, coupons, orders } = useRetailStore()
const orderActions = [
  { label: '待付款', status: 'pending-payment', mark: '付' },
  { label: '待发货', status: 'pending-delivery', mark: '发' },
  { label: '待收货', status: 'pending-receipt', mark: '收' },
  { label: '待评价', status: 'completed', mark: '评' },
  { label: '退款/售后', status: 'after-sale', mark: '退' },
]
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-24 text-slate-950">
    <view class="relative overflow-hidden bg-[linear-gradient(145deg,#ccfbf1,#f0fdfa_58%,#ffffff)] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+20px)]">
      <view class="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[28px] border-white/45" />
      <view class="relative z-10 flex items-center gap-3">
        <Avatar alt="Varo 用户" fallback="V" :size="56" shape="rounded" />
        <view class="grid min-w-0 flex-1 gap-1">
          <view class="flex items-center gap-2">
            <text class="text-xl font-black">
              Varo 用户
            </text>
            <VTag tone="primary" variant="solid" size="sm">
              PLUS
            </VTag>
          </view>
          <text class="text-[10px] text-slate-500">
            会员等级 3 · 已安全登录
          </text>
        </view>
        <VButton size="sm" variant="ghost" @click="navigateRetail('/retail-user/person-info/index')">
          设置
        </VButton>
      </view>
    </view>

    <view class="-mt-4 grid gap-3 px-3 pb-5">
      <VCard class-name="grid gap-4" variant="elevated">
        <view class="flex items-center justify-between">
          <text class="text-base font-black">
            我的订单
          </text>
          <VButton
            size="sm"
            variant="ghost"
            tone="default"
            class-name="!p-0 !text-[10px] !font-semibold !text-slate-400"
            @click="navigateRetail('/retail-order/order-list/index')"
          >
            全部订单 ›
          </VButton>
        </view>
        <view class="grid grid-cols-5 gap-2">
          <VButton
            v-for="action in orderActions"
            :key="action.status"
            size="sm"
            variant="ghost"
            tone="default"
            class-name="relative !grid !min-h-16 !w-full !place-items-center !gap-1 !p-0"
            @click="navigateRetail('/retail-order/order-list/index', { status: action.status })"
          >
            <text class="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-xs font-black text-slate-700">
              {{ action.mark }}
            </text>
            <Badge
              v-if="orders.filter(order => order.status === action.status).length"
              :content="orders.filter(order => order.status === action.status).length"
              class="absolute right-0 top-0"
            />
            <text class="text-[9px] text-slate-500">
              {{ action.label }}
            </text>
          </VButton>
        </view>
      </VCard>

      <VCard class-name="grid gap-1" variant="default">
        <RetailMenuRow
          title="收货地址"
          :meta="`${addresses.length} 个地址`"
          @click="navigateRetail('/retail-user/address/list/index')"
        />
        <RetailMenuRow
          title="优惠券"
          :meta="`${coupons.length} 张可用`"
          @click="navigateRetail('/retail-coupon/coupon-list/index')"
        />
        <RetailMenuRow
          title="积分与会员权益"
          meta="2,680 积分"
          :bordered="false"
          @click="navigateRetail('/retail-user/person-info/index')"
        />
      </VCard>

      <VCard class-name="grid gap-1" variant="default">
        <RetailMenuRow title="售后服务" @click="navigateRetail('/retail-order/after-service-list/index')" />
        <RetailMenuRow title="帮助与客服" :bordered="false">
          <template #trailing>
            <text class="text-[10px] font-semibold text-teal-700">
              400-820-2026
            </text>
          </template>
        </RetailMenuRow>
      </VCard>

      <text class="py-4 text-center text-[9px] text-slate-300">
        Varo Retail v1.0.1
      </text>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "个人中心",
  "navigationStyle": "custom",
  "usingComponents": {}
}
</json>
