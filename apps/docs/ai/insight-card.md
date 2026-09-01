# AgentInsightCard

可翻页的 Agent 洞察、指标和行动建议。

## 案例

<AgentComponentDemo component="insight-card" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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

## 平台差异

| Target | Import                                                  |
| ------ | ------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`               |
| weapp  | 默认导出自 `@/components/agent-ui/AgentInsightCard.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
