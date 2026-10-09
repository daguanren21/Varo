# AgentSourceChat Block

可安装的知识来源对话切片：先显示可用来源与启用范围，再呈现检索进度、来源回执、回答引用和转工单入口。它组合现有 `AgentChat`、`AgentComposerScope`、`AgentRetrievalProgress`、`AgentSourceReceipt` 与 `AgentCitations`，不拥有连接、检索或工单执行器。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-source-chat
# 原生 Wevu 工程：
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-source-chat
```

两个目标都安装到 `src/components/blocks/agent-source-chat.vue`，并安装同目录的 `agent-source-chat.types.ts`。CLI 报告的 npm 依赖需要另外安装。

直接 Registry 依赖为 `blocks/agent-chat`、`components/agent-workspace`、`components/agent-advanced`、`components/button` 与 `utils/primitives`。引用功能明确选择 `agent-advanced`；不安装 monolithic `components/agent-ui`，也不扩张基础 `agent-chat` 的 conversation 闭包。共享来源类型属于 `agent-workspace`，引用类型属于 `agent-advanced`。传递闭包包含 Agent 主题、conversation、presentation 与所需基础控件；以安装计划为准，不手工复制依赖文件。

H5 使用安装源中的完整依赖 CSS 导入。原生通过 `weapp.styles` 全局注册全部已安装 CSS，`varo.css` 排在前面，`include: 'app.vue'`；保留 SFC 的 `styleIsolation: apply-shared`，不要把全局 CSS 导入组件局部 WXSS。配置见 [Registry 模式](/guide/shadcn-mode)。原生运行时使用 `wevu`，不是 Vue alias。目标声明仅覆盖 `h5` / `weapp`，不代表实验性 profile 或设备认证。

## 数据与执行边界

- `sources`、`retrieval`、`receipts`、`citations`、`messages`、回答状态与工单资格全部由应用注入；Block 不把点击当作外部执行成功，也不乐观修改这些数组。
- `AgentContextSource.status` 继续使用 `available | connecting | unavailable`。省略状态按已有组件约定视为 `available`。只有 `enabled` 且可用的来源允许提交；不可用来源的连接意图不会自动授权或启用来源。
- 检索继续使用 `AgentRetrievalItem` 的 `queued | reading | read | skipped | failed`；回执继续使用 `AgentSourceReceiptItem` 的 `read | skipped | failed`。空结果可以是“已读、0 条”，超出范围可以是“已跳过”。应用必须给出真实结果与原因，Block 不从消息文字猜测。
- `AgentCitationItem` 原样传给 `openCitation`。`url` 可省略，例如应用内文档可用 `id` 定位。应用只提供确实能打开的引用，负责权限检查、URL 安全策略及宿主导航。Block 不调用 `window.open`、原生导航或网络。
- `createTicket` 只是申请转交；应用负责审核、去重、实际创建、结果和存储。接收后应移除 `ticket` 或设置 `busy`，避免在处理同一申请时继续授权点击。
- 不包含模型、账号授权、凭据、服务端知识检索、工单 API 或持久化，也不提供假的成功兜底。

## 最小受控示例

以下示例仅演示本地空结果与转交申请，没有真实服务。实际检索应用应在提交后设置 `responseState='retrieving'` 并更新检索项，再由真实结果更新回答、回执与引用。

```vue
<script setup lang="ts">
import type { AgentConversationMessage } from '@/components/agent-ui/types'
import type { AgentContextSource } from '@/components/agent-ui/workspace-types'
import type { AgentSourceChatResponseState, AgentSourceChatTicketIntent } from '@/components/blocks/agent-source-chat.types'
import { shallowRef } from 'vue'
import AgentSourceChat from '@/components/blocks/agent-source-chat.vue'
import { VButton } from '@/components/ui/button'

const open = shallowRef(true)
const prompt = shallowRef('')
const sources = shallowRef<AgentContextSource[]>([
  { id: 'local', label: '本地演示资料', enabled: true, status: 'available' },
])
const messages = shallowRef<AgentConversationMessage[]>([])
const state = shallowRef<AgentSourceChatResponseState>('idle')
const ticket = shallowRef<AgentSourceChatTicketIntent>()
const notice = shallowRef('本地空结果演示；没有连接外部服务。')

function submit(question: string) {
  messages.value = [{ id: 'question', role: 'user', content: question }]
  prompt.value = ''
  state.value = 'empty'
  ticket.value = { question, reason: 'empty', sourceIds: ['local'] }
  notice.value = '本地演示资料为空；可以申请转交。'
}
function toggleSource(source: AgentContextSource, enabled: boolean) {
  sources.value = sources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
}
function requestTicket(intent: AgentSourceChatTicketIntent) {
  notice.value = `已收到转交申请：${intent.question}。本例没有创建工单。`
  ticket.value = undefined
}
function reset() {
  prompt.value = ''
  messages.value = []
  state.value = 'idle'
  ticket.value = undefined
  notice.value = '已清空本地会话。'
}
</script>

<template>
  <AgentSourceChat
    v-if="open" v-model="prompt" :sources="sources" :messages="messages"
    :response-state="state" :response-detail="notice" :ticket="ticket"
    @submit="submit" @toggle-source="toggleSource" @create-ticket="requestTicket"
    @new-conversation="reset" @close="open = false"
  />
  <VButton v-else @click="open = true">
    打开知识问答
  </VButton>
</template>
```

原生页面将 reactivity import 改为 `wevu`、按钮改为 `@/components/ui/v-button.vue` 默认导入，使用 `@toggleSource` / `@createTicket` / `@newConversation`。多值事件必须接收一个 tuple：

```ts
function toggleSource([source, enabled]: [AgentContextSource, boolean]) {
  sources.value = sources.value.map(item => item.id === source.id ? { ...item, enabled } : item)
}
```

## Props

| Prop             | Type                           | 默认值 / 语义                                          |
| ---------------- | ------------------------------ | ------------------------------------------------------ |
| `modelValue`     | `string`                       | 可选；未提供时组件保留本地草稿，`''` 是受控空值        |
| `sources`        | `AgentContextSource[]`         | `[]`；可用性与范围由应用维护                           |
| `retrieval`      | `AgentRetrievalItem[]`         | `[]`；`retryable` 是应用授予的重试资格                 |
| `receipts`       | `AgentSourceReceiptItem[]`     | `[]`；展示读取、跳过、失败与可选 `itemCount`           |
| `citations`      | `AgentCitationItem[]`          | `[]`；提供的每条引用都应能由应用处理打开意图           |
| `messages`       | `AgentConversationMessage[]`   | `[]`；传给已有 `AgentChat`                             |
| `responseState`  | `AgentSourceChatResponseState` | `'idle'`                                               |
| `responseDetail` | `string`                       | `''`；应用提供的结果、错误或范围说明                   |
| `ticket`         | `AgentSourceChatTicketIntent`  | 未提供；提供当前结果的有效转交申请上下文才启用按钮     |
| `busy`           | `boolean`                      | `false`；`responseState='retrieving'` 也视为忙碌       |
| `disabled`       | `boolean`                      | `false`；禁用修改、提交、打开来源与转交，不隐藏证据    |
| `contextUsage`   | `number`                       | `0`；传给来源组件的使用百分比，不在 Block 内估算 token |
| `suggestions`    | `string[]`                     | `[]`；已有 Chat 建议词                                 |
| `title`          | `string`                       | `'知识来源对话'`                                       |

```ts
export type AgentSourceChatResponseState
  = | 'idle' | 'retrieving' | 'answered' | 'empty' | 'out-of-scope' | 'failed'

export interface AgentSourceChatTicketIntent {
  question: string
  reason: Extract<AgentSourceChatResponseState, 'empty' | 'out-of-scope' | 'failed'>
  sourceIds: string[]
}
```

这些只是 Block 的呈现/转交类型，不改变核心 `AgentPartStatus`。工单上下文的 `reason` 必须匹配当前 `responseState`，且 `question.trim()` 非空；`sourceIds` 表示应用记录的请求范围，不是 Block 重新推断的权限。

## Events 与守卫

| Event               | Payload                                            | 可触发条件                                                  |
| ------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| `update:modelValue` | `string`                                           | 输入可编辑且值变化；不自动清空草稿                          |
| `submit`            | `string`                                           | 去除首尾空白后非空，至少一个可用且启用来源，非忙碌/禁用     |
| `toggleSource`      | H5：`(source, enabled)`；原生：`[source, enabled]` | 当前来源存在、可用、值确实改变，非忙碌/禁用                 |
| `connectSource`     | `AgentContextSource`                               | 当前来源为 `unavailable`，非忙碌/禁用                       |
| `retryRetrieval`    | `AgentRetrievalItem`                               | 当前项为 `failed` 且 `retryable`，非忙碌/禁用               |
| `openReceipt`       | `AgentSourceReceiptItem`                           | 当前回执为 `read`，非忙碌/禁用                              |
| `connectReceipt`    | `AgentSourceReceiptItem`                           | 当前回执为 `failed`，非忙碌/禁用；不是连接成功              |
| `openCitation`      | `AgentCitationItem`                                | 引用仍在当前列表中，非忙碌/禁用                             |
| `createTicket`      | `AgentSourceChatTicketIntent`                      | 有效 `ticket` 与当前失败/空结果/超范围状态匹配，非忙碌/禁用 |
| `newConversation`   | 无                                                 | 非忙碌/禁用且存在草稿、消息或结果；应用清空其拥有的状态     |
| `stop`              | 无                                                 | 仅忙碌；应用取消真实任务/生产者                             |
| `close`             | 无                                                 | 应用关闭页面切片，并按业务要求取消任务                      |

Block 按当前 props 的 id 重新定位列表项，再判断资格，不继续转发已经被替换的陈旧对象。`stop` 与 `close` 是既有 Chat 的退出/取消通道：**即使 `disabled` 仍可停止或关闭**，不会困住正在进行的任务。禁用和忙碌不隐藏回执或引用，只禁用操作；检索列表保持原始项与状态，不把它们改写成成功或不可重试。

省略 `modelValue` 与传入 `''` 不同。原生使用 `type: null, value: null` 属性元数据与 nullish 存在性检查。提交不清空非受控草稿；需要应用接受/拒绝更新、外部清空或切换会话草稿时使用 `v-model`。原生忙碌时可以编辑下一条草稿但不能提交；H5 沿用 `AgentChat` 忙碌时禁用编辑的行为。

## 本地演示与验收范围

- H5：playground 的 `/?demo=source-chat`，组件为 `SourceChatDemo.vue`。
- 原生：`pages/source-chat/index`。
- 手动流程：切换来源可用性 → 请求并手动完成**演示**连接 → 显式启用范围 → 提问 → 排队/读取 → 成功、失败、空结果或超出范围 → 打开本地引用原文/申请转交。
- 禁用操作时证据仍保留；转交后应用移除授权对象，按钮不可再次申请。切换非受控输入可检查本地草稿与受控空串的区别。

对应真实 E2E 为 `apps/e2e/tests/h5/source-chat.e2e.ts` 与 `apps/e2e/tests/weapp-native/source-chat.e2e.ts`。它们通过实际控件操作检查页面状态，不调用组件内部方法或用 `setData` 假扮输入。原生断言针对原生文字、回执与引用控件和本地来源预览，**不声称 headless 能观察 Chat 的 rich-text 消息正文**。未发布的 Wevu plain-slot 协议与真实宿主可观测性限制仍须独立验收；不会用上下文桥、假几何或复制消息文字绕过。
