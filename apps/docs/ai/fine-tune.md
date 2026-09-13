# AgentFineTune

Agent 生成设计的属性检查器和调优面板。

## 案例

<AgentComponentDemo component="fine-tune" locale="zh" />

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

::: info 平台差异

| Target | Import                                               |
| ------ | ---------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`            |
| weapp  | 默认导出自 `@/components/agent-ui/AgentFineTune.vue` |

:::
