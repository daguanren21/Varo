# AgentApproval

General human approval, choice, reject, and confirm card.

## Demo

<AgentComponentDemo component="approval" locale="en" />

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
| `rejectText`  | `string`        | `拒绝`     | Reject label     |
| `title`       | `string`        | `required` | Approval title   |
| `value`       | `string`        | `''`       | Current choice   |

## Events

| Event          | Payload  | Description   |
| -------------- | -------- | ------------- |
| `approve`      | `string` | Approved      |
| `reject`       | `void`   | Rejected      |
| `update:value` | `string` | Update choice |

## Slots

| Slot      | Description        |
| --------- | ------------------ |
| `default` | Additional content |

## Target Notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentApproval.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
