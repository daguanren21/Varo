<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    interactive?: boolean
    padding?: boolean
    variant?: 'default' | 'outline' | 'elevated' | 'muted'
  }>(),
  {
    interactive: false,
    padding: true,
    variant: 'default',
  },
)

const classes = computed(() =>
  cn(
    'varo-card',
    `varo-card--${props.variant}`,
    props.padding && 'varo-card--padded',
    props.interactive && 'varo-card--interactive',
    props.className,
  ),
)
const hoverClass = computed(() => (props.interactive ? 'varo-card--pressed' : 'none'))
</script>

<template>
  <view
    :class="classes"
    :hover-class="hoverClass"
    :hover-start-time="20"
    :hover-stay-time="70"
    :data-interactive="String(interactive)"
    :data-variant="variant"
  >
    <view v-if="$slots.header || $slots.title || $slots.description" class="varo-card__header">
      <slot name="header">
        <text v-if="$slots.title" class="varo-card__title">
          <slot name="title" />
        </text>
        <text v-if="$slots.description" class="varo-card__description">
          <slot name="description" />
        </text>
      </slot>
    </view>
    <view class="varo-card__content">
      <slot />
    </view>
    <view v-if="$slots.footer" class="varo-card__footer">
      <slot name="footer" />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
