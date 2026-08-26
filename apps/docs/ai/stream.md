# AgentStream

回答流、光标、错误、重试与完成操作区。

## 案例

<AgentComponentDemo component="stream" locale="zh" />

## 安装

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentStream } from '@/components/agent-ui'
</script>

<template>
  <AgentStream content="正在生成…" status="streaming" />
</template>
```

## Props

| Prop | Type | Default | 说明 |
| --- | --- | --- | --- |
| `className` | `ClassValue` | `undefined` | 通过目标对应的 `cn` 合并根节点样式 |
| `content` | `string` | `''` | 可见内容 |
| `cursor` | `boolean` | `true` | 显示光标 |
| `error` | `string` | `—` | 错误文案 |
| `final` | `boolean` | `false` | Markdown 是否结束 |
| `status` | `AgentStreamStatus` | `idle` | 流状态 |

## Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `retry` | `void` | 请求重试 |

## Slots

| Slot | 说明 |
| --- | --- |
| `actions` | 完成后的操作 |

## 平台差异

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentStream.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
