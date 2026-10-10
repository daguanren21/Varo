import type { AgentModelOption } from '../agent-ui/agent-model-selector.types'
import type { AgentCompareSide, AgentCompareState } from './agent-model-compare.types'
import { availableModel } from '../agent-ui/agent-model-selector.types'

export function comparisonRunning(state: AgentCompareState | null | undefined): boolean {
  return Boolean(state?.busy || state?.snapshot?.status === 'streaming' || state?.snapshot?.status === 'waiting')
}

export function comparisonRetryable(state: AgentCompareState | null | undefined, models: AgentModelOption[]): boolean {
  return Boolean(state && !comparisonRunning(state) && state.retryable && (state.error || state.snapshot?.status === 'failed') && availableModel(models, state.modelId))
}

export function comparisonPanel(id: AgentCompareSide, state: AgentCompareState, other: AgentCompareState | undefined) {
  const status = state.snapshot?.status ?? 'idle'
  const running = comparisonRunning(state)
  const error = state.error || (status === 'failed' ? state.snapshot?.error?.message : '')
  const latency = state.metrics?.latencyMs
  const cost = state.metrics?.cost
  return {
    id,
    state,
    running,
    error,
    otherModelId: other?.modelId,
    selectorLabel: `${state.label}模型`,
    stopLabel: `停止${state.label}`,
    retryLabel: `重试${state.label}`,
    statusLabel: running ? '处理中' : error ? '失败' : status === 'completed' ? '已完成' : status === 'cancelled' ? '已停止' : '就绪',
    content: state.snapshot?.message?.visible ?? '',
    latencyLabel: latency != null && Number.isFinite(latency) && latency >= 0 ? `应用测量耗时：${latency} ms` : '耗时：未提供',
    costLabel: cost && Number.isFinite(cost.amount) && cost.amount >= 0 && cost.currency.trim() ? `应用提供费用：${cost.amount} ${cost.currency}` : '费用：未提供',
  }
}
