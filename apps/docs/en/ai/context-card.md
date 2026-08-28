# AgentContextCard

Retrieved knowledge chunks with source type and open actions.

## Demo

<AgentComponentDemo component="context-card" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

## Target Notes

| Target     | Import                                                           |
| ---------- | ---------------------------------------------------------------- |
| H5         | Named export from `@/components/agent-ui`                        |
| weapp-vite | Default export from `@/components/agent-ui/AgentContextCard.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
