<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { SizeValue } from './layout-utils'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { normalizeSize } from './layout-utils'

type DividerContentPosition = 'left' | 'center' | 'right'

const props = withDefaults(
  defineProps<{
    borderColor?: string
    className?: ClassValue
    contentPosition?: DividerContentPosition
    dashed?: boolean
    hairline?: boolean
    lineColor?: string
    spacing?: SizeValue
    textColor?: string
    vertical?: boolean
  }>(),
  {
    contentPosition: 'center',
    dashed: false,
    hairline: true,
    vertical: false,
  },
)

const classes = computed(() =>
  cn(
    'varo-divider',
    `position-${props.contentPosition}`,
    props.dashed && 'dashed-true',
    props.hairline && 'hairline-true',
    props.vertical && 'vertical-true',
    props.className,
  ),
)
const orientation = computed(() => (props.vertical ? 'vertical' : 'horizontal'))
const rootStyle = computed(() => ({
  '--varo-divider-line-color': props.lineColor ?? props.borderColor,
  '--varo-divider-spacing': normalizeSize(props.spacing),
  '--varo-divider-text-color': props.textColor,
}))
</script>

<template>
  <text
    v-if="props.vertical"
    :class="classes"
    role="separator"
    :style="rootStyle"
    :aria-orientation="orientation"
    :data-content-position="props.contentPosition"
    :data-dashed="String(props.dashed)"
    :data-hairline="String(props.hairline)"
    :data-vertical="String(props.vertical)"
  />
  <view
    v-else
    :class="classes"
    role="separator"
    :style="rootStyle"
    :aria-orientation="orientation"
    :data-content-position="props.contentPosition"
    :data-dashed="String(props.dashed)"
    :data-hairline="String(props.hairline)"
    :data-vertical="String(props.vertical)"
  >
    <text v-if="$slots.default" class="varo-divider__text">
      <slot />
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
