import type { AgentEventChannel, AgentStreamEvent } from './types'

export function createAgentEventChannel(): AgentEventChannel {
  const queue: AgentStreamEvent[] = []
  let ended = false
  let failure: Error | undefined
  let wake: (() => void) | undefined

  function stopConsuming() {
    ended = true
    queue.length = 0
    notify()
  }

  async function* iterate(): AsyncGenerator<AgentStreamEvent> {
    try {
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
    } finally {
      stopConsuming()
    }
  }

  function createIterator(): AsyncIterator<AgentStreamEvent> {
    const iterator = iterate()
    return {
      next() {
        return iterator.next()
      },
      return() {
        stopConsuming()
        return iterator.return(undefined)
      }
    }
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
      [Symbol.asyncIterator]: createIterator
    }
  }
}
