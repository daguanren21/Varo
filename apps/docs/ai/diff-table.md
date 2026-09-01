# AgentDiffTable

展示 AI 对结构化表格提出的新增、删除和更新。

## 案例

<AgentComponentDemo component="diff-table" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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
