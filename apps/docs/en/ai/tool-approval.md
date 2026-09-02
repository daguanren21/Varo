# AgentToolApproval

Review tool details, allow once, remember access, or deny execution.

## Demo

<AgentComponentDemo component="tool-approval" locale="en" />

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

## Target Notes

| Target | Import                                                            |
| ------ | ----------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                         |
| weapp  | Default export from `@/components/agent-ui/AgentToolApproval.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
