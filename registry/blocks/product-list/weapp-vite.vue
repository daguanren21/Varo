<script setup lang="ts">
import { computed } from 'wevu'
import VEmpty from '../ui/empty.vue'
import { cn, type ClassValue } from '../../lib/cn'
import ProductListItem from './product-list-item.vue'
import type { ProductListAction, ProductListItemData } from './product-list.types'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    currency?: string
    description?: string
    emptyText?: string
    items?: ProductListItemData[]
    loadingId?: string
    title?: string
  }>(),
  {
    currency: '¥',
    description: '',
    emptyText: '暂无商品',
    items: () => [],
    loadingId: '',
    title: '推荐商品'
  }
)

const emit = defineEmits<{
  addToCart: [payload: ProductListAction]
  select: [payload: ProductListAction]
}>()

const rootClass = computed(() => cn('w-full grid gap-4', props.className))
</script>

<template>
  <view :class="rootClass" aria-labelledby="product-list-title">
    <view class="flex items-end justify-between gap-4">
      <view>
        <text id="product-list-title" class="text-xl font-bold tracking-tight text-slate-950">{{ title }}</text>
        <text v-if="description" class="mt-1 block text-sm text-slate-500">{{ description }}</text>
      </view>
      <slot name="action" />
    </view>

    <VEmpty v-if="items.length === 0" :description="emptyText" icon="search">
      <slot name="empty-action" />
    </VEmpty>

    <view v-else class="grid gap-3">
      <ProductListItem
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :currency="currency"
        :loading="loadingId === item.id"
        @select="emit('select', { index, item: $event })"
        @add-to-cart="emit('addToCart', { index, item: $event })"
      />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
