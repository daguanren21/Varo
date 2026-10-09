# AgentChat Block

Complete block composing header, history, events, approval, and prompt input.

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
# Use --target weapp in a native Wevu project
```

There is no `components/agent-ui` prerequisite. This Block installs conversation and its required dependencies, without advanced, RAG, fine-tune, or workspace UI. Install the npm dependencies reported by the CLI separately; configure native global styles through [Wevu Registry](/en/guide/shadcn-mode). Approval, rejection, retry, and cancellation intents do not execute networking or approval policy; that remains application-owned.

## Demo

<AgentComponentDemo component="agent-chat" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import type { AgentConversationMessage } from '@/components/agent-ui/types'
import { shallowRef } from 'vue' // Import from wevu in native pages
import AgentChat from '@/components/blocks/agent-chat.vue'

const open = shallowRef(true)
const prompt = shallowRef('')
const messages = shallowRef<AgentConversationMessage[]>([])
let sequence = 0
function send(content: string) {
  messages.value = [...messages.value, { id: String(++sequence), role: 'user', content }]
  prompt.value = ''
}
function newConversation() {
  messages.value = []
  prompt.value = ''
}
</script>

<template>
  <AgentChat v-if="open" v-model="prompt" :messages="messages" @submit="send" @new-conversation="newConversation" @close="open = false" />
  <button v-else @click="open = true">
    Open conversation
  </button>
</template>
```

`v-model` is optional. Without a binding, the Block owns an initially empty draft. With a binding, the parent owns the draft, including an explicit empty string. `submit` emits trimmed text without clearing the draft; the parent can set its bound value to `''` after accepting the submission. Busy, disabled or whitespace-only input does not submit.

Both renderers determine ownership from the presence of `modelValue`. Passing only `:model-value="''"` without an update listener still keeps the prompt controlled; unaccepted edits cannot be submitted.

Native input stays editable while `busy`, allowing a next draft without submitting it; `disabled` also prevents editing. H5 retains its existing disabled-input behavior while busy. Native playground route `pages/chat-prompt/index` demonstrates local drafts, parent rejection/acceptance, external reset, and draft retention while busy using actual native components rather than jsdom layout simulation.

This example only stores local messages; it does not connect a model. Wire `newConversation` and `close` to real application state transitions. When supplying `busy` and a streaming `snapshot`, also wire `stop` to cancel the producer/network operation. Disabled input does not disable stopping an active operation. The Block follows content growth only within 64px of the bottom and preserves the position while reading above.

## Props

| Prop              | Type                         | Default      | Description                                                        |
| ----------------- | ---------------------------- | ------------ | ------------------------------------------------------------------ |
| `modelValue`      | `string`                     | `—`          | Controlled when provided; otherwise an initially empty local draft |
| `busy`            | `boolean`                    | `false`      | Busy                                                               |
| `disabled`        | `boolean`                    | `false`      | Disable editing, submission and history changes, not stop          |
| `closeLabel`      | `string`                     | `关闭 Agent` | Close button name                                                  |
| `layout`          | `'panel' \| 'page'`          | `'panel'`    | Panel or page layout                                               |
| `history`         | `AgentChatHistoryItem[]`     | `[]`         | Application-supplied `{ id, title }` history entries               |
| `activeHistoryId` | `string`                     | `—`          | Currently selected entry                                           |
| `messages`        | `AgentConversationMessage[]` | `[]`         | Messages                                                           |
| `snapshot`        | `AgentStreamSnapshot`        | `—`          | Snapshot                                                           |
| `subtitle`        | `string`                     | `—`          | Subtitle                                                           |
| `suggestions`     | `string[]`                   | `[]`         | Suggestions                                                        |
| `title`           | `string`                     | `Varo Agent` | Title                                                              |

## Events

| Event               | Payload  | Description                                                                                 |
| ------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `approve`           | `string` | Approve                                                                                     |
| `close`             | `void`   | Close                                                                                       |
| `historySelect`     | `string` | Ask the application to select a history id; blocked while busy/disabled or already selected |
| `newConversation`   | `void`   | Ask the application to clear the current conversation                                       |
| `stop`              | `void`   | Ask the application to cancel generation (shown only while busy)                            |
| `reject`            | `void`   | Reject                                                                                      |
| `retry`             | `void`   | Retry                                                                                       |
| `submit`            | `string` | Submit                                                                                      |
| `update:modelValue` | `string` | Update prompt                                                                               |

::: info Target notes

| Target | Import                               |
| ------ | ------------------------------------ |
| H5     | `@/components/blocks/agent-chat.vue` |
| weapp  | `@/components/blocks/agent-chat.vue` |

:::
