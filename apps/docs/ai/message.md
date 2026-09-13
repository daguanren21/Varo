# AgentMessage

用户、助手与系统消息的对齐、头像和元信息容器。

## 案例

<AgentComponentDemo component="message" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentMessage } from '@/components/agent-ui'
</script>

<template>
  <AgentMessage role="assistant" label="Varo Agent">
    回答内容
  </AgentMessage>
</template>
```

## Props

| Prop        | Type                                | Default     | 说明       |
| ----------- | ----------------------------------- | ----------- | ---------- |
| `label`     | `string`                            | `—`         | 发送方标签 |
| `role`      | `'assistant' \| 'system' \| 'user'` | `assistant` | 消息角色   |
| `timestamp` | `string`                            | `—`         | 时间文案   |

## Events

无。

## Slots

| Slot      | 说明     |
| --------- | -------- |
| `default` | 消息内容 |

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentMessage.vue`  |

:::
