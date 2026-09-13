# AgentMessage

Alignment, avatar, and metadata container for user, assistant, and system messages.

## Demo

<AgentComponentDemo component="message" locale="en" />

## Basic Usage

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

| Prop        | Type                                | Default     | Description  |
| ----------- | ----------------------------------- | ----------- | ------------ |
| `label`     | `string`                            | `—`         | Sender label |
| `role`      | `'assistant' \| 'system' \| 'user'` | `assistant` | Message role |
| `timestamp` | `string`                            | `—`         | Timestamp    |

## Events

None.

## Slots

| Slot      | Description     |
| --------- | --------------- |
| `default` | Message content |

::: info Target notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentMessage.vue`  |

:::
