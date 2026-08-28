<script setup lang="ts">
import type { PropType } from 'wevu'
import type { RetailProduct } from '../../lib/retail'
import { computed } from 'wevu'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VImage from '../ui/v-image.vue'

interface RetailCategory {
  id: string
  label: string
}

const props = defineProps({
  activeId: { type: null as unknown as PropType<string>, default: '' },
  categories: { type: null as unknown as PropType<RetailCategory[]>, default: () => [] },
  products: { type: null as unknown as PropType<RetailProduct[]>, default: () => [] },
})

const emit = defineEmits<{
  'add': [product: RetailProduct]
  'select': [product: RetailProduct]
  'update:activeId': [categoryId: string]
}>()

const safeActiveId = computed(() => props.activeId || '')
const categoryItems = computed(() => (Array.isArray(props.categories) ? props.categories : []).map(category => ({
  id: String(category?.id ?? ''),
  label: String(category?.label ?? ''),
})))
const safeProducts = computed(() => (Array.isArray(props.products) ? props.products : []).map((product) => {
  const normalized = normalizeRetailProduct(product)
  return {
    ...normalized,
    priceLabel: formatRetailMoney(normalized.price),
    primaryTag: normalized.tags[0] ?? '',
  }
}))
const activeProducts = computed(() => {
  const filtered = safeProducts.value.filter(product => !safeActiveId.value || product.category === safeActiveId.value)
  return filtered.length > 0 ? filtered : safeProducts.value
})
</script>

<template>
  <view class="grid min-h-[620px] grid-cols-[92px_minmax(0,1fr)] bg-white text-slate-950">
    <scroll-view scroll-y class="h-full bg-slate-50">
      <VButton
        v-for="category in categoryItems"
        :key="category.id"
        size="sm"
        variant="ghost"
        tone="default"
        class-name="relative !flex !min-h-14 !w-full !items-center !justify-center !rounded-none !px-2 !text-xs !text-slate-500"
        :class="safeActiveId === category.id ? '!bg-white !font-black !text-teal-700' : ''"
        @click="emit('update:activeId', category.id)"
      >
        <text v-if="safeActiveId === category.id" class="absolute inset-y-3 left-0 w-1 rounded-r-full bg-teal-600" />
        {{ category.label }}
      </VButton>
    </scroll-view>

    <scroll-view scroll-y class="h-full">
      <view class="grid grid-cols-2 gap-3 p-3">
        <VCard v-for="product in activeProducts" :key="product.id" :padding="false" interactive class-name="overflow-hidden" @click="emit('select', product)">
          <VImage :src="product.image" :alt="product.name" fit="cover" width="100%" height="128px" />
          <view class="grid gap-2 p-3">
            <text class="w-fit rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700">
              {{ product.primaryTag }}
            </text>
            <text class="line-clamp-2 text-xs font-bold leading-[18px]">
              {{ product.name }}
            </text>
            <view class="flex items-end justify-between gap-2">
              <text class="text-sm font-black text-[#f04438]">
                ¥{{ product.priceLabel }}
              </text>
              <VButton size="sm" shape="round" class-name="!h-8 !min-h-8 !w-8 !p-0" @click="emit('add', product)">
                +
              </VButton>
            </view>
          </view>
        </VCard>
      </view>
    </scroll-view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
