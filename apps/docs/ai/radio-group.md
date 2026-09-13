# AgentRadioGroup

带共享指示器的 Agent 单选决策控件。

## 案例

<AgentComponentDemo component="radio-group" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentRadioGroup } from '@/components/agent-ui'
</script>

<template>
  <AgentRadioGroup v-model:value="value" :choices="choices" />
</template>
```

## Props

| Prop          | Type                         | Default    | 说明     |
| ------------- | ---------------------------- | ---------- | -------- |
| `choices`     | `AgentRadioChoice[]`         | `[]`       | 选项     |
| `orientation` | `'horizontal' \| 'vertical'` | `vertical` | 排列方向 |
| `value`       | `string`                     | `''`       | 选中值   |

## Events

| Event          | Payload  | 说明       |
| -------------- | -------- | ---------- |
| `update:value` | `string` | 更新选中值 |
| `change`       | `string` | 选择变化   |

::: info 平台差异

| Target | Import                                      |
| ------ | ------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`   |
| weapp  | `@/components/agent-ui/AgentRadioGroup.vue` |

:::
