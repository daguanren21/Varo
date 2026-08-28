# AgentRadioGroup

Agent single-choice control with a shared active indicator.

## Demo

<AgentComponentDemo component="radio-group" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentRadioGroup } from '@/components/agent-ui'
</script>

<template>
  <AgentRadioGroup v-model:value="value" :choices="choices" />
</template>
```

## Props

| Prop          | Type                         | Default    | Description    |
| ------------- | ---------------------------- | ---------- | -------------- |
| `choices`     | `AgentRadioChoice[]`         | `[]`       | Choices        |
| `orientation` | `'horizontal' \| 'vertical'` | `vertical` | Orientation    |
| `value`       | `string`                     | `''`       | Selected value |

## Events

| Event          | Payload  | Description           |
| -------------- | -------- | --------------------- |
| `update:value` | `string` | Update selected value |
| `change`       | `string` | Selection changed     |

## Target Notes

| Target     | Import                                      |
| ---------- | ------------------------------------------- |
| H5         | Named export from `@/components/agent-ui`   |
| weapp-vite | `@/components/agent-ui/AgentRadioGroup.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
