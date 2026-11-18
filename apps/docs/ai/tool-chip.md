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

对话中的工具结果显示实际 `output`：字符串直接展示，结构化结果使用 JSON 展示；不会把 `input` 与 `output` 再包装成内部对象打印。输入仍保留在 SDK 消息和工具展示数据中，失败状态不因存在输出而变成成功。

## Events

无。

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentToolChip.vue` |

:::
