<script setup lang="ts">
import type { RetailProduct } from '../../lib/retail'
import { computed } from 'wevu'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'
import InputNumber from '../ui/input-number.vue'
import VButton from '../ui/v-button.vue'
import VImage from '../ui/v-image.vue'

const props = withDefaults(
  defineProps<{
    cartCount?: number
    product?: RetailProduct
    quantity?: number
  }>(),
  {
    cartCount: 0,
    quantity: 1,
  },
)
const emit = defineEmits<{
  'add': [payload: { product: RetailProduct, quantity: number }]
  'back': []
  'buy': [payload: { product: RetailProduct, quantity: number }]
  'cart': []
  'update:quantity': [quantity: number]
}>()
const safeCartCount = computed(() => Number(props.cartCount) || 0)
const safeProduct = computed(() => normalizeRetailProduct(props.product))
const safeQuantity = computed(() => Math.max(1, Number(props.quantity) || 1))
const linePriceLabel = computed(() => formatRetailMoney(safeProduct.value.linePrice))
const priceLabel = computed(() => formatRetailMoney(safeProduct.value.price))
</script>

<template>
  <view class="grid grid-cols-1 gap-6 bg-[var(--varo-ui-surface)] p-4 pb-[calc(env(safe-area-inset-bottom)+112px)] text-sm leading-6 text-[var(--varo-ui-text)]">
    <view class="flex items-center justify-between gap-4">
      <VButton
        tone="default"
        variant="ghost"
        class-name="!min-h-11 !rounded-lg !px-3 !text-sm !shadow-none"
        @click="emit('back')"
      >
        返回
      </VButton>
      <VButton
        tone="default"
        variant="outline"
        aria-label="打开购物车"
        class-name="!min-h-11 !rounded-lg !border-[var(--varo-ui-border-lighter)] !px-3 !text-sm !shadow-none"
        @click="emit('cart')"
      >
        购物车
        <text class="ml-2 text-xs tabular-nums">
          {{ safeCartCount }}
        </text>
      </VButton>
    </view>

    <view class="overflow-hidden rounded-xl">
      <VImage
        :src="safeProduct.image"
        :alt="safeProduct.name"
        fit="cover"
        width="100%"
        height="320px"
        loading-text="图片加载中"
        error-text="图片暂不可用"
      />
    </view>

    <view class="grid grid-cols-1 gap-3">
      <text class="break-words text-xl font-semibold leading-7">
        {{ safeProduct.name }}
      </text>
      <view class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <text class="break-all text-[28px] font-semibold leading-9 tabular-nums">
          ¥{{ priceLabel }}
        </text>
        <text class="break-all text-xs leading-5 text-[var(--varo-ui-text-muted)] line-through tabular-nums">
          ¥{{ linePriceLabel }}
        </text>
      </view>
      <view v-if="safeProduct.tags.length" class="flex flex-wrap gap-x-3 gap-y-1">
        <text v-for="tag in safeProduct.tags" :key="tag" class="max-w-full break-words text-xs leading-5 text-[var(--varo-ui-text-muted)]">
          {{ tag }}
        </text>
      </view>
      <text v-if="safeProduct.description" class="break-words text-sm leading-7 text-[var(--varo-ui-text-regular)]">
        {{ safeProduct.description }}
      </text>
    </view>

    <view class="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--varo-ui-border-lighter)] py-6">
      <text class="text-sm font-semibold leading-6">
        购买数量
      </text>
      <InputNumber
        :value="safeQuantity"
        :min="1"
        :max="safeProduct.stock"
        decrease-aria-label="减少购买数量"
        increase-aria-label="增加购买数量"
        input-aria-label="购买数量"
        @update:value="emit('update:quantity', $event)"
      />
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface)] px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
      <view class="grid grid-cols-2 gap-3">
        <view class="min-w-0">
          <VButton
            block
            size="lg"
            variant="outline"
            tone="default"
            class-name="!min-h-12 !w-full !rounded-lg !border-[var(--varo-ui-border-lighter)] !px-3 !text-sm !shadow-none"
            @click="emit('add', { product: safeProduct, quantity: safeQuantity })"
          >
            加入购物车
          </VButton>
        </view>
        <view class="min-w-0">
          <VButton
            block
            size="lg"
            tone="default"
            class-name="!min-h-12 !w-full !rounded-lg !bg-[var(--varo-ui-text)] !px-3 !text-sm !text-[var(--varo-ui-surface)] !shadow-none"
            @click="emit('buy', { product: safeProduct, quantity: safeQuantity })"
          >
            立即购买
          </VButton>
        </view>
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
