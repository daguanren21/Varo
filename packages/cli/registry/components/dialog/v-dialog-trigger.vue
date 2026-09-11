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
const classes = computed(() => cn('varo-dialog__trigger', props.className))
const expanded = computed(() => dialog.state.open.value)
const disabled = computed(() => dialog.state.disabled.value)
const ariaDisabled = computed(() => disabled.value || undefined)
const dataDisabled = computed(() => String(disabled.value))
const state = computed(() => expanded.value ? 'open' : 'closed')
const renderAsButton = computed(() => props.as === 'button')
const renderAsText = computed(() => props.as === 'span' || props.as === 'text')

function toggle(event: unknown) {
  if (disabled.value) {
    return
  }
  emit('click', event)
  dialog.events.toggle()
}
</script>

<template>
  <button
    v-if="renderAsButton"
    :class="classes"
    aria-haspopup="dialog"
    :aria-expanded="expanded"
    :aria-disabled="ariaDisabled"
    :data-disabled="dataDisabled"
    :data-state="state"
    :disabled="disabled"
    @click="toggle"
  >
    <slot />
  </button>
  <text
    v-else-if="renderAsText"
    :class="classes"
    aria-haspopup="dialog"
    :aria-expanded="expanded"
    :aria-disabled="ariaDisabled"
    :data-disabled="dataDisabled"
    :data-state="state"
    @click="toggle"
  >
    <slot />
  </text>
  <view
    v-else
    :class="classes"
    aria-haspopup="dialog"
    :aria-expanded="expanded"
    :aria-disabled="ariaDisabled"
    :data-disabled="dataDisabled"
    :data-state="state"
    @click="toggle"
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
