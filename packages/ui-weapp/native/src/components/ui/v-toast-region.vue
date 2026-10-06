<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

type VToastPosition = 'top' | 'middle' | 'bottom'

const props = withDefaults(defineProps<{
  className?: ClassValue
  inline?: boolean
  position?: VToastPosition
}>(), {
  className: undefined,
  inline: false,
  position: 'top',
})

const classes = computed(() => cn('varo-toast-region', props.className))
</script>

<template>
  <view
    :class="classes"
    :data-inline="String(props.inline)"
    :data-position="props.position"
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
