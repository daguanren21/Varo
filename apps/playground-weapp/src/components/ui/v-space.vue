<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { PairSizeValue } from './layout-utils'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { normalizePairSize } from './layout-utils'

type SpaceDirection = 'horizontal' | 'vertical'
type SpaceAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'
type SpaceJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'

const props = withDefaults(
  defineProps<{
    align?: SpaceAlign
    className?: ClassValue
    direction?: SpaceDirection
    fill?: boolean
    justify?: SpaceJustify
    size?: PairSizeValue
    wrap?: boolean
  }>(),
  {
    align: 'start',
    direction: 'horizontal',
    fill: false,
    justify: 'start',
    wrap: false,
  },
)

const classes = computed(() =>
  cn(
    'varo-space',
    `direction-${props.direction}`,
    `align-${props.align}`,
    `justify-${props.justify}`,
    props.wrap && 'wrap-true',
    props.fill && 'fill-true',
    props.className,
  ),
)
const rootStyle = computed(() => {
  const [gapX, gapY] = normalizePairSize(props.size)
  return {
    '--varo-space-gap-x': gapX,
    '--varo-space-gap-y': gapY,
  }
})
</script>

<template>
  <view
    :class="classes"
    :style="rootStyle"
    :data-align="props.align"
    :data-direction="props.direction"
    :data-fill="String(props.fill)"
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
