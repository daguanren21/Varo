import type { AgentPartStatus, AgentStreamStatus } from '@varo-ui/ai'
import type { AgentTraceStep } from './types'

export const agentPartStatusLabels: Readonly<Record<AgentPartStatus, string>> = {
  waiting: '等待中',
  running: '进行中',
  completed: '已完成',
  failed: '失败',
}

export function agentStreamIsFinal(status: AgentStreamStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled'
}

export function agentStreamNotice(status: AgentStreamStatus): string {
  if (status === 'waiting') { return '等待确认' }
  if (status === 'cancelled') { return '已取消' }
  return ''
}

export function agentTraceDetail(step: AgentTraceStep): string {
  return step.detail ?? step.content ?? ''
}

export function agentTraceDuration(step: AgentTraceStep): string {
  if (step.duration) { return step.duration }
  return step.durationMs === undefined ? '' : `${(step.durationMs / 1000).toFixed(1)}s`
}
