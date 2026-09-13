# AgentFilterTable

使用状态 chips 实时过滤 Agent 数据。

## 案例

<AgentComponentDemo component="filter-table" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentFilterTable } from '@/components/agent-ui'
</script>

<template>
  <AgentFilterTable v-model:filter="filter" :filters="filters" :columns="columns" :rows="rows" />
</template>
```

## Props

| Prop        | Type                  | Default     | 说明                               |
| ----------- | --------------------- | ----------- | ---------------------------------- |
| `className` | `ClassValue`          | `undefined` | 通过目标对应的 `cn` 合并根节点样式 |
| `filter`    | `string`              | `all`       | 当前筛选                           |
| `filters`   | `AgentFilterOption[]` | `[]`        | 筛选项                             |
| `columns`   | `AgentTableColumn[]`  | `[]`        | 列                                 |
| `rows`      | `AgentTableRow[]`     | `[]`        | 记录                               |
| `statusKey` | `string`              | `status`    | 状态字段                           |

## Events

| Event           | Payload         | 说明     |
| --------------- | --------------- | -------- |
| `select`        | `AgentTableRow` | 选择行   |
| `update:filter` | `string`        | 更新筛选 |

::: info 平台差异

| Target | Import                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                                                             |
| weapp  | 默认导出自 `@/components/agent-ui/AgentFilterTable.vue`；类型来自 `@/components/agent-ui/agent-table` |

:::
