# AgentAttachmentList

Attachment preview, size, and removal actions.

## Demo

<AgentComponentDemo component="attachments" locale="en" />

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

::: info Target notes

| Target | Import                                          |
| ------ | ----------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`       |
| weapp  | `@/components/agent-ui/AgentAttachmentList.vue` |

:::
