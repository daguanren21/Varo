<script setup lang="ts">
import { computed } from 'wevu'
import VBadge from '../ui/badge.vue'
import VButton from '../ui/v-button.vue'
import VImage from '../ui/v-image.vue'
import { cn, type ClassValue } from '../../lib/cn'
import type { ProductListItemData } from './product-list.types'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    currency?: string
    item: ProductListItemData
    loading?: boolean
  }>(),
  {
    currency: '¥',
    loading: false
  }
)

const emit = defineEmits<{
  addToCart: [item: ProductListItemData]
  select: [item: ProductListItemData]
}>()

const priceLabel = computed(() => `${props.currency}${(props.item.price / 100).toFixed(2)}`)
const rootClass = computed(() =>
  cn('grid grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm', props.className)
)
</script>

<template>
  <view :class="rootClass">
    <button class="m-0 aspect-square overflow-hidden rounded-xl bg-slate-100 p-0" type="button" :aria-label="`查看 ${item.name}`" @click="emit('select', item)">
      <VImage :src="item.image" :alt="item.name" width="100%" height="100%" fit="cover" error-text="暂无图片" />
    </button>

    <view class="flex min-w-0 flex-col">
      <view class="flex items-start justify-between gap-2">
        <button class="m-0 bg-transparent p-0 text-left text-sm font-bold leading-5 text-slate-950" type="button" @click="emit('select', item)">
          {{ item.name }}
        </button>
        <VBadge v-if="item.badge" tone="primary" variant="soft">{{ item.badge }}</VBadge>
      </view>
      <text v-if="item.description" class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{{ item.description }}</text>

      <view class="mt-auto flex items-end justify-between gap-3 pt-3">
        <view>
          <text class="text-lg font-bold text-red-600">{{ priceLabel }}</text>
          <text v-if="item.inventory !== undefined" class="block text-[11px] text-slate-400">库存 {{ item.inventory }}</text>
        </view>
        <VButton
          size="sm"
          :disabled="item.inventory === 0"
          :loading="loading"
          @click.stop="emit('addToCart', item)"
        >
          {{ item.inventory === 0 ? '已售罄' : '加入购物车' }}
        </VButton>
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
