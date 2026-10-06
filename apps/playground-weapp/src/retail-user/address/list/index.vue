<script setup lang="ts">
import { computed, onLoad, shallowRef } from 'wevu'
import RetailRequestState from '../../../components/retail/RetailRequestState.vue'
import VTag from '../../../components/ui/tag.vue'
import VButton from '../../../components/ui/v-button.vue'
import VCard from '../../../components/ui/v-card.vue'
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
  <view class="min-h-screen bg-[#f4f6f8] pb-28 text-slate-950">
    <RetailRequestState :loading="loading" :error="loadError" :empty="addresses.length === 0" empty-title="请新增有效收货地址" @retry="retryLoad" />
    <view class="grid gap-3 px-3 py-3">
      <VCard v-for="address in addresses" :key="address.id" class-name="grid gap-2" variant="default">
        <view class="flex items-center gap-2">
          <text class="text-sm font-black">
            {{ address.name }}
          </text>
          <text class="text-xs text-slate-500">
            {{ address.phone }}
          </text>
          <VTag v-if="address.isDefault" tone="primary" variant="soft" size="sm">
            默认
          </VTag>
        </view>
        <text class="text-xs leading-5 text-slate-600">
          {{ address.city }} {{ address.district }} {{ address.detail }}
        </text>
        <view class="flex justify-end border-t border-slate-100 pt-2">
          <VButton v-if="choosing" size="sm" :disabled="submitting" @click="choose(address.id)">
            选择此地址
          </VButton>
          <VTag v-if="address.id === selectedId" label="结算地址" size="sm" />
          <VButton size="sm" variant="ghost" :disabled="submitting" @click="navigateRetail('/retail-user/address/edit/index', { id: address.id })">
            编辑
          </VButton>
        </view>
      </VCard>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,.06)]">
      <VButton block size="lg" :disabled="submitting || loading || !!loadError" @click="navigateRetail('/retail-user/address/edit/index')">
        新增收货地址
      </VButton>
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
