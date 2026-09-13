# AgentFlowchart

Agent workflow made of triggers, conditions, actions, and results.

## Demo

<AgentComponentDemo component="flowchart" locale="en" />

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

::: info Target notes

| Target | Import                                                         |
| ------ | -------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                      |
| weapp  | Default export from `@/components/agent-ui/AgentFlowchart.vue` |

:::
