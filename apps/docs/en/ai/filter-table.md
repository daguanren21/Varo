# AgentFilterTable

Live Agent data filtering with status chips.

## Demo

<AgentComponentDemo component="filter-table" locale="en" />

## Install

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

Registry installs the UI component into your project, so import it from `@/components/agent-ui`; `@varo-ui/ai` provides the event protocol, stream controller, and Markdown primitives—not Vue/Wevu UI components.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentFilterTable } from '@/components/agent-ui'
</script>

<template>
  <AgentFilterTable v-model:filter="filter" :filters="filters" :columns="columns" :rows="rows" />
</template>
```

## Props

| Prop        | Type                  | Default     | Description                                            |
| ----------- | --------------------- | ----------- | ------------------------------------------------------ |
| `className` | `ClassValue`          | `undefined` | Root classes merged by the target-specific `cn` helper |
| `filter`    | `string`              | `all`       | Current filter                                         |
| `filters`   | `AgentFilterOption[]` | `[]`        | Filters                                                |
| `columns`   | `AgentTableColumn[]`  | `[]`        | Columns                                                |
| `rows`      | `AgentTableRow[]`     | `[]`        | Rows                                                   |
| `statusKey` | `string`              | `status`    | Status key                                             |

## Events

| Event           | Payload         | Description   |
| --------------- | --------------- | ------------- |
| `select`        | `AgentTableRow` | Select row    |
| `update:filter` | `string`        | Update filter |

## Target Notes

| Target | Import                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                                                                        |
| weapp  | Default export from `@/components/agent-ui/AgentFilterTable.vue`; types from `@/components/agent-ui/agent-table` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
