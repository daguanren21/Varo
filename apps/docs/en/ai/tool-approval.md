# AgentToolApproval

Review tool details, allow once, remember access, or deny execution.

## Demo

<AgentComponentDemo component="tool-approval" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tool` | `string` | `required` | Tool name |
| `description` | `string` | `—` | Description |
| `details` | `{ label; value }[]` | `[]` | Tool details |
| `remember` | `boolean` | `false` | Remember access |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `allow` | `{ remember: boolean }` | Allow |
| `deny` | `void` | Deny |
| `update:remember` | `boolean` | Update remember |

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | Default export from `@/components/agent-ui/AgentToolApproval.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
