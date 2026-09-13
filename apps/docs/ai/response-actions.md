# AgentResponseActions

复制、重试、赞与踩的回答操作栏。

## 案例

<AgentComponentDemo component="response-actions" locale="zh" />

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

| Prop       | Type      | Default | 说明     |
| ---------- | --------- | ------- | -------- |
| `content`  | `string`  | `''`    | 回答文本 |
| `disabled` | `boolean` | `false` | 禁用     |

## Events

| Event     | Payload | 说明   |
| --------- | ------- | ------ |
| `copy`    | `void`  | 复制   |
| `retry`   | `void`  | 重试   |
| `like`    | `void`  | 有帮助 |
| `dislike` | `void`  | 需改进 |

::: info 平台差异

| Target | Import                                           |
| ------ | ------------------------------------------------ |
| H5     | Named export from `@/components/agent-ui`        |
| weapp  | `@/components/agent-ui/AgentResponseActions.vue` |

:::
