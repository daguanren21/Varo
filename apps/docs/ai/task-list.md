# AgentTaskList

Agent 计划、任务进度和完成计数。

## 案例

<AgentComponentDemo component="task-list" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentTaskList } from '@/components/agent-ui'
</script>

<template>
  <AgentTaskList title="执行计划" :tasks="tasks" />
</template>
```

## Props

| Prop    | Type          | Default    | 说明     |
| ------- | ------------- | ---------- | -------- |
| `tasks` | `AgentTask[]` | `[]`       | 任务列表 |
| `title` | `string`      | `执行进度` | 标题     |

## Events

无。

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentTaskList.vue` |

:::
