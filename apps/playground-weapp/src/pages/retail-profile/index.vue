<script setup lang="ts">
import { computed } from 'wevu'
import RetailMenuRow from '../../components/retail/RetailMenuRow.vue'
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VButton from '../../components/ui/v-button.vue'
import VIcon from '../../components/ui/v-icon.vue'
import { useWeappChrome } from '../../composables/useWeappChrome'
import { navigateRetail } from '../../features/retail/navigation'
import { useRetailPage } from '../../features/retail/use-retail-page'

const { addresses, coupons, orders, loading, loadError, retryLoad } = useRetailPage()
const { navigationStyle, rootStyle } = useWeappChrome()
const orderActions = computed(() => [
  { count: orders.value.filter(order => order.status === 'pending-payment').length, label: '待付款', status: 'pending-payment' },
  { count: orders.value.filter(order => order.status === 'pending-delivery').length, label: '待发货', status: 'pending-delivery' },
  { count: orders.value.filter(order => order.status === 'pending-receipt').length, label: '待收货', status: 'pending-receipt' },
  { count: orders.value.filter(order => order.status === 'completed').length, label: '待评价', status: 'completed' },
  { count: orders.value.filter(order => order.status === 'after-sale').length, label: '退款/售后', status: 'after-sale' },
])
const addressMeta = computed(() => `${addresses.value.length} 个地址`)
const couponMeta = computed(() => `${coupons.value.length} 张模拟优惠券`)
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-24 text-[#292722]">
    <view class="border-b border-[#dcd6cb] px-[18px]" :style="rootStyle">
      <view class="flex items-center" :style="navigationStyle">
        <text class="retail-heading text-[22px] leading-8">
          个人中心
        </text>
      </view>
    </view>

    <view class="mx-auto max-w-3xl">
      <view class="flex flex-wrap items-center justify-between gap-4 px-[18px] py-6">
        <view class="grid min-w-0 gap-2">
          <text class="retail-heading text-[26px] leading-9">
            Varo 用户
          </text>
          <text class="text-[15px] leading-6 text-[#625e55]">
            本地模拟用户，未接入登录。
          </text>
        </view>
        <VButton
          size="lg"
          tone="default"
          variant="outline"
          class-name="!min-h-11 !rounded-[3px] !text-[15px] !shadow-none"
          @click="navigateRetail('/retail-user/person-info/index')"
        >
          设置
        </VButton>
      </view>

      <RetailRequestState :loading="loading" :error="loadError" @retry="retryLoad" />

      <view class="retail-section-enter grid gap-8 px-[18px] pb-6">
        <view>
          <view class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <text class="retail-heading text-[21px] leading-8">
              我的订单
            </text>
            <VButton
              variant="text"
              class-name="!min-h-11 !rounded-[3px] !px-1 !text-[15px] !font-medium !shadow-none"
              @click="navigateRetail('/retail-order/order-list/index')"
            >
              全部订单
            </VButton>
          </view>
          <text class="mb-3 block text-[15px] leading-7 text-[#625e55]">
            模拟订单，不代表支付或履约。
          </text>
          <view class="border-t border-[#dcd6cb]">
            <RetailMenuRow
              v-for="action in orderActions"
              :key="action.status"
              :title="action.label"
              @click="navigateRetail('/retail-order/order-list/index', { status: action.status })"
            >
              <template #trailing>
                <view class="flex shrink-0 items-center gap-3">
                  <text class="retail-price text-lg leading-6 text-[#625e55]">
                    {{ action.count }}
                  </text>
                  <VIcon name="chevron-right" :size="18" color="#625e55" />
                </view>
              </template>
            </RetailMenuRow>
          </view>
        </view>

        <view>
          <text class="retail-heading mb-3 block text-[21px] leading-8">
            常用服务
          </text>
          <view class="border-t border-[#dcd6cb]">
            <RetailMenuRow
              title="收货地址"
              :meta="addressMeta"
              @click="navigateRetail('/retail-user/address/list/index')"
            />
            <RetailMenuRow
              title="优惠券"
              :meta="couponMeta"
              @click="navigateRetail('/retail-coupon/coupon-list/index')"
            />
            <RetailMenuRow
              title="积分与会员权益"
              meta="PLUS 会员 · 2,680 积分"
              @click="navigateRetail('/retail-user/person-info/index')"
            />
            <RetailMenuRow
              title="售后服务"
              meta="静态示例，未接入退货或退款"
              @click="navigateRetail('/retail-order/after-service-list/index')"
            />
            <view class="grid gap-1 border-b border-[#dcd6cb] py-4">
              <text class="text-base font-medium leading-6">
                帮助与客服
              </text>
              <text class="text-[15px] leading-6 text-[#625e55]">
                尚未接入客服服务
              </text>
            </view>
          </view>
        </view>
      </view>
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
