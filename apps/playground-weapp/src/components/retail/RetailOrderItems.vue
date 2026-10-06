<script setup lang="ts">
import type { RetailOrderItem } from '../../features/retail/types'
import { formatRetailMoney } from '../../features/retail/store'
import VImage from '../ui/v-image.vue'

defineProps<{ items: readonly RetailOrderItem[] }>()
</script>

<template>
  <view class="grid gap-3">
    <view v-for="item in items" :key="item.productId" class="grid grid-cols-[76px_minmax(0,1fr)] gap-3 rounded-xl bg-slate-50 p-2">
      <VImage :src="item.image" :alt="item.name" fit="cover" width="76px" height="76px" radius="12px" />
      <view class="grid min-w-0 content-between gap-2">
        <text class="line-clamp-2 text-xs font-semibold leading-[18px]">
          {{ item.name }}
        </text>
        <view class="flex items-center justify-between text-xs text-slate-500">
          <text>¥{{ formatRetailMoney(item.unitPrice) }}</text>
          <text>× {{ item.quantity }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
