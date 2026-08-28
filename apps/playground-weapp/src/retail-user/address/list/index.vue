<script setup lang="ts">
import VTag from '../../../components/ui/tag.vue'
import VButton from '../../../components/ui/v-button.vue'
import VCard from '../../../components/ui/v-card.vue'
import { navigateRetail } from '../../../features/retail/navigation'
import { useRetailStore } from '../../../features/retail/store'

const { addresses } = useRetailStore()
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-28 text-slate-950">
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
          <VButton size="sm" variant="ghost" @click="navigateRetail('/retail-user/address/edit/index', { id: address.id })">
            编辑
          </VButton>
        </view>
      </VCard>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,.06)]">
      <VButton block size="lg" @click="navigateRetail('/retail-user/address/edit/index')">
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
