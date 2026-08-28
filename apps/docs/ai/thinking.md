# AgentThinking

可折叠的推理、搜索、编码与执行轨迹。

## 案例

<AgentComponentDemo component="thinking" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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

## 平台差异

| Target     | Import                                    |
| ---------- | ----------------------------------------- |
| H5         | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentThinking.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
