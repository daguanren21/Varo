# AgentCodeBlock

Code surface with stable streaming, line numbers, focused lines, and copy feedback.

## Demo

<AgentComponentDemo component="code-block" locale="en" />

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
import { AgentCodeBlock } from '@/components/agent-ui'
</script>

<template>
  <AgentCodeBlock filename="agent.ts" language="TypeScript" :code="code" :focused-lines="[2]" />
</template>
```

## Props

| Prop           | Type                        | Default       | Description       |
| -------------- | --------------------------- | ------------- | ----------------- |
| `code`         | `string`                    | `''`          | Code              |
| `filename`     | `string`                    | `untitled.ts` | Filename          |
| `focusedLines` | `number[]`                  | `[]`          | Focused lines     |
| `language`     | `string`                    | `text`        | Language          |
| `lineNumbers`  | `boolean`                   | `true`        | Show line numbers |
| `status`       | `'complete' \| 'streaming'` | `complete`    | Status            |

## Events

| Event  | Payload  | Description |
| ------ | -------- | ----------- |
| `copy` | `string` | Copy code   |

## Slots

| Slot     | Description |
| -------- | ----------- |
| `footer` | Footer      |

## Target Notes

| Target | Import                                                         |
| ------ | -------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                      |
| weapp  | Default export from `@/components/agent-ui/AgentCodeBlock.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
