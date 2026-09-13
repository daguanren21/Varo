# AgentLoading

带耗时与多种动效的 Agent 加载状态。

## 案例

<AgentComponentDemo component="loading" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentLoading } from '@/components/agent-ui'
</script>

<template>
  <AgentLoading label="正在分析" variant="grid" />
</template>
```

## Props

| Prop        | Type                          | Default          | 说明       |
| ----------- | ----------------------------- | ---------------- | ---------- |
| `active`    | `boolean`                     | `true`           | 是否运行   |
| `label`     | `string`                      | `Agent 正在处理` | 状态文案   |
| `startedAt` | `number`                      | `—`              | 开始时间戳 |
| `variant`   | `'grid' \| 'dots' \| 'orbit'` | `grid`           | 加载动效   |

## Events

无。

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentLoading.vue`  |

:::
