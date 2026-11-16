# AgentToolApproval

审查工具详情，选择允许一次、记住权限或拒绝执行。

## 案例

<AgentComponentDemo component="tool-approval" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentToolApproval } from '@/components/agent-ui'
</script>

<template>
  <AgentToolApproval tool="npm.publish" :details="details" @allow="allow" />
</template>
```

该卡片只发送应用意图；`remember` 只表示用户选择，不会持久化权限，也不会自动批准后续操作。接入 TanStack 工具审批时，应用必须保存与卡片对应的 interrupt ID，并从 SDK 当前 `getInterrupts()` 找到可解析的 `tool-approval`，将允许/拒绝映射为 `resolveInterrupt(true)` / `resolveInterrupt(false)`。业务授权、记忆策略和工具执行归应用与服务端。需要直接携带 interrupt ID 的渲染器契约见 [AgentEventRenderer](./event-renderer)。

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

::: info 平台差异

| Target | Import                                                   |
| ------ | -------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                |
| weapp  | 默认导出自 `@/components/agent-ui/AgentToolApproval.vue` |

:::
