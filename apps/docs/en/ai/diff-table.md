# AgentDiffTable

AI-proposed additions, removals, and updates for structured tables.

## Demo

<AgentComponentDemo component="diff-table" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentDiffTable } from '@/components/agent-ui'
</script>

<template>
  <AgentDiffTable :columns="columns" :rows="changedRows" />
</template>
```

## Props

| Prop      | Type                 | Default            | Description  |
| --------- | -------------------- | ------------------ | ------------ |
| `columns` | `AgentTableColumn[]` | `[]`               | Columns      |
| `rows`    | `AgentTableRow[]`    | `[]`               | Changed rows |
| `title`   | `string`             | `Proposed changes` | Title        |

## Events

| Event    | Payload         | Description |
| -------- | --------------- | ----------- |
| `accept` | `void`          | Accept      |
| `reject` | `void`          | Reject      |
| `select` | `AgentTableRow` | Select row  |

::: info Target notes

| Target | Import                                                         |
| ------ | -------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                      |
| weapp  | Default export from `@/components/agent-ui/AgentDiffTable.vue` |

:::
