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

## File types and previews

Both H5 and native prefer an image from `previewUrl`. Without a preview, the independent [VFileType](/en/components/file-type) recognizes an extension or special basename in `name`, then falls back to `mimeType`. Unknown inputs use the neutral `FILE` label. See FileType for the supported formats.

The full filename appears next to the icon and can wrap, so type icons are decorative and are not announced twice. `remove` still emits the original `AgentAttachmentItem`; the component does not remove it internally. Update the supplied array by `id` to accept removal. Neither previews nor classification change file selection, upload allowlists, size limits, or server validation.

Installing the `agent-advanced` Registry item includes `file-type` and its icon/style dependencies. Installing `file-type` alone does not pull in Agent components.

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
