# AgentFineTune

Property inspector and tuning panel for Agent-generated designs.

## Demo

<AgentComponentDemo component="fine-tune" locale="en" />

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

::: info Target notes

| Target | Import                                                        |
| ------ | ------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                     |
| weapp  | Default export from `@/components/agent-ui/AgentFineTune.vue` |

:::
