import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createStreamingMarkdownParser,
  createTextStream,
  normalizeMarkdownNodes,
  toAgentRichTextNodes,
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
