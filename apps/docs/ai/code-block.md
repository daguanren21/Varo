# AgentCodeBlock

支持稳定流式更新、行号、聚焦行和复制反馈的代码块。

## 案例

<AgentComponentDemo component="code-block" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentCodeBlock } from '@/components/agent-ui'
</script>

<template>
  <AgentCodeBlock filename="agent.ts" language="TypeScript" :code="code" :focused-lines="[2]" />
</template>
```

## Props

| Prop           | Type                        | Default       | 说明     |
| -------------- | --------------------------- | ------------- | -------- |
| `code`         | `string`                    | `''`          | 代码     |
| `filename`     | `string`                    | `untitled.ts` | 文件名   |
| `focusedLines` | `number[]`                  | `[]`          | 高亮行   |
| `language`     | `string`                    | `text`        | 语言     |
| `lineNumbers`  | `boolean`                   | `true`        | 显示行号 |
| `status`       | `'complete' \| 'streaming'` | `complete`    | 状态     |

## Events

| Event  | Payload  | 说明     |
| ------ | -------- | -------- |
| `copy` | `string` | 复制代码 |

## Slots

| Slot     | 说明     |
| -------- | -------- |
| `footer` | 底部扩展 |

::: info 平台差异

| Target | Import                                                |
| ------ | ----------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`             |
| weapp  | 默认导出自 `@/components/agent-ui/AgentCodeBlock.vue` |

:::
