# AgentThinking

可折叠的推理、搜索、编码与执行轨迹。

## 案例

<AgentComponentDemo component="thinking" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentThinking } from '@/components/agent-ui'
</script>

<template>
  <AgentThinking label="推理过程" :steps="steps" default-open />
</template>
```

## Props

| Prop          | Type               | Default          | 说明                               |
| ------------- | ------------------ | ---------------- | ---------------------------------- |
| `className`   | `ClassValue`       | `undefined`      | 通过目标对应的 `cn` 合并根节点样式 |
| `label`       | `string`           | `Agent 执行轨迹` | 标题                               |
| `open`        | `boolean`          | `undefined`      | 受控展开状态                       |
| `defaultOpen` | `boolean`          | `false`          | 非受控默认展开状态                 |
| `steps`       | `AgentTraceStep[]` | `[]`             | 推理步骤                           |

## Events

| Event         | Payload   | 说明         |
| ------------- | --------- | ------------ |
| `update:open` | `boolean` | 展开状态变化 |

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentThinking.vue` |

:::
