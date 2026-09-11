<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { useDialogContext } from './dialog-context'

const props = defineProps<{
  className?: ClassValue
}>()

const dialog = useDialogContext()
const open = computed(() => dialog.state.open.value)
const classes = computed(() => cn('varo-dialog__content', props.className))
const state = computed(() => open.value ? 'open' : 'closed')
function stop(event: unknown) {
  if (event && typeof event === 'object' && 'stopPropagation' in event && typeof event.stopPropagation === 'function') {
    event.stopPropagation()
  }
}
</script>

<template>
  <view
    v-if="open"
    :class="classes"
    role="dialog"
    aria-modal="true"
    :data-state="state"
    @click="stop"
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
