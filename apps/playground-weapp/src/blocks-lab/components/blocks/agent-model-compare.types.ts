import type { ChatClientSnapshot } from '@tanstack/ai-client'
import type { AgentConversationEntry } from '../../../components/agent-ui/types'

export type AgentCompareSide = 'left' | 'right'

export interface AgentCompareApprovalIntent {
  side: AgentCompareSide
  interruptId: string
}

export interface AgentCompareMetrics {
  /** Application-measured elapsed time, not estimated model latency. */
  latencyMs?: number
  /** Application-supplied amount and unit; omission never implies free service. */
  cost?: { amount: number, currency: string }
}

export interface AgentCompareState {
  label: string
  modelId: string
  messages: readonly AgentConversationEntry[]
  snapshot?: ChatClientSnapshot
  busy: boolean
  error?: string
  retryable?: boolean
  /** Application-confirmed result; SDK ready alone does not establish completion or cancellation. */
  outcome?: 'completed' | 'cancelled'
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
