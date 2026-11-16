# AgentApproval

通用人工审批、选择、拒绝与确认卡片。

## 案例

<AgentComponentDemo component="approval" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentApproval } from '@/components/agent-ui'
</script>

<template>
  <AgentApproval v-model:value="value" title="确认发布" :choices="choices" />
</template>
```

## Props

| Prop          | Type            | Default    | 说明     |
| ------------- | --------------- | ---------- | -------- |
| `approveText` | `string`        | `确认`     | 确认按钮 |
| `choices`     | `AgentChoice[]` | `[]`       | 审批选项 |
| `description` | `string`        | `—`        | 说明     |
| `disabled` | `boolean` | `false` | 禁止选择、批准与拒绝；用于保护失效或提交中的事务 |
| `rejectText`  | `string`        | `拒绝`     | 拒绝按钮 |
| `title`       | `string`        | `required` | 审批标题 |
| `value`       | `string`        | `''`       | 当前选择 |

## Events

| Event          | Payload  | 说明     |
| -------------- | -------- | -------- |
| `approve`      | `string` | 确认     |
| `reject`       | `void`   | 拒绝     |
| `update:value` | `string` | 更新选择 |

独立卡片的 `approve` 字符串是当前选择值，`reject` 无载荷；这不同于 [AgentEventRenderer](./event-renderer) 和 AgentChat 转发的 interrupt ID 契约。`AgentChoice` 从 Registry `@/components/agent-ui/types` 导入，不属于 core 协议。应用若将此卡片关联 SDK 审批，必须另行保存 interrupt ID，解析对应 `tool-approval` 的 `true` / `false`，不能把选择值当作中断 ID。卡片不执行网络、工具或授权。

## Slots

| Slot      | 说明     |
| --------- | -------- |
| `default` | 补充内容 |

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentApproval.vue` |

:::
