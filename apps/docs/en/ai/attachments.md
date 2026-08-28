# AgentAttachmentList

Attachment preview, size, and removal actions.

## Demo

<AgentComponentDemo component="attachments" locale="en" />

## Install

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

This component ships in `components/agent-ui`; the CLI copies real source rather than a runtime black box.

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

| Target     | Import                                          |
| ---------- | ----------------------------------------------- |
| H5         | Named export from `@/components/agent-ui`       |
| weapp-vite | `@/components/agent-ui/AgentAttachmentList.vue` |

The public API stays aligned across targets; DOM/WXML, scheduling, and native events are target-owned.
