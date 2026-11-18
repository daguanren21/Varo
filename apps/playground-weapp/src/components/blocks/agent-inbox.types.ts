export interface AgentInboxTask {
  id: string
  title: string
  detail?: string
  status: 'queued' | 'running' | 'needs-input' | 'failed' | 'completed' | 'cancelled'
  retryable?: boolean
  disabled?: boolean
}
