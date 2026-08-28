<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = defineProps<{
  className?: ClassValue
}>()
const classes = computed(() => cn('px-5 py-4 text-base leading-7 text-slate-700', props.className))
</script>

<template>
  <view :class="classes">
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
