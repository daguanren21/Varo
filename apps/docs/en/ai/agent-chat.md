# AgentChat Block

Combines a header, message history, event rendering, approvals, and prompt input in one conversation block.

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
# Use --target weapp in a native Wevu project
```

There is no `components/agent-ui` prerequisite. This Block installs conversation and its required dependencies, without advanced, RAG, fine-tune, or workspace UI. Install the npm dependencies listed by the CLI separately; configure native global styles through [Wevu Registry](/en/guide/shadcn-mode). Handle approval, rejection, retry, and cancellation events in your application. The Block does not perform network requests or process approvals automatically.

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

`v-model` is optional: without it, the Block keeps an initially empty draft; with it, the parent manages the draft, including an empty string. `submit` emits trimmed text without clearing it. The parent can set the bound value to `''` after accepting submission. Busy, disabled, or whitespace-only input does not submit.

Both renderers check whether `modelValue` is supplied. With only `:model-value="''"` and no update listener, the draft remains controlled and unaccepted edits cannot submit.

Native input remains editable while `busy` but cannot submit; `disabled` also blocks editing. H5 disables input while busy. Native playground `pages/chat-prompt/index` uses native components to demonstrate local drafts, parent rejection/acceptance, external reset, and draft retention while busy, without jsdom layout simulation.

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
