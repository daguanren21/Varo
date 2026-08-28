# AgentCommandSearch

Live-filtered Agent command search with empty state.

## Demo

<AgentComponentDemo component="command-search" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentCommandSearch } from '@/components/agent-ui'
</script>

<template>
  <AgentCommandSearch v-model="query" :items="commands" />
</template>
```

## Props

| Prop          | Type                | Default             | Description |
| ------------- | ------------------- | ------------------- | ----------- |
| `modelValue`  | `string`            | `''`                | Query       |
| `items`       | `AgentSearchItem[]` | `[]`                | Commands    |
| `placeholder` | `string`            | `Search commands…`  | Placeholder |
| `emptyText`   | `string`            | `No commands found` | Empty state |

## Events

| Event               | Payload           | Description    |
| ------------------- | ----------------- | -------------- |
| `select`            | `AgentSearchItem` | Select command |
| `update:modelValue` | `string`          | Update query   |

## Target Notes

| Target     | Import                                                             |
| ---------- | ------------------------------------------------------------------ |
| H5         | Named export from `@/components/agent-ui`                          |
| weapp-vite | Default export from `@/components/agent-ui/AgentCommandSearch.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
