# AgentChat Block

将导航头、消息历史、事件渲染、审批和输入区组合成一个对话 Block。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
# 原生 Wevu 工程改用 --target weapp
```

无需先装 `components/agent-ui`：此 Block 只安装 conversation 及其必要依赖，不包含 advanced、RAG、fine-tune 或 workspace UI。CLI 列出的 npm 依赖需另外安装；原生全局样式见 [Wevu Registry](/guide/shadcn-mode)。应用收到 `approve`、`reject`、`retry` 和取消相关事件后，需要自行处理网络请求和审批；Block 不会自动执行这些操作。

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

两端都按是否提供 `modelValue` 判断是否受控。仅传 `:model-value="''"` 而不监听更新时，父级未接受的编辑不能提交。

原生输入在 `busy` 时可编辑但不能提交，`disabled` 才禁用编辑；H5 在 `busy` 时禁用输入。原生 playground 的 `pages/chat-prompt/index` 用原生组件演示本地草稿、应用拒绝或接受更新、外部清空及忙碌期间保留草稿，不使用 jsdom 模拟布局。

此示例只保存静态本地消息，不连接模型。接入活动聊天时由 TanStack AI 持有消息和 abort；`snapshot` 直接传入 `client.getSnapshot()` / 订阅获得的真实 `ChatClientSnapshot`。`busy` 从 SDK `isLoading`、待处理的 `interruptState.interrupts` 和 `interruptState.resuming` 投影，不向 SDK 写入展示状态。将 `submit`、`stop`、`retry` 接到 SDK `sendMessage`、`stop`、`reload`，由应用决定新建会话和关闭策略；不要在 UI 中再建 reducer。`messages` 保留静态历史展示契约，不是第二份活动 transcript。禁用输入不会阻止忙碌时停止。Block 只在距底部 64px 内跟随内容增长，向上阅读时保留滚动位置。接入示例见 [AI 指南](./index) 与 [AgentEventRenderer](./event-renderer)。

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
| `messages` | `readonly AgentConversationEntry[]` | `[]` | 静态消息或保留完整 parts 的 SDK 历史 |
| `snapshot`        | `ChatClientSnapshot`         | `—`          | 真实 TanStack SDK 快照，不是展示状态对象   |
| `subtitle`        | `string`                     | `—`          | 副标题                                     |
| `suggestions`     | `string[]`                   | `[]`         | 建议词                                     |
| `title`           | `string`                     | `Varo Agent` | 标题                                       |

## Events

| Event               | Payload  | 说明                                                    |
| ------------------- | -------- | ------------------------------------------------------- |
| `approve`           | `string` | 请求批准该 interrupt ID；由应用解析 SDK 中断            |
| `close`             | `void`   | 关闭                                                    |
| `historySelect`     | `string` | 请求应用切换到给定历史 id；忙碌、禁用或重复选择时不发送 |
| `newConversation`   | `void`   | 请求应用清空当前会话                                    |
| `stop`              | `void`   | 请求应用取消生成（仅忙碌时显示）                        |
| `reject`            | `string` | 请求拒绝该 interrupt ID；由应用解析 SDK 中断            |
| `retry`             | `void`   | 重试                                                    |
| `retryInterrupts` | `void` | 重试当前可恢复的审批事务，不重新生成回答 |
| `cancelInterrupts` | `void` | 取消当前中断事务 |
| `submit`            | `string` | 提交                                                    |
| `update:modelValue` | `string` | 更新提示词                                              |

批准/拒绝时，应用从 `client.getInterrupts()` 查找同 ID 的 `tool-approval`，检查可解析状态后调用 `resolveInterrupt(true)` / `resolveInterrupt(false)`。UI 不以选择值或工具名替代 interrupt ID，不执行网络或工具；业务授权仍由应用与服务端负责。

::: info 平台差异

| Target | Import                               |
| ------ | ------------------------------------ |
| H5     | `@/components/blocks/agent-chat.vue` |
| weapp  | `@/components/blocks/agent-chat.vue` |

:::
