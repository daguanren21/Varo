<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentSelectionAction } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    actions?: AgentSelectionAction[]
    className?: ClassValue
    text: string
  }>(),
  {
    actions: () => [],
  },
)

const emit = defineEmits<{
  select: [payload: { action: AgentSelectionAction, text: string }]
}>()

const rootClass = computed(() =>
  cn('agent-selection-actions overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm', props.className),
)
</script>

<template>
  <view :class="rootClass">
    <view class="border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-3.5 py-3">
      <text class="block border-l-[3px] border-[var(--varo-agent-primary)] pl-3 text-[12px] leading-5 text-[var(--varo-agent-text)]">
        {{ text }}
      </text>
    </view>
    <view class="flex flex-wrap gap-2 p-2.5">
      <button v-for="action in actions" :key="action.id" class="min-h-8 rounded-lg border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-3 text-[11px] font-bold text-[var(--varo-agent-text)]" hover-class="border-[var(--varo-agent-primary)] text-[var(--varo-agent-primary)]" :hover-start-time="20" :hover-stay-time="70" type="button" @click="emit('select', { action, text })">
        {{ action.label }}
      </button>
    </view>
  </view>
</template>

<style scoped>
.agent-selection-actions button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
