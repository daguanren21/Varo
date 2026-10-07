<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { SizeValue } from './layout-utils'
import type { GridContext, GridDirection } from './grid-context'
import { computed, provide } from 'wevu'
import { cn } from '../../lib/cn'
import { normalizeSize } from './layout-utils'
import { gridContextKey } from './grid-context'

const props = withDefaults(
  defineProps<{
    border?: boolean
    center?: boolean
    className?: ClassValue
    clickable?: boolean
    columnNum?: number | string
    direction?: GridDirection
    gutter?: SizeValue
    square?: boolean
  }>(),
  {
    border: true,
    center: true,
    clickable: false,
    columnNum: 4,
    direction: 'vertical',
    square: false,
  },
)

provide<GridContext>(gridContextKey, {
  get clickable() {
    return props.clickable
  },
  get direction() {
    return props.direction
  },
  get square() {
    return props.square
  },
})

const classes = computed(() =>
  cn(
    'varo-grid',
    `direction-${props.direction}`,
    props.square && 'square-true',
    props.border && 'border-true',
    props.className,
  ),
)
const rootStyle = computed(() => ({
  '--varo-grid-columns': props.columnNum,
  '--varo-grid-gutter': normalizeSize(props.gutter),
}))
</script>

<template>
  <view
    :class="classes"
    :style="rootStyle"
    :data-border="String(props.border)"
    :data-center="String(props.center)"
    :data-clickable="String(props.clickable)"
    :data-columns="String(props.columnNum)"
    :data-direction="props.direction"
    :data-square="String(props.square)"
  >
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
