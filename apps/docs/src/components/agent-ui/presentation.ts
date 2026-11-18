import type { ChatClientSnapshot, UIMessage } from '@tanstack/ai-client'
import type { ChatUIInterrupt, ChatUISelectedMessage, ChatUISelectedPart } from '@tanstack/ai-client/ui'
import { selectChatUI } from '@tanstack/ai-client/ui'
import type { AgentConversationEntry, AgentPartStatus, AgentStreamStatus, AgentToolPart, AgentTraceStep } from '../agent-ui/types'

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

export interface AgentInterruptIdentity {
  id: string
  threadId: string
  interruptedRunId: string
  generation: number
}

export interface AgentApprovalDisplay extends AgentInterruptIdentity {
  description: string
  title: string
  errors: string[]
  canResolve: boolean
}

export interface AgentMessageSegment {
  id: string
  kind: 'text' | 'thinking' | 'tool' | 'data'
  content: string
  tool?: AgentToolPart
  steps: AgentTraceStep[]
}

export interface AgentRenderedMessage {
  id: string
  role: 'assistant' | 'system' | 'user'
  label: string
  timestamp: string
  segments: AgentMessageSegment[]
  final: boolean
  status: AgentStreamStatus
}

export interface AgentSnapshotProjection {
  approvals: AgentApprovalDisplay[]
  interruptErrors: string[]
  canRetryInterrupts: boolean
  canCancelInterrupts: boolean
  transactionKey: string
  error?: string
  message?: UIMessage
  renderedMessage?: AgentRenderedMessage
  messageFinal: boolean
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

/** Preserve SDK messages and their parts by reference; never flatten tool receipts into text. */
export function agentConversationHistory(snapshot: ChatClientSnapshot): UIMessage[] {
  const current = agentCurrentMessage(snapshot)
  return snapshot.messages.filter(message => message !== current && message.parts.length > 0)
}

export function agentSnapshotStatus(snapshot: ChatClientSnapshot): AgentStreamStatus {
  if (snapshot.error || snapshot.status === 'error') { return 'failed' }
  if (snapshot.interruptState.resuming || snapshot.interruptState.interrupts.length > 0 || snapshot.interruptState.interruptErrors.length > 0) {
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

function selectedTool(selected: ChatUISelectedPart): AgentToolPart | undefined {
  if (selected.key === 'toolCall') {
    const { part, result } = selected
    const failed = part.state === 'error' || result?.state === 'error'
    const output = part.output ?? result?.content
    const error = result?.error ?? (failed ? toolSummary(output) : undefined)
    return {
      id: part.id,
      input: part.input ?? parseToolInput(part.arguments),
      name: part.name,
      output,
      error,
      status: failed ? 'failed' : result ? toolResultStatus(result.state) : toolCallStatus(part.state),
      summary: error ?? toolSummary(output),
    }
  }
  if (selected.key === 'toolResult' && !selected.matched) {
    return {
      id: selected.part.toolCallId,
      name: selected.part.name ?? '工具结果',
      output: selected.part.content,
      error: selected.part.error,
      status: toolResultStatus(selected.part.state),
      summary: selected.part.error ?? toolSummary(selected.part.content),
    }
  }
  return undefined
}

function renderMessage(selected: ChatUISelectedMessage, status: AgentStreamStatus): AgentRenderedMessage {
  const message = selected.message
  const segments: AgentMessageSegment[] = []
  for (const [index, selectedPart] of selected.parts.entries()) {
    const part = selectedPart.part
    const id = `${message.id}:${index}`
    if (selectedPart.key === 'toolResult' && selectedPart.matched) { continue }
    const tool = selectedTool(selectedPart)
    if (tool) {
      const content = tool.output === undefined ? '' : toolSummary(tool.output) ?? ''
      segments.push({ id, kind: 'tool', content, tool, steps: [] })
    }
    else if (part.type === 'text') {
      segments.push({ id, kind: 'text', content: part.content, steps: [] })
    }
    else if (part.type === 'thinking') {
      segments.push({ id, kind: 'thinking', content: part.content, steps: [{ id, content: part.content, status: partStatusForSnapshot(status), title: '推理过程' }] })
    }
    else {
      segments.push({ id, kind: 'data', content: toolSummary(part) ?? part.type, steps: [] })
    }
  }
  return {
    id: message.id,
    role: message.role === 'user' || message.role === 'system' ? message.role : 'assistant',
    label: '',
    timestamp: '',
    segments,
    final: status !== 'streaming',
    status,
  }
}

export function agentConversationProjection(entries: readonly AgentConversationEntry[], context?: readonly UIMessage[]): AgentRenderedMessage[] {
  const sdkMessages = context ?? entries.filter((entry): entry is UIMessage => 'parts' in entry)
  const selected = new Map(selectChatUI({ messages: sdkMessages }).messages.map(message => [message.message.id, message]))
  return entries.map((entry) => {
    if ('parts' in entry) {
      const message = selected.get(entry.id) ?? selectChatUI({ messages: [entry] }).messages[0]!
      return renderMessage(message, 'completed')
    }
    return {
      id: entry.id, role: entry.role, label: entry.label ?? '', timestamp: entry.timestamp ?? '',
      segments: [{ id: `${entry.id}:text`, kind: 'text' as const, content: entry.content, steps: [] }],
      final: true, status: 'completed' as const,
    }
  })
}

export function agentInterruptTransactionKey(snapshot: ChatClientSnapshot): string {
  return JSON.stringify([
    snapshot.interruptState.interrupts.map(({ id, threadId, interruptedRunId, generation }) => [id, threadId, interruptedRunId, generation]),
    snapshot.interruptState.interruptErrors.map(({ threadId, interruptedRunId, generation }) => [threadId, interruptedRunId, generation]),
  ])
}

export function agentCanResolveApproval(snapshot: ChatClientSnapshot, displayed: AgentInterruptIdentity): boolean {
  if (snapshot.interruptState.resuming) { return false }
  const interrupts: readonly ChatUIInterrupt[] = snapshot.interruptState.interrupts
  const current = interrupts.find(item => item.id === displayed.id && item.threadId === displayed.threadId
    && item.interruptedRunId === displayed.interruptedRunId && item.generation === displayed.generation)
  if (!current || current.kind !== 'tool-approval' || !current.canResolve) { return false }
  if (snapshot.error || snapshot.status === 'error') { return false }
  if (current.status === 'pending') { return true }
  return current.status === 'error' && current.errors.length > 0
    && current.errors.every(error => error.code === 'invalid-payload' || error.code === 'invalid-edited-args')
}

/** Read-only view of SDK state, including errors owned by the interrupt transaction. */
export function agentSnapshotProjection(snapshot: ChatClientSnapshot): AgentSnapshotProjection {
  const message = agentCurrentMessage(snapshot)
  const status = agentSnapshotStatus(snapshot)
  const interrupts: readonly ChatUIInterrupt[] = snapshot.interruptState.interrupts
  const hasInterrupt = interrupts.length > 0 || snapshot.interruptState.interruptErrors.length > 0
  const selection = selectChatUI({ messages: snapshot.messages, interrupts })
  const selected = message ? selection.messages.find(item => item.message.id === message.id) : undefined
  const renderedMessage = selected ? renderMessage(selected, hasInterrupt ? 'waiting' : status) : undefined
  const interruptErrors = [
    ...snapshot.interruptState.interruptErrors.map(error => error.message),
    ...interrupts.flatMap(item => item.errors.map(error => error.message)),
  ]
  if (hasInterrupt && snapshot.error) { interruptErrors.unshift(snapshot.error.message) }
  const approvals = interrupts.filter(item => item.kind === 'tool-approval').map(item => ({
    id: item.id, threadId: item.threadId, interruptedRunId: item.interruptedRunId, generation: item.generation,
    title: `确认工具：${item.kind === 'tool-approval' ? item.toolName : ''}`,
    description: item.message ?? item.reason,
    errors: item.errors.map(error => error.message),
    canResolve: agentCanResolveApproval(snapshot, item),
  }))
  return {
    approvals,
    interruptErrors: [...new Set(interruptErrors)],
    canRetryInterrupts: !snapshot.interruptState.resuming && (snapshot.interruptState.interruptErrors.some(error => error.retryable)
      || interrupts.some(item => item.errors.some(error => error.retryable))),
    canCancelInterrupts: !snapshot.interruptState.resuming && (interrupts.some(item => item.kind !== 'unbound') || snapshot.interruptState.interruptErrors.length > 0),
    transactionKey: agentInterruptTransactionKey(snapshot),
    error: hasInterrupt ? undefined : snapshot.error?.message,
    message, renderedMessage,
    messageFinal: status !== 'streaming',
    messageText: agentMessageText(message),
    reasoning: renderedMessage?.segments.flatMap(segment => segment.steps) ?? [],
    status,
    tools: renderedMessage?.segments.flatMap(segment => segment.tool ? [segment.tool] : []) ?? [],
  }
}
