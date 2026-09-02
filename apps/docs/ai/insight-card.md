# AgentInsightCard

可翻页的 Agent 洞察、指标和行动建议。

## 案例

<AgentComponentDemo component="insight-card" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

UI 组件由 Registry 安装到项目本地，因此从 `@/components/agent-ui` 导入；`@varo-ui/ai` 只提供事件协议、流控制和 Markdown 能力，不导出 Vue/Wevu UI 组件。

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
