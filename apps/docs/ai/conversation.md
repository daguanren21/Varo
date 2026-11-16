# AgentConversation

`messages` 接受 `AgentConversationEntry[]`：既支持原有静态 `AgentConversationMessage`，也支持 TanStack `UIMessage`。SDK 消息按原 parts 顺序显示文本、推理、工具调用与结果，不再把历史记录压平成字符串。使用 `agentConversationHistory(snapshot)` 取得保留原对象引用的历史，并传入 `contextMessages=snapshot.messages` 关联跨消息工具结果；活动消息继续由 [AgentEventRenderer](./event-renderer) 展示。组件不复制可写 transcript，也不执行工具。

## 案例

<AgentComponentDemo component="conversation" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentConversation } from '@/components/agent-ui'
import type { AgentConversationMessage } from '@/components/agent-ui/types'

const messages: AgentConversationMessage[] = [
  { id: 'history-1', role: 'assistant', content: '已保存的静态回答。' },
]
</script>

<template>
  <AgentConversation :messages="messages" />
</template>
```

## Props

| Prop       | Type                         | Default | 说明     |
| ---------- | ---------------------------- | ------- | -------- |
| `messages` | `readonly AgentConversationEntry[]` | `[]` | 静态消息或完整 SDK 消息 |
| `contextMessages` | `readonly UIMessage[]` | 未提供 | 完整 SDK transcript，用于跨消息工具结果关联 |

## Events

无。

::: info 平台差异

| Target | Import                                        |
| ------ | --------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`     |
| weapp  | `@/components/agent-ui/AgentConversation.vue` |

:::
