# AgentActivity

Displays reasoning, searches, tool calls, and execution traces in one list.

## Demo

<AgentComponentDemo component="activity" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentActivity } from '@/components/agent-ui'
</script>

<template>
  <AgentActivity title="Agent 活动" :items="activity" />
</template>
```

## Optional row disclosure

Details remain visible by default. Set `expandable` to turn rows with `detail` into disclosure buttons; rows without details stay static and outside the focus order. Multiple rows can be open independently.

```vue
<script setup lang="ts">
import type { AgentActivityItem } from '@/components/agent-ui'
import { ref } from 'vue'
import { AgentActivity } from '@/components/agent-ui'

const expandedIds = ref(['search'])
const activity: AgentActivityItem[] = [
  { id: 'search', kind: 'search', title: 'Search sources', status: 'running', detail: 'Reading candidate sources.' },
  { id: 'tool', kind: 'tool', title: 'Generate summary', status: 'failed', detail: 'The application reported a generation failure.' },
]
</script>

<template>
  <AgentActivity v-model:expanded-ids="expandedIds" :items="activity" expandable />
</template>
```

Use unique, stable ids to preserve expansion when reordering. Without `expandedIds`, `defaultExpandedIds` initializes local state once, and removed items lose their local expansion records. With `expandedIds`, including an empty array, the component emits the next ids and waits for the parent to update them. Removing items does not change the parent's array.

H5 uses native buttons supporting Enter / Space, `aria-expanded`, and `aria-controls`; native taps emit the same array. Status text uses the standard Chinese labels, plus 排队中 for `queued` and 已取消 for `cancelled`. These states only affect the display; the component does not execute or retry work.

## Props

| Prop                 | Type                  | Default          | Description                           |
| -------------------- | --------------------- | ---------------- | ------------------------------------- |
| `items`              | `AgentActivityItem[]` | `[]`             | Activity items                        |
| `title`              | `string`              | `Agent activity` | Title                                 |
| `expandable`         | `boolean`             | `false`          | Enable independent row disclosure     |
| `expandedIds`        | `string[]`            | `undefined`      | Controlled expanded row ids           |
| `defaultExpandedIds` | `string[]`            | `[]`             | Initial uncontrolled expanded row ids |

## Events

| Event                | Payload    | Description               |
| -------------------- | ---------- | ------------------------- |
| `update:expandedIds` | `string[]` | Proposed expanded row ids |

::: info Target notes

| Target | Import                                                        |
| ------ | ------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                     |
| weapp  | Default export from `@/components/agent-ui/AgentActivity.vue` |

For native, import `ref` from `wevu` and use the `.vue` default export above. Omitting `expandedIds` lets the component manage expansion; passing an empty array puts the parent in control.

:::
