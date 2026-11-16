# AgentConversation

保留 `AgentConversationMessage[]` 的静态消息历史展示 API。该类型来自 Registry `@/components/agent-ui/types`，不是 core 协议。活动聊天由 TanStack AI 持有；应用可从 SDK 消息纯投影展示，但不要在这里创建第二份可写 transcript。需要活动快照与工具审批时使用 [AgentEventRenderer](./event-renderer)。

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
| `messages` | `AgentConversationMessage[]` | `[]`    | 消息列表 |

## Events

无。

::: info 平台差异

| Target | Import                                        |
| ------ | --------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`     |
| weapp  | `@/components/agent-ui/AgentConversation.vue` |

:::
