# AgentSelectionActions

Agent actions such as explain, improve, or shorten for selected text.

## Demo

<AgentComponentDemo component="selection-actions" locale="en" />

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

::: info Target notes

| Target | Import                                                                |
| ------ | --------------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                             |
| weapp  | Default export from `@/components/agent-ui/AgentSelectionActions.vue` |

:::
