# AgentDiffTable

展示 AI 对结构化表格提出的新增、删除和更新。

## 案例

<AgentComponentDemo component="diff-table" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentDiffTable } from '@/components/agent-ui'
</script>

<template>
  <AgentDiffTable :columns="columns" :rows="changedRows" />
</template>
```

## Props

| Prop      | Type                 | Default            | 说明   |
| --------- | -------------------- | ------------------ | ------ |
| `columns` | `AgentTableColumn[]` | `[]`               | 列     |
| `rows`    | `AgentTableRow[]`    | `[]`               | 变更行 |
| `title`   | `string`             | `Proposed changes` | 标题   |

## Events

| Event    | Payload         | 说明     |
| -------- | --------------- | -------- |
| `accept` | `void`          | 接受变更 |
| `reject` | `void`          | 拒绝变更 |
| `select` | `AgentTableRow` | 选择行   |

::: info 平台差异

| Target | Import                                                |
| ------ | ----------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`             |
| weapp  | 默认导出自 `@/components/agent-ui/AgentDiffTable.vue` |

:::
