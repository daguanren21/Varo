# AgentToolChip

Compact display of tool name, summary, and execution status.

## Demo

<AgentComponentDemo component="tool-chip" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentToolChip } from '@/components/agent-ui'
import type { AgentToolPart } from '@/components/agent-ui/types'

const tool: AgentToolPart = {
  id: 'lookup-1',
  name: 'lookup',
  status: 'completed',
  summary: 'Local presentation example; no tool was called',
}
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

`AgentToolPart` is a Registry display type (`id`, `name`, `input`, `output`, `summary`, `error`, `status`), not an import from `@varo-ui/ai`. Its `AgentPartStatus` is `waiting | running | completed | failed`, not a TanStack tool wire state. The application or renderer projects it from SDK messages; the component neither executes tools nor grants permission.

## Events

None.

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentToolChip.vue` |

:::
