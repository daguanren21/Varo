export type AgentSourceChatResponseState = 'idle' | 'retrieving' | 'answered' | 'empty' | 'out-of-scope' | 'failed'

/** Application-supplied escalation context, never a created ticket or execution result. */
export interface AgentSourceChatTicketIntent {
  question: string
  reason: Extract<AgentSourceChatResponseState, 'empty' | 'out-of-scope' | 'failed'>
  sourceIds: string[]
}
