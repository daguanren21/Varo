# AgentImageGeneration

从排队、渐进生成到完成的稳定图片产物。

## 案例

<AgentComponentDemo component="image-generation" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentImageGeneration } from '@/components/agent-ui'
</script>

<template>
  <AgentImageGeneration status="generating" :progress="68" prompt="Generate an Agent UI" />
</template>
```

## Props

| Prop        | Type                                                  | Default           | 说明                               |
| ----------- | ----------------------------------------------------- | ----------------- | ---------------------------------- |
| `className` | `ClassValue`                                          | `undefined`       | 通过目标对应的 `cn` 合并根节点样式 |
| `status`    | `'queued' \| 'generating' \| 'completed' \| 'failed'` | `queued`          | 生成状态                           |
| `progress`  | `number`                                              | `0`               | 进度                               |
| `src`       | `string`                                              | `—`               | 图片地址                           |
| `alt`       | `string`                                              | `Generated image` | 替代文本                           |
| `prompt`    | `string`                                              | `—`               | 提示词                             |

## Events

| Event      | Payload  | 说明 |
| ---------- | -------- | ---- |
| `retry`    | `void`   | 重试 |
| `download` | `string` | 下载 |

::: info 平台差异

| Target | Import                                                      |
| ------ | ----------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                   |
| weapp  | 默认导出自 `@/components/agent-ui/AgentImageGeneration.vue` |

:::
