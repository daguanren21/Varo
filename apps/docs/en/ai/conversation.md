# AgentConversation

`messages` accepts `AgentConversationEntry[]`: either static `AgentConversationMessage` entries or full TanStack `UIMessage` entries. SDK text, reasoning, tool calls and results retain part order instead of being flattened into history strings. `agentConversationHistory(snapshot)` preserves historical message references; pass `contextMessages=snapshot.messages` to associate tool results across messages. [AgentEventRenderer](./event-renderer) renders the active message. Components own neither a writable transcript nor tool execution.

## Demo

<AgentComponentDemo component="conversation" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentConversation } from '@/components/agent-ui'
import type { AgentConversationMessage } from '@/components/agent-ui/types'

const messages: AgentConversationMessage[] = [
  { id: 'history-1', role: 'assistant', content: 'A saved static response.' },
]
</script>

<template>
  <AgentConversation :messages="messages" />
</template>
```

## Props

| Prop       | Type                         | Default | Description |
| ---------- | ---------------------------- | ------- | ----------- |
| `messages` | `readonly AgentConversationEntry[]` | `[]` | Static or full SDK messages |
| `contextMessages` | `readonly UIMessage[]` | Omitted | Full SDK transcript for cross-message tool-result matching |

## Events

None.

::: info Target notes

| Target | Import                                        |
| ------ | --------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`     |
| weapp  | `@/components/agent-ui/AgentConversation.vue` |

:::
