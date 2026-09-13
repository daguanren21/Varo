# AgentToolChip

紧凑展示工具名称、摘要与执行状态。

## 案例

<AgentComponentDemo component="tool-chip" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentToolChip } from '@/components/agent-ui'
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

## Events

无。

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentToolChip.vue` |

:::
