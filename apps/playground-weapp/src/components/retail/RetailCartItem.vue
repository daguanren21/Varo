<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { computed } from 'wevu'
import { formatRetailMoney } from '../../features/retail/store'
import InputNumber from '../ui/input-number.vue'
import VButton from '../ui/v-button.vue'
import VCheckbox from '../ui/v-checkbox.vue'
import VImage from '../ui/v-image.vue'

const props = defineProps<{
  product: RetailProduct
  quantity: number
  selected: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'quantity-change': [quantity: number]
  'select': [selected: boolean]
  'view': [product: RetailProduct]
  'remove': []
}>()
const quantityMax = computed(() => Math.max(1, props.product.stock))
const selectionLabel = computed(() => `选择${props.product.name}`)
const viewLabel = computed(() => `查看${props.product.name}`)
const decreaseLabel = computed(() => `减少${props.product.name}数量`)
const increaseLabel = computed(() => `增加${props.product.name}数量`)
const quantityLabel = computed(() => `${props.product.name}数量`)
const removeLabel = computed(() => `移除${props.product.name}`)

function changeQuantity(quantity: number) {
  // Wevu forwards camelCase names unchanged; the native listener is kebab-case.
  // eslint-disable-next-line vue/custom-event-name-casing
  emit('quantity-change', quantity)
}
</script>

<template>
  <view class="retail-section-enter grid grid-cols-[44px_72px_minmax(0,1fr)] items-start gap-2 border-b border-[#dcd6cb] py-6 text-[#292722]">
    <view class="grid min-h-11 w-11 place-items-center">
      <VCheckbox :checked="selected" :disabled="disabled" :aria-label="selectionLabel" @update:checked="emit('select', $event)" />
    </view>
    <VButton
      variant="ghost"
      tone="default"
      :aria-label="viewLabel"
      class-name="!h-[72px] !min-h-[72px] !w-[72px] !overflow-hidden !rounded-[3px] !p-0"
      @click="emit('view', props.product)"
    >
      <VImage :src="product.image" :alt="product.name" fit="cover" width="72px" height="72px" radius="3px" />
    </VButton>
    <view class="grid min-w-0 gap-2">
      <text class="retail-heading break-words text-[17px] leading-7">
        {{ product.name }}
      </text>
      <text class="text-[15px] leading-6 text-[#625e55]">
        库存 {{ product.stock }} · 数量 {{ quantity }} 件
      </text>
      <text class="retail-price text-[22px] leading-8">
        ¥{{ formatRetailMoney(product.price) }}
      </text>
      <view class="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
        <InputNumber
          :value="quantity"
          :min="1"
          :max="quantityMax"
          :disabled="disabled || product.stock === 0"
          :decrease-aria-label="decreaseLabel"
          :increase-aria-label="increaseLabel"
          :input-aria-label="quantityLabel"
          @change="changeQuantity"
        />
        <VButton variant="ghost" :aria-label="removeLabel" class-name="!min-h-11 !min-w-11 !px-2 !text-[15px]" :disabled="disabled" @click="emit('remove')">
          移除
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
