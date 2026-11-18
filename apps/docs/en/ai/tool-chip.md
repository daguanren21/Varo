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

H5 conversations display the actual SDK tool `output`: strings are plain text and structured results appear as JSON, without an extra `input`/`output` wrapper. Showing output does not turn a failed tool into a successful one.

Native Wevu conversations use collapsible tool-call groups with SDK names and statuses. Arguments, results, errors, and durations are opt-in: pass only bounded display text safe for the current user via [`toolCallPreviews`](./agent-chat#native-tool-previews), keyed by `toolCallId`. Raw SDK payloads are not rendered in the group. See [updating installed native source](./agent-chat#native-source-upgrade) for migration.

## Events

None.

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentToolChip.vue` |

:::
