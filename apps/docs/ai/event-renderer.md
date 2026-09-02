# AgentEventRenderer

把 AgentStreamSnapshot 投影为推理、工具、回答和审批 UI。

## 案例

<AgentComponentDemo component="event-renderer" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

UI 组件由 Registry 安装到项目本地，因此从 `@/components/agent-ui` 导入；`@varo-ui/ai` 只提供事件协议、流控制和 Markdown 能力，不导出 Vue/Wevu UI 组件。

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
