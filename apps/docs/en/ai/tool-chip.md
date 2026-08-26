# AgentToolChip

Compact tool name, summary, and execution status.

## Demo

<AgentComponentDemo component="tool-chip" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentToolChip } from '@/components/agent-ui'
</script>

<template>
  <AgentToolChip :tool="tool" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `compact` | `boolean` | `false` | Compact presentation |
| `tool` | `AgentToolPart` | `required` | Tool state |

## Events

None.

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentToolChip.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
