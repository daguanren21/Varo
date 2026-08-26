import { createTextStream } from './text-stream'
import type {
  AgentApprovalPart,
  AgentErrorEvent,
  AgentReasoningPart,
  AgentStreamController,
  AgentStreamEvent,
  AgentStreamSnapshot,
  AgentToolPart,
  TextStreamOptions
} from './types'

export interface AgentStreamControllerOptions {
  text?: TextStreamOptions
}

function initialSnapshot(): AgentStreamSnapshot {
  return {
    data: [],
    eventCount: 0,
    reasoning: [],
    status: 'idle',
    tools: []
  }
}

export function createAgentStreamController(
  options: AgentStreamControllerOptions = {}
): AgentStreamController {
  const text = createTextStream(options.text)
  const listeners = new Set<() => void>()
  let snapshot = initialSnapshot()
  let destroyed = false
  let cancelled = false
  let transportDone = false
  let connecting = false
  let cancelActiveConnect: (() => void) | undefined

  function emit() {
    listeners.forEach((listener) => listener())
  }

  function setSnapshot(update: Partial<AgentStreamSnapshot>) {
    snapshot = { ...snapshot, ...update }
    emit()
  }

  function updateReasoning(id: string, update: Partial<AgentReasoningPart>) {
    setSnapshot({
      reasoning: snapshot.reasoning.map((part) => (part.id === id ? { ...part, ...update } : part))
    })
  }

  function updateTool(id: string, update: Partial<AgentToolPart>) {
    setSnapshot({
      tools: snapshot.tools.map((part) => (part.id === id ? { ...part, ...update } : part))
    })
  }

  function finalStatus() {
    const textSnapshot = text.getSnapshot()
    if (!transportDone || !textSnapshot.final) return
    setSnapshot({ status: snapshot.error ? 'failed' : cancelled ? 'cancelled' : 'completed' })
  }

  const unsubscribeText = text.subscribe(() => {
    if (destroyed || !snapshot.message) return
    const textSnapshot = text.getSnapshot()
    snapshot = {
      ...snapshot,
      message: {
        ...snapshot.message,
        final: textSnapshot.final,
        source: textSnapshot.source,
        visible: textSnapshot.visible
      }
    }
    emit()
    finalStatus()
  })

  function push(event: AgentStreamEvent) {
    if (destroyed || cancelled) return
    snapshot = { ...snapshot, eventCount: snapshot.eventCount + 1 }

    switch (event.type) {
      case 'message.start':
        transportDone = false
        text.reset()
        setSnapshot({
          error: undefined,
          message: {
            final: false,
            id: event.messageId,
            role: event.role,
            source: '',
            visible: ''
          },
          status: 'streaming'
        })
        break
      case 'text.delta':
        if (snapshot.message?.id === event.messageId) text.enqueue(event.delta)
        break
      case 'message.end':
        if (snapshot.message?.id === event.messageId) text.finish()
        break
      case 'reasoning.start':
        setSnapshot({
          reasoning: [
            ...snapshot.reasoning,
            { content: '', id: event.id, status: 'running', title: event.title }
          ]
        })
        break
      case 'reasoning.delta': {
        const part = snapshot.reasoning.find((item) => item.id === event.id)
        if (part) updateReasoning(event.id, { content: `${part.content}${event.delta}` })
        break
      }
      case 'reasoning.end':
        updateReasoning(event.id, { durationMs: event.durationMs, status: 'completed' })
        break
      case 'tool.start':
        setSnapshot({
          tools: [
            ...snapshot.tools,
            {
              id: event.id,
              input: event.input,
              name: event.name,
              status: 'running',
              summary: event.summary
            }
          ]
        })
        break
      case 'tool.update':
        updateTool(event.id, { summary: event.summary })
        break
      case 'tool.result':
        updateTool(event.id, {
          output: event.output,
          status: 'completed',
          summary: event.summary
        })
        break
      case 'tool.error':
        updateTool(event.id, { error: event.error, status: 'failed' })
        break
      case 'approval.required': {
        const approval: AgentApprovalPart = {
          choices: event.choices ?? [],
          description: event.description,
          id: event.id,
          status: 'waiting',
          title: event.title
        }
        setSnapshot({ approval, status: 'waiting' })
        break
      }
      case 'approval.resolved':
        if (snapshot.approval?.id === event.id) {
          setSnapshot({
            approval: {
              ...snapshot.approval,
              resolvedValue: event.value,
              status: 'completed'
            },
            status: 'streaming'
          })
        }
        break
      case 'data':
        setSnapshot({ data: [...snapshot.data, { name: event.name, value: event.value }] })
        break
      case 'error':
        transportDone = true
        text.finish({ flush: true })
        setSnapshot({ error: event, status: 'failed' })
        break
      case 'done':
        transportDone = true
        text.finish()
        setSnapshot({ usage: event.usage })
        if (!snapshot.message) setSnapshot({ status: 'completed' })
        finalStatus()
        break
    }
  }

  async function waitForTerminal() {
    if (snapshot.status === 'completed' || snapshot.status === 'failed' || snapshot.status === 'cancelled') {
      return snapshot
    }

    return await new Promise<AgentStreamSnapshot>((resolve) => {
      const unsubscribe = subscribe(() => {
        if (snapshot.status !== 'completed' && snapshot.status !== 'failed' && snapshot.status !== 'cancelled') return
        unsubscribe()
        resolve(snapshot)
      })
    })
  }

  function subscribe(listener: () => void) {
    if (destroyed) return () => {}
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function reset() {
    text.reset()
    snapshot = initialSnapshot()
    cancelled = false
    transportDone = false
    emit()
  }

  function cancel(reason = 'Cancelled') {
    if (destroyed || cancelled) return
    cancelled = true
    transportDone = true
    text.finish({ flush: true })
    const error: AgentErrorEvent = { code: 'cancelled', message: reason, retryable: true, type: 'error' }
    setSnapshot({ error, status: 'cancelled' })
    cancelActiveConnect?.()
  }

  return {
    cancel,
    async connect(events) {
      if (connecting) throw new Error('Agent stream controller is already connected')
      connecting = true
      reset()
      const iterator = events[Symbol.asyncIterator]()
      let resolveCancellation: (() => void) | undefined
      const cancellation = new Promise<void>((resolve) => {
        resolveCancellation = resolve
      })
      cancelActiveConnect = resolveCancellation

      try {
        try {
          while (!cancelled && !destroyed) {
            const outcome = await Promise.race([
              iterator.next().then((result) => ({ kind: 'event' as const, result })),
              cancellation.then(() => ({ kind: 'cancelled' as const }))
            ])
            if (outcome.kind === 'cancelled' || outcome.result.done) break
            push(outcome.result.value)
          }
          if (!transportDone && !cancelled && !destroyed) push({ type: 'done' })
        } catch (error) {
          push({
            message: error instanceof Error ? error.message : String(error),
            retryable: true,
            type: 'error'
          })
        } finally {
          if (cancelled || destroyed) void iterator.return?.()
        }
        return await waitForTerminal()
      } finally {
        connecting = false
        cancelActiveConnect = undefined
      }
    },
    destroy() {
      if (destroyed) return
      cancel('Agent stream controller destroyed')
      destroyed = true
      unsubscribeText()
      text.destroy()
      listeners.clear()
    },
    getSnapshot() {
      return snapshot
    },
    push,
    reset,
    subscribe
  }
}
