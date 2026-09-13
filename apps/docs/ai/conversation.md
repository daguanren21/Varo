# AgentConversation

消息历史与当前回答的会话列表。

## 案例

<AgentComponentDemo component="conversation" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentConversation } from '@/components/agent-ui'
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
