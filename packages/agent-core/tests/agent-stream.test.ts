import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createAgentSseEventSource,
  createAgentEventChannel,
  createAgentStreamController,
  createStreamingMarkdownParser,
  createTextStream,
  type AgentStreamEvent
} from '../src'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('text stream', () => {
  it('reveals grapheme-safe text incrementally and finalizes after the queue drains', () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', undefined)
    vi.stubGlobal('cancelAnimationFrame', undefined)
    const controller = createTextStream({
      maxCharsPerCommit: 1,
      maxCharsPerSecond: 100,
      maxCommitFps: 20,
      minCharsPerSecond: 100
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
      visible: '你👨‍👩‍👧‍👦好'
    })
    controller.destroy()
  })
})

describe('agent stream controller', () => {
  it('projects protocol events into message, reasoning, tool, approval, and usage state', () => {
    vi.useFakeTimers()
    const controller = createAgentStreamController({
      text: { maxCharsPerCommit: 8, maxCharsPerSecond: 1000, maxCommitFps: 20 }
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
      { type: 'done', usage: { inputTokens: 12, outputTokens: 8 } }
    ]

    events.forEach(controller.push)
    vi.runAllTimers()

    expect(controller.getSnapshot()).toMatchObject({
      approval: { resolvedValue: 'approve', status: 'completed' },
      message: { final: true, source: '**已找到**牛奶', visible: '**已找到**牛奶' },
      reasoning: [{ content: '正在查找', durationMs: 120, status: 'completed' }],
      status: 'completed',
      tools: [{ name: 'catalog.search', status: 'completed', summary: '找到 1 项' }],
      usage: { inputTokens: 12, outputTokens: 8 }
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
      status: 'cancelled'
    })
    channel.end()
    controller.destroy()
  })
})

describe('SSE transport', () => {
  it('decodes UTF-8 split across chunks and validates the event payload', async () => {
    const transport = createAgentSseEventSource()
    const eventsPromise = (async () => {
      const events: AgentStreamEvent[] = []
      for await (const event of transport.source) events.push(event)
      return events
    })()
    const payload = 'data: {"type":"text.delta","messageId":"m1","delta":"你好"}\n\n'
    const bytes = new TextEncoder().encode(payload)
    const split = payload.indexOf('你') + 1

    transport.feed(bytes.slice(0, split))
    transport.feed(bytes.slice(split))
    transport.end()

    await expect(eventsPromise).resolves.toEqual([
      { delta: '你好', messageId: 'm1', type: 'text.delta' }
    ])
  })
})

describe('streaming markdown parser', () => {
  it('keeps incomplete markdown parseable and produces final structured nodes', () => {
    const parser = createStreamingMarkdownParser()
    expect(parser.parse('## Result\n\n**stream', { final: false }).length).toBeGreaterThan(0)

    const finalNodes = parser.parse('## Result\n\n**stream**', { final: true })
    expect(finalNodes.map((node) => node.type)).toEqual(['heading', 'paragraph'])
  })
})
