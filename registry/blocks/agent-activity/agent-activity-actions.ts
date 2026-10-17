import type { AgentActivityItem, AgentActivityStatus } from '../agent-ui/advanced-types'

export type AgentActivityAction = 'start' | 'approve' | 'retry' | 'cancel'

/** Application-owned presentation data, not an execution or transport protocol. */
export interface AgentActivityTask extends AgentActivityItem {
  /** Explicit grants. Omitted or empty means no action is eligible. */
  actions?: readonly AgentActivityAction[]
  disabled?: boolean
}

export const agentActivityActions: Readonly<Record<AgentActivityStatus, readonly AgentActivityAction[]>> = {
  queued: ['start', 'cancel'],
  running: ['cancel'],
  waiting: ['approve', 'cancel'],
  failed: ['retry'],
  cancelled: [],
  completed: [],
}

export const agentActivityActionLabels: Readonly<Record<AgentActivityAction, string>> = {
  start: 'Start',
  approve: 'Approve',
  retry: 'Retry',
  cancel: 'Cancel',
}

/** Evaluate the current prop item again at activation, not the rendered row snapshot. */
export function canRequestAgentActivityAction(
  item: AgentActivityTask,
  action: AgentActivityAction,
  disabled = false,
): boolean {
  return !disabled && !item.disabled
    && agentActivityActions[item.status].includes(action)
    && item.actions?.includes(action) === true
}
