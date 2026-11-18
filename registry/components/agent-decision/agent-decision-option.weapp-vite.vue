<script setup lang="ts">
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'

const props = defineProps<{
  decisionId: string
  optionId: string
  label: string
  description: string
  statusText: string
  accessibleLabel: string
  selected: boolean
  disabled: boolean
}>()
const emit = defineEmits<{ select: [selection: { decisionId: string, optionId: string }] }>()
// Capture the identity of this keyed native option, not its current list index.
const decisionId = props.decisionId
const optionId = props.optionId
const color = computed(() => props.selected ? 'var(--varo-agent-primary)' : '')
function select() {
  if (!props.disabled) { emit('select', { decisionId, optionId }) }
}
</script>

<template>
  <VButton class-name="agent-decision__option" block size="lg" variant="outline" :aria-label="accessibleLabel" :aria-pressed="selected" :color="color" :disabled="disabled" @click="select">
    <view class="grid w-full min-w-0 gap-1 py-2 text-left">
      <text class="whitespace-pre-wrap break-words text-sm font-semibold leading-5">
        {{ label }}
      </text>
      <text v-if="description" class="whitespace-pre-wrap break-words text-xs font-normal leading-4 text-[var(--varo-agent-text)]">
        {{ description }}
      </text>
      <text v-if="statusText" class="text-xs leading-4">
        {{ statusText }}
      </text>
    </view>
  </VButton>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
