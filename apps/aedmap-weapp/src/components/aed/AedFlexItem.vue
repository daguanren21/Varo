<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = defineProps<{
  className?: ClassValue
  isAuto?: boolean
  size?: number | string
}>()

const classes = computed(() => cn('min-w-0', props.isAuto ? 'flex-none' : 'flex-1', props.className))
const styles = computed(() => props.size ? { flex: `0 0 ${(Number(props.size) / 12) * 100}%` } : undefined)
</script>

<template>
  <view :class="classes" :style="styles">
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
