# AgentContextCard

展示检索知识块、来源类型与跳转动作。

## 案例

<AgentComponentDemo component="context-card" locale="zh" />

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

## 平台差异

| Target | Import                                                  |
| ------ | ------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`               |
| weapp  | 默认导出自 `@/components/agent-ui/AgentContextCard.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
