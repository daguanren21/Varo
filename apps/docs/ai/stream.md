# AgentStream

回答流、光标、错误、重试与完成操作区。

## 案例

<AgentComponentDemo component="stream" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { AgentStream } from '@/components/agent-ui'
</script>

<template>
  <AgentStream content="正在生成…" status="streaming" />
</template>
```

## Props

| Prop        | Type                | Default     | 说明                               |
| ----------- | ------------------- | ----------- | ---------------------------------- |
| `className` | `ClassValue`        | `undefined` | 通过目标对应的 `cn` 合并根节点样式 |
| `content`   | `string`            | `''`        | 可见内容                           |
| `cursor`    | `boolean`           | `true`      | 显示光标                           |
| `error`     | `string`            | `—`         | 错误文案                           |
| `final`     | `boolean`           | `false`     | Markdown 是否结束                  |
| `status`    | `AgentStreamStatus` | `idle`      | Registry 纯展示状态，不是 SDK 状态  |

## Events

| Event   | Payload | 说明     |
| ------- | ------- | -------- |
| `retry` | `void`  | 请求重试 |

`AgentStreamStatus` 从安装后的 `@/components/agent-ui/types` 导入，值为 `idle | streaming | waiting | completed | failed | cancelled`。TanStack SDK 状态则是 `ready | submitted | streaming | error`；请根据实际请求、结果和取消记录投影，不要把 SDK `ready` 直接认作成功或取消。该组件只展示，不持有消息、不归约事件；`retry` 由应用决定是否调用 SDK `reload()`。

## Slots

| Slot      | 说明         |
| --------- | ------------ |
| `actions` | 完成后的操作 |

::: info 流式调度
`@varo-ui/ai` 只提供 Markdown、文本展示节奏与会话版本 helper。H5 使用 RAF，小程序使用定时帧；这些只控制内容如何显示，不代替 TanStack 的传输、活动消息、请求状态或 abort。具体文本节奏与安全 Markdown 行为见 [AI 接入](./index)。
:::

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentStream.vue`   |

:::
