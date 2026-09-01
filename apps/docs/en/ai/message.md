# AgentMessage

Alignment, avatar, and metadata container for user, assistant, and system messages.

## Demo

<AgentComponentDemo component="message" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

## Target Notes

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentMessage.vue`  |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
