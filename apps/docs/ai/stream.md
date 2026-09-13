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
| `status`    | `AgentStreamStatus` | `idle`      | 流状态                             |

## Events

| Event   | Payload | 说明     |
| ------- | ------- | -------- |
| `retry` | `void`  | 请求重试 |

## Slots

| Slot      | 说明         |
| --------- | ------------ |
| `actions` | 完成后的操作 |

::: info 流式调度
`@varo-ui/ai` 对齐 `markstream-core 2.0.7` 和 `stream-markdown-parser 1.2.13`。H5 使用 RAF 调度；小程序使用定时帧调度，但保持 grapheme 边界、代码围栏原子提交、追赶延迟、启动延迟、burst reveal、暂停、恢复、flush 和 dispose 契约。
:::

::: info 平台差异

| Target | Import                                    |
| ------ | ----------------------------------------- |
| H5     | Named export from `@/components/agent-ui` |
| weapp  | `@/components/agent-ui/AgentStream.vue`   |

:::
