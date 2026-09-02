# AgentEventRenderer

Projects AgentStreamSnapshot into reasoning, tools, response, and approval UI.

## Demo

<AgentComponentDemo component="event-renderer" locale="en" />

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

## Target Notes

| Target | Import                                         |
| ------ | ---------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`      |
| weapp  | `@/components/agent-ui/AgentEventRenderer.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
