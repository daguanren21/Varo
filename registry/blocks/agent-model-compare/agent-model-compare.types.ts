import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentConversationMessage } from '../agent-ui/types'

export type AgentCompareSide = 'left' | 'right'

export interface AgentCompareMetrics {
  /** Application-measured elapsed time, not estimated model latency. */
  latencyMs?: number
  /** Application-supplied amount and unit; omission never implies free service. */
  cost?: { amount: number, currency: string }
}

export interface AgentCompareState {
  label: string
  modelId: string
  messages: AgentConversationMessage[]
  snapshot?: AgentStreamSnapshot
  busy: boolean
  error?: string
  retryable?: boolean
  metrics?: AgentCompareMetrics
}

export interface AgentCompareModelIntent {
  side: AgentCompareSide
  modelId: string
}

export interface AgentCompareRunIntent {
  prompt: string
  leftModelId: string
  rightModelId: string
}
