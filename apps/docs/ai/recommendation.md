# AgentRecommendation

带置信度和采用动作的 Agent 建议卡片。

## 案例

<AgentComponentDemo component="recommendation" locale="zh" />

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
import { AgentRecommendation } from '@/components/agent-ui'
</script>

<template>
  <AgentRecommendation title="推荐统一协议" :confidence="96" />
</template>
```

## Props

| Prop          | Type     | Default    | 说明     |
| ------------- | -------- | ---------- | -------- |
| `acceptText`  | `string` | `采用建议` | 按钮文案 |
| `confidence`  | `number` | `80`       | 置信度   |
| `description` | `string` | `—`        | 建议说明 |
| `title`       | `string` | `required` | 标题     |

## Events

| Event    | Payload | 说明     |
| -------- | ------- | -------- |
| `accept` | `void`  | 采用建议 |

## Slots

| Slot        | 说明     |
| ----------- | -------- |
| `default`   | 扩展内容 |
| `secondary` | 次要操作 |

## 平台差异

| Target | Import                                          |
| ------ | ----------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`       |
| weapp  | `@/components/agent-ui/AgentRecommendation.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
