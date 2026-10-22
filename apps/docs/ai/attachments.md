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

## 文件类型与预览

H5 与原生都优先显示 `previewUrl` 图片；没有预览时使用独立的 [VFileType](/components/file-type)，先识别 `name` 中的扩展名或特殊文件名，再回退到 `mimeType`。两者都未知时显示中性的 `FILE`，支持范围见 FileType 文档。

文件名在图标旁完整显示并可换行，因此类型图标是装饰性的，不会重复朗读。`remove` 仍发送对应的原始 `AgentAttachmentItem`，组件本身不删除附件。应用应按 `id` 更新传入数组。预览图和类型图标均不改变文件选择、上传白名单、大小限制或服务器校验。

Registry 安装 `agent-advanced` 会自动包含 `file-type` 和图标/样式依赖。单独安装 `file-type` 不引入 Agent 组件。

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
