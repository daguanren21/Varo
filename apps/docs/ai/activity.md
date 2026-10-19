# AgentActivity

统一展示推理、搜索、工具调用和执行轨迹。

## 案例

<AgentComponentDemo component="activity" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentActivity } from '@/components/agent-ui'
</script>

<template>
  <AgentActivity title="Agent 活动" :items="activity" />
</template>
```

## 可选行展开

默认直接显示每一项的 `detail`。设置 `expandable` 后，有详情的行显示展开按钮，无详情的行保持静态，不进入焦点顺序；可同时展开多个项目。

```vue
<script setup lang="ts">
import type { AgentActivityItem } from '@/components/agent-ui'
import { ref } from 'vue'
import { AgentActivity } from '@/components/agent-ui'

const expandedIds = ref(['search'])
const activity: AgentActivityItem[] = [
  { id: 'search', kind: 'search', title: '检索资料', status: 'running', detail: '正在读取候选来源。' },
  { id: 'tool', kind: 'tool', title: '生成摘要', status: 'failed', detail: '应用报告本次生成失败。' },
]
</script>

<template>
  <AgentActivity v-model:expanded-ids="expandedIds" :items="activity" expandable />
</template>
```

`id` 必须唯一且稳定；重排保留展开项。省略 `expandedIds` 时，`defaultExpandedIds` 只初始化一次，删除项目会清理内部记录。传入 `expandedIds`（包括空数组）后，组件仅发出下一组 id；父级拒绝更新时保持原样，删除项目也不会改写父级数组。H5 使用支持 Enter / Space 的原生按钮及 `aria-expanded` / `aria-controls`；原生点击发出同一数组。状态采用统一中文展示标签，额外的 `queued` / `cancelled` 分别显示“排队中” / “已取消”。这些状态仅用于展示，不执行任务或重试。

## Props

| Prop                 | Type                  | Default          | 说明                |
| -------------------- | --------------------- | ---------------- | ------------------- |
| `items`              | `AgentActivityItem[]` | `[]`             | 活动项              |
| `title`              | `string`              | `Agent activity` | 标题                |
| `expandable`         | `boolean`             | `false`          | 启用独立行展开      |
| `expandedIds`        | `string[]`            | `undefined`      | 受控展开行 id       |
| `defaultExpandedIds` | `string[]`            | `[]`             | 初始非受控展开行 id |

## Events

| Event                | Payload    | 说明           |
| -------------------- | ---------- | -------------- |
| `update:expandedIds` | `string[]` | 请求更新展开行 |

::: info 平台差异

| Target | Import                                               |
| ------ | ---------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`            |
| weapp  | 默认导出自 `@/components/agent-ui/AgentActivity.vue` |

原生示例从 `wevu` 导入 `ref`，组件使用上述 `.vue` 默认导出。省略 `expandedIds` 与显式传入空数组含义不同。

:::
