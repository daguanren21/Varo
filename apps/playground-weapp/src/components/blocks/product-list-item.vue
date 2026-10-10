<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { ProductListItemData } from './product-list.types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VButton from '../ui/v-button.vue'
import VImage from '../ui/v-image.vue'

const props = withDefaults(
  defineProps<{
    cartDisabled?: boolean
    className?: ClassValue
    currency?: string
    item: ProductListItemData
    loading?: boolean
    viewDisabled?: boolean
  }>(),
  {
    currency: '¥',
    cartDisabled: false,
    loading: false,
    viewDisabled: false,
  },
)

const emit = defineEmits<{
  addToCart: [item: ProductListItemData]
  select: [item: ProductListItemData]
}>()

const priceLabel = computed(() => `${props.currency}${(props.item.price / 100).toFixed(2)}`)
const itemAriaLabel = computed(() => `查看 ${props.item.name}`)
const actionLabel = computed(() => props.item.inventory === 0 ? '已售罄' : '加入购物车')
const actionAriaLabel = computed(() => props.item.inventory === 0 ? `${props.item.name} 已售罄` : `将 ${props.item.name} 加入购物车`)
const rootClass = computed(() =>
  cn('grid min-w-0 grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-[var(--varo-ui-border-lighter)] py-5', props.className),
)

function select() {
  if (!props.item?.id || props.viewDisabled || props.loading) { return }
  emit('select', props.item)
}

function addToCart() {
  if (!props.item?.id || props.cartDisabled || props.loading || (props.item.inventory != null && props.item.inventory <= 0)) { return }
  emit('addToCart', props.item)
}
</script>

<template>
  <view :class="rootClass">
    <VButton
      size="sm"
      variant="ghost"
      tone="default"
      class-name="!h-24 !min-h-24 !w-24 !overflow-hidden !rounded-lg !bg-[var(--varo-ui-surface-muted)] !p-0 !shadow-none"
      :aria-label="itemAriaLabel"
      :disabled="viewDisabled || loading"
      @click="select"
    >
      <VImage :src="item.image || ''" :alt="item.name || ''" width="96px" height="96px" fit="cover" error-text="暂无图片" />
    </VButton>

    <view class="min-w-0">
      <VButton
        block
        size="sm"
        variant="ghost"
        tone="default"
        class-name="!h-auto !min-h-11 !min-w-0 !w-full !whitespace-normal !rounded-lg !bg-transparent !p-0 !text-left !text-sm !font-semibold !text-[var(--varo-ui-text)] !shadow-none"
        :aria-label="itemAriaLabel"
        :disabled="viewDisabled || loading"
        @click="select"
      >
        <text class="block w-full break-words text-left text-sm font-semibold leading-6">
          {{ item.name }}
        </text>
      </VButton>
      <text v-if="item.badge" class="mt-1 inline-block max-w-full break-words rounded-md bg-[var(--varo-ui-surface-muted)] px-2 py-1 text-xs leading-5 text-[var(--varo-ui-text-regular)]">
        {{ item.badge }}
      </text>
      <text v-if="item.description" class="mt-2 block break-words text-sm leading-6 text-[var(--varo-ui-text-regular)]">
        {{ item.description }}
      </text>
    </view>

    <view class="col-span-2 flex flex-wrap items-center justify-between gap-3">
      <view class="min-w-0">
        <text class="block break-words text-lg font-semibold tabular-nums text-[var(--varo-ui-text)]">
          {{ priceLabel }}
        </text>
        <text v-if="item.inventory !== undefined" class="mt-1 block text-xs leading-5 text-[var(--varo-ui-text-regular)]">
          库存 {{ item.inventory }}
        </text>
      </view>
      <VButton
        tone="default"
        color="var(--varo-ui-text)"
        foreground-color="var(--varo-ui-surface)"
        class-name="!min-h-11 !rounded-lg !px-4 !shadow-none"
        :aria-label="actionAriaLabel"
        :disabled="cartDisabled || (item.inventory != null && item.inventory <= 0)"
        :loading="loading"
        loading-text="加购中…"
        @click.stop="addToCart"
      >
        {{ actionLabel }}
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
