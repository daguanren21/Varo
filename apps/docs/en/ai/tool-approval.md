# AgentToolApproval

Review tool details, allow once, remember access, or deny execution.

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
