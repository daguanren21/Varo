# AgentToolApproval

审查工具详情、允许一次、记住权限或拒绝执行。

## 案例

<AgentComponentDemo component="tool-approval" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentToolApproval } from '@/components/agent-ui'
</script>

<template>
  <AgentToolApproval tool="npm.publish" :details="details" @allow="allow" />
</template>
```

## Props

| Prop          | Type                 | Default    | 说明     |
| ------------- | -------------------- | ---------- | -------- |
| `tool`        | `string`             | `required` | 工具名称 |
| `description` | `string`             | `—`        | 说明     |
| `details`     | `{ label; value }[]` | `[]`       | 工具详情 |
| `remember`    | `boolean`            | `false`    | 记住权限 |

## Events

| Event             | Payload                 | 说明         |
| ----------------- | ----------------------- | ------------ |
| `allow`           | `{ remember: boolean }` | 允许         |
| `deny`            | `void`                  | 拒绝         |
| `update:remember` | `boolean`               | 更新记忆选项 |

## 平台差异

| Target | Import                                                   |
| ------ | -------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                |
| weapp  | 默认导出自 `@/components/agent-ui/AgentToolApproval.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
