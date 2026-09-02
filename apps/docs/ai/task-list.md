# AgentTaskList

Agent 计划、任务进度和完成计数。

## 案例

<AgentComponentDemo component="task-list" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

UI 组件由 Registry 安装到项目本地，因此从 `@/components/agent-ui` 导入；`@varo-ui/ai` 只提供事件协议、流控制和 Markdown 能力，不导出 Vue/Wevu UI 组件。

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

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentTaskList.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
