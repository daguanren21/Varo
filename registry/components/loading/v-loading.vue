<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

type LoadingSize = 'sm' | 'md' | 'lg'
type LoadingTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    size?: LoadingSize
    text?: string
    tone?: LoadingTone
  }>(),
  {
    size: 'md',
    tone: 'default',
  },
)

const classes = computed(() => cn('varo-loading', props.className))
</script>

<template>
  <view :class="classes" role="status" :data-size="props.size" :data-tone="props.tone">
    <text class="varo-loading__spinner" aria-hidden="true" />
    <text v-if="props.text || $slots.default" class="varo-loading__text">
      <slot>{{ props.text }}</slot>
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
