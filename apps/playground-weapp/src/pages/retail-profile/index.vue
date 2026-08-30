<script setup lang="ts">
import { computed } from 'wevu'
import RetailMenuRow from '../../components/retail/RetailMenuRow.vue'
import Avatar from '../../components/ui/avatar.vue'
import VTag from '../../components/ui/tag.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import { useWeappChrome } from '../../composables/useWeappChrome'
import { navigateRetail } from '../../features/retail/navigation'
import { useRetailStore } from '../../features/retail/store'

const { addresses, coupons, orders } = useRetailStore()
const { navigationStyle, rootStyle } = useWeappChrome()
const orderActions = computed(() => [
  { count: orders.value.filter(order => order.status === 'pending-payment').length, label: '待付款', status: 'pending-payment', mark: '付' },
  { count: orders.value.filter(order => order.status === 'pending-delivery').length, label: '待发货', status: 'pending-delivery', mark: '发' },
  { count: orders.value.filter(order => order.status === 'pending-receipt').length, label: '待收货', status: 'pending-receipt', mark: '收' },
  { count: orders.value.filter(order => order.status === 'completed').length, label: '待评价', status: 'completed', mark: '评' },
  { count: orders.value.filter(order => order.status === 'after-sale').length, label: '退款/售后', status: 'after-sale', mark: '退' },
])
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f4f6f8] pb-24 text-slate-950">
    <view class="relative overflow-hidden bg-[linear-gradient(145deg,#082f35,#0f766e)] px-4 pb-6 text-white" :style="rootStyle">
      <view class="absolute -right-10 top-0 h-40 w-40 rounded-full border-[28px] border-white/10" />
      <view class="relative z-10 flex items-center gap-3" :style="navigationStyle">
        <Avatar alt="Varo 用户" fallback="V" :size="58" shape="rounded" />
        <view class="grid min-w-0 flex-1 gap-1">
          <view class="flex items-center gap-2">
            <text class="text-xl font-black text-white">
              Varo 用户
            </text>
            <VTag label="PLUS" tone="primary" variant="solid" size="sm" />
          </view>
          <text class="text-[10px] text-teal-100">
            会员等级 3 · 已安全登录
          </text>
        </view>
        <VButton size="sm" tone="default" variant="ghost" class-name="!border !border-white/20 !bg-white/10 !text-white" @click="navigateRetail('/retail-user/person-info/index')">
          设置
        </VButton>
      </view>
      <view class="relative z-10 mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3">
        <view class="grid justify-items-center gap-1">
          <text class="text-base font-black">
            2680
          </text>
          <text class="text-[9px] text-teal-100">
            会员积分
          </text>
        </view>
        <view class="grid justify-items-center gap-1">
          <text class="text-base font-black">
            {{ addresses.length }}
          </text>
          <text class="text-[9px] text-teal-100">
            收货地址
          </text>
        </view>
        <view class="grid justify-items-center gap-1">
          <text class="text-base font-black">
            {{ coupons.length }}
          </text>
          <text class="text-[9px] text-teal-100">
            可用优惠券
          </text>
        </view>
      </view>
    </view>

    <view class="retail-section-enter -mt-4 grid gap-3 px-3 pb-5">
      <VCard variant="elevated">
        <view class="grid gap-4">
          <view class="flex items-center justify-between">
            <view class="grid gap-0.5">
              <text class="text-base font-black">
                我的订单
              </text>
              <text class="text-[9px] text-slate-400">
                查看订单与履约进度
              </text>
            </view>
            <VButton
              size="sm"
              variant="ghost"
              tone="default"
              class-name="!min-h-8 !px-2 !text-[10px] !font-semibold !text-teal-700"
              @click="navigateRetail('/retail-order/order-list/index')"
            >
              全部订单
            </VButton>
          </view>
          <view class="grid grid-cols-5 gap-2">
            <VButton
              v-for="action in orderActions"
              :key="action.status"
              size="sm"
              variant="ghost"
              tone="default"
              class-name="relative !grid !min-h-[72px] !w-full !place-items-center !gap-1 !rounded-xl !bg-slate-50 !p-1"
              @click="navigateRetail('/retail-order/order-list/index', { status: action.status })"
            >
              <text class="grid h-9 w-9 place-items-center rounded-xl bg-white text-xs font-black text-slate-700 shadow-sm">
                {{ action.mark }}
              </text>
              <text v-if="action.count" class="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
                {{ action.count }}
              </text>
              <text class="text-[9px] text-slate-500">
                {{ action.label }}
              </text>
            </VButton>
          </view>
        </view>
      </VCard>

      <VCard variant="default">
        <view class="grid gap-1">
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
        </view>
      </VCard>

      <VCard variant="default">
        <view class="grid gap-1">
          <RetailMenuRow title="售后服务" @click="navigateRetail('/retail-order/after-service-list/index')" />
          <RetailMenuRow title="帮助与客服" :bordered="false">
            <template #trailing>
              <text class="text-[10px] font-semibold text-teal-700">
                400-820-2026
              </text>
            </template>
          </RetailMenuRow>
        </view>
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
