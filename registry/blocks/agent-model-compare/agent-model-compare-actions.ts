import type { AgentModelOption } from '../agent-ui/agent-model-selector.types'
import type { AgentCompareSide, AgentCompareState } from './agent-model-compare.types'
import { availableModel } from '../agent-ui/agent-model-selector.types'
import { agentCurrentMessage, agentSnapshotProjection, agentSnapshotStatus } from '../agent-ui/presentation'

export function comparisonRunning(state: AgentCompareState | null | undefined): boolean {
  const status = state?.snapshot ? agentSnapshotStatus(state.snapshot) : 'idle'
  return Boolean(state?.busy || status === 'streaming' || status === 'waiting')
}

export function comparisonRetryable(state: AgentCompareState | null | undefined, models: AgentModelOption[]): boolean {
  const error = state?.snapshot ? agentSnapshotProjection(state.snapshot).error : undefined
  return Boolean(state && !comparisonRunning(state) && state.retryable && (state.error || error) && availableModel(models, state.modelId))
}

export function comparisonPanel(id: AgentCompareSide, state: AgentCompareState, other: AgentCompareState | undefined) {
  const message = state.snapshot ? agentCurrentMessage(state.snapshot) : undefined
  const running = comparisonRunning(state)
  const snapshotError = state.snapshot ? agentSnapshotProjection(state.snapshot).error : undefined
  const error = state.error || snapshotError
  const latency = state.metrics?.latencyMs
  const cost = state.metrics?.cost
  return {
    id,
    state,
    running,
    error,
    snapshotError,
    contextMessages: state.snapshot?.messages,
    otherModelId: other?.modelId,
    selectorLabel: `${state.label}模型`,
    stopLabel: `停止${state.label}`,
    retryLabel: `重试${state.label}`,
    statusLabel: running ? '处理中' : error ? '失败' : state.outcome === 'completed' ? '已完成' : state.outcome === 'cancelled' ? '已停止' : '就绪',
    hasMessage: Boolean(message),
    latencyLabel: latency != null && Number.isFinite(latency) && latency >= 0 ? `应用测量耗时：${latency} ms` : '耗时：未提供',
    costLabel: cost && Number.isFinite(cost.amount) && cost.amount >= 0 && cost.currency.trim() ? `应用提供费用：${cost.amount} ${cost.currency}` : '费用：未提供',
  }
}
