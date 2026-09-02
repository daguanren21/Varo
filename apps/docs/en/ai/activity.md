# AgentActivity

Unified activity stream for reasoning, searches, tools, and traces.

## Demo

<AgentComponentDemo component="activity" locale="en" />

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
import { AgentActivity } from '@/components/agent-ui'
</script>

<template>
  <AgentActivity title="Agent 活动" :items="activity" />
</template>
```

## Props

| Prop    | Type                  | Default          | Description    |
| ------- | --------------------- | ---------------- | -------------- |
| `items` | `AgentActivityItem[]` | `[]`             | Activity items |
| `title` | `string`              | `Agent activity` | Title          |

## Events

None.

## Target Notes

| Target | Import                                                        |
| ------ | ------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                     |
| weapp  | Default export from `@/components/agent-ui/AgentActivity.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
