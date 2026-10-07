<script setup lang="ts">
import type { RetailOrderItem } from '../../features/retail/types'
import { formatRetailMoney } from '../../features/retail/store'
import VImage from '../ui/v-image.vue'

defineProps<{ items: readonly RetailOrderItem[] }>()
</script>

<template>
  <view>
    <view v-for="item in items" :key="item.productId" class="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-3 border-b border-[#dcd6cb] py-5 text-[#292722]">
      <VImage :src="item.image" :alt="item.name" fit="cover" width="72px" height="72px" radius="3px" />
      <view class="grid min-w-0 gap-3">
        <text class="retail-heading break-words text-[17px] leading-7">
          {{ item.name }}
        </text>
        <view class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <text class="retail-price text-xl">
            ¥{{ formatRetailMoney(item.unitPrice) }}
          </text>
          <text class="text-[15px] text-[#625e55]">
            × {{ item.quantity }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
