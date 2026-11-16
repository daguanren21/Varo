# AgentToolApproval

Review tool details and choose: allow once, remember access, or deny execution.

## Demo

<AgentComponentDemo component="tool-approval" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentToolApproval } from '@/components/agent-ui'
</script>

<template>
  <AgentToolApproval tool="npm.publish" :details="details" @allow="allow" />
</template>
```

The card emits application intents only. `remember` records a user choice; it neither persists permissions nor automatically approves future operations. For TanStack tool approval, the application associates the card with an interrupt ID, finds the current resolvable `tool-approval` in SDK `getInterrupts()`, and maps allow/deny to `resolveInterrupt(true)` / `resolveInterrupt(false)`. Business authorization, remembered-policy handling, and tool execution belong to the application and server. See [AgentEventRenderer](./event-renderer) for renderer events carrying interrupt IDs directly.

## Props

| Prop          | Type                 | Default    | Description     |
| ------------- | -------------------- | ---------- | --------------- |
| `tool`        | `string`             | `required` | Tool name       |
| `description` | `string`             | `—`        | Description     |
| `details`     | `{ label; value }[]` | `[]`       | Tool details    |
| `remember`    | `boolean`            | `false`    | Remember access |

## Events

| Event             | Payload                 | Description     |
| ----------------- | ----------------------- | --------------- |
| `allow`           | `{ remember: boolean }` | Allow           |
| `deny`            | `void`                  | Deny            |
| `update:remember` | `boolean`               | Update remember |

::: info Target notes

| Target | Import                                                            |
| ------ | ----------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                         |
| weapp  | Default export from `@/components/agent-ui/AgentToolApproval.vue` |

:::
