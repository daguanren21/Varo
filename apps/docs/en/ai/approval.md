# AgentApproval

A card for human approval, with choices, rejection, and confirmation.

## Demo

<AgentComponentDemo component="approval" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentApproval } from '@/components/agent-ui'
</script>

<template>
  <AgentApproval v-model:value="value" title="确认发布" :choices="choices" />
</template>
```

## Props

| Prop          | Type            | Default    | Description      |
| ------------- | --------------- | ---------- | ---------------- |
| `approveText` | `string`        | `确认`     | Approve label    |
| `choices`     | `AgentChoice[]` | `[]`       | Approval choices |
| `description` | `string`        | `—`        | Description      |
| `disabled` | `boolean` | `false` | Prevent selection, approval and rejection for ineligible or submitting transactions |
| `rejectText`  | `string`        | `拒绝`     | Reject label     |
| `title`       | `string`        | `required` | Approval title   |
| `value`       | `string`        | `''`       | Current choice   |

## Events

| Event          | Payload  | Description   |
| -------------- | -------- | ------------- |
| `approve`      | `string` | Approved      |
| `reject`       | `void`   | Rejected      |
| `update:value` | `string` | Update choice |

The standalone card's `approve` string is the selected value; `reject` has no payload. This differs from the interrupt ID contract of [AgentEventRenderer](./event-renderer) and AgentChat forwarding it. Import `AgentChoice` from Registry `@/components/agent-ui/types`, not a core protocol. To associate the card with an SDK approval, the application stores the interrupt ID separately and resolves the matching `tool-approval` with `true` / `false`; a choice value is not an interrupt ID. The card performs no requests, tool execution, or authorization.

## Slots

| Slot      | Description        |
| --------- | ------------------ |
| `default` | Additional content |

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentApproval.vue` |

:::
