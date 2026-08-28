<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(defineProps<{
  className?: ClassValue
  isOpened?: boolean
  status?: string
  text?: string
}>(), {
  isOpened: false,
  status: '',
  text: '',
})

const classes = computed(() => cn(
  'fixed left-1/2 top-1/2 z-[60] max-w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-xl px-5 py-3 text-center text-sm text-white shadow-xl',
  props.status === 'error' ? 'bg-red-600' : 'bg-slate-900/90',
  props.className,
))
</script>

<template>
  <view v-if="isOpened" :class="classes" role="status">
    {{ text }}
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
