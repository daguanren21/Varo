<script setup lang="ts">
import type { RetailProduct } from '../../lib/retail'
import { computed } from 'wevu'
import { formatRetailMoney } from '../../lib/retail'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VImage from '../ui/v-image.vue'

interface RetailCategory {
  id: string
  label: string
}

const props = withDefaults(
  defineProps<{
    activeId?: string
    categories?: RetailCategory[]
    products?: RetailProduct[]
  }>(),
  {
    activeId: '',
    categories: () => [],
    products: () => [],
  },
)

const emit = defineEmits<{
  'add': [product: RetailProduct]
  'select': [product: RetailProduct]
  'update:activeId': [categoryId: string]
}>()

const activeProducts = computed(() => {
  const filtered = props.products.filter(product => !props.activeId || product.category === props.activeId)
  return filtered.length > 0 ? filtered : props.products
})
</script>

<template>
  <view class="grid min-h-[620px] grid-cols-[92px_minmax(0,1fr)] bg-white text-slate-950">
    <scroll-view scroll-y class="h-full bg-slate-50">
      <VButton
        v-for="category in categories"
        :key="category.id"
        size="sm"
        variant="ghost"
        tone="default"
        class-name="relative !flex !min-h-14 !w-full !items-center !justify-center !rounded-none !px-2 !text-xs !text-slate-500"
        :class="activeId === category.id ? '!bg-white !font-black !text-teal-700' : ''"
        @click="emit('update:activeId', category.id)"
      >
        <text v-if="activeId === category.id" class="absolute inset-y-3 left-0 w-1 rounded-r-full bg-teal-600" />
        {{ category.label }}
      </VButton>
    </scroll-view>

    <scroll-view scroll-y class="h-full">
      <view class="grid grid-cols-2 gap-3 p-3">
        <VCard v-for="product in activeProducts" :key="product.id" :padding="false" interactive class-name="overflow-hidden" @click="emit('select', product)">
          <VImage :src="product.image" :alt="product.name" fit="cover" width="100%" height="128px" />
          <view class="grid gap-2 p-3">
            <VTag v-if="product.tags.length" tone="primary" variant="soft" size="sm">
              {{ product.tags[0] }}
            </VTag>
            <text class="line-clamp-2 text-xs font-bold leading-[18px]">
              {{ product.name }}
            </text>
            <view class="flex items-end justify-between gap-2">
              <text class="text-sm font-black text-[#f04438]">
                ¥{{ formatRetailMoney(product.price) }}
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
