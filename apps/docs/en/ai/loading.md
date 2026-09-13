# AgentLoading

Agent loading feedback with elapsed time and multiple motion variants.

## Demo

<AgentComponentDemo component="loading" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { AgentLoading } from '@/components/agent-ui'
</script>

<template>
  <AgentLoading label="正在分析" variant="grid" />
</template>
```

## Props

| Prop        | Type                          | Default          | Description          |
| ----------- | ----------------------------- | ---------------- | -------------------- |
| `active`    | `boolean`                     | `true`           | Whether it is active |
| `label`     | `string`                      | `Agent 正在处理` | Status label         |
| `startedAt` | `number`                      | `—`              | Start timestamp      |
| `variant`   | `'grid' \| 'dots' \| 'orbit'` | `grid`           | Loader variant       |

## Events

None.

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentLoading.vue`  |

:::
