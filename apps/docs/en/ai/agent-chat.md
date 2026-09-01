# AgentChat Block

Complete block composing header, history, events, approval, and prompt input.

## Demo

<AgentComponentDemo component="agent-chat" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

## Target Notes

| Target | Import                               |
| ------ | ------------------------------------ |
| H5     | `@/components/blocks/agent-chat.vue` |
| weapp  | `@/components/blocks/agent-chat.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
