# AgentThinking

Collapsible reasoning, search, coding, and execution traces.

## Demo

<AgentComponentDemo component="thinking" locale="en" />

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

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentThinking.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
