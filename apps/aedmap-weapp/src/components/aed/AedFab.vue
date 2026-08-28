<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = defineProps<{
  className?: ClassValue
}>()
const classes = computed(() => cn('fixed bottom-6 right-6 z-30 flex min-h-14 min-w-14 items-center justify-center rounded-full bg-orange-500 px-4 text-white shadow-lg', props.className))
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
