# AgentRecordsTable

Agent records table with sorting and selection.

## Demo

<AgentComponentDemo component="records-table" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

## Target Notes

| Target | Import                                                            |
| ------ | ----------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                         |
| weapp  | Default export from `@/components/agent-ui/AgentRecordsTable.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
