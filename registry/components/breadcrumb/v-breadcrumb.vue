<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VIcon from './v-icon.vue'

interface BreadcrumbItem {
  disabled?: boolean
  href?: string
  label: string
  value?: string
}
interface RenderedBreadcrumb {
  current: boolean
  currentData: string
  disabled: boolean
  disabledData: string
  index: number
  item: BreadcrumbItem
  key: string
  label: string
  showSeparator: boolean
}

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    items?: Array<BreadcrumbItem | string>
    label?: string
    separator?: string
  }>(),
  {
    className: undefined,
    items: () => [],
    label: 'Breadcrumb',
    separator: undefined,
  },
)

const emit = defineEmits<{
  select: [payload: { index: number, item: BreadcrumbItem }]
}>()
const classes = computed(() => cn('varo-breadcrumb', props.className))
const hasCustomSeparator = computed(() => Boolean(props.separator))
const normalizedItems = computed<BreadcrumbItem[]>(() =>
  props.items.map(item => (typeof item === 'string' ? { label: item } : item)),
)
const renderedItems = computed<RenderedBreadcrumb[]>(() =>
  normalizedItems.value.map((item, index) => {
    const current = index === normalizedItems.value.length - 1
    const disabled = Boolean(item.disabled)
    return {
      current,
      currentData: String(current),
      disabled,
      disabledData: String(disabled),
      index,
      item,
      key: `${index}-${item.value ?? item.label}`,
      label: item.label,
      showSeparator: !current,
    }
  }),
)

function select(crumb: RenderedBreadcrumb) {
  if (crumb.disabled || crumb.current) {
    return
  }
  emit('select', { index: crumb.index, item: crumb.item })
}
</script>

<template>
  <view :class="classes" role="navigation" :aria-label="props.label">
    <view class="varo-breadcrumb__list">
      <view
        v-for="crumb in renderedItems"
        :key="crumb.key"
        class="varo-breadcrumb__item"
        :data-current="crumb.currentData"
        :data-disabled="crumb.disabledData"
      >
        <text v-if="crumb.current" class="varo-breadcrumb__current" aria-current="page">
          {{ crumb.label }}
        </text>
        <button
          v-else
          class="varo-breadcrumb__link"
          type="button"
          :disabled="crumb.disabled"
          @click="select(crumb)"
        >
          {{ crumb.label }}
        </button>
        <view v-if="crumb.showSeparator" class="varo-breadcrumb__separator" aria-hidden="true">
          <slot name="separator">
            <text v-if="hasCustomSeparator">
              {{ props.separator }}
            </text>
            <VIcon v-else name="chevronRight" :size="12" />
          </slot>
        </view>
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
