# AgentSelectionActions

针对选中文本执行解释、优化、缩短等 Agent 操作。

## 案例

<AgentComponentDemo component="selection-actions" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentSelectionActions } from '@/components/agent-ui'
</script>

<template>
  <AgentSelectionActions :text="selectedText" :actions="actions" />
</template>
```

## Props

| Prop      | Type                     | Default    | 说明     |
| --------- | ------------------------ | ---------- | -------- |
| `text`    | `string`                 | `required` | 选中文本 |
| `actions` | `AgentSelectionAction[]` | `[]`       | 动作     |

## Events

| Event    | Payload            | 说明     |
| -------- | ------------------ | -------- |
| `select` | `{ action; text }` | 选择操作 |

## 平台差异

| Target | Import                                                       |
| ------ | ------------------------------------------------------------ |
| H5     | Named export from `@/components/agent-ui`                    |
| weapp  | 默认导出自 `@/components/agent-ui/AgentSelectionActions.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
