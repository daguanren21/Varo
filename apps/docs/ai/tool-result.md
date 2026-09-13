# AgentToolResult

终端输出和请求响应的可折叠工具结果。

## 案例

<AgentComponentDemo component="tool-result" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentToolResult } from '@/components/agent-ui'
</script>

<template>
  <AgentToolResult name="pnpm test" output="38 tests passed" status="completed" default-open />
</template>
```

## Props

| Prop          | Type                  | Default     | 说明     |
| ------------- | --------------------- | ----------- | -------- |
| `name`        | `string`              | `required`  | 工具名   |
| `status`      | `AgentAdvancedStatus` | `completed` | 状态     |
| `summary`     | `string`              | `—`         | 摘要     |
| `output`      | `string`              | `''`        | 输出     |
| `duration`    | `string`              | `—`         | 耗时     |
| `defaultOpen` | `boolean`             | `false`     | 默认展开 |

## Events

| Event         | Payload   | 说明     |
| ------------- | --------- | -------- |
| `retry`       | `void`    | 重试     |
| `update:open` | `boolean` | 展开变化 |

## Slots

| Slot      | 说明       |
| --------- | ---------- |
| `default` | 自定义输出 |

::: info 平台差异

| Target | Import                                                 |
| ------ | ------------------------------------------------------ |
| H5     | Named export from `@/components/agent-ui`              |
| weapp  | 默认导出自 `@/components/agent-ui/AgentToolResult.vue` |

:::
