# AgentChat Block

组合导航头、消息历史、事件渲染、审批和输入区的完整 Block。

## 案例

<AgentComponentDemo component="agent-chat" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import AgentChat from '@/components/blocks/agent-chat.vue'
</script>

<template>
  <AgentChat v-model="prompt" :messages="messages" :snapshot="snapshot" @submit="send" />
</template>
```

`v-model` 是可选的。未绑定时，Block 保存初始为空的本地草稿；绑定后由父级管理草稿，空字符串也是有效的受控值。`submit` 发送去除首尾空白的文本，但不自动清空草稿；父级可在接受提交后将绑定值设为 `''`。忙碌或纯空白输入不会提交。

## Props

| Prop          | Type                         | Default      | 说明         |
| ------------- | ---------------------------- | ------------ | ------------ |
| `modelValue`  | `string`                     | `''`         | 提示词       |
| `busy`        | `boolean`                    | `false`      | 忙碌         |
| `closeLabel`  | `string`                     | `关闭 Agent` | 关闭按钮名称 |
| `messages`    | `AgentConversationMessage[]` | `[]`         | 消息         |
| `snapshot`    | `AgentStreamSnapshot`        | `—`          | 快照         |
| `subtitle`    | `string`                     | `—`          | 副标题       |
| `suggestions` | `string[]`                   | `[]`         | 建议词       |
| `title`       | `string`                     | `Varo Agent` | 标题         |

## Events

| Event               | Payload  | 说明       |
| ------------------- | -------- | ---------- |
| `approve`           | `string` | 批准       |
| `close`             | `void`   | 关闭       |
| `reject`            | `void`   | 拒绝       |
| `retry`             | `void`   | 重试       |
| `submit`            | `string` | 提交       |
| `update:modelValue` | `string` | 更新提示词 |

::: info 平台差异

| Target | Import                               |
| ------ | ------------------------------------ |
| H5     | `@/components/blocks/agent-chat.vue` |
| weapp  | `@/components/blocks/agent-chat.vue` |

:::
