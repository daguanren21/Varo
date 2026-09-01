# AgentCommandSearch

实时过滤的 Agent 命令搜索与空状态。

## 案例

<AgentComponentDemo component="command-search" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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
