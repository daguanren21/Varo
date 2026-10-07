<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { computed } from 'wevu'
import { formatRetailMoney } from '../../features/retail/store'
import VButton from '../ui/v-button.vue'
import VImage from '../ui/v-image.vue'

const props = defineProps<{
  product: RetailProduct
}>()
const emit = defineEmits<{
  add: [product: RetailProduct]
  select: [product: RetailProduct]
}>()
const priceLabel = computed(() => formatRetailMoney(props.product.price))
const unavailable = computed(() => props.product.stock === 0)
const addLabel = computed(() => unavailable.value ? '暂时缺货' : '加购')
const addAriaLabel = computed(() => unavailable.value ? `${props.product.name}，暂时缺货` : `将${props.product.name}加入购物车`)
</script>

<template>
  <view class="retail-product-card retail-section-enter flex min-w-0 flex-col">
    <VButton
      block
      variant="ghost"
      tone="default"
      class-name="!h-auto !w-full !min-w-0 !items-start !rounded-[3px] !border-0 !bg-transparent !p-0 !text-left !text-[#292722] !shadow-none"
      :aria-label="product.name"
      @click="emit('select', product)"
    >
      <view class="grid w-full min-w-0 gap-2">
        <view class="relative w-full overflow-hidden rounded-[3px] pt-[100%]">
          <view class="absolute inset-0">
            <VImage :src="product.image" :alt="product.name" fit="contain" width="100%" height="100%" radius="3px" lazy-load />
          </view>
        </view>
        <text class="retail-heading block min-h-[54px] whitespace-normal break-words text-[17px] leading-[27px]">
          {{ product.name }}
        </text>
      </view>
    </VButton>
    <view class="mt-auto pt-2">
      <view class="flex flex-wrap items-center justify-between gap-x-1 gap-y-2 border-t border-[#dcd6cb] pt-2">
        <text class="retail-price whitespace-nowrap text-[22px] leading-8 text-[#292722]">
          ¥{{ priceLabel }}
        </text>
        <VButton
          variant="ghost"
          tone="default"
          class-name="!min-h-11 !min-w-11 !rounded-none !border-0 !border-b !border-[#86543c] !bg-transparent !px-2 !py-2 !text-[15px] !font-medium !text-[#86543c] !shadow-none"
          :aria-label="addAriaLabel"
          :disabled="unavailable"
          @click="emit('add', props.product)"
        >
          {{ addLabel }}
        </VButton>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
