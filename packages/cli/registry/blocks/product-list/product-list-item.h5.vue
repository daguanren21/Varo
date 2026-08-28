<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { ProductListItemData } from './product-list.types'
import { computed } from 'vue'
import { cn } from '../../lib/cn'
import { VBadge } from '../ui/badge'
import { VButton } from '../ui/button'
import { VImage } from '../ui/image'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    currency?: string
    item: ProductListItemData
    loading?: boolean
  }>(),
  {
    currency: '¥',
    loading: false,
  },
)

const emit = defineEmits<{
  addToCart: [item: ProductListItemData]
  select: [item: ProductListItemData]
}>()

const priceLabel = computed(() => `${props.currency}${(props.item.price / 100).toFixed(2)}`)
const rootClass = computed(() =>
  cn('grid grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm', props.className),
)
</script>

<template>
  <article :class="rootClass">
    <VButton size="sm" variant="ghost" tone="default" class="!aspect-square !h-auto !min-h-0 !overflow-hidden !rounded-xl !bg-slate-100 !p-0" :aria-label="`查看 ${item.name}`" @click="emit('select', item)">
      <VImage :src="item.image" :alt="item.name" width="100%" height="100%" fit="cover" error-text="暂无图片" />
    </VButton>

    <div class="flex min-w-0 flex-col">
      <div class="flex items-start justify-between gap-2">
        <h3 class="m-0 line-clamp-2 text-sm font-bold leading-5 text-slate-950">
          <VButton size="sm" variant="ghost" tone="default" class="!min-h-0 !bg-transparent !p-0 !text-left !text-inherit" @click="emit('select', item)">
            {{ item.name }}
          </VButton>
        </h3>
        <VBadge v-if="item.badge" tone="primary" variant="soft">
          {{ item.badge }}
        </VBadge>
      </div>
      <p v-if="item.description" class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
        {{ item.description }}
      </p>

      <div class="mt-auto flex items-end justify-between gap-3 pt-3">
        <div>
          <strong class="text-lg text-red-600">{{ priceLabel }}</strong>
          <p v-if="item.inventory !== undefined" class="m-0 text-[11px] text-slate-400">
            库存 {{ item.inventory }}
          </p>
        </div>
        <VButton
          size="sm"
          :disabled="item.inventory === 0"
          :loading="loading"
          @click.stop="emit('addToCart', item)"
        >
          {{ item.inventory === 0 ? '已售罄' : '加入购物车' }}
        </VButton>
      </div>
    </div>
  </article>
</template>
