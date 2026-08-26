# AgentAttachmentList

附件预览、大小和移除操作。

## 案例

<AgentComponentDemo component="attachments" locale="zh" />

## 安装

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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

| Prop | Type | Default | 说明 |
| --- | --- | --- | --- |
| `attachments` | `AgentAttachmentItem[]` | `[]` | 附件列表 |

## Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `remove` | `AgentAttachmentItem` | 移除附件 |

## 平台差异

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentAttachmentList.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
