# AgentCommandSearch

Live-filtered Agent command search with empty state.

## Demo

<AgentComponentDemo component="command-search" locale="en" />

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

::: info Target notes

| Target | Import                                                             |
| ------ | ------------------------------------------------------------------ |
| H5     | Named export from `@/components/agent-ui`                          |
| weapp  | Default export from `@/components/agent-ui/AgentCommandSearch.vue` |

:::
