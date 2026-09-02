# AgentMessageScroller

Reader-aware streaming viewport with jump-to-latest control.

## Demo

<AgentComponentDemo component="message-scroller" locale="en" />

## Install

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

Registry installs the UI component into your project, so import it from `@/components/agent-ui`; `@varo-ui/ai` provides the event protocol, stream controller, and Markdown primitives—not Vue/Wevu UI components.

## Basic Usage

```vue
<script setup lang="ts">
import { AgentMessageScroller } from '@/components/agent-ui'
</script>

<template>
  <AgentMessageScroller :at-live-edge="false" @follow="follow">
    <AgentConversation :messages="messages" />
  </AgentMessageScroller>
</template>
```

## Props

| Prop          | Type               | Default          | Description    |
| ------------- | ------------------ | ---------------- | -------------- |
| `atLiveEdge`  | `boolean`          | `true`           | At live edge   |
| `followLabel` | `string`           | `Jump to latest` | Follow label   |
| `maxHeight`   | `number \| string` | `480`            | Maximum height |

## Events

| Event               | Payload   | Description            |
| ------------------- | --------- | ---------------------- |
| `follow`            | `void`    | Follow latest          |
| `update:atLiveEdge` | `boolean` | Update live-edge state |

## Slots

| Slot      | Description          |
| --------- | -------------------- |
| `default` | Conversation content |

## Target Notes

| Target | Import                                                               |
| ------ | -------------------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                            |
| weapp  | Default export from `@/components/agent-ui/AgentMessageScroller.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
