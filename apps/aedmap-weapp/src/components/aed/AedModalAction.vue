<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = defineProps<{
  className?: ClassValue
}>()
const classes = computed(() => cn(
  'flex border-t border-slate-100 [&>button]:m-0 [&>button]:flex-1 [&>button]:rounded-none [&>button]:bg-white [&>button]:py-4',
  props.className,
))
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
