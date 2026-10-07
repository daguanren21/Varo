<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { ProductListAction, ProductListItemData } from './product-list.types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VEmpty from '../ui/empty.vue'
import ProductListItem from './product-list-item.vue'

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
    title: '推荐商品',
  },
)

const emit = defineEmits<{
  addToCart: [payload: ProductListAction]
  select: [payload: ProductListAction]
}>()

const rootClass = computed(() => cn('box-border grid w-full min-w-0 grid-cols-1 gap-6 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]', props.className))
</script>

<template>
  <view :class="rootClass" :aria-label="title">
    <view class="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <view class="min-w-0 flex-1">
        <text class="block break-words text-xl font-semibold leading-7">
          {{ title }}
        </text>
        <text v-if="description" class="mt-2 block break-words text-xs leading-5 text-[var(--varo-ui-text-regular)]">
          {{ description }}
        </text>
      </view>
      <slot name="action" />
    </view>

    <VEmpty v-if="items.length === 0" icon="search" size="sm">
      <template #description>
        <text class="block text-sm leading-6 text-[var(--varo-ui-text-regular)]">
          {{ emptyText }}
        </text>
      </template>
      <slot name="empty-action" />
    </VEmpty>

    <view v-else class="grid min-w-0 grid-cols-1">
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
