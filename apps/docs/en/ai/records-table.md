# AgentRecordsTable

Agent records table with sorting and selection.

## Demo

<AgentComponentDemo component="records-table" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentRecordsTable } from '@/components/agent-ui'
</script>

<template>
  <AgentRecordsTable :columns="columns" :rows="rows" @sort="sort" />
</template>
```

## Props

| Prop            | Type                 | Default | Description    |
| --------------- | -------------------- | ------- | -------------- |
| `columns`       | `AgentTableColumn[]` | `[]`    | Columns        |
| `rows`          | `AgentTableRow[]`    | `[]`    | Rows           |
| `sortBy`        | `string`             | `—`     | Sort key       |
| `sortDirection` | `'asc' \| 'desc'`    | `asc`   | Sort direction |

## Events

| Event    | Payload            | Description |
| -------- | ------------------ | ----------- |
| `select` | `AgentTableRow`    | Select row  |
| `sort`   | `AgentTableColumn` | Sort        |

::: info Target notes

| Target | Import                                                            |
| ------ | ----------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                         |
| weapp  | Default export from `@/components/agent-ui/AgentRecordsTable.vue` |

:::
