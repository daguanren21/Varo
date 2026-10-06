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
const itemAriaLabel = computed(() => `查看 ${props.item.name}`)
const actionLabel = computed(() => props.item.inventory === 0 ? '已售罄' : '加入购物车')
const actionAriaLabel = computed(() => props.item.inventory === 0 ? `${props.item.name} 已售罄` : `将 ${props.item.name} 加入购物车`)
const rootClass = computed(() =>
  cn('grid min-w-0 grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-[var(--varo-ui-border-lighter)] py-5', props.className),
)
</script>

<template>
  <article :class="rootClass">
    <VButton
      size="sm"
      variant="ghost"
      tone="default"
      class="!h-24 !min-h-24 !w-24 !overflow-hidden !rounded-lg !bg-[var(--varo-ui-surface-muted)] !p-0 !shadow-none"
      :aria-label="itemAriaLabel"
      @click="emit('select', item)"
    >
      <VImage :src="item.image" :alt="item.name" width="96px" height="96px" fit="cover" error-text="暂无图片" />
    </VButton>

    <div class="min-w-0">
      <h3 class="m-0 text-sm font-semibold leading-6">
        <VButton
          size="sm"
          variant="ghost"
          tone="default"
          class="!h-auto !min-h-11 !w-full !justify-start !whitespace-normal !break-words !rounded-lg !bg-transparent !p-0 !text-left !text-sm !font-semibold !leading-6 !text-[var(--varo-ui-text)] !shadow-none"
          :aria-label="itemAriaLabel"
          @click="emit('select', item)"
        >
          <span class="block w-full min-w-0 break-words">{{ item.name }}</span>
        </VButton>
      </h3>
      <VBadge v-if="item.badge" tone="default" variant="soft" class="mt-1 !max-w-full !whitespace-normal !break-words !text-xs !leading-5 !text-[var(--varo-ui-text-regular)]">
        <span class="block min-w-0 break-words">{{ item.badge }}</span>
      </VBadge>
      <p v-if="item.description" class="mb-0 mt-2 break-words text-sm leading-6 text-[var(--varo-ui-text-regular)]">
        {{ item.description }}
      </p>
    </div>

    <div class="col-span-2 flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <strong class="break-words text-lg font-semibold tabular-nums text-[var(--varo-ui-text)]">{{ priceLabel }}</strong>
        <p v-if="item.inventory !== undefined" class="mb-0 mt-1 text-xs leading-5 text-[var(--varo-ui-text-regular)]">
          库存 {{ item.inventory }}
        </p>
      </div>
      <VButton
        tone="default"
        color="var(--varo-ui-text)"
        foreground-color="var(--varo-ui-surface)"
        class="!min-h-11 !rounded-lg !px-4 !shadow-none"
        :aria-label="actionAriaLabel"
        :disabled="item.inventory === 0"
        :loading="loading"
        loading-text="加购中…"
        @click.stop="emit('addToCart', item)"
      >
        {{ actionLabel }}
      </VButton>
    </div>
  </article>
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
