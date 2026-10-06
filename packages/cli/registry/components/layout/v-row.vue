<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { PairSizeValue } from './layout-utils'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { normalizePairSize } from './layout-utils'

type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch'
type RowJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between'

const props = withDefaults(
  defineProps<{
    align?: RowAlign
    className?: ClassValue
    gutter?: PairSizeValue
    justify?: RowJustify
    wrap?: boolean
  }>(),
  {
    align: 'top',
    justify: 'start',
    wrap: true,
  },
)

const classes = computed(() =>
  cn(
    'varo-row',
    `justify-${props.justify}`,
    `align-${props.align}`,
    props.wrap && 'wrap-true',
    props.className,
  ),
)
const rootStyle = computed(() => {
  const [gutterX, gutterY] = normalizePairSize(props.gutter)
  return {
    '--varo-row-gutter-x': gutterX,
    '--varo-row-gutter-y': gutterY,
  }
})
</script>

<template>
  <view
    :class="classes"
    :style="rootStyle"
    :data-align="props.align"
    :data-justify="props.justify"
    :data-wrap="String(props.wrap)"
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
