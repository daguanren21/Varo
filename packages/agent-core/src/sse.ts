import { createAgentEventChannel } from './event-channel'
import { parseAgentStreamEvent } from './event-parser'
import type { AgentStreamEvent } from './types'

export interface AgentSseEventSource {
  end: () => void
  fail: (error: unknown) => void
  feed: (chunk: string | ArrayBuffer | Uint8Array) => void
  source: AsyncIterable<AgentStreamEvent>
}

interface Utf8ChunkDecoder {
  decode: (chunk: Uint8Array, final?: boolean) => string
}

function createFallbackUtf8Decoder(): Utf8ChunkDecoder {
  let carry = new Uint8Array(0)

  return {
    decode(chunk, final = false) {
      const bytes = new Uint8Array(carry.length + chunk.length)
      bytes.set(carry)
      bytes.set(chunk, carry.length)
      let cursor = 0
      let result = ''

      while (cursor < bytes.length) {
        const first = bytes[cursor]
        if (first < 0x80) {
          result += String.fromCodePoint(first)
          cursor += 1
          continue
        }

        const size = first >= 0xf0 ? 4 : first >= 0xe0 ? 3 : first >= 0xc0 ? 2 : 1
        if (size === 1) {
          result += '\uFFFD'
          cursor += 1
          continue
        }
        if (cursor + size > bytes.length) break

        let codePoint = first & (size === 2 ? 0x1f : size === 3 ? 0x0f : 0x07)
        let valid = true
        for (let index = 1; index < size; index += 1) {
          const continuation = bytes[cursor + index]
          if ((continuation & 0xc0) !== 0x80) {
            valid = false
            break
          }
          codePoint = (codePoint << 6) | (continuation & 0x3f)
        }

        if (!valid || codePoint > 0x10ffff) {
          result += '\uFFFD'
          cursor += 1
          continue
        }

        result += String.fromCodePoint(codePoint)
        cursor += size
      }

      carry = bytes.slice(cursor)
      if (final && carry.length > 0) {
        result += '\uFFFD'
        carry = new Uint8Array(0)
      }
      return result
    }
  }
}

function createUtf8Decoder(): Utf8ChunkDecoder {
  if (typeof TextDecoder === 'function') {
    const decoder = new TextDecoder()
    return {
      decode(chunk, final = false) {
        return decoder.decode(chunk, { stream: !final })
      }
    }
  }
  return createFallbackUtf8Decoder()
}

function toBytes(chunk: ArrayBuffer | Uint8Array) {
  return chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk)
}

export function createAgentSseEventSource(): AgentSseEventSource {
  const channel = createAgentEventChannel()
  const decoder = createUtf8Decoder()
  const dataLines: string[] = []
  let textBuffer = ''
  let ended = false

  function clearBufferedInput() {
    dataLines.length = 0
    textBuffer = ''
  }

  function closeSource() {
    if (ended) return
    ended = true
    clearBufferedInput()
    channel.end()
  }

  function failSource(error: unknown) {
    if (ended) return
    ended = true
    clearBufferedInput()
    channel.fail(error)
  }

  function finishWith(event: AgentStreamEvent) {
    channel.push(event)
    closeSource()
  }

  function dispatch() {
    if (dataLines.length === 0 || ended) return
    const payload = dataLines.join('\n')
    dataLines.length = 0
    if (payload === '[DONE]') {
      finishWith({ type: 'done' })
      return
    }

    try {
      const event = parseAgentStreamEvent(JSON.parse(payload))
      if (event.type === 'done' || event.type === 'error') finishWith(event)
      else channel.push(event)
    } catch (error) {
      failSource(error)
    }
  }

  function processLine(line: string) {
    const normalized = line.endsWith('\r') ? line.slice(0, -1) : line
    if (normalized.length === 0) {
      dispatch()
      return
    }
    if (normalized.startsWith(':')) return
    if (normalized === 'data') {
      dataLines.push('')
      return
    }
    if (normalized.startsWith('data:')) {
      const value = normalized.slice(5)
      dataLines.push(value.startsWith(' ') ? value.slice(1) : value)
    }
  }

  function appendText(value: string) {
    if (ended) return
    textBuffer += value
    let lineEnd = textBuffer.indexOf('\n')
    while (lineEnd >= 0) {
      processLine(textBuffer.slice(0, lineEnd))
      if (ended) return
      textBuffer = textBuffer.slice(lineEnd + 1)
      lineEnd = textBuffer.indexOf('\n')
    }
  }

  return {
    end() {
      if (ended) return
      appendText(decoder.decode(new Uint8Array(0), true))
      if (ended) return
      if (textBuffer.length > 0) processLine(textBuffer)
      dispatch()
      closeSource()
    },
    fail(error) {
      failSource(error)
    },
    feed(chunk) {
      if (ended) return
      appendText(typeof chunk === 'string' ? chunk : decoder.decode(toBytes(chunk)))
    },
    source: channel.source
  }
}
