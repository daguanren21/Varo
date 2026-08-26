# AgentPromptSuggestions

水平滚动的 Agent 提示词建议。

## 案例

<AgentComponentDemo component="prompt-suggestions" locale="zh" />

## 安装

```bash
pnpm dlx @varo/cli add --target h5 components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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

| Prop | Type | Default | 说明 |
| --- | --- | --- | --- |
| `suggestions` | `string[]` | `[]` | 建议词 |
| `disabled` | `boolean` | `false` | 禁用；小程序支持 |

## Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `select` | `string` | 选中建议词 |

## 平台差异

| Target | Import |
| --- | --- |
| H5 | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentPromptSuggestions.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
