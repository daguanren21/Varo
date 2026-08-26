import { createSmoothMarkdownStream } from 'markstream-core'
import type { TextStreamController, TextStreamOptions, TextStreamSnapshot } from './types'

interface SegmenterLike {
  segment: (value: string) => Iterable<{ segment: string }>
}

function splitGraphemes(value: string): string[] {
  const intlRuntime: unknown = Intl
  if (
    typeof intlRuntime !== 'object'
    || intlRuntime === null
    || !('Segmenter' in intlRuntime)
    || typeof intlRuntime.Segmenter !== 'function'
  ) {
    return Array.from(value)
  }

  // Runtime constructor shape is checked above; TypeScript's configured Intl lib omits Segmenter.
  const Segmenter = intlRuntime.Segmenter as new (
    locale?: string,
    options?: { granularity: 'grapheme' }
  ) => SegmenterLike
  return Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(value), (item) => item.segment)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function createTimerTextStream(options: TextStreamOptions = {}): TextStreamController {
  const minCharsPerSecond = Math.max(1, options.minCharsPerSecond ?? 40)
  const maxCharsPerSecond = Math.max(minCharsPerSecond, options.maxCharsPerSecond ?? 800)
  const targetLatencyMs = Math.max(50, options.targetLatencyMs ?? 700)
  const maxCommitFps = Math.max(1, Math.min(30, options.maxCommitFps ?? 20))
  const maxCharsPerCommit = Math.max(1, options.maxCharsPerCommit ?? 64)
  const catchUpThreshold = Math.max(1, options.catchUpThreshold ?? 320)
  const listeners = new Set<() => void>()
  const pending: string[] = []
  let pendingOffset = 0
  let source = ''
  let visible = ''
  let done = false
  let paused = false
  let destroyed = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastTick = Date.now()
  let budget = 0

  function pendingCount() {
    return pending.length - pendingOffset
  }

  function snapshot(): TextStreamSnapshot {
    const pendingChars = pendingCount()
    return {
      caughtUp: pendingChars === 0,
      done,
      final: done && pendingChars === 0,
      paused,
      pendingChars,
      source,
      visible
    }
  }

  function emit() {
    listeners.forEach((listener) => listener())
  }

  function compactPending() {
    if (pendingOffset < 1024 || pendingOffset * 2 < pending.length) return
    pending.splice(0, pendingOffset)
    pendingOffset = 0
  }

  function schedule() {
    if (destroyed || paused || timer || pendingCount() === 0) return
    timer = setTimeout(tick, Math.ceil(1000 / maxCommitFps))
  }

  function tick() {
    timer = undefined
    if (destroyed || paused) return

    const now = Date.now()
    const deltaMs = Math.max(1, now - lastTick)
    lastTick = now
    const backlog = pendingCount()
    if (backlog === 0) {
      emit()
      return
    }

    const latencyCps = (backlog * 1000) / targetLatencyMs
    const catchUpBoost = backlog >= catchUpThreshold ? 1.8 : 1
    const cps = clamp(latencyCps * catchUpBoost, minCharsPerSecond, maxCharsPerSecond)
    budget += (cps * deltaMs) / 1000
    const commitCount = Math.min(backlog, maxCharsPerCommit, Math.max(1, Math.floor(budget)))
    budget = Math.max(0, budget - commitCount)
    visible += pending.slice(pendingOffset, pendingOffset + commitCount).join('')
    pendingOffset += commitCount
    compactPending()
    emit()
    schedule()
  }

  function cancelTimer() {
    clearTimeout(timer)
    timer = undefined
  }

  return {
    destroy() {
      if (destroyed) return
      destroyed = true
      cancelTimer()
      pending.length = 0
      listeners.clear()
    },
    enqueue(chunk) {
      if (destroyed || !chunk) return
      if (done) done = false
      source += chunk
      pending.push(...splitGraphemes(chunk))
      lastTick = Date.now()
      emit()
      schedule()
    },
    finish(finishOptions = {}) {
      if (destroyed) return
      done = true
      if (finishOptions.flush) {
        visible = source
        pending.length = 0
        pendingOffset = 0
        cancelTimer()
      }
      emit()
      schedule()
    },
    flush() {
      if (destroyed) return
      visible = source
      pending.length = 0
      pendingOffset = 0
      budget = 0
      cancelTimer()
      emit()
    },
    getSnapshot: snapshot,
    pause() {
      if (destroyed || paused) return
      paused = true
      cancelTimer()
      emit()
    },
    reset(content = '') {
      cancelTimer()
      source = content
      visible = content
      pending.length = 0
      pendingOffset = 0
      done = false
      paused = false
      budget = 0
      lastTick = Date.now()
      emit()
    },
    resume() {
      if (destroyed || !paused) return
      paused = false
      lastTick = Date.now()
      emit()
      schedule()
    },
    subscribe(listener) {
      if (destroyed) return () => {}
      listeners.add(listener)
      return () => listeners.delete(listener)
    }
  }
}

export function createTextStream(options: TextStreamOptions = {}): TextStreamController {
  if (typeof requestAnimationFrame !== 'function' || typeof cancelAnimationFrame !== 'function') {
    return createTimerTextStream(options)
  }

  const controller = createSmoothMarkdownStream(options)
  return {
    destroy: controller.destroy,
    enqueue: controller.enqueue,
    finish: controller.finish,
    flush: controller.flush,
    getSnapshot: controller.getSnapshot,
    pause: controller.pause,
    reset: controller.reset,
    resume: controller.resume,
    subscribe: controller.subscribe
  }
}
