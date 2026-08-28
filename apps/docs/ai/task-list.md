# AgentTaskList

Agent 计划、任务进度和完成计数。

## 案例

<AgentComponentDemo component="task-list" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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

## 平台差异

| Target     | Import                                    |
| ---------- | ----------------------------------------- |
| H5         | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentTaskList.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
