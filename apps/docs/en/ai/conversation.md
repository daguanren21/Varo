# AgentConversation

Conversation list for message history and active responses.

## Demo

<AgentComponentDemo component="conversation" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

## Target Notes

| Target     | Import                                        |
| ---------- | --------------------------------------------- |
| H5         | Named export from `@/components/agent-ui`     |
| weapp-vite | `@/components/agent-ui/AgentConversation.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
