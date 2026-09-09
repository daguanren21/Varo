<script setup lang="ts">
import type { AgentThreadVersion } from '@varo-ui/ai'
import type { AgentContextSource, AgentWorkspacePlacement } from '../agent-ui/advanced-types'
import { shallowRef } from 'vue'
import { useRagDemo } from '../../features/useRagDemo'
import { AgentRagPipeline } from '../agent-ui'
import AgentWorkspace from '../blocks/agent-workspace.vue'

const prompt = shallowRef('')
const placement = shallowRef<AgentWorkspacePlacement>('docked')
const open = shallowRef(true)
const activity = shallowRef('Demo data · Run, cancel, replay, and follow each citation back to its source.')
const sources = shallowRef<AgentContextSource[]>([
  { id: 'support', label: 'Support queue', description: '14 signup tickets', enabled: true, status: 'available' },
  { id: 'replay', label: 'Session replay', description: '18 failed signup sessions', enabled: true, status: 'available' },
  { id: 'drive', label: 'Product docs', description: 'Reconnect required', enabled: false, status: 'unavailable' },
])
const { snapshot: rag, busy: ragBusy, run: runRag, cancel: cancelRag } = useRagDemo(() => sources.value, 'en')
const versions: AgentThreadVersion[] = [
  { id: 'root', label: 'Initial analysis', summary: 'Signup failure root cause', createdAt: '09:32', pinned: true },
  { id: 'copy', parentId: 'root', label: 'Conservative copy', summary: 'Retry copy only', createdAt: '09:38' },
  { id: 'flow', parentId: 'root', label: 'Flow fix', summary: 'Signature and idempotency', createdAt: '09:41' },
]

function toggleSource(source: AgentContextSource, enabled: boolean) {
  sources.value = sources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
  activity.value = `${source.label} ${enabled ? 'added to' : 'removed from'} context.`
}

function setPlacement(next: AgentWorkspacePlacement) {
  placement.value = next
  open.value = true
}

async function submit(value: string) {
  activity.value = `Demo query: ${value}`
  prompt.value = ''
  await runRag(value)
}

function closeWorkspace() {
  cancelRag()
  open.value = false
}
</script>

<template>
  <section id="agent-workspace" class="agent-workspace-demo">
    <header class="agent-workspace-demo__header">
      <div>
        <p class="agent-workspace-demo__kicker">
          Grounded Agent Workspace
        </p>
        <h2>Context, execution, and evidence stay visible</h2>
      </div>
      <div class="agent-workspace-demo__placements" role="group" aria-label="Workspace placement">
        <button type="button" :aria-pressed="placement === 'page'" :data-active="String(placement === 'page')" @click="setPlacement('page')">
          Page
        </button>
        <button type="button" :aria-pressed="placement === 'docked'" :data-active="String(placement === 'docked')" @click="setPlacement('docked')">
          Docked
        </button>
        <button type="button" :aria-pressed="placement === 'sheet'" :data-active="String(placement === 'sheet')" @click="setPlacement('sheet')">
          Sheet
        </button>
      </div>
    </header>
    <p class="agent-workspace-demo__activity">
      {{ activity }}
    </p>
    <AgentWorkspace
      v-model:prompt="prompt"
      active-version-id="flow"
      :busy="ragBusy"
      :context-usage="64"
      :open="open"
      :placement="placement"
      :sources="sources"
      :versions="versions"
      subtitle="Demo data: approved sources become context, then a streamed answer with linked citations."
      title="Signup failure analysis"
      @branch-version="activity = `Branch from ${$event.label || $event.id}`"
      @close="closeWorkspace"
      @connect-source="activity = `Connect source: ${$event.label}`"
      @pin-version="activity = `Pinned: ${$event.label || $event.id}`"
      @select-version="activity = `Selected: ${$event.label || $event.id}`"
      @submit="submit"
      @toggle-source="toggleSource"
    >
      <template #execution>
        <AgentRagPipeline
          class-name="mx-auto w-full max-w-[640px]"
          :answer="rag.answer"
          :elapsed-ms="rag.elapsedMs"
          :query="rag.query"
          :sources="rag.sources"
          :steps="rag.steps"
          @cancel="cancelRag"
          @run="runRag()"
          @select-source="activity = `Selected source: ${$event.title}`"
        />
      </template>
    </AgentWorkspace>
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
  padding: 10px 12px;
  margin: 0;
  font-size: 12px;
  color: var(--varo-agent-text);
  background: var(--varo-agent-fill);
  border-radius: 12px;
}

@media (max-width: 720px) {
  .agent-workspace-demo__header {
    flex-direction: column;
    align-items: stretch;
  }

  .agent-workspace-demo__placements {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
