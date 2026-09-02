# AgentCitations

内联引用对应的可折叠来源集合。

## 案例

<AgentComponentDemo component="citations" locale="zh" />

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
import { AgentCitations } from '@/components/agent-ui'
</script>

<template>
  <AgentCitations title="来源" :items="citations" default-open />
</template>
```

## Props

| Prop          | Type                  | Default   | 说明     |
| ------------- | --------------------- | --------- | -------- |
| `items`       | `AgentCitationItem[]` | `[]`      | 引用     |
| `title`       | `string`              | `Sources` | 标题     |
| `defaultOpen` | `boolean`             | `false`   | 默认展开 |

## Events

| Event         | Payload             | 说明     |
| ------------- | ------------------- | -------- |
| `open`        | `AgentCitationItem` | 打开引用 |
| `update:open` | `boolean`           | 展开变化 |

## 平台差异

| Target | Import                                                |
| ------ | ----------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`             |
| weapp  | 默认导出自 `@/components/agent-ui/AgentCitations.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
