<script setup lang="ts">
import type { PropType } from 'wevu'
import type { RetailProduct } from '../../lib/retail'
import { computed } from 'wevu'
import InputNumber from '../../components/ui/input-number.vue'
import VTag from '../../components/ui/tag.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VImage from '../../components/ui/v-image.vue'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'

const props = defineProps({
  cartCount: { type: null as unknown as PropType<number>, default: 0 },
  product: { type: null as unknown as PropType<RetailProduct>, default: undefined },
  quantity: { type: null as unknown as PropType<number>, default: 1 },
})
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
  <view class="grid gap-3 bg-[#f4f6f8] pb-24 text-slate-950">
    <view class="relative h-[420px] overflow-hidden bg-white">
      <VImage :src="safeProduct.image" :alt="safeProduct.name" fit="cover" width="100%" height="420px" />
      <VButton size="sm" shape="round" tone="default" class-name="absolute left-3 top-3 !h-10 !min-h-10 !bg-black/45 !px-3 !text-[10px] !text-white" @click="emit('back')">
        返回
      </VButton>
      <VButton size="sm" shape="round" tone="default" class-name="absolute right-3 top-3 !h-10 !min-h-10 !bg-black/45 !px-3 !text-[10px] !text-white" @click="emit('cart')">
        购物车 {{ safeCartCount }}
      </VButton>
    </view>

    <view class="grid gap-3 px-3">
      <VCard variant="elevated">
        <view class="grid gap-3">
          <view class="flex items-baseline gap-1">
            <text class="text-sm font-black text-[#f04438]">
              ¥
            </text>
            <text class="text-[30px] font-black text-[#f04438]">
              {{ priceLabel }}
            </text>
            <text class="text-xs text-slate-300 line-through">
              ¥{{ linePriceLabel }}
            </text>
          </view>
          <view class="flex flex-wrap gap-1.5">
            <VTag v-for="tag in safeProduct.tags" :key="tag" :label="tag" tone="danger" variant="soft" size="sm" />
          </view>
          <text class="text-lg font-black leading-7">
            {{ safeProduct.name }}
          </text>
          <text class="text-xs leading-5 text-slate-500">
            {{ safeProduct.description }}
          </text>
        </view>
      </VCard>

      <VCard>
        <view class="flex items-center justify-between gap-3">
          <text class="text-sm font-black">
            购买数量
          </text>
          <InputNumber
            :value="safeQuantity"
            :min="1"
            :max="safeProduct.stock"
            @update:value="emit('update:quantity', $event)"
          />
        </view>
      </VCard>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 shadow-[0_-8px_28px_rgba(15,23,42,.08)]">
      <view class="grid grid-cols-2 gap-3">
        <view class="min-w-0">
          <VButton block size="lg" variant="outline" tone="danger" class-name="!w-full" @click="emit('add', { product: safeProduct, quantity: safeQuantity })">
            加入购物车
          </VButton>
        </view>
        <view class="min-w-0">
          <VButton block size="lg" tone="danger" class-name="!w-full" @click="emit('buy', { product: safeProduct, quantity: safeQuantity })">
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
