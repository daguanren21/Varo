<script setup lang="ts">
import type { AgentActivityAction, AgentActivityTask } from './agent-activity-actions'
import { computed } from 'vue'
import { AgentActivity } from '../agent-ui/advanced'
import { VButton } from '../ui/button'
import { agentActivityActionLabels, agentActivityActions, canRequestAgentActivityAction } from './agent-activity-actions'

const props = withDefaults(defineProps<{
  items: AgentActivityTask[]
  disabled?: boolean
  title?: string
  emptyText?: string
}>(), {
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
  <section class="grid min-w-0 gap-3" :aria-label="title">
    <AgentActivity :items="items" :title="title" />
    <p v-if="!items.length" class="m-0 text-sm text-[var(--varo-agent-muted)]" role="status">
      {{ emptyText }}
    </p>
    <ul v-else class="m-0 grid list-none gap-3 p-0" aria-label="Task actions">
      <li v-for="row in rows" :key="row.id" class="flex min-w-0 flex-wrap items-center justify-between gap-2" :data-activity-task="row.id">
        <span class="min-w-0 break-words text-sm font-medium">{{ row.title }}</span>
        <div v-if="row.actions.length" class="flex flex-wrap gap-2">
          <VButton v-for="action in row.actions" :key="action.action" variant="outline" :aria-label="action.ariaLabel" :disabled="action.disabled" @click="request(row.id, action.action)">
            {{ action.label }}
          </VButton>
        </div>
        <span v-else class="text-xs text-[var(--varo-agent-muted)]">No actions available</span>
      </li>
    </ul>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-agent.css';
@import '../agent-ui/agent-advanced.css';
@import '../agent-ui/agent-artifact.css';
@import '../../styles/varo-button.css';
</style>
