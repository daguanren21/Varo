# AgentContextCard

展示检索知识块、来源类型与跳转动作。

## 案例

<AgentComponentDemo component="context-card" locale="zh" />

## 安装

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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

| Prop | Type | Default | 说明 |
| --- | --- | --- | --- |
| `chunks` | `AgentContextChunk[]` | `[]` | 上下文块 |
| `title` | `string` | `Retrieved context` | 标题 |

## Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `open` | `AgentContextChunk` | 打开来源 |

## 平台差异

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | 默认导出自 `@/components/agent-ui/AgentContextCard.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
