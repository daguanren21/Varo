<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, useSlots } from 'wevu'
import { cn } from '../../lib/cn'
import { useDialogContext } from './dialog-context'

const props = defineProps<{
  className?: ClassValue
}>()

const emit = defineEmits<{
  click: [event: unknown]
}>()

const dialog = useDialogContext()
const slots = useSlots()
const backdropAriaHidden = computed(() => slots.default ? undefined : 'true')
const open = computed(() => dialog.state.open.value)
const classes = computed(() => cn('varo-dialog__overlay', props.className))
const state = computed(() => open.value ? 'open' : 'closed')

function click(event: unknown) {
  emit('click', event)
  dialog.events.onOverlayClick()
}
</script>

<template>
  <view
    v-if="open"
    :class="classes"
    :aria-hidden="backdropAriaHidden"
    :data-state="state"
    @click="click"
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
