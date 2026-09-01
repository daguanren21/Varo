# AgentSelectionActions

Agent actions such as explain, improve, or shorten for selected text.

## Demo

<AgentComponentDemo component="selection-actions" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentSelectionActions } from '@/components/agent-ui'
</script>

<template>
  <AgentSelectionActions :text="selectedText" :actions="actions" />
</template>
```

## Props

| Prop      | Type                     | Default    | Description   |
| --------- | ------------------------ | ---------- | ------------- |
| `text`    | `string`                 | `required` | Selected text |
| `actions` | `AgentSelectionAction[]` | `[]`       | Actions       |

## Events

| Event    | Payload            | Description     |
| -------- | ------------------ | --------------- |
| `select` | `{ action; text }` | Action selected |

## Target Notes

| Target | Import                                                                |
| ------ | --------------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                             |
| weapp  | Default export from `@/components/agent-ui/AgentSelectionActions.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
