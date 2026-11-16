import type { ChatClientSnapshot, UIMessage } from '@tanstack/ai-client'
import type { ChatUIInterrupt } from '@tanstack/ai-client/ui'
import type { AgentConversationMessage, AgentPartStatus, AgentStreamStatus, AgentToolPart, AgentTraceStep, AgentChoice } from '../agent-ui/types'

export const agentPartStatusLabels: Readonly<Record<AgentPartStatus, string>> = {
  waiting: '等待中',
  running: '进行中',
  completed: '已完成',
  failed: '失败',
}

export function agentStreamIsFinal(status: AgentStreamStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled'
}

export function agentStreamNotice(status: AgentStreamStatus): string {
  if (status === 'waiting') { return '等待确认' }
  if (status === 'cancelled') { return '已取消' }
  return ''
}

export function agentTraceDetail(step: AgentTraceStep): string {
  return step.detail ?? step.content ?? ''
}

export function agentTraceDuration(step: AgentTraceStep): string {
  if (step.duration) { return step.duration }
  return step.durationMs === undefined ? '' : `${(step.durationMs / 1000).toFixed(1)}s`
}

type AgentMessagePart = UIMessage['parts'][number]
type AgentToolCallPart = Extract<AgentMessagePart, { type: 'tool-call' }>
type AgentToolResultPart = Extract<AgentMessagePart, { type: 'tool-result' }>

export interface AgentApprovalDisplay {
  choices: AgentChoice[]
  description?: string
  id: string
  title: string
}

export interface AgentSnapshotProjection {
  approval?: AgentApprovalDisplay
  error?: string
  message?: UIMessage
  messageFinal: boolean
  messageRole: 'assistant' | 'system' | 'user'
  messageText: string
  reasoning: AgentTraceStep[]
  status: AgentStreamStatus
  tools: AgentToolPart[]
}

/** Return the visible text from standard TanStack message parts. */
export function agentMessageText(message: UIMessage | undefined): string {
  if (!message) { return '' }
  return message.parts
    .filter((part): part is Extract<AgentMessagePart, { type: 'text' }> => part.type === 'text')
    .map(part => part.content)
    .join('')
}

/** Select the active assistant message from the full client transcript. */
export function agentCurrentMessage(snapshot: ChatClientSnapshot): UIMessage | undefined {
  for (let index = snapshot.messages.length - 1; index >= 0; index -= 1) {
    const message = snapshot.messages[index]
    if (message?.role === 'user') { return undefined }
    if (message?.role === 'assistant' && message.parts.length > 0) { return message }
  }
  return undefined
}

export function agentConversationHistory(snapshot: ChatClientSnapshot, timestamp: string): Array<AgentConversationMessage & { timestamp: string }>
export function agentConversationHistory(snapshot: ChatClientSnapshot, timestamp?: string): AgentConversationMessage[]
export function agentConversationHistory(snapshot: ChatClientSnapshot, timestamp?: string): AgentConversationMessage[] {
  const current = agentCurrentMessage(snapshot)
  const history: AgentConversationMessage[] = []
  for (const message of snapshot.messages) {
    if (message.id === current?.id || message.role === 'activity') { continue }
    const content = agentMessageText(message)
    if (!content) { continue }
    history.push({ id: message.id, role: message.role, content, timestamp })
  }
  return history
}

export function agentSnapshotStatus(snapshot: ChatClientSnapshot): AgentStreamStatus {
  if (snapshot.error || snapshot.status === 'error') { return 'failed' }
  if (snapshot.interruptState.resuming || snapshot.interruptState.interrupts.some(interrupt => interrupt.status !== 'error')) {
    return 'waiting'
  }
  if (snapshot.isLoading || snapshot.status === 'submitted' || snapshot.status === 'streaming') {
    return 'streaming'
  }
  return agentCurrentMessage(snapshot) ? 'completed' : 'idle'
}

function partStatusForSnapshot(status: AgentStreamStatus): AgentPartStatus {
  if (status === 'waiting') { return 'waiting' }
  if (status === 'streaming') { return 'running' }
  if (status === 'failed') { return 'failed' }
  return 'completed'
}

function toolCallStatus(state: AgentToolCallPart['state']): AgentPartStatus {
  if (state === 'approval-requested' || state === 'awaiting-input') { return 'waiting' }
  if (state === 'error') { return 'failed' }
  if (state === 'complete') { return 'completed' }
  return 'running'
}

function toolResultStatus(state: AgentToolResultPart['state']): AgentPartStatus {
  if (state === 'error') { return 'failed' }
  if (state === 'complete') { return 'completed' }
  return 'running'
}

function parseToolInput(argumentsText: string): unknown {
  try { return JSON.parse(argumentsText) }
  catch { return argumentsText }
}

function toolSummary(value: unknown): string | undefined {
  if (typeof value === 'string') { return value }
  if (value === undefined || value === null) { return undefined }
  try { return JSON.stringify(value) }
  catch { return undefined }
}

function snapshotTools(message: UIMessage | undefined): AgentToolPart[] {
  if (!message) { return [] }
  const tools: AgentToolPart[] = []
  const byId = new Map<string, AgentToolPart>()
  for (const part of message.parts) {
    if (part.type === 'tool-call') {
      const tool: AgentToolPart = {
        id: part.id,
        input: part.input ?? parseToolInput(part.arguments),
        name: part.name,
        output: part.output,
        status: part.output === undefined ? toolCallStatus(part.state) : 'completed',
        summary: toolSummary(part.output),
      }
      tools.push(tool)
      byId.set(part.id, tool)
      continue
    }
    if (part.type === 'tool-result') {
      const existing = byId.get(part.toolCallId)
      if (existing) {
        existing.output = part.content
        existing.error = part.error
        existing.status = toolResultStatus(part.state)
        existing.summary = toolSummary(part.error ?? part.content)
      }
      else {
        tools.push({
          error: part.error,
          id: part.toolCallId,
          name: part.name ?? '工具结果',
          output: part.content,
          status: toolResultStatus(part.state),
          summary: toolSummary(part.error ?? part.content),
        })
      }
    }
  }
  return tools
}

function snapshotReasoning(message: UIMessage | undefined, status: AgentStreamStatus): AgentTraceStep[] {
  if (!message) { return [] }
  const partStatus = partStatusForSnapshot(status)
  return message.parts
    .filter((part): part is Extract<AgentMessagePart, { type: 'thinking' }> => part.type === 'thinking')
    .map((part, index) => ({
      content: part.content,
      id: `${message.id}:thinking:${index}`,
      status: partStatus,
      title: '推理过程',
    }))
}

function snapshotApproval(snapshot: ChatClientSnapshot): AgentApprovalDisplay | undefined {
  if (snapshot.error || snapshot.status === 'error' || snapshot.interruptState.resuming) { return undefined }
  const interrupts: readonly ChatUIInterrupt[] = snapshot.interruptState.interrupts
  const interrupt = interrupts.find(item => item.kind === 'tool-approval' && item.status === 'pending' && item.canResolve)
  if (!interrupt || interrupt.kind !== 'tool-approval') { return undefined }
  return {
    choices: [],
    description: interrupt.message ?? interrupt.reason,
    id: interrupt.id,
    title: `确认工具：${interrupt.toolName}`,
  }
}

/** Build one immutable display projection; no reducer or execution policy is involved. */
export function agentSnapshotProjection(snapshot: ChatClientSnapshot): AgentSnapshotProjection {
  const message = agentCurrentMessage(snapshot)
  const status = agentSnapshotStatus(snapshot)
  const projection: AgentSnapshotProjection = {
    approval: snapshotApproval(snapshot),
    error: snapshot.error?.message,
    message,
    messageFinal: status !== 'streaming',
    messageRole: message?.role === 'system' ? 'system' : message?.role === 'user' ? 'user' : 'assistant',
    messageText: agentMessageText(message),
    reasoning: snapshotReasoning(message, status),
    status,
    tools: snapshotTools(message),
  }
  return Object.freeze(projection)
}
