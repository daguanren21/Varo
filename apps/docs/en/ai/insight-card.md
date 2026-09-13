# AgentInsightCard

Paged Agent insights with metrics and action suggestions.

## Demo

<AgentComponentDemo component="insight-card" locale="en" />

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

::: info Target notes

| Target | Import                                                           |
| ------ | ---------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                        |
| weapp  | Default export from `@/components/agent-ui/AgentInsightCard.vue` |

:::
