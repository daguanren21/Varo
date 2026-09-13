# AgentRecordsTable

支持排序和选择的 Agent 记录表格。

## 案例

<AgentComponentDemo component="records-table" locale="zh" />

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

::: info 平台差异

| Target | Import                                                   |
| ------ | -------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                |
| weapp  | 默认导出自 `@/components/agent-ui/AgentRecordsTable.vue` |

:::
