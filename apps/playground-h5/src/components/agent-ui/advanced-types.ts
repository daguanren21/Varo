export type AgentAdvancedStatus = 'waiting' | 'running' | 'completed' | 'failed'

export interface AgentCodeLine {
  content: string
  number?: number
  highlighted?: boolean
}

export interface AgentCitationItem {
  description?: string
  domain?: string
  id: string
  title: string
  url?: string
}

export interface AgentActivityItem {
  detail?: string
  duration?: string
  id: string
  kind: 'reasoning' | 'search' | 'tool' | 'trace'
  status: AgentAdvancedStatus
  title: string
}

export interface AgentSidebarItem {
  badge?: string | number
  id: string
  label: string
  meta?: string
}

export interface AgentSidebarGroup {
  id: string
  items: AgentSidebarItem[]
  label: string
}

export interface AgentContextChunk {
  content: string
  id: string
  label?: string
  source?: string
  sourceType?: string
  url?: string
}

export interface AgentInsightItem {
  action?: string
  description: string
  id: string
  label?: string
  tone?: 'danger' | 'default' | 'success' | 'warning'
  value?: string
}

export interface AgentSelectionAction {
  id: string
  label: string
}

export interface AgentSearchItem {
  description?: string
  group?: string
  id: string
  label: string
  shortcut?: string
}

export interface AgentFlowNode {
  detail?: string
  id: string
  label: string
  status?: AgentAdvancedStatus
  type: 'action' | 'condition' | 'result' | 'trigger'
}

export interface AgentFineTuneControl {
  label: string
  max?: number
  min?: number
  step?: number
  type: 'number' | 'select' | 'text'
  value: number | string
  values?: Array<{ label: string; value: string }>
}

export interface AgentRadioChoice {
  description?: string
  disabled?: boolean
  label: string
  value: string
}

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
