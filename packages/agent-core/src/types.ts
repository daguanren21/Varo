export type AgentMessageRole = 'assistant' | 'system' | 'user'
export type AgentStreamStatus = 'idle' | 'streaming' | 'waiting' | 'completed' | 'failed' | 'cancelled'
export type AgentPartStatus = 'waiting' | 'running' | 'completed' | 'failed'

export interface AgentMessageStartEvent {
  messageId: string
  role: AgentMessageRole
  type: 'message.start'
}

export interface AgentTextDeltaEvent {
  delta: string
  messageId: string
  type: 'text.delta'
}

export interface AgentMessageEndEvent {
  messageId: string
  type: 'message.end'
}

export interface AgentReasoningStartEvent {
  id: string
  title: string
  type: 'reasoning.start'
}

export interface AgentReasoningDeltaEvent {
  delta: string
  id: string
  type: 'reasoning.delta'
}

export interface AgentReasoningEndEvent {
  durationMs?: number
  id: string
  type: 'reasoning.end'
}

export interface AgentToolStartEvent {
  id: string
  input?: unknown
  name: string
  summary?: string
  type: 'tool.start'
}

export interface AgentToolUpdateEvent {
  id: string
  summary?: string
  type: 'tool.update'
}

export interface AgentToolResultEvent {
  id: string
  output?: unknown
  summary?: string
  type: 'tool.result'
}

export interface AgentToolErrorEvent {
  error: string
  id: string
  type: 'tool.error'
}

export interface AgentApprovalRequiredEvent {
  choices?: Array<{
    description?: string
    disabled?: boolean
    label: string
    value: string
  }>
  description?: string
  id: string
  title: string
  type: 'approval.required'
}

export interface AgentApprovalResolvedEvent {
  id: string
  type: 'approval.resolved'
  value: string
}

export interface AgentDataEvent {
  name: string
  type: 'data'
  value: unknown
}

export interface AgentErrorEvent {
  code?: string
  message: string
  retryable?: boolean
  type: 'error'
}

export interface AgentDoneEvent {
  type: 'done'
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}

export type AgentStreamEvent =
  | AgentMessageStartEvent
  | AgentTextDeltaEvent
  | AgentMessageEndEvent
  | AgentReasoningStartEvent
  | AgentReasoningDeltaEvent
  | AgentReasoningEndEvent
  | AgentToolStartEvent
  | AgentToolUpdateEvent
  | AgentToolResultEvent
  | AgentToolErrorEvent
  | AgentApprovalRequiredEvent
  | AgentApprovalResolvedEvent
  | AgentDataEvent
  | AgentErrorEvent
  | AgentDoneEvent

export interface AgentStreamMessage {
  final: boolean
  id: string
  role: AgentMessageRole
  source: string
  visible: string
}

export interface AgentReasoningPart {
  content: string
  durationMs?: number
  id: string
  status: AgentPartStatus
  title: string
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

export interface AgentApprovalPart {
  choices: AgentApprovalRequiredEvent['choices']
  description?: string
  id: string
  resolvedValue?: string
  status: 'waiting' | 'completed'
  title: string
}

export interface AgentDataPart {
  name: string
  value: unknown
}

export interface AgentStreamSnapshot {
  approval?: AgentApprovalPart
  data: AgentDataPart[]
  error?: AgentErrorEvent
  eventCount: number
  message?: AgentStreamMessage
  reasoning: AgentReasoningPart[]
  status: AgentStreamStatus
  tools: AgentToolPart[]
  usage?: AgentDoneEvent['usage']
}

export interface TextStreamSnapshot {
  caughtUp: boolean
  done: boolean
  final: boolean
  paused: boolean
  pendingChars: number
  source: string
  visible: string
}

export interface TextStreamOptions {
  catchUpThreshold?: number
  maxCharsPerCommit?: number
  maxCharsPerSecond?: number
  maxCommitFps?: number
  minCharsPerSecond?: number
  targetLatencyMs?: number
}

export interface TextStreamController {
  destroy: () => void
  enqueue: (chunk: string) => void
  finish: (options?: { flush?: boolean }) => void
  flush: () => void
  getSnapshot: () => TextStreamSnapshot
  pause: () => void
  reset: (content?: string) => void
  resume: () => void
  subscribe: (listener: () => void) => () => void
}

export interface AgentStreamController {
  cancel: (reason?: string) => void
  connect: (events: AsyncIterable<AgentStreamEvent>) => Promise<AgentStreamSnapshot>
  destroy: () => void
  getSnapshot: () => AgentStreamSnapshot
  push: (event: AgentStreamEvent) => void
  reset: () => void
  subscribe: (listener: () => void) => () => void
}

export interface AgentEventChannel {
  end: () => void
  fail: (error: unknown) => void
  push: (event: AgentStreamEvent) => void
  source: AsyncIterable<AgentStreamEvent>
}
