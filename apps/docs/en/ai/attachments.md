# AgentAttachmentList

Attachment preview, size, and removal actions.

## Demo

<AgentComponentDemo component="attachments" locale="en" />

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
import { AgentAttachmentList } from '@/components/agent-ui'
</script>

<template>
  <AgentAttachmentList :attachments="attachments" @remove="remove" />
</template>
```

## Props

| Prop          | Type                    | Default | Description |
| ------------- | ----------------------- | ------- | ----------- |
| `attachments` | `AgentAttachmentItem[]` | `[]`    | Attachments |

## Events

| Event    | Payload               | Description       |
| -------- | --------------------- | ----------------- |
| `remove` | `AgentAttachmentItem` | Remove attachment |

## Target Notes

| Target | Import                                          |
| ------ | ----------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`       |
| weapp  | `@/components/agent-ui/AgentAttachmentList.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
