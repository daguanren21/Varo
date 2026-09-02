# AgentLoading

带耗时与多种动效的 Agent 加载状态。

## 案例

<AgentComponentDemo component="loading" locale="zh" />

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

## 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentLoading.vue`  |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
