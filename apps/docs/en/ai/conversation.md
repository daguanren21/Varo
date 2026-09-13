# AgentConversation

Conversation list for message history and active responses.

## Demo

<AgentComponentDemo component="conversation" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentConversation } from '@/components/agent-ui'
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
