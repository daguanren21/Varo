<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { ProductListItemData } from './product-list.types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VButton from '../ui/v-button.vue'
import VImage from '../ui/v-image.vue'

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
  cn('grid grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm', props.className),
)
</script>

<template>
  <view :class="rootClass">
    <view class="h-28 w-28 overflow-hidden rounded-xl bg-slate-100">
      <VButton block size="sm" variant="ghost" tone="default" class-name="!h-28 !min-h-28 !w-28 !overflow-hidden !rounded-xl !bg-slate-100 !p-0" :aria-label="`查看 ${item.name}`" @click="emit('select', item)">
        <VImage :src="item.image || ''" :alt="item.name || ''" width="112px" height="112px" fit="cover" error-text="暂无图片" />
      </VButton>
    </view>

    <view class="grid min-w-0 content-between gap-2">
      <view class="grid gap-1">
        <view class="flex min-w-0 items-start gap-2">
          <VButton block size="sm" variant="ghost" tone="default" class-name="!block !min-h-0 !min-w-0 !flex-1 !bg-transparent !p-0 !text-left !text-sm !font-bold !leading-5 !text-slate-950" @click="emit('select', item)">
            {{ item.name }}
          </VButton>
          <text v-if="item.badge" class="flex-none rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700">
            {{ item.badge }}
          </text>
        </view>
        <text v-if="item.description" class="line-clamp-2 text-xs leading-5 text-slate-500">
          {{ item.description }}
        </text>
      </view>

      <view class="flex items-end justify-between gap-3">
        <view>
          <text class="text-lg font-bold text-red-600">
            {{ priceLabel }}
          </text>
          <text v-if="item.inventory !== undefined" class="block text-[11px] text-slate-400">
            库存 {{ item.inventory }}
          </text>
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
