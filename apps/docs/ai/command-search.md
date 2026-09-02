# AgentCommandSearch

实时过滤的 Agent 命令搜索与空状态。

## 案例

<AgentComponentDemo component="command-search" locale="zh" />

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
import { AgentCommandSearch } from '@/components/agent-ui'
</script>

<template>
  <AgentCommandSearch v-model="query" :items="commands" />
</template>
```

## Props

| Prop          | Type                | Default             | 说明     |
| ------------- | ------------------- | ------------------- | -------- |
| `modelValue`  | `string`            | `''`                | 搜索词   |
| `items`       | `AgentSearchItem[]` | `[]`                | 命令     |
| `placeholder` | `string`            | `Search commands…`  | 占位文案 |
| `emptyText`   | `string`            | `No commands found` | 空状态   |

## Events

| Event               | Payload           | 说明       |
| ------------------- | ----------------- | ---------- |
| `select`            | `AgentSearchItem` | 选择命令   |
| `update:modelValue` | `string`          | 更新搜索词 |

## 平台差异

| Target | Import                                                    |
| ------ | --------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                 |
| weapp  | 默认导出自 `@/components/agent-ui/AgentCommandSearch.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
