<script setup lang="ts">
import RetailRequestState from '../../components/retail/RetailRequestState.vue'
import VTag from '../../components/ui/tag.vue'
import VCard from '../../components/ui/v-card.vue'
import { formatRetailMoney } from '../../features/retail/store'
import { useRetailPage } from '../../features/retail/use-retail-page'

const { coupons, loading, loadError, retryLoad } = useRetailPage()
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-8 text-slate-950">
    <RetailRequestState :loading="loading" :error="loadError" :empty="coupons.length === 0" empty-title="暂无模拟优惠券" @retry="retryLoad" />
    <text class="block px-4 pt-3 text-xs text-slate-500">
      仅展示优惠券样式，不支持领取或核销。结算优惠以服务报价为准。
    </text>
    <view class="grid gap-3 px-3 py-3">
      <VCard
        v-for="coupon in coupons"
        :key="coupon.id"
        :padding="false"
        class-name="overflow-hidden border-[#fecaca] bg-[linear-gradient(135deg,#fff7ed,#fff)]"
        variant="outline"
      >
        <view class="grid grid-cols-[112px_minmax(0,1fr)]">
          <view class="grid place-items-center bg-[linear-gradient(145deg,#f04438,#fb7185)] px-3 py-5 text-white">
            <view class="flex items-baseline">
              <text class="text-sm font-black">
                ¥
              </text>
              <text class="text-[30px] font-black">
                {{ formatRetailMoney(coupon.discount).split('.')[0] }}
              </text>
            </view>
            <text class="text-[9px] text-white/80">
              {{ coupon.condition }}
            </text>
          </view>
          <view class="grid content-between gap-3 p-4">
            <view class="grid gap-1">
              <view class="flex items-center gap-2">
                <text class="text-sm font-black">
                  {{ coupon.title }}
                </text>
                <VTag tone="danger" variant="soft" size="sm">
                  展示用券
                </VTag>
              </view>
              <text class="text-[10px] text-slate-400">
                有效期至 {{ coupon.validUntil }}
              </text>
            </view>
          </view>
        </view>
      </VCard>
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
