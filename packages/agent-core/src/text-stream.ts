import type { TextStreamController, TextStreamOptions, TextStreamSnapshot } from './types'
import { createSmoothMarkdownStream } from 'markstream-core'

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
  return Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(value), item => item.segment)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hasUnclosedFence(value: string) {
  let marker: '`' | '~' | undefined
  let markerLength = 0
  for (const line of value.split(/\r?\n/)) {
    const match = /^ {0,3}(`{3,}|~{3,})/.exec(line)
    if (!match) { continue }
    const nextMarker = match[1][0] as '`' | '~'
    const nextLength = match[1].length
    if (!marker) {
      marker = nextMarker
      markerLength = nextLength
    }
    else if (marker === nextMarker && nextLength >= markerLength) {
      marker = undefined
      markerLength = 0
    }
  }
  return marker !== undefined
}

function fenceSafeCommitCount(visible: string, source: string, segments: string[]) {
  if (segments.length === 0) { return 0 }
  const candidate = visible + segments.join('')
  const lineStart = candidate.lastIndexOf('\n') + 1
  const candidateLine = candidate.slice(lineStart)
  const sourceLineEnd = source.indexOf('\n', lineStart)
  const sourceLine = source.slice(lineStart, sourceLineEnd < 0 ? source.length : sourceLineEnd)
  const match = /^ {0,3}(`+|~+)/.exec(sourceLine)
  if (!match) { return segments.length }

  const marker = match[1]
  const unresolvedCandidate = marker.length < 3 && sourceLine.trim() === marker
  const completeFence = marker.length >= 3
  if ((unresolvedCandidate || completeFence) && /^ {0,3}(?:`+|~+)/.test(candidateLine)) {
    return 0
  }
  return segments.length
}

function createTimerTextStream(options: TextStreamOptions = {}): TextStreamController {
  const minCharsPerSecond = Math.max(1, options.minCharsPerSecond ?? 40)
  const maxCharsPerSecond = Math.max(minCharsPerSecond, options.maxCharsPerSecond ?? 1000)
  const targetLatencyMs = Math.max(1, options.targetLatencyMs ?? 900)
  const catchUpLatencyMs = Math.max(1, options.catchUpLatencyMs ?? 350)
  const maxCommitFps = Math.max(1, Math.min(30, options.maxCommitFps ?? 30))
  const maxCharsPerCommit = Math.max(1, options.maxCharsPerCommit ?? 80)
  const catchUpThreshold = Math.max(0, options.catchUpThreshold ?? 600)
  const startDelayMs = Math.max(0, options.startDelayMs ?? 80)
  const flushOnFinish = options.flushOnFinish ?? false
  const burstInitialContent = options.burstInitialContent ?? false
  const burstRevealThresholdChars = Math.max(1, options.burstRevealThresholdChars ?? 2048)
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
  let firstPendingAt = 0
  let budget = 0

  function pendingCount() {
    return pending.length - pendingOffset
  }

  function snapshot(): TextStreamSnapshot {
    const pendingChars = Math.max(0, source.length - visible.length)
    return {
      caughtUp: pendingCount() === 0,
      done,
      final: done && pendingCount() === 0,
      paused,
      pendingChars,
      source,
      visible,
    }
  }

  function emit() {
    listeners.forEach(listener => listener())
  }

  function compactPending() {
    if (pendingOffset < 1024 || pendingOffset * 2 < pending.length) { return }
    pending.splice(0, pendingOffset)
    pendingOffset = 0
  }

  function schedule() {
    if (destroyed || paused || timer || pendingCount() === 0) { return }
    // The scheduler and tick callback are mutually recursive by design.
    // eslint-disable-next-line ts/no-use-before-define
    timer = setTimeout(tick, Math.ceil(1000 / maxCommitFps))
  }

  function tick() {
    timer = undefined
    if (destroyed || paused) { return }

    const now = Date.now()
    if (firstPendingAt && now - firstPendingAt < startDelayMs) {
      schedule()
      return
    }
    firstPendingAt = 0

    const deltaMs = Math.max(1, now - lastTick)
    lastTick = now
    const backlog = pendingCount()
    if (backlog === 0) {
      emit()
      return
    }

    const latencyMs = backlog >= catchUpThreshold ? catchUpLatencyMs : targetLatencyMs
    const latencyCps = (backlog * 1000) / latencyMs
    const cps = clamp(latencyCps, minCharsPerSecond, maxCharsPerSecond)
    budget += (cps * deltaMs) / 1000
    const commitCount = Math.min(backlog, maxCharsPerCommit, Math.max(1, Math.floor(budget)))
    let proposedSegments = pending.slice(pendingOffset, pendingOffset + commitCount)
    let safeCommitCount = fenceSafeCommitCount(visible, source, proposedSegments)
    if (safeCommitCount === 0) {
      const newlineOffset = pending.slice(pendingOffset).findIndex(segment => segment.includes('\n'))
      if (newlineOffset >= 0) {
        proposedSegments = pending.slice(pendingOffset, pendingOffset + newlineOffset + 1)
        safeCommitCount = fenceSafeCommitCount(visible, source, proposedSegments)
      }
    }
    if (safeCommitCount === 0) {
      emit()
      schedule()
      return
    }
    budget = Math.max(0, budget - safeCommitCount)
    visible += proposedSegments.slice(0, safeCommitCount).join('')
    pendingOffset += safeCommitCount
    compactPending()
    emit()
    schedule()
  }

  function cancelTimer() {
    clearTimeout(timer)
    timer = undefined
  }

  function destroy() {
    if (destroyed) { return }
    destroyed = true
    cancelTimer()
    pending.length = 0
    listeners.clear()
  }

  return {
    destroy,
    dispose: destroy,
    enqueue(chunk) {
      if (destroyed || !chunk) { return }
      if (done) { done = false }
      const initialChunk = source.length === 0
      source += chunk
      pending.push(...splitGraphemes(chunk))
      if (initialChunk) { firstPendingAt = Date.now() }
      lastTick = Date.now()

      if (
        initialChunk
        && burstInitialContent
        && pendingCount() >= burstRevealThresholdChars
        && !hasUnclosedFence(source)
      ) {
        visible = source
        pending.length = 0
        pendingOffset = 0
        firstPendingAt = 0
      }

      emit()
      schedule()
    },
    finish(finishOptions = {}) {
      if (destroyed) { return }
      done = true
      if (finishOptions.flush ?? flushOnFinish) {
        visible = source
        pending.length = 0
        pendingOffset = 0
        cancelTimer()
      }
      emit()
      schedule()
    },
    flush() {
      if (destroyed) { return }
      visible = source
      pending.length = 0
      pendingOffset = 0
      budget = 0
      cancelTimer()
      emit()
    },
    getSnapshot: snapshot,
    pause() {
      if (destroyed || paused) { return }
      paused = true
      cancelTimer()
      emit()
    },
    reset(content = '', _resetOptions = {}) {
      cancelTimer()
      source = content
      visible = content
      pending.length = 0
      pendingOffset = 0
      done = false
      paused = false
      budget = 0
      firstPendingAt = 0
      lastTick = Date.now()
      emit()
    },
    resume() {
      if (destroyed || !paused) { return }
      paused = false
      lastTick = Date.now()
      emit()
      schedule()
    },
    subscribe(listener) {
      if (destroyed) { return () => {} }
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export function createTextStream(options: TextStreamOptions = {}): TextStreamController {
  if (typeof requestAnimationFrame !== 'function' || typeof cancelAnimationFrame !== 'function') {
    return createTimerTextStream(options)
  }

  const controller = createSmoothMarkdownStream(options)
  return {
    destroy: controller.destroy,
    dispose: controller.dispose,
    enqueue: controller.enqueue,
    finish: controller.finish,
    flush: controller.flush,
    getSnapshot: controller.getSnapshot,
    pause: controller.pause,
    reset: controller.reset,
    resume: controller.resume,
    subscribe: controller.subscribe,
  }
}
