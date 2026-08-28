<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(defineProps<{
  closeOnClickOverlay?: boolean
  className?: ClassValue
  isOpened?: boolean
}>(), {
  closeOnClickOverlay: true,
  isOpened: false,
})
const emit = defineEmits<{
  cancel: []
  close: []
}>()

const classes = computed(() => cn('w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl', props.className))

function overlayTap() {
  if (!props.closeOnClickOverlay) { return }
  emit('cancel')
  emit('close')
}
</script>

<template>
  <view v-if="isOpened" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6" @tap="overlayTap">
    <view :class="classes" @tap.stop>
      <slot />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
