<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { useDialogContext } from './dialog-context'

const props = withDefaults(
  defineProps<{
    as?: string
    className?: ClassValue
  }>(),
  {
    as: 'button',
  },
)

const emit = defineEmits<{
  click: [event: unknown]
}>()

const dialog = useDialogContext()
const classes = computed(() => cn('varo-dialog__close', props.className))
const renderAsButton = computed(() => props.as === 'button')
const renderAsText = computed(() => props.as === 'span' || props.as === 'text')
const disabled = computed(() => dialog.state.disabled.value)
const state = computed(() => dialog.state.open.value ? 'open' : 'closed')

function close(event: unknown) {
  if (disabled.value) {
    return
  }
  emit('click', event)
  dialog.events.close()
}
</script>

<template>
  <button
    v-if="renderAsButton"
    :class="classes"
    data-part="close"
    :data-state="state"
    :disabled="disabled"
    @click="close"
  >
    <slot />
  </button>
  <text
    v-else-if="renderAsText"
    :class="classes"
    data-part="close"
    :data-state="state"
    @click="close"
  >
    <slot />
  </text>
  <view
    v-else
    :class="classes"
    data-part="close"
    :data-state="state"
    @click="close"
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
