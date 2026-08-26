# AgentActivity

统一展示推理、搜索、工具调用和执行轨迹。

## 案例

<AgentComponentDemo component="activity" locale="zh" />

## 安装

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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

| Prop | Type | Default | 说明 |
| --- | --- | --- | --- |
| `items` | `AgentActivityItem[]` | `[]` | 活动项 |
| `title` | `string` | `Agent activity` | 标题 |

## Events

无。

## 平台差异

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | 默认导出自 `@/components/agent-ui/AgentActivity.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
