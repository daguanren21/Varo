# AI Agent 组件

TanStack AI 拥有 AG-UI 事件、活动消息、流状态、工具中断和请求 abort；Varo UI 只消费 SDK 状态并展示。`@varo-ui/ai` 仅保留安全 Markdown、文本节奏与会话版本 helper，不再提供私有协议、流控制器、channel、SSE 解码器或事件 parser。UI 通过 Registry 安装为可编辑源码。

## 安装

```bash
# H5：Vue SDK binding
pnpm add @varo-ui/ai @tanstack/ai@1.4.0 @tanstack/ai-client@1.1.0 @tanstack/ai-vue@1.0.1
# 原生：只使用 headless SDK + Wevu，不安装 Vue binding
# pnpm add @varo-ui/ai @tanstack/ai@1.4.0 @tanstack/ai-client@1.1.0 wevu@7.10.0
# 按需对话单元；H5 / Weapp 二选一
pnpm dlx @varo-ui/cli add --target h5 components/agent-conversation
pnpm dlx @varo-ui/cli add --target weapp components/agent-conversation

# 直接安装 Block，无需先装全套 Agent UI
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-workspace
```

CLI 复制源码并列出 npm 依赖，需另用 `pnpm add` / `pnpm add -D` 安装全部依赖。`blocks/agent-chat` 仅包含对话所需组件和依赖，不包含 advanced、RAG、fine-tune 或 workspace UI。

| Registry 单元                   | 内容                                             | H5 安装后的入口                                  |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `components/agent-presentation` | 共享展示类型、状态含义与纯函数，无执行策略       | `@/components/agent-ui/presentation`、`types`    |
| `components/agent-conversation` | 消息、Markdown、流式回答、思考、工具、审批、输入 | `@/components/agent-ui/conversation`             |
| `components/agent-workspace`    | 来源范围、检索进度、任务、会话版本与工作区布局   | `@/components/agent-ui/workspace`                |
| `components/agent-advanced`     | 文件差异、表格、媒体、流程、fine-tune 等可选 UI  | `@/components/agent-ui/advanced`、`supplemental` |
| `components/agent-rag`          | RAG 流程展示与来源关联回答                       | `@/components/agent-ui/AgentRagPipeline.vue`     |
| `components/agent-ui`           | 包含以上单元的完整套件                           | `@/components/agent-ui`                          |

仅当确实需要全套组件时执行：

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
# 原生工程改用 --target weapp
```

::: info 导入
按需安装的 H5 组件从上表对应单元导入，例如 `import { AgentComposer } from '@/components/agent-ui/conversation'`。详细组件页中使用 `@/components/agent-ui` 的示例对应显式安装完整套件；最小安装不要引用该总入口。小程序始终从对应原生 `.vue` 文件导入，例如 `@/components/agent-ui/AgentComposer.vue`。
:::

H5 源码会导入所需 CSS。原生单元依赖 `themes/agent`，请按 [Wevu Registry](/guide/shadcn-mode) 将所有 `src/styles/*.css` 全局加载到 `app.vue`，先加载 `varo.css`。应用负责审批执行、网络请求、重试和取消；展示组件不会批准操作。

## 状态与所有权

| 所有者 | 数据 / 责任 |
| ------ | ----------- |
| `@tanstack/ai` | 上游 `UIMessage`、AG-UI `StreamChunk`；服务端模型与工具 API |
| `@tanstack/ai-client` | `ChatClient`、真实 `ChatClientSnapshot`、活动消息、连接、abort 与中断解析 |
| `@tanstack/ai-vue` | H5 `useChat`，通过 Vue ref 暴露 SDK 状态并清理作用域 |
| `@varo-ui/ai` | Markdown AST / 安全视图、文本展示节奏、会话版本 helper |
| Registry `components/agent-ui/types` | `AgentPartStatus`、`AgentStreamStatus`、`AgentToolPart`、`AgentChoice`、`AgentConversationMessage` 等纯展示类型 |
| 应用 / 服务端 | 身份与业务授权、provider 凭据、工具实现、来源范围、存储、重试策略及服务端取消传播 |

SDK `status` 是 `ready | submitted | streaming | error`。展示用 `AgentPartStatus` 是 `waiting | running | completed | failed`，`AgentStreamStatus` 是 `idle | streaming | waiting | completed | failed | cancelled`；两者不是 SDK 状态或 wire enum，不可直接替换 SDK 的 `status`。`ready` 本身不代表成功完成或取消；应用根据真实结果做纯展示投影，不另建事件 reducer。

`AgentToolPart` 的 `id`、`name`、`input`、`output`、`summary`、`error`、`status` 仅描述工具 UI，不会执行工具。`AgentConversationEntry` 接受静态 `AgentConversationMessage` 或 SDK `UIMessage`；`agentConversationHistory(snapshot)` 保留消息对象与完整 parts 的原引用，不将工具记录压平成文本。SDK 拥有活动 transcript；`snapshot` prop 直接传入 `client.getSnapshot()`，不要手写近似对象或把 hook 的若干 ref 拼成快照。

从安装后的 `@/components/agent-ui/presentation` 导入 `agentMessageText(message: UIMessage | undefined): string` 与 `agentCurrentMessage(snapshot: ChatClientSnapshot): UIMessage | undefined`。它们是只读展示 helper，不解析网络事件。

## H5：使用 Vue binding

以下示例要求应用已提供 `/api/chat`。服务端使用 TanStack `chat()` 与 `toServerSentEventsResponse()` 返回 AG-UI SSE，并校验请求与业务权限；模型凭据只放在服务端，不放进源码、Registry 或浏览器构建产物。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-vue'
import { AgentMarkdown } from '@/components/agent-ui/conversation'
import { agentMessageText } from '@/components/agent-ui/presentation'

const input = ref('')
const { messages, status, isLoading, error, sendMessage, stop } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
  threadId: 'support-chat',
})

async function submit() {
  const text = input.value.trim()
  if (!text || isLoading.value) return
  input.value = ''
  await sendMessage(text)
}
</script>

<template>
  <p>SDK: {{ status }}</p>
  <AgentMarkdown v-for="message in messages" :key="message.id" :content="agentMessageText(message)" :final="!isLoading" />
  <p v-if="error">{{ error.message }}</p>
  <form @submit.prevent="submit">
    <input v-model="input" :disabled="isLoading">
    <button v-if="isLoading" type="button" @click="stop">停止</button>
    <button v-else type="submit">发送</button>
  </form>
</template>
```

此最小示例只展示文本。工具、推理和审批展示见 [AgentEventRenderer](./event-renderer)；静态历史 API 见 [AgentChat](./agent-chat)。直接持有 `ChatClient` 时使用它的真实 snapshot，不从 `useChat` 人工重建。

## 原生：ai-client + Wevu

原生 SFC 的响应式和生命周期 API 从 `wevu` 导入，客户端从 `@tanstack/ai-client` 导入，不使用 `vue` 或 `@tanstack/ai-vue`。编译器 `weapp-vite` 与 `wevu` 使用 **7.10.0**，在编译配置中启用已发布的 Web Runtime：

```ts
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  weapp: {
    platform: 'weapp',
    vue: {
      enable: true,
      template: { nativeSlotContext: true, scopedSlotsRequireProps: true },
    },
    appPrelude: {
      webRuntime: {
        enabled: true,
        networkDefaults: { request: { enableChunked: true } },
      },
    },
  },
})
```

其中 `nativeSlotContext` 与 `scopedSlotsRequireProps` 显式启用 7.10.0 微信目标的上游 slot/app-shell 实现，取代旧版编译器补丁和 bootstrap。它们不等于当前运行已通过验证，也不承诺 created setup 或其他平台支持；默认 attached setup 的实际插槽行为仍需独立验收。

继续使用 SDK 的标准 `fetchServerSentEvents` 与应用提供的绝对 HTTPS endpoint。Web Runtime 提供所需 Fetch / Streams / 解码 / 取消 API，不再添加 `wx.request` transport 或自制 polyfill。通过 `getSnapshot()` 初始读取，再用 `subscribeSnapshot()` 更新 Wevu `shallowRef`；视图 attach/detach、订阅清理和 client dispose 由应用管理，完整例子见 [AgentEventRenderer](./event-renderer)。需要停止当前请求时调用 SDK `stop()`；关闭视图或业务操作是否同时取消，由应用决定。

宿主必须在响应结束前提供真实状态码、响应头和增量数据块；缺少能力时不能假定 200，也不能用整包缓冲伪装流式。微信 DevTools 与真机需分别验证；配置不承诺其他 profile 同等能力，不模拟浏览器 Cookie/CORS，也不等同于网络级反压。见 [Web Runtime 官方配置](https://vite.weapp.dev/config/web-runtime-globals)。

## 审批与本地演示

`AgentEventRenderer` 及转发它的 AgentChat 的 `approve` / `reject` 均发送 **interrupt ID 字符串**，不是选择值或工具名。应用从 `client.getInterrupts()` 找到同 ID 的 `kind === 'tool-approval'`，检查 `canResolve` 后调用 `resolveInterrupt(true)` / `resolveInterrupt(false)`。H5 `useChat` 直接暴露 `interrupts` ref，可同样按 ID 查找。UI 事件不授予业务权限，不执行网络或工具；服务端仍需独立授权，审批续传应按官方指南转交 `parentRunId` / `resume`。

本地演示可用 SDK `stream(async function* ...)` 产生标准 AG-UI chunk，但必须标注为本地逻辑，不冒充 provider 请求、模型推理或真实费用。业务任务、来源范围及上传确认仍是应用领域状态，不由聊天协议自动授权。

官方依据：[Vue API](https://tanstack.com/ai/latest/docs/api/ai-vue)、[ChatClient API](https://tanstack.com/ai/latest/docs/api/ai-client)、[AG-UI 事件](https://tanstack.com/ai/latest/docs/chat/stream-events)、[工具审批](https://tanstack.com/ai/latest/docs/tools/tool-approval)。

## 演示

<AgentComponentsDemo locale="zh" />

::: warning RAG 边界
`AgentRagPipeline` 只渲染受控状态并触发 `run`、`cancel`、`selectSource`；应用需要自行实现检索、模型请求和来源授权。
:::

## Blocks

- [AgentChat](./agent-chat)：对话、流式回答、工具、审批和输入。
- [AgentWorkspace](./agent-workspace)：来源、检索、任务、版本和多种布局。

::: info 平台
H5 使用 RAF 文本展示节奏，微信小程序使用定时帧，两者共用安全 Markdown AST；聊天传输与状态由 TanStack AI 管理。Agent 条目仅支持 `h5` / `weapp`，其他基础组件通过实验性编译不代表 Agent UI 支持相应 profile。原生源码和可信编译产物预览都不能证明 IDE 或真机行为。
:::
