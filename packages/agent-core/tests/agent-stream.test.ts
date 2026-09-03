import type { AgentStreamEvent } from '../src'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {

  createAgentEventChannel,
  createAgentSseEventSource,
  createAgentStreamController,
  createStreamingMarkdownParser,
  createTextStream,
  normalizeMarkdownNodes,
  toAgentRichTextNodes,
} from '../src'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function createOpenEventSource(
  event: AgentStreamEvent,
  cleanup: () => void | Promise<void> = () => {},
): AsyncIterable<AgentStreamEvent> {
  return {
    [Symbol.asyncIterator]() {
      let emitted = false
      return {
        async next(): Promise<IteratorResult<AgentStreamEvent>> {
          if (!emitted) {
            emitted = true
            return { done: false, value: event }
          }
          return await new Promise<IteratorResult<AgentStreamEvent>>(() => {})
        },
        return(): Promise<IteratorResult<AgentStreamEvent>> {
          const result = cleanup()
          return Promise.resolve(result).then<IteratorResult<AgentStreamEvent>>(() => ({
            done: true,
            value: undefined,
          }))
        },
      }
    },
  }
}

describe('text stream', () => {
  it('reveals grapheme-safe text incrementally and finalizes after the queue drains', () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', undefined)
    vi.stubGlobal('cancelAnimationFrame', undefined)
    const controller = createTextStream({
      maxCharsPerCommit: 1,
      maxCharsPerSecond: 100,
      maxCommitFps: 20,
      minCharsPerSecond: 100,
      startDelayMs: 0,
    })

    controller.enqueue('你👨‍👩‍👧‍👦好')
    controller.finish()
    expect(controller.getSnapshot()).toMatchObject({ final: false, visible: '' })

    vi.advanceTimersByTime(50)
    expect(controller.getSnapshot().visible).toBe('你')

    vi.runAllTimers()
    expect(controller.getSnapshot()).toMatchObject({
      final: true,
      pendingChars: 0,
      source: '你👨‍👩‍👧‍👦好',
      visible: '你👨‍👩‍👧‍👦好',
    })
    controller.destroy()
  })

  it('supports burst reveal, finish defaults, and dispose from Markstream 2.0.7', () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', undefined)
    vi.stubGlobal('cancelAnimationFrame', undefined)
    const controller = createTextStream({
      burstInitialContent: true,
      burstRevealThresholdChars: 8,
      flushOnFinish: true,
    })

    controller.enqueue('完整的一次性回答')
    expect(controller.getSnapshot().visible).toBe('完整的一次性回答')
    controller.finish()
    expect(controller.getSnapshot()).toMatchObject({ final: true, pendingChars: 0 })

    controller.reset()
    controller.enqueue('```ts\nconst pending = true')
    expect(controller.getSnapshot().visible).toBe('')
    controller.dispose()
  })

  it('reveals fenced code markers atomically on the mini-program timer scheduler', () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', undefined)
    vi.stubGlobal('cancelAnimationFrame', undefined)
    const controller = createTextStream({
      maxCharsPerCommit: 2,
      maxCharsPerSecond: 1000,
      maxCommitFps: 20,
      minCharsPerSecond: 1000,
      startDelayMs: 0,
    })

    controller.enqueue('```ts\nconst value = 1\n```\n')
    vi.advanceTimersByTime(50)
    expect(controller.getSnapshot().visible).toBe('```ts\n')
    vi.runAllTimers()
    expect(controller.getSnapshot().visible).toBe('```ts\nconst value = 1\n```\n')
    controller.destroy()
  })
})

describe('agent event channel', () => {
  it('ends the channel and clears queued events when its consumer returns', async () => {
    const channel = createAgentEventChannel()
    const iterator = channel.source[Symbol.asyncIterator]()
    channel.push({ name: 'first', type: 'data', value: 1 })
    channel.push({ name: 'queued', type: 'data', value: 2 })

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: { name: 'first', type: 'data', value: 1 },
    })
    await iterator.return?.()
    channel.push({ name: 'after-return', type: 'data', value: 3 })

    const laterIterator = channel.source[Symbol.asyncIterator]()
    await expect(laterIterator.next()).resolves.toEqual({ done: true, value: undefined })
  })
})

describe('agent stream controller', () => {
  it('projects protocol events into message, reasoning, tool, approval, and usage state', () => {
    vi.useFakeTimers()
    const controller = createAgentStreamController({
      text: { maxCharsPerCommit: 8, maxCharsPerSecond: 1000, maxCommitFps: 20 },
    })
    const events: AgentStreamEvent[] = [
      { messageId: 'm1', role: 'assistant', type: 'message.start' },
      { id: 'r1', title: '检索', type: 'reasoning.start' },
      { delta: '正在查找', id: 'r1', type: 'reasoning.delta' },
      { durationMs: 120, id: 'r1', type: 'reasoning.end' },
      { id: 't1', input: { query: 'milk' }, name: 'catalog.search', type: 'tool.start' },
      { id: 't1', output: { count: 1 }, summary: '找到 1 项', type: 'tool.result' },
      { id: 'a1', title: '确认购买', type: 'approval.required' },
      { id: 'a1', type: 'approval.resolved', value: 'approve' },
      { delta: '**已找到**牛奶', messageId: 'm1', type: 'text.delta' },
      { messageId: 'm1', type: 'message.end' },
      { type: 'done', usage: { inputTokens: 12, outputTokens: 8 } },
    ]

    events.forEach(controller.push)
    vi.runAllTimers()

    expect(controller.getSnapshot()).toMatchObject({
      approval: { resolvedValue: 'approve', status: 'completed' },
      message: { final: true, source: '**已找到**牛奶', visible: '**已找到**牛奶' },
      reasoning: [{ content: '正在查找', durationMs: 120, status: 'completed' }],
      status: 'completed',
      tools: [{ name: 'catalog.search', status: 'completed', summary: '找到 1 项' }],
      usage: { inputTokens: 12, outputTokens: 8 },
    })
    controller.destroy()
  })

  it('cancels a connected source without waiting for another transport event', async () => {
    const channel = createAgentEventChannel()
    const controller = createAgentStreamController()
    const connection = controller.connect(channel.source)
    channel.push({ messageId: 'm1', role: 'assistant', type: 'message.start' })
    await Promise.resolve()

    controller.cancel('Stopped by user')
    await expect(connection).resolves.toMatchObject({
      error: { code: 'cancelled', message: 'Stopped by user' },
      status: 'cancelled',
    })
    channel.end()
    controller.destroy()
  })

  it('completes and cleans up when an open source emits done', async () => {
    const cleanup = vi.fn()
    const controller = createAgentStreamController()

    await expect(controller.connect(createOpenEventSource({ type: 'done' }, cleanup))).resolves.toMatchObject({
      status: 'completed',
    })
    expect(cleanup).toHaveBeenCalledOnce()
    controller.destroy()
  })

  it('fails and cleans up when an open source emits a protocol error', async () => {
    const cleanup = vi.fn()
    const controller = createAgentStreamController()

    await expect(controller.connect(createOpenEventSource({
      code: 'upstream_failed',
      message: 'Upstream failed',
      type: 'error',
    }, cleanup))).resolves.toMatchObject({
      error: { code: 'upstream_failed', message: 'Upstream failed' },
      status: 'failed',
    })
    expect(cleanup).toHaveBeenCalledOnce()
    controller.destroy()
  })

  it('preserves completed status when iterator cleanup throws synchronously', async () => {
    const cleanup = vi.fn(() => {
      throw new Error('Synchronous cleanup failure')
    })
    const controller = createAgentStreamController()

    await expect(controller.connect(createOpenEventSource({ type: 'done' }, cleanup))).resolves.toMatchObject({
      status: 'completed',
    })
    expect(cleanup).toHaveBeenCalledOnce()
    controller.destroy()
  })

  it('preserves protocol failure when iterator cleanup rejects', async () => {
    const cleanup = vi.fn(() => Promise.reject(new Error('Asynchronous cleanup failure')))
    const controller = createAgentStreamController()

    await expect(controller.connect(createOpenEventSource({
      code: 'upstream_failed',
      message: 'Upstream failed',
      type: 'error',
    }, cleanup))).resolves.toMatchObject({
      error: { code: 'upstream_failed', message: 'Upstream failed' },
      status: 'failed',
    })
    expect(cleanup).toHaveBeenCalledOnce()
    controller.destroy()
  })

  it('accepts a new connection after terminal completion', async () => {
    const controller = createAgentStreamController()

    await expect(controller.connect(createOpenEventSource({ type: 'done' }))).resolves.toMatchObject({
      status: 'completed',
    })
    await expect(controller.connect(createOpenEventSource({ type: 'done' }))).resolves.toMatchObject({
      status: 'completed',
    })
    controller.destroy()
  })

  it('synthesizes done when a source exhausts naturally', async () => {
    const controller = createAgentStreamController()
    const events = (async function* (): AsyncIterable<AgentStreamEvent> {
      yield { name: 'result', type: 'data', value: 42 }
    })()

    await expect(controller.connect(events)).resolves.toMatchObject({
      data: [{ name: 'result', value: 42 }],
      eventCount: 2,
      status: 'completed',
    })
    controller.destroy()
  })
})

describe('SSE transport', () => {
  it('decodes UTF-8 split across chunks and validates the event payload', async () => {
    const transport = createAgentSseEventSource()
    const eventsPromise = (async () => {
      const events: AgentStreamEvent[] = []
      for await (const event of transport.source) { events.push(event) }
      return events
    })()
    const payload = 'data: {"type":"text.delta","messageId":"m1","delta":"你好"}\n\n'
    const bytes = new TextEncoder().encode(payload)
    const split = payload.indexOf('你') + 1

    transport.feed(bytes.slice(0, split))
    transport.feed(bytes.slice(split))
    transport.end()

    await expect(eventsPromise).resolves.toEqual([
      { delta: '你好', messageId: 'm1', type: 'text.delta' },
    ])
  })

  it('treats SSE [DONE] as terminal without transport end', async () => {
    const transport = createAgentSseEventSource()
    const controller = createAgentStreamController()
    const connection = controller.connect(transport.source)

    transport.feed('data: [DONE]\n\n')

    await expect(connection).resolves.toMatchObject({ status: 'completed' })
    controller.destroy()
  })

  it('ignores feed after SSE [DONE] for later source iteration', async () => {
    const transport = createAgentSseEventSource()
    const iterator = transport.source[Symbol.asyncIterator]()

    transport.feed('data: [DONE]\n\n')
    await expect(iterator.next()).resolves.toEqual({
      done: false,
      value: { type: 'done' },
    })

    transport.feed('data: {"type":"data","name":"stale","value":true}\n\n')
    await expect(iterator.next()).resolves.toEqual({ done: true, value: undefined })

    const laterIterator = transport.source[Symbol.asyncIterator]()
    await expect(laterIterator.next()).resolves.toEqual({ done: true, value: undefined })
  })

  it('ignores feed after a protocol error for later source iteration', async () => {
    const transport = createAgentSseEventSource()
    const iterator = transport.source[Symbol.asyncIterator]()

    transport.feed('data: {"type":"error","message":"Upstream failed"}\n\n')
    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: { message: 'Upstream failed', type: 'error' },
    })

    transport.feed('data: {"type":"data","name":"stale","value":true}\n\n')
    await expect(iterator.next()).resolves.toEqual({ done: true, value: undefined })

    const laterIterator = transport.source[Symbol.asyncIterator]()
    await expect(laterIterator.next()).resolves.toEqual({ done: true, value: undefined })
  })

  it('preserves explicit transport failure behavior', async () => {
    const transport = createAgentSseEventSource()
    const iterator = transport.source[Symbol.asyncIterator]()
    const nextEvent = iterator.next()

    transport.fail(new Error('Transport failed'))

    await expect(nextEvent).rejects.toThrow('Transport failed')
  })
})

describe('streaming markdown parser', () => {
  it('keeps incomplete markdown parseable and produces final structured nodes', () => {
    const parser = createStreamingMarkdownParser()
    expect(parser.parse('## Result\n\n**stream', { final: false }).length).toBeGreaterThan(0)

    const finalNodes = parser.parse('## Result\n\n**stream**', { final: true })
    expect(finalNodes.map(node => node.type)).toEqual(['heading', 'paragraph'])

    const richTextNodes = toAgentRichTextNodes(
      normalizeMarkdownNodes(finalNodes).find(node => node.kind === 'paragraph')?.children ?? [],
    )
    expect(richTextNodes).toEqual([
      {
        children: [{ text: 'stream', type: 'text' }],
        name: 'strong',
      },
    ])
    expect(toAgentRichTextNodes([
      {
        children: [{ kind: 'text', text: 'unsafe navigation' }],
        href: 'javascript:alert(1)',
        kind: 'link',
      },
    ])).toBeUndefined()
  })
})
