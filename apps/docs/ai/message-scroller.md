# AgentMessageScroller

感知阅读位置的流式会话视口和回到底部按钮。

## 案例

<AgentComponentDemo component="message-scroller" locale="zh" />

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
import { AgentMessageScroller } from '@/components/agent-ui'
</script>

<template>
  <AgentMessageScroller :at-live-edge="false" @follow="follow">
    <AgentConversation :messages="messages" />
  </AgentMessageScroller>
</template>
```

## Props

| Prop          | Type               | Default          | 说明             |
| ------------- | ------------------ | ---------------- | ---------------- |
| `atLiveEdge`  | `boolean`          | `true`           | 是否位于实时边缘 |
| `followLabel` | `string`           | `Jump to latest` | 按钮文案         |
| `maxHeight`   | `number \| string` | `480`            | 最大高度         |

## Events

| Event               | Payload   | 说明             |
| ------------------- | --------- | ---------------- |
| `follow`            | `void`    | 跳到最新         |
| `update:atLiveEdge` | `boolean` | 更新实时边缘状态 |

## Slots

| Slot      | 说明     |
| --------- | -------- |
| `default` | 会话内容 |

## 平台差异

| Target | Import                                                      |
| ------ | ----------------------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`                   |
| weapp  | 默认导出自 `@/components/agent-ui/AgentMessageScroller.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
