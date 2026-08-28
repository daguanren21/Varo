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
  <VCard class-name="retail-section-enter" variant="default">
    <view class="grid gap-3">
      <view class="grid grid-cols-[auto_88px_minmax(0,1fr)] items-center gap-3">
        <view class="grid h-10 w-10 place-items-center">
          <VCheckbox :checked="selected" aria-label="选择商品" @update:checked="emit('select', $event)" />
        </view>
        <view class="h-[88px] w-[88px] overflow-hidden rounded-xl bg-slate-100">
          <VButton
            block
            variant="ghost"
            tone="default"
            class-name="!h-[88px] !min-h-[88px] !w-[88px] !overflow-hidden !rounded-xl !bg-slate-100 !p-0"
            @click="emit('view', props.product)"
          >
            <VImage :src="product.image" :alt="product.name" fit="cover" width="88px" height="88px" />
          </VButton>
        </view>
        <view class="grid min-w-0 gap-1">
          <text class="line-clamp-2 text-sm font-bold leading-5 text-slate-900">
            {{ product.name }}
          </text>
          <text class="truncate text-[9px] text-slate-400">
            默认规格 · 七天无理由
          </text>
        </view>
      </view>
      <view class="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <text class="text-lg font-black text-[#f04438]">
          ¥{{ formatRetailMoney(product.price) }}
        </text>
        <view class="flex-none">
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
