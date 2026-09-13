# AgentInsightCard

可翻页的 Agent 洞察、指标和行动建议。

## 案例

<AgentComponentDemo component="insight-card" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentInsightCard } from '@/components/agent-ui'
</script>

<template>
  <AgentInsightCard v-model:current="current" :insights="insights" />
</template>
```

## Props

| Prop       | Type                 | Default    | 说明     |
| ---------- | -------------------- | ---------- | -------- |
| `current`  | `number`             | `0`        | 当前页   |
| `insights` | `AgentInsightItem[]` | `[]`       | 洞察列表 |
| `title`    | `string`             | `Insights` | 标题     |

## Events

| Event            | Payload            | 说明       |
| ---------------- | ------------------ | ---------- |
| `action`         | `AgentInsightItem` | 执行建议   |
| `update:current` | `number`           | 更新当前页 |

::: info 平台差异

| Target | Import                                                  |
| ------ | ------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`               |
| weapp  | 默认导出自 `@/components/agent-ui/AgentInsightCard.vue` |

:::
