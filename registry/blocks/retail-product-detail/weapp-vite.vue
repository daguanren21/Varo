<script setup lang="ts">
import type { RetailProduct } from '../../lib/retail'
import { formatRetailMoney } from '../../lib/retail'
import InputNumber from '../ui/input-number.vue'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VImage from '../ui/v-image.vue'

const props = withDefaults(
  defineProps<{
    cartCount?: number
    product: RetailProduct
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
</script>

<template>
  <view class="grid gap-3 bg-[#f4f6f8] pb-24 text-slate-950">
    <view class="relative h-[420px] overflow-hidden bg-white">
      <VImage :src="product.image" :alt="product.name" fit="cover" width="100%" height="420px" />
      <VButton size="sm" shape="round" tone="default" class-name="absolute left-3 top-3 !h-10 !min-h-10 !bg-black/45 !px-3 !text-[10px] !text-white" @click="emit('back')">
        返回
      </VButton>
      <VButton size="sm" shape="round" tone="default" class-name="absolute right-3 top-3 !h-10 !min-h-10 !bg-black/45 !px-3 !text-[10px] !text-white" @click="emit('cart')">
        购物车 {{ cartCount }}
      </VButton>
    </view>

    <view class="grid gap-3 px-3">
      <VCard class-name="grid gap-3" variant="elevated">
        <view class="flex items-baseline gap-1">
          <text class="text-sm font-black text-[#f04438]">
            ¥
          </text>
          <text class="text-[30px] font-black text-[#f04438]">
            {{ formatRetailMoney(product.price) }}
          </text>
          <text class="text-xs text-slate-300 line-through">
            ¥{{ formatRetailMoney(product.linePrice) }}
          </text>
        </view>
        <view class="flex flex-wrap gap-1.5">
          <VTag v-for="tag in product.tags" :key="tag" tone="danger" variant="soft" size="sm">
            {{ tag }}
          </VTag>
        </view>
        <text class="text-lg font-black leading-7">
          {{ product.name }}
        </text>
        <text class="text-xs leading-5 text-slate-500">
          {{ product.description }}
        </text>
      </VCard>

      <VCard class-name="flex items-center justify-between gap-3">
        <text class="text-sm font-black">
          购买数量
        </text>
        <InputNumber
          :value="quantity"
          :min="1"
          :max="product.stock"
          @update:value="emit('update:quantity', $event)"
        />
      </VCard>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 gap-2 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      <VButton size="lg" variant="outline" tone="danger" @click="emit('add', { product: props.product, quantity })">
        加入购物车
      </VButton>
      <VButton size="lg" tone="danger" @click="emit('buy', { product: props.product, quantity })">
        立即购买
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
