# AgentSourceList

外链、引用与来源列表。

## 案例

<AgentComponentDemo component="sources" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentSourceList } from '@/components/agent-ui'
</script>

<template>
  <AgentSourceList title="来源" :sources="sources" />
</template>
```

## Props

| Prop      | Type                | Default | 说明     |
| --------- | ------------------- | ------- | -------- |
| `sources` | `AgentSourceItem[]` | `[]`    | 来源列表 |
| `title`   | `string`            | `来源`  | 标题     |

## Events

| Event  | Payload           | 说明     |
| ------ | ----------------- | -------- |
| `open` | `AgentSourceItem` | 打开来源 |

::: info 平台差异

| Target | Import                                      |
| ------ | ------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`   |
| weapp  | `@/components/agent-ui/AgentSourceList.vue` |

:::
