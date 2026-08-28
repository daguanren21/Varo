# AgentThinking

Collapsible reasoning, search, coding, and execution traces.

## Demo

<AgentComponentDemo component="thinking" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

## Target Notes

| Target     | Import                                    |
| ---------- | ----------------------------------------- |
| H5         | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentThinking.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
