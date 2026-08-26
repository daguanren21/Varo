<script setup lang="ts">
import { computed } from 'vue'
import { VEmpty } from '../ui/empty'
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

const rootClass = computed(() => cn('w-full space-y-4', props.className))
</script>

<template>
  <section :class="rootClass" aria-labelledby="product-list-title">
    <header class="flex items-end justify-between gap-4">
      <div>
        <h2 id="product-list-title" class="m-0 text-xl font-bold tracking-tight text-slate-950">{{ title }}</h2>
        <p v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</p>
      </div>
      <slot name="action" />
    </header>

    <VEmpty v-if="items.length === 0" :description="emptyText" icon="search">
      <slot name="empty-action" />
    </VEmpty>

    <div v-else class="grid gap-3 sm:grid-cols-2">
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
