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

const rootClass = computed(() => cn('agent-selection-actions', props.className))

function selectAction(id: string) {
  const action = props.actions.find(entry => entry.id === id)
  if (action) {
    emit('select', { action, text: props.text })
  }
}
</script>

<template>
  <view :class="rootClass">
    <text class="agent-selection-actions__quote">
      {{ text }}
    </text>
    <view class="agent-selection-actions__toolbar">
      <button
        v-for="action in actions"
        :key="action.id"
        class="agent-native-button agent-selection-actions__action"
        type="button"
        @click="selectAction(action.id)"
      >
        {{ action.label }}
      </button>
    </view>
  </view>
</template>

<style>
.agent-selection-actions {
  overflow: hidden;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-selection-actions__quote {
  display: block;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--varo-agent-text, #475569);
  background: var(--varo-agent-surface-strong, #f8fafc);
  border-left: 3px solid var(--varo-agent-primary, #0f766e);
}

.agent-selection-actions__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 10px 12px 12px;
}

.agent-selection-actions__action {
  min-height: 32px;
  padding: 0 11px;
  font-size: 11px;
  font-weight: 750;
  color: var(--varo-agent-text, #475569);
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 999px;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
