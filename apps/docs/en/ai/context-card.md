# AgentContextCard

Retrieved knowledge chunks with source type and open actions.

## Demo

<AgentComponentDemo component="context-card" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentContextCard } from '@/components/agent-ui'
</script>

<template>
  <AgentContextCard title="检索上下文" :chunks="chunks" />
</template>
```

## Props

| Prop     | Type                  | Default             | Description    |
| -------- | --------------------- | ------------------- | -------------- |
| `chunks` | `AgentContextChunk[]` | `[]`                | Context chunks |
| `title`  | `string`              | `Retrieved context` | Title          |

## Events

| Event  | Payload             | Description |
| ------ | ------------------- | ----------- |
| `open` | `AgentContextChunk` | Open source |

::: info Target notes

| Target | Import                                                           |
| ------ | ---------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                        |
| weapp  | Default export from `@/components/agent-ui/AgentContextCard.vue` |

:::
