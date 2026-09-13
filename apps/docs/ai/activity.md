# AgentActivity

统一展示推理、搜索、工具调用和执行轨迹。

## 案例

<AgentComponentDemo component="activity" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentActivity } from '@/components/agent-ui'
</script>

<template>
  <AgentActivity title="Agent 活动" :items="activity" />
</template>
```

## Props

| Prop    | Type                  | Default          | 说明   |
| ------- | --------------------- | ---------------- | ------ |
| `items` | `AgentActivityItem[]` | `[]`             | 活动项 |
| `title` | `string`              | `Agent activity` | 标题   |

## Events

无。

::: info 平台差异

| Target | Import                                               |
| ------ | ---------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`            |
| weapp  | 默认导出自 `@/components/agent-ui/AgentActivity.vue` |

:::
