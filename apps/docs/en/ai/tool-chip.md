# AgentToolChip

Compact tool name, summary, and execution status.

## Demo

<AgentComponentDemo component="tool-chip" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentToolChip } from '@/components/agent-ui'
</script>

<template>
  <AgentToolChip :tool="tool" />
</template>
```

## Props

| Prop      | Type            | Default    | Description          |
| --------- | --------------- | ---------- | -------------------- |
| `compact` | `boolean`       | `false`    | Compact presentation |
| `tool`    | `AgentToolPart` | `required` | Tool state           |

## Events

None.

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentToolChip.vue` |

:::
