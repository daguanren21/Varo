# AgentDiffTable

展示 AI 对结构化表格提出的新增、删除和更新。

## 案例

<AgentComponentDemo component="diff-table" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

UI 组件由 Registry 安装到项目本地，因此从 `@/components/agent-ui` 导入；`@varo-ui/ai` 只提供事件协议、流控制和 Markdown 能力，不导出 Vue/Wevu UI 组件。

## 基础用法

```vue
<script setup lang="ts">
import { AgentDiffTable } from '@/components/agent-ui'
</script>

<template>
  <AgentDiffTable :columns="columns" :rows="changedRows" />
</template>
```

## Props

| Prop      | Type                 | Default            | 说明   |
| --------- | -------------------- | ------------------ | ------ |
| `columns` | `AgentTableColumn[]` | `[]`               | 列     |
| `rows`    | `AgentTableRow[]`    | `[]`               | 变更行 |
| `title`   | `string`             | `Proposed changes` | 标题   |

## Events

| Event    | Payload         | 说明     |
| -------- | --------------- | -------- |
| `accept` | `void`          | 接受变更 |
| `reject` | `void`          | 拒绝变更 |
| `select` | `AgentTableRow` | 选择行   |

## 平台差异

| Target | Import                                                |
| ------ | ----------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`             |
| weapp  | 默认导出自 `@/components/agent-ui/AgentDiffTable.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
