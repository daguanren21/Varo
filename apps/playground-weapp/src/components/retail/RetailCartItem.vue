<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { formatRetailMoney } from '../../features/retail/store'
import InputNumber from '../ui/input-number.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VCheckbox from '../ui/v-checkbox.vue'
import VImage from '../ui/v-image.vue'

const props = defineProps<{
  product: RetailProduct
  quantity: number
  selected: boolean
}>()

const emit = defineEmits<{
  quantityChange: [quantity: number]
  select: [selected: boolean]
  view: [product: RetailProduct]
}>()
</script>

<template>
  <VCard class-name="relative" variant="default">
    <view class="grid grid-cols-[auto_88px_minmax(0,1fr)] gap-3">
      <VCheckbox :checked="selected" aria-label="选择商品" @update:checked="emit('select', $event)" />
      <VButton
        variant="ghost"
        tone="default"
        class-name="!h-auto !min-h-0 !overflow-hidden !rounded-xl !bg-slate-100 !p-0"
        @click="emit('view', props.product)"
      >
        <VImage :src="product.image" :alt="product.name" fit="cover" width="88px" height="88px" />
      </VButton>
      <view class="grid min-w-0 content-between gap-2">
        <view class="grid gap-1">
          <text class="line-clamp-2 text-xs font-bold leading-[18px] text-slate-900">
            {{ product.name }}
          </text>
          <text class="truncate text-[9px] text-slate-400">
            默认规格 · 七天无理由
          </text>
        </view>
        <view class="flex items-end justify-between gap-2">
          <text class="text-base font-black text-[#f04438]">
            ¥{{ formatRetailMoney(product.price) }}
          </text>
          <InputNumber
            :value="quantity"
            :min="1"
            :max="Math.max(1, product.stock)"
            @update:value="emit('quantityChange', $event)"
          />
        </view>
      </view>
    </view>
  </VCard>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
