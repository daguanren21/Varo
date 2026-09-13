# AgentSelectionActions

针对选中文本执行解释、优化、缩短等 Agent 操作。

## 案例

<AgentComponentDemo component="selection-actions" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentSelectionActions } from '@/components/agent-ui'
</script>

<template>
  <AgentSelectionActions :text="selectedText" :actions="actions" />
</template>
```

## Props

| Prop      | Type                     | Default    | 说明     |
| --------- | ------------------------ | ---------- | -------- |
| `text`    | `string`                 | `required` | 选中文本 |
| `actions` | `AgentSelectionAction[]` | `[]`       | 动作     |

## Events

| Event    | Payload            | 说明     |
| -------- | ------------------ | -------- |
| `select` | `{ action; text }` | 选择操作 |

::: info 平台差异

| Target | Import                                                       |
| ------ | ------------------------------------------------------------ |
| H5     | Named export from `@/components/agent-ui`                    |
| weapp  | 默认导出自 `@/components/agent-ui/AgentSelectionActions.vue` |

:::
