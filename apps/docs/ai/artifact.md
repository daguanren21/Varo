# AgentArtifact

代码、文档、文件与图片产物卡片。

## 案例

<AgentComponentDemo component="artifact" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentArtifact } from '@/components/agent-ui'
</script>

<template>
  <AgentArtifact :artifact="artifact" @open="openArtifact" />
</template>
```

## Props

| Prop       | Type                | Default    | 说明     |
| ---------- | ------------------- | ---------- | -------- |
| `artifact` | `AgentArtifactItem` | `required` | 产物数据 |

## Events

| Event  | Payload             | 说明     |
| ------ | ------------------- | -------- |
| `open` | `AgentArtifactItem` | 打开产物 |

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentArtifact.vue` |

:::
