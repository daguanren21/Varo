# AgentResponseActions

复制、重试、赞与踩的回答操作栏。

## 案例

<AgentComponentDemo component="response-actions" locale="zh" />

## 安装

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentResponseActions } from '@/components/agent-ui'
</script>

<template>
  <AgentResponseActions :content="answer" @retry="retry" />
</template>
```

## Props

| Prop | Type | Default | 说明 |
| --- | --- | --- | --- |
| `content` | `string` | `''` | 回答文本 |
| `disabled` | `boolean` | `false` | 禁用 |

## Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `copy` | `void` | 复制 |
| `retry` | `void` | 重试 |
| `like` | `void` | 有帮助 |
| `dislike` | `void` | 需改进 |

## 平台差异

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentResponseActions.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
