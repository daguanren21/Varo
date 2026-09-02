# AgentFineTune

Agent 生成设计的属性检查器和调优面板。

## 案例

<AgentComponentDemo component="fine-tune" locale="zh" />

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
import { AgentFineTune } from '@/components/agent-ui'
</script>

<template>
  <AgentFineTune v-model:controls="controls" title="调整卡片" />
</template>
```

## Props

| Prop       | Type                     | Default     | 说明   |
| ---------- | ------------------------ | ----------- | ------ |
| `controls` | `AgentFineTuneControl[]` | `[]`        | 控制项 |
| `title`    | `string`                 | `Fine tune` | 标题   |

## Events

| Event             | Payload                  | 说明       |
| ----------------- | ------------------------ | ---------- |
| `apply`           | `AgentFineTuneControl[]` | 应用       |
| `update:controls` | `AgentFineTuneControl[]` | 更新控制项 |

## 平台差异

| Target | Import                                               |
| ------ | ---------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`            |
| weapp  | 默认导出自 `@/components/agent-ui/AgentFineTune.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
