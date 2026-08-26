# AgentFlowchart

Agent workflow made of triggers, conditions, actions, and results.

## Demo

<AgentComponentDemo component="flowchart" locale="en" />

## Install

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `nodes` | `AgentFlowNode[]` | `[]` | Nodes |
| `title` | `string` | `Agent workflow` | Title |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `add` | `string \| undefined` | Add step |
| `select` | `AgentFlowNode` | Select node |

## Target Notes

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | Default export from `@/components/agent-ui/AgentFlowchart.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
