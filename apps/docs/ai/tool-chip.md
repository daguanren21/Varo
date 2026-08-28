# AgentToolChip

紧凑展示工具名称、摘要与执行状态。

## 案例

<AgentComponentDemo component="tool-chip" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentToolChip } from '@/components/agent-ui'
</script>

<template>
  <AgentToolChip :tool="tool" />
</template>
```

## Props

| Prop      | Type            | Default    | 说明           |
| --------- | --------------- | ---------- | -------------- |
| `compact` | `boolean`       | `false`    | 仅显示紧凑信息 |
| `tool`    | `AgentToolPart` | `required` | 工具状态       |

## Events

无。

## 平台差异

| Target     | Import                                    |
| ---------- | ----------------------------------------- |
| H5         | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentToolChip.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
