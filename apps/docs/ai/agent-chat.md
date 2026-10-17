# AgentChat Block

组合导航头、消息历史、事件渲染、审批和输入区的完整 Block。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
# 原生 Wevu 工程改用 --target weapp
```

无需先装 `components/agent-ui`：此 Block 只安装 conversation 及其必要依赖，不包含 advanced、RAG、fine-tune 或 workspace UI。CLI 报告的 npm 依赖需另外安装；原生全局样式见 [Wevu Registry](/guide/shadcn-mode)。`approve`、`reject`、`retry` 和取消相关意图不执行网络或审批策略，这些仍由业务层处理。

## 案例

<AgentComponentDemo component="agent-chat" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import type { AgentConversationMessage } from '@/components/agent-ui/types'
import { shallowRef } from 'vue' // 原生页面从 wevu 导入
import AgentChat from '@/components/blocks/agent-chat.vue'

const open = shallowRef(true)
const prompt = shallowRef('')
const messages = shallowRef<AgentConversationMessage[]>([])
let sequence = 0
function send(content: string) {
  messages.value = [...messages.value, { id: String(++sequence), role: 'user', content }]
  prompt.value = ''
}
function newConversation() {
  messages.value = []
  prompt.value = ''
}
</script>

<template>
  <AgentChat v-if="open" v-model="prompt" :messages="messages" @submit="send" @new-conversation="newConversation" @close="open = false" />
  <button v-else @click="open = true">
    打开会话
  </button>
</template>
```

`v-model` 是可选的。未绑定时，Block 保存初始为空的本地草稿；绑定后由父级管理草稿，空字符串也是有效的受控值。`submit` 发送去除首尾空白的文本，但不自动清空草稿；父级可在接受提交后将绑定值设为 `''`。忙碌、禁用或纯空白输入不会提交。

两端均按 `modelValue` 是否提供决定所有权。仅传 `:model-value="''"` 而不监听更新，也保持受控；未经父级接受的编辑不能提交。

原生输入在 `busy` 时仍可编辑下一条草稿，但不能提交；`disabled` 才同时禁用编辑。H5 在 `busy` 时保持禁用输入的既有行为。原生 playground 的 `pages/chat-prompt/index` 演示组件草稿、应用拒绝/接受更新、外部清空及忙碌期间的草稿保留，使用实际原生组件验证，不依赖 jsdom 模拟布局。

此示例只保存本地消息，不连接模型。`newConversation` 和 `close` 必须接到应用的真实状态转换；提供 `busy` 与流式 `snapshot` 时，也必须将 `stop` 接到应用的生产者/网络取消操作。禁用输入不会阻止忙碌时停止。Block 只在距底部 64px 内跟随内容增长，向上阅读时保留滚动位置。

## Props

| Prop              | Type                         | Default      | 说明                                       |
| ----------------- | ---------------------------- | ------------ | ------------------------------------------ |
| `modelValue`      | `string`                     | `—`          | 提供时受控；未提供时组件保存初始为空的草稿 |
| `busy`            | `boolean`                    | `false`      | 忙碌                                       |
| `disabled`        | `boolean`                    | `false`      | 禁用编辑、提交和历史切换，不禁用停止       |
| `closeLabel`      | `string`                     | `关闭 Agent` | 关闭按钮名称                               |
| `layout`          | `'panel' \| 'page'`          | `'panel'`    | 面板或页面布局                             |
| `history`         | `AgentChatHistoryItem[]`     | `[]`         | 应用注入的 `{ id, title }` 历史入口        |
| `activeHistoryId` | `string`                     | `—`          | 当前选中入口                               |
| `messages`        | `AgentConversationMessage[]` | `[]`         | 消息                                       |
| `snapshot`        | `AgentStreamSnapshot`        | `—`          | 快照                                       |
| `subtitle`        | `string`                     | `—`          | 副标题                                     |
| `suggestions`     | `string[]`                   | `[]`         | 建议词                                     |
| `title`           | `string`                     | `Varo Agent` | 标题                                       |

## Events

| Event               | Payload  | 说明                                                    |
| ------------------- | -------- | ------------------------------------------------------- |
| `approve`           | `string` | 批准                                                    |
| `close`             | `void`   | 关闭                                                    |
| `historySelect`     | `string` | 请求应用切换到给定历史 id；忙碌、禁用或重复选择时不发送 |
| `newConversation`   | `void`   | 请求应用清空当前会话                                    |
| `stop`              | `void`   | 请求应用取消生成（仅忙碌时显示）                        |
| `reject`            | `void`   | 拒绝                                                    |
| `retry`             | `void`   | 重试                                                    |
| `submit`            | `string` | 提交                                                    |
| `update:modelValue` | `string` | 更新提示词                                              |

::: info 平台差异

| Target | Import                               |
| ------ | ------------------------------------ |
| H5     | `@/components/blocks/agent-chat.vue` |
| weapp  | `@/components/blocks/agent-chat.vue` |

:::
