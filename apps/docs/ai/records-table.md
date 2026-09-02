# AgentRecordsTable

支持排序和选择的 Agent 记录表格。

## 案例

<AgentComponentDemo component="records-table" locale="zh" />

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
import { AgentRecordsTable } from '@/components/agent-ui'
</script>

<template>
  <AgentRecordsTable :columns="columns" :rows="rows" @sort="sort" />
</template>
```

## Props

| Prop            | Type                 | Default | 说明     |
| --------------- | -------------------- | ------- | -------- |
| `columns`       | `AgentTableColumn[]` | `[]`    | 列       |
| `rows`          | `AgentTableRow[]`    | `[]`    | 记录     |
| `sortBy`        | `string`             | `—`     | 排序字段 |
| `sortDirection` | `'asc' \| 'desc'`    | `asc`   | 排序方向 |

## Events

| Event    | Payload            | 说明     |
| -------- | ------------------ | -------- |
| `select` | `AgentTableRow`    | 选择记录 |
| `sort`   | `AgentTableColumn` | 排序     |

## 平台差异

| Target | Import                                                   |
| ------ | -------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                |
| weapp  | 默认导出自 `@/components/agent-ui/AgentRecordsTable.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
