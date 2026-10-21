# AgentThinking

Collapsible reasoning, search, coding, and execution traces.

## Demo

<AgentComponentDemo component="thinking" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentThinking } from '@/components/agent-ui'
</script>

<template>
  <AgentThinking label="推理过程" :steps="steps" default-open />
</template>
```

## Expand individual steps

`open` / `defaultOpen` controls the whole group; by default, all details show when it opens. Set `expandable` to make rows with `detail` (preferred) or `content` individually expandable. Rows without details stay static. Row expansion does not change the group state.

```vue
<script setup lang="ts">
import type { AgentTraceStep } from '@/components/agent-ui'
import { ref } from 'vue'
import { AgentThinking } from '@/components/agent-ui'

const expandedIds = ref(['inspect'])
const steps: AgentTraceStep[] = [
  { id: 'inspect', title: 'Inspect context', status: 'completed', detail: 'Relevant documents have been read.' },
  { id: 'search', title: 'Search sources', status: 'running', content: 'Comparing two sources.' },
]
</script>

<template>
  <AgentThinking v-model:expanded-ids="expandedIds" :steps="steps" expandable default-open />
</template>
```

Use unique, stable ids to preserve expansion when reordering. Uncontrolled state starts from `defaultExpandedIds`; removing a step clears its expansion record, so it stays closed when readded. With `expandedIds`, including `[]`, the component emits the next ids and waits for the parent to update them. It never removes ids from the parent's array. H5 native buttons support Enter / Space, `aria-expanded`, and `aria-controls`; native taps emit the same array. Expandable rows use the standard Chinese status labels: 等待中 (waiting), 进行中 (running), 已完成 (completed), and 失败 (failed).

## Props

| Prop                 | Type               | Default          | Description                                            |
| -------------------- | ------------------ | ---------------- | ------------------------------------------------------ |
| `className`          | `ClassValue`       | `undefined`      | Root classes merged by the target-specific `cn` helper |
| `label`              | `string`           | `Agent 执行轨迹` | Title                                                  |
| `open`               | `boolean`          | `undefined`      | Controlled open state                                  |
| `defaultOpen`        | `boolean`          | `false`          | Initial uncontrolled open state                        |
| `steps`              | `AgentTraceStep[]` | `[]`             | Trace steps                                            |
| `expandable`         | `boolean`          | `false`          | Enable independent row disclosure                      |
| `expandedIds`        | `string[]`         | `undefined`      | Controlled expanded row ids                            |
| `defaultExpandedIds` | `string[]`         | `[]`             | Initial uncontrolled expanded row ids                  |

## Events

| Event                | Payload    | Description                                          |
| -------------------- | ---------- | ---------------------------------------------------- |
| `update:open`        | `boolean`  | Open state changed                                   |
| `update:expandedIds` | `string[]` | Proposed row expansion; does not change group `open` |

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentThinking.vue` |

For native, import `ref` from `wevu` and use the `.vue` default export above. Omitted `expandedIds` is uncontrolled; an explicit `[]` is controlled with all rows closed.

:::
