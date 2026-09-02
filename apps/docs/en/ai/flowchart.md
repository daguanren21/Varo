# AgentFlowchart

Agent workflow made of triggers, conditions, actions, and results.

## Demo

<AgentComponentDemo component="flowchart" locale="en" />

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
import { AgentFlowchart } from '@/components/agent-ui'
</script>

<template>
  <AgentFlowchart title="发布工作流" :nodes="nodes" />
</template>
```

## Props

| Prop    | Type              | Default          | Description |
| ------- | ----------------- | ---------------- | ----------- |
| `nodes` | `AgentFlowNode[]` | `[]`             | Nodes       |
| `title` | `string`          | `Agent workflow` | Title       |

## Events

| Event    | Payload               | Description |
| -------- | --------------------- | ----------- |
| `add`    | `string \| undefined` | Add step    |
| `select` | `AgentFlowNode`       | Select node |

## Target Notes

| Target | Import                                                         |
| ------ | -------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                      |
| weapp  | Default export from `@/components/agent-ui/AgentFlowchart.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
