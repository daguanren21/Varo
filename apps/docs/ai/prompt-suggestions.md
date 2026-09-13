# AgentPromptSuggestions

水平滚动的 Agent 提示词建议。

## 案例

<AgentComponentDemo component="prompt-suggestions" locale="zh" />

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

::: info 平台差异

| Target | Import                                             |
| ------ | -------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`          |
| weapp  | `@/components/agent-ui/AgentPromptSuggestions.vue` |

:::
