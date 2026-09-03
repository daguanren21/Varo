export type AgentRunStatus = 'idle' | 'running' | 'waiting' | 'completed' | 'failed'

export interface AgentTraceStep {
  content?: string
  detail?: string
  duration?: string
  durationMs?: number
  id: string
  status: AgentRunStatus
  title: string
}

export interface AgentToolCall {
  id: string
  name: string
  status: AgentRunStatus
  summary?: string
}

export interface AgentTask {
  description?: string
  id: string
  meta?: string
  progress?: number
  requiresApproval?: boolean
  retryable?: boolean
  status: AgentRunStatus
  title: string
}

export interface AgentChoice {
  description?: string
  disabled?: boolean
  label: string
  value: string
}

export interface AgentAlternative {
  description?: string
  label: string
  value: string
}
