import type { AgentActivityAction, AgentActivityTask } from '../../components/blocks/agent-activity-actions'
import { computed, shallowRef } from 'wevu'
import { canRequestAgentActivityAction } from '../../components/blocks/agent-activity-actions'

export function useActivityDemo() {
  const items = shallowRef<AgentActivityTask[]>([])
  const disabled = shallowRef(false)
  const rejectNext = shallowRef(false)
  const requests = shallowRef(0)
  const accepted = shallowRef(0)
  const last = shallowRef('none')
  const draft = computed(() => items.value.find(item => item.id === 'draft'))
  const startAllowed = computed(() => draft.value?.actions?.includes('start') === true)
  const outcomeDisabled = computed(() => disabled.value || draft.value?.status !== 'running')
  const locked = computed(() => items.value.find(item => item.id === 'locked')?.disabled === true)
  const disabledLabel = computed(() => disabled.value ? 'Enable actions' : 'Disable actions')
  const startLabel = computed(() => startAllowed.value ? 'Restrict start' : 'Allow start')
  const lockedLabel = computed(() => locked.value ? 'Unlock task' : 'Lock task')
  const rejectLabel = computed(() => rejectNext.value ? 'Accept next request' : 'Reject next request')
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
    if (outcomeDisabled.value) { return }
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
  return { diagnostic, disabled, disabledLabel, items, localOutcome, lockedLabel, outcomeDisabled, rejectLabel, rejectNext, request, reset, startLabel, toggleLocked, toggleStart }
}
