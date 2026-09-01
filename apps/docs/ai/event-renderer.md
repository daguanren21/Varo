# AgentEventRenderer

把 AgentStreamSnapshot 投影为推理、工具、回答和审批 UI。

## 案例

<AgentComponentDemo component="event-renderer" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentEventRenderer } from '@/components/agent-ui'
</script>

<template>
  <AgentEventRenderer :snapshot="snapshot" @approve="approve" />
</template>
```

## Props

| Prop       | Type                  | Default    | 说明       |
| ---------- | --------------------- | ---------- | ---------- |
| `snapshot` | `AgentStreamSnapshot` | `required` | 事件流快照 |

## Events

| Event     | Payload  | 说明     |
| --------- | -------- | -------- |
| `approve` | `string` | 审批通过 |
| `reject`  | `void`   | 拒绝     |
| `retry`   | `void`   | 重试     |

## Slots

| Slot      | 说明         |
| --------- | ------------ |
| `actions` | 回答完成操作 |
| `default` | 后置扩展     |

## 平台差异

| Target | Import                                         |
| ------ | ---------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`      |
| weapp  | `@/components/agent-ui/AgentEventRenderer.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
