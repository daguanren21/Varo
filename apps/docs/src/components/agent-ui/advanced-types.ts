import type { AgentPartStatus } from '@varo-ui/ai'

export type AgentCodeBlockStatus = 'complete' | 'streaming'
export type AgentImageGenerationStatus = 'completed' | 'failed' | 'generating' | 'queued'

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
  status: AgentPartStatus
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
  status?: AgentPartStatus
  type: 'action' | 'condition' | 'result' | 'trigger'
}

export interface AgentFineTuneControl {
  label: string
  max?: number
  min?: number
  step?: number
  type: 'number' | 'select' | 'text'
  value: number | string
  values?: Array<{ label: string, value: string }>
}

export interface AgentArtifactItem {
  content?: string
  id: string
  kind?: 'code' | 'document' | 'file' | 'image'
  language?: string
  previewUrl?: string
  title: string
  url?: string
}
export interface AgentAttachmentItem {
  id: string
  mimeType?: string
  name: string
  previewUrl?: string
  size?: string
}
export interface AgentSourceItem {
  description?: string
  domain?: string
  id: string
  title: string
  url: string
}

export interface AgentAlternative {
  description?: string
  label: string
  value: string
}
