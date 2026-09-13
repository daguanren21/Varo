# AgentChat Block

Complete block composing header, history, events, approval, and prompt input.

## Demo

<AgentComponentDemo component="agent-chat" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import AgentChat from '@/components/blocks/agent-chat.vue'
</script>

<template>
  <AgentChat v-model="prompt" :messages="messages" :snapshot="snapshot" @submit="send" />
</template>
```

## Props

| Prop          | Type                         | Default      | Description       |
| ------------- | ---------------------------- | ------------ | ----------------- |
| `modelValue`  | `string`                     | `''`         | Prompt            |
| `busy`        | `boolean`                    | `false`      | Busy              |
| `closeLabel`  | `string`                     | `关闭 Agent` | Close button name |
| `messages`    | `AgentConversationMessage[]` | `[]`         | Messages          |
| `snapshot`    | `AgentStreamSnapshot`        | `—`          | Snapshot          |
| `subtitle`    | `string`                     | `—`          | Subtitle          |
| `suggestions` | `string[]`                   | `[]`         | Suggestions       |
| `title`       | `string`                     | `Varo Agent` | Title             |

## Events

| Event               | Payload  | Description   |
| ------------------- | -------- | ------------- |
| `approve`           | `string` | Approve       |
| `close`             | `void`   | Close         |
| `reject`            | `void`   | Reject        |
| `retry`             | `void`   | Retry         |
| `submit`            | `string` | Submit        |
| `update:modelValue` | `string` | Update prompt |

::: info Target notes

| Target | Import                               |
| ------ | ------------------------------------ |
| H5     | `@/components/blocks/agent-chat.vue` |
| weapp  | `@/components/blocks/agent-chat.vue` |

:::
