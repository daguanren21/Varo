<script setup lang="ts">
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import { formatRetailMoney } from '../../features/retail/store'
import { useRetailPage } from '../../features/retail/use-retail-page'

const { coupons, loading, loadError, retryLoad } = useRetailPage()
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-8 text-[#292722]">
    <view class="mx-auto max-w-3xl">
      <view class="px-[18px] pt-6">
        <text class="retail-heading block text-[26px] leading-9">
          优惠券
        </text>
        <text class="mt-3 block text-[15px] leading-7 text-[#625e55]">
          仅展示优惠券样式，不支持领取或核销。结算优惠以服务报价为准。
        </text>
      </view>
      <RetailRequestState :loading="loading" :error="loadError" :empty="coupons.length === 0" empty-title="暂无模拟优惠券" @retry="retryLoad" />
      <view class="retail-section-enter px-[18px] pt-6">
        <view
          v-for="coupon in coupons"
          :key="coupon.id"
          class="flex flex-wrap items-start justify-between gap-4 border-b border-[#dcd6cb] py-5"
        >
          <view class="grid min-w-0 flex-1 gap-2">
            <text class="retail-heading text-lg leading-7">
              {{ coupon.title }}
            </text>
            <text class="text-base leading-7">
              {{ coupon.condition }}
            </text>
            <text class="text-[15px] leading-7 text-[#625e55]">
              有效期至 {{ coupon.validUntil }}
            </text>
          </view>
          <text class="retail-price shrink-0 text-[28px] leading-9 text-[#86543c]">
            ¥{{ formatRetailMoney(coupon.discount) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "优惠券",
  "usingComponents": {}
}
</json>
