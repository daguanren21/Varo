export type AgentContextSourceStatus = 'available' | 'connecting' | 'unavailable'

export interface AgentContextSource {
  description?: string
  enabled: boolean
  id: string
  label: string
  meta?: string
  status?: AgentContextSourceStatus
}

export type AgentRetrievalStatus = 'queued' | 'reading' | 'read' | 'skipped' | 'failed'

export interface AgentRetrievalItem {
  detail?: string
  id: string
  retryable?: boolean
  sourceId?: string
  status: AgentRetrievalStatus
  title: string
}

export interface AgentSourceReceiptItem {
  detail?: string
  id: string
  itemCount?: number
  label: string
  status: 'read' | 'skipped' | 'failed'
}

export type AgentWorkspacePlacement = 'page' | 'docked' | 'sheet'
