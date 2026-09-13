# AgentCitations

内联引用对应的可折叠来源集合。

## 案例

<AgentComponentDemo component="citations" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentCitations } from '@/components/agent-ui'
</script>

<template>
  <AgentCitations title="来源" :items="citations" default-open />
</template>
```

## Props

| Prop          | Type                  | Default   | 说明     |
| ------------- | --------------------- | --------- | -------- |
| `items`       | `AgentCitationItem[]` | `[]`      | 引用     |
| `title`       | `string`              | `Sources` | 标题     |
| `defaultOpen` | `boolean`             | `false`   | 默认展开 |

## Events

| Event         | Payload             | 说明     |
| ------------- | ------------------- | -------- |
| `open`        | `AgentCitationItem` | 打开引用 |
| `update:open` | `boolean`           | 展开变化 |

::: info 平台差异

| Target | Import                                                |
| ------ | ----------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`             |
| weapp  | 默认导出自 `@/components/agent-ui/AgentCitations.vue` |

:::
