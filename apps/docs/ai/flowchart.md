# AgentFlowchart

触发、条件、动作和结果组成的 Agent 工作流。

## 案例

<AgentComponentDemo component="flowchart" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentFlowchart } from '@/components/agent-ui'
</script>

<template>
  <AgentFlowchart title="发布工作流" :nodes="nodes" />
</template>
```

## Props

| Prop    | Type              | Default          | 说明 |
| ------- | ----------------- | ---------------- | ---- |
| `nodes` | `AgentFlowNode[]` | `[]`             | 节点 |
| `title` | `string`          | `Agent workflow` | 标题 |

## Events

| Event    | Payload               | 说明     |
| -------- | --------------------- | -------- |
| `add`    | `string \| undefined` | 添加步骤 |
| `select` | `AgentFlowNode`       | 选择节点 |

## 平台差异

| Target | Import                                                |
| ------ | ----------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`             |
| weapp  | 默认导出自 `@/components/agent-ui/AgentFlowchart.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
