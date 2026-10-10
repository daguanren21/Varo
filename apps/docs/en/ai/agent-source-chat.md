# AgentSourceChat Block

An installable knowledge-scoped conversation: show source availability and selected scope, then retrieval progress, source receipts, answer citations, and a ticket-escalation entry. It composes the existing `AgentChat`, `AgentComposerScope`, `AgentRetrievalProgress`, `AgentSourceReceipt`, and `AgentCitations`. It does not own a connection, retrieval, or ticket executor.

## Installation

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-source-chat
# For a native Wevu application:
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-source-chat
```

Both targets install `src/components/blocks/agent-source-chat.vue` and the adjacent `agent-source-chat.types.ts`. Install the npm dependencies reported by the CLI separately.

Direct Registry dependencies are `blocks/agent-chat`, `components/agent-workspace`, `components/agent-advanced`, `components/button`, and `utils/primitives`. Citations explicitly opt into `agent-advanced`; this does not install the monolithic `components/agent-ui` entry or expand the basic `agent-chat` conversation closure. Source types remain owned by `agent-workspace`, and citation types by `agent-advanced`. Transitive dependencies include the Agent theme, conversation, presentation, and required base controls. Use the install plan rather than copying dependency files manually.

H5 installed source imports its full CSS dependency closure. For native, register every installed CSS file globally with `weapp.styles`, put `varo.css` first, and use `include: 'app.vue'`. Retain `styleIsolation: apply-shared`; do not import global CSS into component-local WXSS. See [Registry mode](/en/guide/shadcn-mode). Native code runs on `wevu`, not a Vue alias. The declared targets are only `h5` and `weapp`, not experimental-profile or device certification.

## Data and execution boundary

- The application supplies `sources`, `retrieval`, `receipts`, `citations`, `messages`, response state, and ticket eligibility. The Block never treats a click as external execution success or optimistically mutates those arrays.
- `AgentContextSource.status` remains `available | connecting | unavailable`. An omitted status means `available`, matching the existing component contract. Submission requires at least one enabled, available source. A connection intent does not authorize or enable a source automatically.
- Retrieval keeps `AgentRetrievalItem` and its `queued | reading | read | skipped | failed` states. Receipts keep `AgentSourceReceiptItem` and `read | skipped | failed`. An empty result can be “read, zero items”; an out-of-scope result can be “skipped.” The application supplies truthful results and explanations; the Block does not infer them from message text.
- `openCitation` carries the original `AgentCitationItem`. Its `url` is optional: an application-local document can be resolved by `id`. Supply only citations whose open intent the application can actually handle. The application owns authorization, URL safety, and host navigation. The Block does not call `window.open`, native navigation, or the network.
- `createTicket` only requests escalation. Approval, deduplication, actual creation, results, and persistence are application-owned. Remove `ticket` or set `busy` after accepting the request so the same request is not still offered during processing.
- There is no model, authentication, credential, server-side knowledge retrieval, ticket API, or storage implementation, and no fabricated success fallback.

## Minimal controlled example

This example presents a local empty result and records an escalation request without a real service. A real retrieval application should set `responseState='retrieving'` on submission, update retrieval items, and populate answers, receipts, and citations from actual results.

```vue
<script setup lang="ts">
import type { AgentConversationMessage } from '@/components/agent-ui/types'
import type { AgentContextSource } from '@/components/agent-ui/workspace-types'
import type { AgentSourceChatResponseState, AgentSourceChatTicketIntent } from '@/components/blocks/agent-source-chat.types'
import { shallowRef } from 'vue'
import AgentSourceChat from '@/components/blocks/agent-source-chat.vue'
import { VButton } from '@/components/ui/button'

const open = shallowRef(true)
const prompt = shallowRef('')
const sources = shallowRef<AgentContextSource[]>([
  { id: 'local', label: 'Local demo material', enabled: true, status: 'available' },
])
const messages = shallowRef<AgentConversationMessage[]>([])
const state = shallowRef<AgentSourceChatResponseState>('idle')
const ticket = shallowRef<AgentSourceChatTicketIntent>()
const notice = shallowRef('Local empty-result demo. No external service is connected.')

function submit(question: string) {
  messages.value = [{ id: 'question', role: 'user', content: question }]
  prompt.value = ''
  state.value = 'empty'
  ticket.value = { question, reason: 'empty', sourceIds: ['local'] }
  notice.value = 'The local demo material is empty. You can request escalation.'
}
function toggleSource(source: AgentContextSource, enabled: boolean) {
  sources.value = sources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
}
function requestTicket(intent: AgentSourceChatTicketIntent) {
  notice.value = `Escalation requested: ${intent.question}. This example did not create a ticket.`
  ticket.value = undefined
}
function reset() {
  prompt.value = ''
  messages.value = []
  state.value = 'idle'
  ticket.value = undefined
  notice.value = 'Local conversation cleared.'
}
</script>

<template>
  <AgentSourceChat
    v-if="open" v-model="prompt" :sources="sources" :messages="messages"
    :response-state="state" :response-detail="notice" :ticket="ticket"
    @submit="submit" @toggle-source="toggleSource" @create-ticket="requestTicket"
    @new-conversation="reset" @close="open = false"
  />
  <VButton v-else @click="open = true">
    Open knowledge chat
  </VButton>
</template>
```

For native pages, import reactivity from `wevu`, default-import the button from `@/components/ui/v-button.vue`, and use `@toggleSource`, `@createTicket`, and `@newConversation`. Multi-value native events carry one tuple:

```ts
function toggleSource([source, enabled]: [AgentContextSource, boolean]) {
  sources.value = sources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
}
```

## Props

| Prop             | Type                           | Default / meaning                                                                               |
| ---------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `modelValue`     | `string`                       | Optional; omission retains a local draft, while `''` is a controlled empty value                |
| `sources`        | `AgentContextSource[]`         | `[]`; application-owned availability and scope                                                  |
| `retrieval`      | `AgentRetrievalItem[]`         | `[]`; `retryable` is application-granted retry eligibility                                      |
| `receipts`       | `AgentSourceReceiptItem[]`     | `[]`; read, skipped, failed, and optional `itemCount`                                           |
| `citations`      | `AgentCitationItem[]`          | `[]`; the application must be able to handle each supplied citation's open intent               |
| `messages`       | `AgentConversationMessage[]`   | `[]`; passed to the existing `AgentChat`                                                        |
| `responseState`  | `AgentSourceChatResponseState` | `'idle'`                                                                                        |
| `responseDetail` | `string`                       | `''`; application-supplied result, error, or scope explanation                                  |
| `ticket`         | `AgentSourceChatTicketIntent`  | Omitted; valid escalation context for the current result enables the button                     |
| `busy`           | `boolean`                      | `false`; `responseState='retrieving'` also makes the Block busy                                 |
| `disabled`       | `boolean`                      | `false`; disables mutations, submission, source opening, and escalation without hiding evidence |
| `contextUsage`   | `number`                       | `0`; percentage passed to the scope component, not a token estimate made by the Block           |
| `suggestions`    | `string[]`                     | `[]`; existing Chat prompt suggestions                                                          |
| `title`          | `string`                       | `'知识来源对话'`                                                                                |

```ts
export type AgentSourceChatResponseState
  = | 'idle' | 'retrieving' | 'answered' | 'empty' | 'out-of-scope' | 'failed'

export interface AgentSourceChatTicketIntent {
  question: string
  reason: Extract<AgentSourceChatResponseState, 'empty' | 'out-of-scope' | 'failed'>
  sourceIds: string[]
}
```

These are Block presentation/escalation types, not an expansion of core `AgentPartStatus`. The ticket `reason` must match the current `responseState`, and `question.trim()` must be nonempty. `sourceIds` records the application's request scope; the Block does not reinterpret it as authorization.

## Events and guards

| Event               | Payload                                              | Eligibility                                                                                   |
| ------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `update:modelValue` | `string`                                             | Editing is allowed and the value changes; no automatic draft clearing                         |
| `submit`            | `string`                                             | Trimmed, nonempty input; at least one enabled, available source; not busy or disabled         |
| `toggleSource`      | H5: `(source, enabled)`; native: `[source, enabled]` | Current source exists, is available, and its enabled value changes; not busy or disabled      |
| `connectSource`     | `AgentContextSource`                                 | Current source is `unavailable`; not busy or disabled                                         |
| `retryRetrieval`    | `AgentRetrievalItem`                                 | Current item is `failed` and `retryable`; not busy or disabled                                |
| `openReceipt`       | `AgentSourceReceiptItem`                             | Current receipt is `read`; not busy or disabled                                               |
| `connectReceipt`    | `AgentSourceReceiptItem`                             | Current receipt is `failed`; not busy or disabled; does not claim connection success          |
| `openCitation`      | `AgentCitationItem`                                  | Citation remains in the current list; not busy or disabled                                    |
| `createTicket`      | `AgentSourceChatTicketIntent`                        | Valid `ticket` matches the current failed, empty, or out-of-scope state; not busy or disabled |
| `newConversation`   | None                                                 | Not busy or disabled, and a draft, message, or result exists; application clears its state    |
| `stop`              | None                                                 | Busy only; application cancels its real task/producer                                         |
| `close`             | None                                                 | Application closes the slice and cancels work as appropriate                                  |

The Block looks list items up by id in current props before checking eligibility, rather than forwarding a replaced stale object. `stop` and `close` retain Chat's cancellation/exit escape: **they remain available even when `disabled`**, so an active task cannot trap the user. Disabling or becoming busy leaves receipts and citations visible and disables their actions. Retrieval items and statuses are preserved rather than rewritten as success or non-retryable.

Omitting `modelValue` differs from passing `''`. Native uses `type: null, value: null` metadata and nullish presence checks. Submission does not clear an uncontrolled draft. Use `v-model` for application acceptance/rejection of updates, external clearing, or conversation-specific drafts. Native allows editing the next draft while busy but blocks submission; H5 retains the existing `AgentChat` behavior of disabling editing while busy.

## Local demo and acceptance scope

- H5: playground `/?demo=source-chat`, implemented by `SourceChatDemo.vue`.
- Native: `pages/source-chat/index`.
- Manual flow: change source availability → request and manually finish a **demo** connection → explicitly enable its scope → ask a question → queued/reading → success, failure, empty, or out-of-scope → open the local cited original or request escalation.
- Disabled actions preserve evidence. After escalation, the application removes the eligibility object and prevents another request. Switching to uncontrolled input demonstrates a local draft versus a controlled empty string.

Real E2E scenarios live in `apps/e2e/tests/h5/source-chat.e2e.ts` and `apps/e2e/tests/weapp-native/source-chat.e2e.ts`. They operate real controls and inspect page state, without calling private component methods or using `setData` to simulate input. Native assertions cover native text, receipt/citation controls, and the local document preview; **they do not claim headless observation of Chat's rich-text message body**. The unreleased Wevu plain-slot protocol and real-host observation limits still require independent acceptance. No context bridge, fake geometry, or copied message text is used to bypass them.
