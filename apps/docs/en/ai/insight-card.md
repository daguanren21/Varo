# AgentInsightCard

Paged Agent insights with metrics and action suggestions.

## Demo

<AgentComponentDemo component="insight-card" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentInsightCard } from '@/components/agent-ui'
</script>

<template>
  <AgentInsightCard v-model:current="current" :insights="insights" />
</template>
```

## Props

| Prop       | Type                 | Default    | Description  |
| ---------- | -------------------- | ---------- | ------------ |
| `current`  | `number`             | `0`        | Current page |
| `insights` | `AgentInsightItem[]` | `[]`       | Insights     |
| `title`    | `string`             | `Insights` | Title        |

## Events

| Event            | Payload            | Description |
| ---------------- | ------------------ | ----------- |
| `action`         | `AgentInsightItem` | Run action  |
| `update:current` | `number`           | Update page |

## Target Notes

| Target | Import                                                           |
| ------ | ---------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                        |
| weapp  | Default export from `@/components/agent-ui/AgentInsightCard.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
