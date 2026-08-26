# AgentActivity

Unified activity stream for reasoning, searches, tools, and traces.

## Demo

<AgentComponentDemo component="activity" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentActivity } from '@/components/agent-ui'
</script>

<template>
  <AgentActivity title="Agent 活动" :items="activity" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `AgentActivityItem[]` | `[]` | Activity items |
| `title` | `string` | `Agent activity` | Title |

## Events

None.

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | Default export from `@/components/agent-ui/AgentActivity.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
