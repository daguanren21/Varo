# AgentEventRenderer

Projects AgentStreamSnapshot into reasoning, tools, response, and approval UI.

## Demo

<AgentComponentDemo component="event-renderer" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentEventRenderer } from '@/components/agent-ui'
</script>

<template>
  <AgentEventRenderer :snapshot="snapshot" @approve="approve" />
</template>
```

## Props

| Prop       | Type                  | Default    | Description           |
| ---------- | --------------------- | ---------- | --------------------- |
| `snapshot` | `AgentStreamSnapshot` | `required` | Event stream snapshot |

## Events

| Event     | Payload  | Description |
| --------- | -------- | ----------- |
| `approve` | `string` | Approve     |
| `reject`  | `void`   | Reject      |
| `retry`   | `void`   | Retry       |

## Slots

| Slot      | Description        |
| --------- | ------------------ |
| `actions` | Completion actions |
| `default` | Trailing content   |

::: info Target notes

| Target | Import                                         |
| ------ | ---------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`      |
| weapp  | `@/components/agent-ui/AgentEventRenderer.vue` |

:::
