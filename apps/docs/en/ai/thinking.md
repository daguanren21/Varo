# AgentThinking

Collapsible reasoning, search, coding, and execution traces.

## Demo

<AgentComponentDemo component="thinking" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentThinking } from '@/components/agent-ui'
</script>

<template>
  <AgentThinking label="推理过程" :steps="steps" default-open />
</template>
```

## Props

| Prop          | Type               | Default          | Description                                            |
| ------------- | ------------------ | ---------------- | ------------------------------------------------------ |
| `className`   | `ClassValue`       | `undefined`      | Root classes merged by the target-specific `cn` helper |
| `label`       | `string`           | `Agent 执行轨迹` | Title                                                  |
| `open`        | `boolean`          | `undefined`      | Controlled open state                                  |
| `defaultOpen` | `boolean`          | `false`          | Initial uncontrolled open state                        |
| `steps`       | `AgentTraceStep[]` | `[]`             | Trace steps                                            |

## Events

| Event         | Payload   | Description        |
| ------------- | --------- | ------------------ |
| `update:open` | `boolean` | Open state changed |

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentThinking.vue` |

:::
