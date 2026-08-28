# AgentApproval

通用人工审批、选择、拒绝与确认卡片。

## 案例

<AgentComponentDemo component="approval" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

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
| `rejectText`  | `string`        | `拒绝`     | 拒绝按钮 |
| `title`       | `string`        | `required` | 审批标题 |
| `value`       | `string`        | `''`       | 当前选择 |

## Events

| Event          | Payload  | 说明     |
| -------------- | -------- | -------- |
| `approve`      | `string` | 确认     |
| `reject`       | `void`   | 拒绝     |
| `update:value` | `string` | 更新选择 |

## Slots

| Slot      | 说明     |
| --------- | -------- |
| `default` | 补充内容 |

## 平台差异

| Target     | Import                                    |
| ---------- | ----------------------------------------- |
| H5         | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentApproval.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
