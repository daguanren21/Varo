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
  burstInitialContent?: boolean
  burstRevealThresholdChars?: number
  catchUpLatencyMs?: number
  catchUpThreshold?: number
  flushOnFinish?: boolean
  maxCharsPerCommit?: number
  maxCharsPerSecond?: number
  maxCommitFps?: number
  minCharsPerSecond?: number
  startDelayMs?: number
  targetLatencyMs?: number
}

export interface TextStreamController {
  destroy: () => void
  dispose: () => void
  enqueue: (chunk: string) => void
  finish: (options?: { flush?: boolean }) => void
  flush: () => void
  getSnapshot: () => TextStreamSnapshot
  pause: () => void
  reset: (content?: string, options?: { prefixKnown?: boolean }) => void
  resume: () => void
  subscribe: (listener: () => void) => () => void
}

export interface AgentThreadVersion {
  readonly createdAt?: string
  readonly id: string
  readonly label?: string
  readonly messageId?: string
  readonly parentId?: string
  readonly pinned?: boolean
  readonly summary?: string
}

export interface AgentThreadSnapshot {
  readonly activeVersionId?: string
  readonly versions: readonly AgentThreadVersion[]
}

export interface AgentThreadController {
  append: (version: AgentThreadVersion) => void
  destroy: () => void
  fork: (parentId: string, version: Omit<AgentThreadVersion, 'parentId'>) => void
  getSnapshot: () => AgentThreadSnapshot
  reset: (initial?: AgentThreadSnapshot) => void
  select: (id: string) => void
  subscribe: (listener: () => void) => () => void
}
