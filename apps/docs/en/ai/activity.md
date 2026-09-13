# AgentActivity

Unified activity stream for reasoning, searches, tools, and traces.

## Demo

<AgentComponentDemo component="activity" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentActivity } from '@/components/agent-ui'
</script>

<template>
  <AgentActivity title="Agent 活动" :items="activity" />
</template>
```

## Props

| Prop    | Type                  | Default          | Description    |
| ------- | --------------------- | ---------------- | -------------- |
| `items` | `AgentActivityItem[]` | `[]`             | Activity items |
| `title` | `string`              | `Agent activity` | Title          |

## Events

None.

::: info Target notes

| Target | Import                                                        |
| ------ | ------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                     |
| weapp  | Default export from `@/components/agent-ui/AgentActivity.vue` |

:::
