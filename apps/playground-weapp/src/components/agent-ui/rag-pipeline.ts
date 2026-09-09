import type { ClassValue } from '../../lib/cn'
import type { AgentAdvancedStatus } from './advanced-types'

export type AgentRagStageId = 'query' | 'embed' | 'retrieve' | 'assemble' | 'generate'
export type AgentRagSourceTone = 'blue' | 'violet' | 'rose'

export interface AgentRagStep {
  id: AgentRagStageId
  status: AgentAdvancedStatus
  detail?: string
  durationMs?: number
}

export interface AgentRagSource {
  id: string
  title: string
  excerpt?: string
  score?: number
  tokens?: number
  tone?: AgentRagSourceTone
}

export type AgentRagAnswerPart
  = | { id: string, type: 'text', text: string }
    | { id: string, type: 'citation', sourceId: string }

export interface AgentRagPipelineProps {
  className?: ClassValue
  title?: string
  query?: string
  steps?: readonly AgentRagStep[]
  sources?: readonly AgentRagSource[]
  answer?: readonly AgentRagAnswerPart[]
  elapsedMs?: number
  reducedMotion?: boolean
}

export const agentRagStages = [
  { id: 'query', label: '理解问题', description: '确认本次查询与来源范围' },
  { id: 'embed', label: '向量编码', description: '将问题转换为检索表示' },
  { id: 'retrieve', label: '检索来源', description: '查找与问题相关的片段' },
  { id: 'assemble', label: '组装上下文', description: '将来源片段组织为上下文' },
  { id: 'generate', label: '引用回答', description: '生成可追溯到来源的回答' },
] as const

const statusLabels: Record<AgentAdvancedStatus, string> = {
  waiting: '等待',
  running: '处理中',
  completed: '已完成',
  failed: '失败',
}

export function resolveRagSteps(steps: readonly AgentRagStep[]) {
  const byId = new Map<AgentRagStageId, AgentRagStep>()
  for (const step of steps) {
    if (byId.has(step.id)) { throw new Error(`Duplicate RAG stage: ${step.id}`) }
    byId.set(step.id, step)
  }
  return agentRagStages.map((definition) => {
    const step = byId.get(definition.id)
    const status = step?.status ?? 'waiting'
    return {
      ...definition,
      status,
      detail: step?.detail ?? definition.description,
      statusLabel: statusLabels[status],
      durationLabel: step?.durationMs === undefined ? '' : `${Math.round(step.durationMs)} ms`,
    }
  })
}

const sourceTones = ['blue', 'violet', 'rose'] as const

export function getRagSourceTone(source: AgentRagSource): AgentRagSourceTone {
  if (source.tone) { return source.tone }
  let hash = 0
  for (let index = 0; index < source.id.length; index += 1) {
    hash = (Math.imul(hash, 31) + source.id.charCodeAt(index)) | 0
  }
  return sourceTones[(hash >>> 0) % 3]!
}
