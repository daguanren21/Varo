# AgentDiffTable

AI-proposed additions, removals, and updates for structured tables.

## Demo

<AgentComponentDemo component="diff-table" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | `AgentTableColumn[]` | `[]` | Columns |
| `rows` | `AgentTableRow[]` | `[]` | Changed rows |
| `title` | `string` | `Proposed changes` | Title |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `accept` | `void` | Accept |
| `reject` | `void` | Reject |
| `select` | `AgentTableRow` | Select row |

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | Default export from `@/components/agent-ui/AgentDiffTable.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
