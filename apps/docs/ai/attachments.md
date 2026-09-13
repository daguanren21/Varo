# AgentAttachmentList

附件预览、大小和移除操作。

## 案例

<AgentComponentDemo component="attachments" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentAttachmentList } from '@/components/agent-ui'
</script>

<template>
  <AgentAttachmentList :attachments="attachments" @remove="remove" />
</template>
```

## Props

| Prop          | Type                    | Default | 说明     |
| ------------- | ----------------------- | ------- | -------- |
| `attachments` | `AgentAttachmentItem[]` | `[]`    | 附件列表 |

## Events

| Event    | Payload               | 说明     |
| -------- | --------------------- | -------- |
| `remove` | `AgentAttachmentItem` | 移除附件 |

::: info 平台差异

| Target | Import                                          |
| ------ | ----------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`       |
| weapp  | `@/components/agent-ui/AgentAttachmentList.vue` |

:::
