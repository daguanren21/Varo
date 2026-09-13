# AgentWorkspace

组合来源授权、会话版本、执行区和输入框的双端 Agent Block。

## 基础用法

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import AgentWorkspace from '@/components/blocks/agent-workspace.vue'

const open = shallowRef(true)
const prompt = shallowRef('')

function submit(value: string) {
  console.log(value)
}
</script>

<template>
  <AgentWorkspace
    v-model:prompt="prompt"
    :open="open"
    placement="docked"
    title="问题分析"
    @close="open = false"
    @submit="submit"
  />
</template>
```

## Props

| Prop              | 类型                            | 默认值                           | 说明           |
| ----------------- | ------------------------------- | -------------------------------- | -------------- |
| `activeVersionId` | `string`                        | `undefined`                      | 当前会话版本   |
| `busy`            | `boolean`                       | `false`                          | 执行中状态     |
| `contextUsage`    | `number`                        | `0`                              | 上下文占用比例 |
| `messages`        | `AgentConversationMessage[]`    | `[]`                             | 对话消息       |
| `open`            | `boolean`                       | `true`                           | 是否显示       |
| `placement`       | `'page' \| 'docked' \| 'sheet'` | `'page'`                         | 布局模式       |
| `prompt`          | `string`                        | `''`                             | 输入内容       |
| `receipts`        | `AgentSourceReceiptItem[]`      | `[]`                             | 来源回执       |
| `retrieval`       | `AgentRetrievalItem[]`          | `[]`                             | 检索进度       |
| `sources`         | `AgentContextSource[]`          | `[]`                             | 可用来源       |
| `subtitle`        | `string`                        | `'先确认可访问来源，再提交任务'` | 副标题         |
| `tasks`           | `AgentTask[]`                   | `[]`                             | 执行任务       |
| `title`           | `string`                        | `'Agent 工作区'`                 | 标题           |
| `versions`        | `readonly AgentThreadVersion[]` | `[]`                             | 会话版本       |

## Events

| Event            | Payload                         | 说明         |
| ---------------- | ------------------------------- | ------------ |
| `submit`         | `string`                        | 提交输入     |
| `update:prompt`  | `string`                        | 同步输入内容 |
| `close`          | `void`                          | 关闭工作区   |
| `toggleSource`   | `(AgentContextSource, boolean)` | 切换来源     |
| `connectSource`  | `AgentContextSource`            | 连接来源     |
| `retryRetrieval` | `AgentRetrievalItem`            | 重试检索     |
| `retryTask`      | `AgentTask`                     | 重试任务     |
| `approveTask`    | `AgentTask`                     | 批准任务     |
| `cancelTask`     | `void`                          | 取消任务     |
| `selectVersion`  | `AgentThreadVersion`            | 选择版本     |
| `branchVersion`  | `AgentThreadVersion`            | 创建分支     |
| `pinVersion`     | `AgentThreadVersion`            | 固定版本     |
| `openReceipt`    | `AgentSourceReceiptItem`        | 打开回执     |
| `connectReceipt` | `AgentSourceReceiptItem`        | 连接回执来源 |

## Slots

| Slot        | 说明                             |
| ----------- | -------------------------------- |
| `execution` | 替换默认对话、检索、任务和回执区 |

::: warning Weapp 插槽配置
使用无参数 `#execution` 时，在 `weapp-vite` 中设置 `weapp.vue.template.scopedSlotsRequireProps: true`，避免父级状态被泛型插槽转换遗漏。
:::

::: info 平台导入
H5 使用 `vue`；小程序将示例中的 `vue` 替换为 `wevu`。两端都默认导入安装后的 `@/components/blocks/agent-workspace.vue`。
:::
