<script setup lang="ts">
import { computed, onLoad, shallowRef } from 'wevu'
import RetailRequestState from '../../../components/retail/RetailRequestState.vue'
import VButton from '../../../components/ui/v-button.vue'
import { navigateRetail } from '../../../features/retail/navigation'
import { runRetailAction, useRetailPage } from '../../../features/retail/use-retail-page'

const { addresses, selectAddress, selectedAddress, loading, loadError, retryLoad, submitting } = useRetailPage()
const choosing = shallowRef(false)
const selectedId = computed(() => selectedAddress.value?.id ?? '')
onLoad((options) => { choosing.value = options?.select === '1' })

function choose(id: string) {
  return runRetailAction(() => {
    selectAddress(id)
    wx.navigateBack({ fail: () => wx.showToast({ title: '返回失败，请手动返回结算页', icon: 'none' }) })
  })
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-32 text-[#292722]">
    <view class="mx-auto max-w-4xl px-[18px] pb-5 pt-6">
      <text class="retail-heading block text-[26px] leading-9">
        收货地址
      </text>
      <text class="mt-3 block text-[15px] leading-7 text-[#625e55]">
        用于模拟订单，不会安排真实配送。
      </text>
    </view>
    <RetailRequestState :loading="loading" :error="loadError" :empty="addresses.length === 0" empty-title="请新增有效收货地址" @retry="retryLoad" />
    <view class="mx-auto max-w-4xl px-[18px]">
      <view v-for="address in addresses" :key="address.id" class="grid gap-3 border-t border-[#dcd6cb] py-5">
        <view class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base leading-7">
          <text class="break-words font-semibold">
            {{ address.name }}
          </text>
          <text>{{ address.phone }}</text>
          <text v-if="address.isDefault" class="text-[15px] text-[#86543c]">
            默认
          </text>
        </view>
        <text class="break-words text-[15px] leading-7 text-[#625e55]">
          {{ address.city }} {{ address.district }} {{ address.detail }}
        </text>
        <view class="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 pt-1">
          <text v-if="address.id === selectedId" class="text-[15px] text-[#86543c]">
            结算地址
          </text>
          <VButton v-if="choosing" class-name="!min-h-11 !rounded-[3px] !text-[15px]" :disabled="submitting" @click="choose(address.id)">
            选择此地址
          </VButton>
          <VButton variant="outline" tone="default" class-name="!min-h-11 !rounded-[3px] !text-[15px]" :disabled="submitting" @click="navigateRetail('/retail-user/address/edit/index', { id: address.id })">
            编辑
          </VButton>
        </view>
      </view>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 border-t border-[#dcd6cb] bg-[#f7f4ee] px-[18px] pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
      <view class="mx-auto max-w-4xl">
        <VButton block size="lg" class-name="!min-h-12 !rounded-[3px] !text-base" :disabled="submitting || loading || !!loadError" @click="navigateRetail('/retail-user/address/edit/index')">
          新增收货地址
        </VButton>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "收货地址",
  "usingComponents": {}
}
</json>
