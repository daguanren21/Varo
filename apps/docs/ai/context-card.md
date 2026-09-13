# AgentContextCard

展示检索知识块、来源类型与跳转动作。

## 案例

<AgentComponentDemo component="context-card" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentContextCard } from '@/components/agent-ui'
</script>

<template>
  <AgentContextCard title="检索上下文" :chunks="chunks" />
</template>
```

## Props

| Prop     | Type                  | Default             | 说明     |
| -------- | --------------------- | ------------------- | -------- |
| `chunks` | `AgentContextChunk[]` | `[]`                | 上下文块 |
| `title`  | `string`              | `Retrieved context` | 标题     |

## Events

| Event  | Payload             | 说明     |
| ------ | ------------------- | -------- |
| `open` | `AgentContextChunk` | 打开来源 |

::: info 平台差异

| Target | Import                                                  |
| ------ | ------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`               |
| weapp  | 默认导出自 `@/components/agent-ui/AgentContextCard.vue` |

:::
