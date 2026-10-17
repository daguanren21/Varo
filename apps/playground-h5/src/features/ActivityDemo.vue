<script setup lang="ts">
import type { AgentActivityAction, AgentActivityTask } from '../components/blocks/agent-activity-actions'
import { computed, shallowRef } from 'vue'
import { canRequestAgentActivityAction } from '../components/blocks/agent-activity-actions'
import AgentActivityBlock from '../components/blocks/agent-activity.vue'
import { VButton } from '../components/ui/button'

const items = shallowRef<AgentActivityTask[]>([])
const disabled = shallowRef(false)
const rejectNext = shallowRef(false)
const requests = shallowRef(0)
const accepted = shallowRef(0)
const last = shallowRef('none')
const draft = computed(() => items.value.find(item => item.id === 'draft'))
const startAllowed = computed(() => draft.value?.actions?.includes('start') === true)
const draftRunning = computed(() => draft.value?.status === 'running')
const locked = computed(() => items.value.find(item => item.id === 'locked')?.disabled === true)
const diagnostic = computed(() => `requests=${requests.value};accepted=${accepted.value};last=${last.value}`)

function reset() {
  items.value = [
    { id: 'draft', title: 'Draft report', kind: 'reasoning', status: 'queued', actions: ['start', 'cancel'], detail: 'Local scenario: start, request approval, retry or finish manually.' },
    { id: 'index', title: 'Index notes', kind: 'search', status: 'running', actions: ['cancel'] },
    { id: 'review', title: 'Review outline', kind: 'tool', status: 'waiting', actions: ['approve', 'cancel'], detail: 'Awaiting an application-owned decision.' },
    { id: 'export', title: 'Export summary', kind: 'tool', status: 'failed', actions: ['retry'], detail: 'Local failure example; no service was called.' },
    { id: 'cancelled', title: 'Cancelled run', kind: 'trace', status: 'cancelled', actions: ['start', 'approve', 'retry', 'cancel'] },
    { id: 'completed', title: 'Completed run', kind: 'trace', status: 'completed', actions: ['start', 'approve', 'retry', 'cancel'] },
    { id: 'restricted', title: 'Restricted task', kind: 'tool', status: 'queued', actions: [] },
    { id: 'locked', title: 'Locked task', kind: 'tool', status: 'queued', actions: ['start', 'cancel'], disabled: true },
  ]
  disabled.value = false
  rejectNext.value = false
  requests.value = 0
  accepted.value = 0
  last.value = 'none'
}

function request(action: AgentActivityAction, requested: AgentActivityTask) {
  requests.value += 1
  const item = items.value.find(candidate => candidate.id === requested.id)
  if (!item || !canRequestAgentActivityAction(item, action, disabled.value)) {
    last.value = `ineligible:${action}:${requested.id}`
    return
  }
  if (rejectNext.value) {
    rejectNext.value = false
    last.value = `rejected:${action}:${item.id}`
    return
  }
  const status = action === 'cancel' ? 'cancelled' : action === 'retry' ? 'queued' : 'running'
  const actions: AgentActivityAction[] = status === 'cancelled' ? [] : status === 'queued' ? ['start', 'cancel'] : ['cancel']
  items.value = items.value.map(candidate => candidate.id === item.id ? { ...candidate, status, actions } : candidate)
  accepted.value += 1
  last.value = `${action}:${item.id}`
}

function localOutcome(status: 'waiting' | 'failed' | 'completed') {
  if (disabled.value || !draftRunning.value) { return }
  const actions: AgentActivityAction[] = status === 'waiting' ? ['approve', 'cancel'] : status === 'failed' ? ['retry'] : []
  items.value = items.value.map(item => item.id === 'draft' ? { ...item, status, actions } : item)
  last.value = `local:${status}`
}

function toggleStart() {
  const actions: AgentActivityAction[] = startAllowed.value ? ['cancel'] : ['start', 'cancel']
  items.value = items.value.map(item => item.id === 'draft' ? { ...item, actions } : item)
}

function toggleLocked() {
  items.value = items.value.map(item => item.id === 'locked' ? { ...item, disabled: !item.disabled } : item)
}

reset()
</script>

<template>
  <section id="activity-demo" class="grid min-w-0 gap-4" aria-label="Activity task demo">
    <header>
      <h2 class="m-0 text-xl font-semibold">
        Activity and task decisions
      </h2>
      <p>Deterministic local data only. No service, model or executor is connected. This page owns every transition; the Block emits requests only.</p>
    </header>
    <div class="flex flex-wrap gap-2">
      <VButton variant="outline" @click="reset">
        Reset activity
      </VButton>
      <VButton variant="outline" @click="disabled = !disabled">
        {{ disabled ? 'Enable actions' : 'Disable actions' }}
      </VButton>
      <VButton variant="outline" @click="toggleStart">
        {{ startAllowed ? 'Restrict start' : 'Allow start' }}
      </VButton>
      <VButton variant="outline" @click="toggleLocked">
        {{ locked ? 'Unlock task' : 'Lock task' }}
      </VButton>
      <VButton variant="outline" @click="rejectNext = !rejectNext">
        {{ rejectNext ? 'Accept next request' : 'Reject next request' }}
      </VButton>
      <VButton variant="outline" @click="items = []">
        Clear activity
      </VButton>
    </div>
    <div class="flex flex-wrap gap-2" aria-label="Local scenario controls">
      <VButton variant="outline" :disabled="disabled || !draftRunning" @click="localOutcome('waiting')">
        Require local approval
      </VButton>
      <VButton variant="outline" :disabled="disabled || !draftRunning" @click="localOutcome('failed')">
        Mark local failure
      </VButton>
      <VButton variant="outline" :disabled="disabled || !draftRunning" @click="localOutcome('completed')">
        Mark local complete
      </VButton>
    </div>
    <output class="break-words text-xs" data-activity-demo="state" aria-live="polite">{{ diagnostic }}</output>
    <AgentActivityBlock :items="items" :disabled="disabled" title="Local task activity" @start="request('start', $event)" @approve="request('approve', $event)" @retry="request('retry', $event)" @cancel="request('cancel', $event)" />
  </section>
</template>
