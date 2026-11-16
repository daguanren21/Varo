export type AgentMessageRole = 'assistant' | 'system' | 'user'
export type AgentPartStatus = 'waiting' | 'running' | 'completed' | 'failed'
export type AgentStreamStatus = 'idle' | 'streaming' | 'waiting' | 'completed' | 'failed' | 'cancelled'

export interface AgentChoice {
  description?: string
  disabled?: boolean
  label: string
  value: string
}

export interface AgentToolPart {
  error?: string
  id: string
  input?: unknown
  name: string
  output?: unknown
  status: AgentPartStatus
  summary?: string
}

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
