import type { AgentConversationEntry } from './types'
import { provide, shallowRef, triggerRef, watch } from 'wevu'

export const agentToolDisclosureKey = Symbol('varo-agent-tool-disclosure')

type TranscriptSource = () => readonly AgentConversationEntry[] | undefined

/** Share native tool disclosure across the live and historical views of one transcript. */
export function provideAgentToolDisclosure(active: TranscriptSource, history: TranscriptSource, ...scope: (() => string | null | undefined)[]) {
  // Wevu does not proxy Sets; groups notify this ref after an in-place toggle.
  const openGroups = shallowRef(new Set<string>())
  provide(agentToolDisclosureKey, openGroups)
  if (scope.length) {
    watch(scope, () => {
      if (!openGroups.value.size) { return }
      openGroups.value.clear()
      triggerRef(openGroups)
    })
  }

  watch([active, history], (transcripts) => {
    const open = openGroups.value
    if (!open.size) { return }
    const removed = new Set(open)
    for (const transcript of transcripts) {
      if (!transcript) { continue }
      for (const message of transcript) {
        if (!('parts' in message)) { continue }
        for (const part of message.parts) {
          if (part.type === 'tool-call') { removed.delete(part.id) }
          else if (part.type === 'tool-result') { removed.delete(part.toolCallId) }
          if (!removed.size) { return }
        }
      }
    }
    for (const id of removed) { open.delete(id) }
    triggerRef(openGroups)
  })
}
