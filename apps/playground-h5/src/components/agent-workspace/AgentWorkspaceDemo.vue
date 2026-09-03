<script setup lang="ts">
import type { AgentThreadVersion } from '@varo-ui/ai'
import type {
  AgentContextSource,
  AgentRetrievalItem,
  AgentSourceReceiptItem,
  AgentWorkspacePlacement,
} from '../agent-ui/advanced-types'
import type { AgentConversationMessage, AgentTask } from '../agent-ui'
import { shallowRef } from 'vue'
import AgentWorkspace from '../blocks/agent-workspace.vue'

const prompt = shallowRef('')
const placement = shallowRef<AgentWorkspacePlacement>('docked')
const open = shallowRef(true)
const activity = shallowRef('Scope confirmed. The agent can start safely.')
const sources = shallowRef<AgentContextSource[]>([
  { id: 'support', label: 'Support queue', description: '14 signup tickets', enabled: true, status: 'available' },
  { id: 'replay', label: 'Session replay', description: '18 failed signup sessions', enabled: true, status: 'available' },
  { id: 'drive', label: 'Product docs', description: 'Reconnect required', enabled: false, status: 'unavailable' },
])
const retrieval: AgentRetrievalItem[] = [
  { id: 'search', title: 'Search signup tickets', detail: '14 matching records', sourceId: 'support', status: 'read' },
  { id: 'replay', title: 'Read session replays', detail: 'Inspecting the exit step', sourceId: 'replay', status: 'reading' },
  { id: 'docs', title: 'Check product docs', detail: 'Source disconnected', retryable: true, sourceId: 'drive', status: 'failed' },
]
const receipts: AgentSourceReceiptItem[] = [
  { id: 'support', label: 'Support queue', detail: '14 tickets', itemCount: 14, status: 'read' },
  { id: 'replay', label: 'Session replay', detail: '18 sessions', itemCount: 18, status: 'read' },
  { id: 'drive', label: 'Product docs', detail: 'Not connected', status: 'skipped' },
]
const tasks: AgentTask[] = [
  { id: 'scope', title: 'Confirm source scope', meta: 'Done', progress: 100, status: 'completed' },
  { id: 'compare', title: 'Compare failure paths', description: 'Cross-check tickets and replay', meta: 'Running', progress: 64, status: 'running' },
  { id: 'patch', title: 'Generate the fix', meta: 'Approval required', requiresApproval: true, status: 'waiting' },
]
const versions: AgentThreadVersion[] = [
  { id: 'root', label: 'Initial analysis', summary: 'Signup failure root cause', createdAt: '09:32', pinned: true },
  { id: 'copy', parentId: 'root', label: 'Conservative copy', summary: 'Retry copy only', createdAt: '09:38' },
  { id: 'flow', parentId: 'root', label: 'Flow fix', summary: 'Signature and idempotency', createdAt: '09:41' },
]
const messages: AgentConversationMessage[] = [
  { id: 'user-1', role: 'user', content: 'Analyze the signup failures and propose an executable fix.', timestamp: '09:31' },
  { id: 'assistant-1', role: 'assistant', content: 'I will confirm readable sources first, then expose retrieval, execution, and receipts.', timestamp: '09:32' },
]

function toggleSource(source: AgentContextSource, enabled: boolean) {
  sources.value = sources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
  activity.value = `${source.label} ${enabled ? 'added to' : 'removed from'} context.`
}

function setPlacement(next: AgentWorkspacePlacement) {
  placement.value = next
  open.value = true
}

function submit(value: string) {
  activity.value = `Submitted: ${value}`
  prompt.value = ''
}
</script>

<template>
  <section id="agent-workspace" class="agent-workspace-demo">
    <header class="agent-workspace-demo__header">
      <div>
        <p class="agent-workspace-demo__kicker">Grounded Agent Workspace</p>
        <h2>Context, execution, and evidence stay visible</h2>
      </div>
      <div class="agent-workspace-demo__placements" role="group" aria-label="Workspace placement">
        <button type="button" :aria-pressed="placement === 'page'" :data-active="String(placement === 'page')" @click="setPlacement('page')">Page</button>
        <button type="button" :aria-pressed="placement === 'docked'" :data-active="String(placement === 'docked')" @click="setPlacement('docked')">Docked</button>
        <button type="button" :aria-pressed="placement === 'sheet'" :data-active="String(placement === 'sheet')" @click="setPlacement('sheet')">Sheet</button>
      </div>
    </header>
    <p class="agent-workspace-demo__activity">{{ activity }}</p>
    <AgentWorkspace
      v-model:prompt="prompt"
      active-version-id="flow"
      :context-usage="64"
      :messages="messages"
      :open="open"
      :placement="placement"
      :receipts="receipts"
      :retrieval="retrieval"
      :sources="sources"
      :tasks="tasks"
      :versions="versions"
      subtitle="Only approved sources are read; every step can be inspected, retried, or branched."
      title="Signup failure analysis"
      @approve-task="activity = `Approved: ${$event.title}`"
      @branch-version="activity = `Branch from ${$event.label || $event.id}`"
      @cancel-task="activity = 'Cancelled the active task.'"
      @close="open = false"
      @connect-receipt="activity = `Connect source: ${$event.label}`"
      @connect-source="activity = `Connect source: ${$event.label}`"
      @open-receipt="activity = `Open receipt: ${$event.label}`"
      @pin-version="activity = `Pinned: ${$event.label || $event.id}`"
      @retry-retrieval="activity = `Retry retrieval: ${$event.title}`"
      @retry-task="activity = `Retry task: ${$event.title}`"
      @select-version="activity = `Selected: ${$event.label || $event.id}`"
      @submit="submit"
      @toggle-source="toggleSource"
    />
  </section>
</template>

<style scoped>
.agent-workspace-demo {
  display: grid;
  gap: 14px;
  padding-top: 24px;
}

.agent-workspace-demo__header {
  display: flex;
  gap: 16px;
  align-items: end;
  justify-content: space-between;
}

.agent-workspace-demo__header h2,
.agent-workspace-demo__header p {
  margin: 0;
}

.agent-workspace-demo__kicker {
  margin-bottom: 6px !important;
  font-size: 12px;
  font-weight: 800;
  color: var(--varo-agent-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.agent-workspace-demo__placements {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--varo-agent-fill);
  border-radius: 12px;
}

.agent-workspace-demo__placements button {
  min-height: 36px;
  padding: 0 12px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--varo-agent-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 8px;
}

.agent-workspace-demo__placements button[data-active='true'] {
  color: var(--varo-agent-primary);
  background: var(--varo-agent-surface);
  box-shadow: 0 1px 3px rgb(15 23 42 / 10%);
}

.agent-workspace-demo__activity {
  margin: 0;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--varo-agent-text);
  background: var(--varo-agent-fill);
  border-radius: 12px;
}

@media (max-width: 720px) {
  .agent-workspace-demo__header {
    align-items: stretch;
    flex-direction: column;
  }

  .agent-workspace-demo__placements {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
