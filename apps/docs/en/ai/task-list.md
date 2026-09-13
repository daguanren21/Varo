# AgentTaskList

Agent plan, task progress, and completion count.

## Demo

<AgentComponentDemo component="task-list" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentTaskList } from '@/components/agent-ui'
</script>

<template>
  <AgentTaskList title="执行计划" :tasks="tasks" />
</template>
```

## Props

| Prop    | Type          | Default    | Description |
| ------- | ------------- | ---------- | ----------- |
| `tasks` | `AgentTask[]` | `[]`       | Task list   |
| `title` | `string`      | `执行进度` | Title       |

## Events

None.

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentTaskList.vue` |

:::
