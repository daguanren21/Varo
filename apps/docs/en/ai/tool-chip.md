# AgentToolChip

Compact display of tool name, summary, and execution status.

## Demo

<AgentComponentDemo component="tool-chip" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import type { AgentToolPart } from '@/components/agent-ui/types'
import { AgentToolChip } from '@/components/agent-ui'

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

Conversation tool results display the actual `output`: strings remain plain text and structured results use JSON. The renderer does not print an additional internal object wrapping `input` and `output`. Inputs remain in SDK messages and tool display data; output does not turn a failed tool into a successful one.

## Events

None.

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentToolChip.vue` |

:::
