# AgentToolChip

紧凑展示工具名称、摘要与执行状态。

## 案例

<AgentComponentDemo component="tool-chip" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import type { AgentToolPart } from '@/components/agent-ui/types'
import { AgentToolChip } from '@/components/agent-ui'

const tool: AgentToolPart = {
  id: 'lookup-1',
  name: 'lookup',
  status: 'completed',
  summary: '本地展示示例；未调用工具',
}
</script>

<template>
  <AgentToolChip :tool="tool" />
</template>
```

## Props

| Prop      | Type            | Default    | 说明           |
| --------- | --------------- | ---------- | -------------- |
| `compact` | `boolean`       | `false`    | 仅显示紧凑信息 |
| `tool`    | `AgentToolPart` | `required` | 工具状态       |

`AgentToolPart` 是 Registry 展示类型（`id`、`name`、`input`、`output`、`summary`、`error`、`status`），不从 `@varo-ui/ai` 导入。其 `AgentPartStatus` 为 `waiting | running | completed | failed`，不是 TanStack 工具 wire state。应用或渲染器从 SDK 消息做纯投影；组件不执行工具或授予权限。

H5 对话展示 SDK 工具的实际 `output`：字符串以纯文本展示，结构化结果以 JSON 展示，不额外包装 `input` 和 `output`。展示输出不会把工具的失败状态改成成功。

原生 Wevu 对话使用可折叠的工具调用组，显示 SDK 提供的名称和状态。参数、结果、错误和耗时默认不展示；如需展示，通过 [`toolCallPreviews`](./agent-chat#native-tool-previews) 按 `toolCallId` 提供简短、可安全展示给当前用户的文本。调用组不会直接渲染 SDK 原始载荷。升级请参阅[更新已安装的原生源码](./agent-chat#native-source-upgrade)。

## Events

无。

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentToolChip.vue` |

:::
