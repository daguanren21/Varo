# AgentLoading

Agent loading feedback with elapsed time and multiple motion variants.

## Demo

<AgentComponentDemo component="loading" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

## Target Notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentLoading.vue`  |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
