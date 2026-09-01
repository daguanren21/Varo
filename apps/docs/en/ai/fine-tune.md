# AgentFineTune

Property inspector and tuning panel for Agent-generated designs.

## Demo

<AgentComponentDemo component="fine-tune" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentFineTune } from '@/components/agent-ui'
</script>

<template>
  <AgentFineTune v-model:controls="controls" title="调整卡片" />
</template>
```

## Props

| Prop       | Type                     | Default     | Description |
| ---------- | ------------------------ | ----------- | ----------- |
| `controls` | `AgentFineTuneControl[]` | `[]`        | Controls    |
| `title`    | `string`                 | `Fine tune` | Title       |

## Events

| Event             | Payload                  | Description     |
| ----------------- | ------------------------ | --------------- |
| `apply`           | `AgentFineTuneControl[]` | Apply           |
| `update:controls` | `AgentFineTuneControl[]` | Update controls |

## Target Notes

| Target | Import                                                        |
| ------ | ------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                     |
| weapp  | Default export from `@/components/agent-ui/AgentFineTune.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
