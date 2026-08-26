# AgentEventRenderer

Projects AgentStreamSnapshot into reasoning, tools, response, and approval UI.

## Demo

<AgentComponentDemo component="event-renderer" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `snapshot` | `AgentStreamSnapshot` | `required` | Event stream snapshot |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `approve` | `string` | Approve |
| `reject` | `void` | Reject |
| `retry` | `void` | Retry |

## Slots

| Slot | Description |
| --- | --- |
| `actions` | Completion actions |
| `default` | Trailing content |

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentEventRenderer.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
