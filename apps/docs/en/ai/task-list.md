# AgentTaskList

Agent plan, task progress, and completion count.

## Demo

<AgentComponentDemo component="task-list" locale="en" />

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
import { AgentTaskList } from '@/components/agent-ui'
</script>

<template>
  <AgentTaskList title="执行计划" :tasks="tasks" />
</template>
```

## Props

| Prop    | Type          | Default    | Description |
| ------- | ------------- | ---------- | ----------- |
| `tasks` | `AgentTask[]` | `[]`       | Task list   |
| `title` | `string`      | `执行进度` | Title       |

## Events

None.

## Target Notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentTaskList.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
