import type { AgentApprovalPart, AgentMessageRole, AgentPartStatus } from '@varo-ui/ai'

export type AgentChoice = NonNullable<AgentApprovalPart['choices']>[number]

export interface AgentTraceStep {
  content?: string
  detail?: string
  duration?: string
  durationMs?: number
  id: string
  status: AgentPartStatus
  title: string
}

export interface AgentTask {
  description?: string
  id: string
  meta?: string
  progress?: number
  requiresApproval?: boolean
  retryable?: boolean
  status: AgentPartStatus
  title: string
}

export interface AgentConversationMessage {
  content: string
  id: string
  label?: string
  role: AgentMessageRole
  timestamp?: string
}
