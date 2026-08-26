# AgentChat Block

组合导航头、消息历史、事件渲染、审批和输入区的完整 Block。

## 案例

<AgentComponentDemo component="agent-chat" locale="zh" />

## 安装

```bash
pnpm dlx @varo/cli add --target h5 blocks/agent-chat
pnpm dlx @varo/cli add --target weapp-vite blocks/agent-chat
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import AgentChat from '@/components/blocks/agent-chat.vue'
</script>

<template>
  <AgentChat v-model="prompt" :messages="messages" :snapshot="snapshot" @submit="send" />
</template>
```

## Props

| Prop | Type | Default | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | 提示词 |
| `busy` | `boolean` | `false` | 忙碌 |
| `messages` | `AgentConversationMessage[]` | `[]` | 消息 |
| `snapshot` | `AgentStreamSnapshot` | `—` | 快照 |
| `subtitle` | `string` | `—` | 副标题 |
| `suggestions` | `string[]` | `[]` | 建议词 |
| `title` | `string` | `Varo Agent` | 标题 |

## Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `approve` | `string` | 批准 |
| `close` | `void` | 关闭 |
| `reject` | `void` | 拒绝 |
| `retry` | `void` | 重试 |
| `submit` | `string` | 提交 |
| `update:modelValue` | `string` | 更新提示词 |

## 平台差异

| Target | Import |
| --- | --- |
| H5 | `@/components/blocks/agent-chat.vue` |
| weapp-vite | `@/components/blocks/agent-chat.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
