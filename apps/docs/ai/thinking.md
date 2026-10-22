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

## 按步骤展开

`open` / `defaultOpen` 控制整个分组，默认展开后显示所有详情。设置 `expandable` 可单独展开含有 `detail`（优先）或 `content` 的行；无详情的行保持静态。行展开不影响分组状态。

```vue
<script setup lang="ts">
import type { AgentTraceStep } from '@/components/agent-ui'
import { ref } from 'vue'
import { AgentThinking } from '@/components/agent-ui'

const expandedIds = ref(['inspect'])
const steps: AgentTraceStep[] = [
  { id: 'inspect', title: '检查上下文', status: 'completed', detail: '已读取相关文档。' },
  { id: 'search', title: '检索来源', status: 'running', content: '正在比对两条来源。' },
]
</script>

<template>
  <AgentThinking v-model:expanded-ids="expandedIds" :steps="steps" expandable default-open />
</template>
```

`id` 必须唯一且稳定，重排后保持展开状态。非受控模式以 `defaultExpandedIds` 初始化；删除步骤会清理其展开记录，重新添加后默认关闭。传入 `expandedIds`（包括 `[]`）后，组件只发出下一组 id，等待父级更新，也不会自动清理父级数组。H5 原生按钮支持 Enter / Space，并提供 `aria-expanded` / `aria-controls`；原生点击发出同一数组。展开模式使用统一的中文状态标签。

## Props

| Prop                 | Type               | Default          | 说明                               |
| -------------------- | ------------------ | ---------------- | ---------------------------------- |
| `className`          | `ClassValue`       | `undefined`      | 通过目标对应的 `cn` 合并根节点样式 |
| `label`              | `string`           | `Agent 执行轨迹` | 标题                               |
| `open`               | `boolean`          | `undefined`      | 受控展开状态                       |
| `defaultOpen`        | `boolean`          | `false`          | 非受控默认展开状态                 |
| `steps`              | `AgentTraceStep[]` | `[]`             | 推理步骤                           |
| `expandable`         | `boolean`          | `false`          | 启用独立行展开                     |
| `expandedIds`        | `string[]`         | `undefined`      | 受控展开行 id                      |
| `defaultExpandedIds` | `string[]`         | `[]`             | 初始非受控展开行 id                |

## Events

| Event                | Payload    | 说明                              |
| -------------------- | ---------- | --------------------------------- |
| `update:open`        | `boolean`  | 展开状态变化                      |
| `update:expandedIds` | `string[]` | 请求更新展开行；不影响分组 `open` |

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentThinking.vue` |

原生示例从 `wevu` 导入 `ref`，组件使用上述 `.vue` 默认导出。省略 `expandedIds` 是非受控模式，显式 `[]` 是受控的全部关闭。

:::
