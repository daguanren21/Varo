export interface AgentDecisionOption {
  id: string
  label: string
  description?: string
  disabled?: boolean
  recommended?: boolean
}

export type AgentDecisionAnswer = { kind: 'option', optionId: string } | { kind: 'text', text: string }

export interface AgentDecisionIntent {
  decisionId: string
  answer: AgentDecisionAnswer
}

export interface AgentDecision {
  id: string
  title: string
  description?: string
  options: readonly AgentDecisionOption[]
  allowCustom?: boolean
  status: 'pending' | 'submitting' | 'answered' | 'error'
  error?: string
  answer?: AgentDecisionAnswer
}
