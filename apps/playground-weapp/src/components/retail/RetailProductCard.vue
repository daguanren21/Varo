<script setup lang="ts">
import type { RetailProduct } from '../../features/retail/types'
import { computed } from 'wevu'
import { formatRetailMoney } from '../../features/retail/store'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VImage from '../ui/v-image.vue'

const props = defineProps<{
  product: RetailProduct
}>()
const emit = defineEmits<{
  add: [product: RetailProduct]
  select: [product: RetailProduct]
}>()
const tags = computed(() => (Array.isArray(props.product.tags) ? props.product.tags : []).slice(0, 2))
const priceLabel = computed(() => formatRetailMoney(props.product.price))
const linePriceLabel = computed(() => formatRetailMoney(props.product.linePrice))
</script>

<template>
  <VCard :padding="false" interactive class-name="retail-product-card retail-section-enter overflow-hidden" @click="emit('select', product)">
    <view class="relative h-44 overflow-hidden bg-slate-100">
      <VImage :src="product.image" :alt="product.name" fit="cover" width="100%" height="176px" lazy-load />
      <view class="absolute left-2 top-2 flex flex-wrap gap-1">
        <VTag v-for="tag in tags" :key="tag" :label="tag" tone="danger" variant="solid" size="sm" />
      </view>
    </view>

    <view class="grid gap-2 p-3">
      <text class="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900">
        {{ product.name }}
      </text>
      <text class="truncate text-[10px] text-slate-400">
        {{ product.description }}
      </text>
      <view class="grid gap-2">
        <view class="flex min-w-0 items-baseline gap-1">
          <text class="text-[11px] font-black text-[#f04438]">
            ¥
          </text>
          <text class="text-xl font-black tracking-tight text-[#f04438]">
            {{ priceLabel }}
          </text>
          <text class="truncate text-[9px] text-slate-300 line-through">
            ¥{{ linePriceLabel }}
          </text>
        </view>
        <VButton
          block
          size="sm"
          tone="danger"
          class-name="!min-h-9 !w-full !rounded-lg !px-3"
          aria-label="加入购物车"
          @click.stop="emit('add', props.product)"
        >
          加入购物车
        </VButton>
      </view>
      <text class="text-[9px] text-slate-400">
        已售 {{ product.sales }} · 库存 {{ product.stock }}
      </text>
    </view>
  </VCard>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
