<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { ProductListAction, ProductListItemData } from './product-list.types'
import { computed } from 'vue'
import { cn } from '../../lib/cn'
import { VEmpty } from '../ui/empty'
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

const rootClass = computed(() => cn('box-border grid w-full min-w-0 grid-cols-1 gap-6 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)] sm:p-6', props.className))
</script>

<template>
  <section :class="rootClass" :aria-label="title">
    <header class="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <h2 class="m-0 break-words text-xl font-semibold leading-7">
          {{ title }}
        </h2>
        <p v-if="description" class="mb-0 mt-2 break-words text-xs leading-5 text-[var(--varo-ui-text-regular)]">
          {{ description }}
        </p>
      </div>
      <slot name="action" />
    </header>

    <VEmpty v-if="items.length === 0" icon="search" size="sm">
      <template #description>
        <span class="block text-sm leading-6 text-[var(--varo-ui-text-regular)]">{{ emptyText }}</span>
      </template>
      <slot name="empty-action" />
    </VEmpty>

    <div v-else class="grid min-w-0 grid-cols-1 gap-x-6 sm:grid-cols-2">
      <ProductListItem
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :currency="currency"
        :loading="loadingId === item.id"
        @select="emit('select', { index, item: $event })"
        @add-to-cart="emit('addToCart', { index, item: $event })"
      />
    </div>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-badge.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-icon.css';
@import '../../styles/varo-image.css';
@import '../../styles/varo-empty.css';
</style>
