# AgentComposer

Auto-growing prompt input, suggestions, keyboard submit, and send state.

## Demo

<AgentComponentDemo component="composer" locale="en" />

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
import { AgentComposer } from '@/components/agent-ui'
</script>

<template>
  <AgentComposer v-model="prompt" :suggestions="suggestions" @submit="send" />
</template>
```

## Props

| Prop          | Type       | Default      | Description            |
| ------------- | ---------- | ------------ | ---------------------- |
| `ariaLabel`   | `string`   | `Agent 输入` | Accessible input name  |
| `busy`        | `boolean`  | `false`      | Busy                   |
| `disabled`    | `boolean`  | `false`      | Disabled; mini program |
| `maxLength`   | `number`   | `4000`       | Max length; H5         |
| `modelValue`  | `string`   | `''`         | Prompt value           |
| `placeholder` | `string`   | `—`          | Placeholder            |
| `suggestions` | `string[]` | `[]`         | Suggestions            |

## Events

| Event               | Payload  | Description   |
| ------------------- | -------- | ------------- |
| `update:modelValue` | `string` | Update prompt |
| `submit`            | `string` | Submit prompt |

## Slots

| Slot       | Description         |
| ---------- | ------------------- |
| `leading`  | Leading action; H5  |
| `trailing` | Trailing action; H5 |

## Target Notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentComposer.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
