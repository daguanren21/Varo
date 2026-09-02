# AgentPromptSuggestions

水平滚动的 Agent 提示词建议。

## 案例

<AgentComponentDemo component="prompt-suggestions" locale="zh" />

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
import { AgentPromptSuggestions } from '@/components/agent-ui'
</script>

<template>
  <AgentPromptSuggestions :suggestions="suggestions" @select="send" />
</template>
```

## Props

| Prop          | Type       | Default | 说明             |
| ------------- | ---------- | ------- | ---------------- |
| `suggestions` | `string[]` | `[]`    | 建议词           |
| `disabled`    | `boolean`  | `false` | 禁用；小程序支持 |

## Events

| Event    | Payload  | 说明       |
| -------- | -------- | ---------- |
| `select` | `string` | 选中建议词 |

## 平台差异

| Target | Import                                             |
| ------ | -------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`          |
| weapp  | `@/components/agent-ui/AgentPromptSuggestions.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
