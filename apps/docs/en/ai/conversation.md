# AgentConversation

Preserves the static-history presentation API `AgentConversationMessage[]`. Import this Registry type from `@/components/agent-ui/types`, not a core protocol. TanStack AI owns active chat. The application may derive a pure display projection from SDK messages, but must not create a second writable transcript here. Use [AgentEventRenderer](./event-renderer) for active snapshots and tool approvals.

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
| `messages` | `AgentConversationMessage[]` | `[]`    | Messages    |

## Events

None.

::: info Target notes

| Target | Import                                        |
| ------ | --------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`     |
| weapp  | `@/components/agent-ui/AgentConversation.vue` |

:::
