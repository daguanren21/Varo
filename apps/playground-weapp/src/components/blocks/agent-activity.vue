<script setup lang="ts">
import type { AgentActivityAction, AgentActivityTask } from './agent-activity-actions'
import { computed } from 'wevu'
import AgentActivity from '../agent-ui/AgentActivity.vue'
import VButton from '../ui/v-button.vue'
import { agentActivityActionLabels, agentActivityActions, canRequestAgentActivityAction } from './agent-activity-actions'

defineOptions({
  properties: {
    items: { type: Array, value: [] },
  },
})

const props = withDefaults(defineProps<{
  items: AgentActivityTask[]
  disabled?: boolean
  title?: string
  emptyText?: string
}>(), {
  items: () => [],
  disabled: false,
  title: 'Task activity',
  emptyText: 'No activity yet',
})

const emit = defineEmits<{
  start: [item: AgentActivityTask]
  approve: [item: AgentActivityTask]
  retry: [item: AgentActivityTask]
  cancel: [item: AgentActivityTask]
}>()

const rows = computed(() => props.items.map(item => ({
  id: item.id,
  title: item.title,
  actions: agentActivityActions[item.status].map(action => ({
    action,
    label: agentActivityActionLabels[action],
    ariaLabel: `${agentActivityActionLabels[action]} ${item.title}`,
    disabled: !canRequestAgentActivityAction(item, action, props.disabled),
  })),
})))

function request(id: string, action: AgentActivityAction) {
  const item = props.items.find(candidate => candidate.id === id)
  if (!item || !canRequestAgentActivityAction(item, action, props.disabled)) { return }
  switch (action) {
    case 'start': emit('start', item); break
    case 'approve': emit('approve', item); break
    case 'retry': emit('retry', item); break
    case 'cancel': emit('cancel', item); break
  }
}
</script>

<template>
  <view class="grid min-w-0 gap-3" :aria-label="title">
    <AgentActivity :items="items" :title="title" />
    <text v-if="!items.length" class="text-sm text-[var(--varo-agent-muted)]" role="status">
      {{ emptyText }}
    </text>
    <view v-else class="grid gap-3" aria-label="Task actions">
      <view v-for="row in rows" :key="row.id" class="flex min-w-0 flex-wrap items-center justify-between gap-2" :data-activity-task="row.id">
        <text class="min-w-0 break-words text-sm font-medium">
          {{ row.title }}
        </text>
        <view v-if="row.actions.length" class="flex flex-wrap gap-2">
          <VButton v-for="action in row.actions" :key="action.action" variant="outline" :aria-label="action.ariaLabel" :disabled="action.disabled" @click="request(row.id, action.action)">
            {{ action.label }}
          </VButton>
        </view>
        <text v-else class="text-xs text-[var(--varo-agent-muted)]">
          No actions available
        </text>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
