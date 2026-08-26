import type { AgentEventChannel, AgentStreamEvent } from './types'

export function createAgentEventChannel(): AgentEventChannel {
  const queue: AgentStreamEvent[] = []
  let ended = false
  let failure: Error | undefined
  let wake: (() => void) | undefined

  async function* iterate(): AsyncGenerator<AgentStreamEvent> {
    while (!ended || queue.length > 0) {
      if (failure) throw failure
      const event = queue.shift()
      if (event) {
        yield event
        continue
      }

      await new Promise<void>((resolve) => {
        wake = resolve
      })
      wake = undefined
    }
    if (failure) throw failure
  }

  function notify() {
    wake?.()
  }

  return {
    end() {
      ended = true
      notify()
    },
    fail(error) {
      failure = error instanceof Error ? error : new Error(String(error))
      ended = true
      notify()
    },
    push(event) {
      if (ended) return
      queue.push(event)
      notify()
    },
    source: {
      [Symbol.asyncIterator]: iterate
    }
  }
}
