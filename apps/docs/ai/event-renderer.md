# AgentEventRenderer

从真实 TanStack `ChatClientSnapshot` 只读展示当前消息的有序 parts、工具结果和审批事务。SDK 错误与中断校验/续传错误分别呈现；审批事件绑定显示时的 interrupt ID、thread、run 和 generation，状态失效后拒绝旧动作。完整历史由 AgentConversation 保留，组件不拥有消息、执行或授权策略。

## 案例

<AgentComponentDemo component="event-renderer" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import { ChatClient, fetchServerSentEvents } from '@tanstack/ai-client'
import { toolDefinition } from '@tanstack/ai/client'
import { onMounted, onUnmounted, shallowRef } from 'wevu'
import AgentEventRenderer from '@/components/agent-ui/AgentEventRenderer.vue'
import { agentSnapshotProjection } from '@/components/agent-ui/presentation'

const props = defineProps<{ endpoint: string, threadId: string }>()

// 名称和 schema 必须与服务端审批工具定义一致；此处不注册客户端执行器。
const applyChange = toolDefinition({ name: 'apply_change', description: 'Apply an application change after approval', needsApproval: true }).client()

const client = new ChatClient({
  connection: fetchServerSentEvents(props.endpoint),
  threadId: props.threadId,
  tools: [applyChange],
})
const snapshot = shallowRef<ChatClientSnapshot>(client.getSnapshot())
const unsubscribe = client.subscribeSnapshot(() => {
  snapshot.value = client.getSnapshot()
})

function resolveApproval(id: string, approved: boolean) {
  if (client.getSnapshot().interruptState.resuming) { return }
  const interrupt = client.getInterrupts().find(item => item.id === id)
  if (interrupt?.kind === 'tool-approval' && interrupt.canResolve && (interrupt.status === 'pending' || interrupt.status === 'error')) {
    interrupt.resolveInterrupt(approved)
  }
}
function approve(id: string) { resolveApproval(id, true) }
function reject(id: string) { resolveApproval(id, false) }
async function retry() {
  if (!client.getInterrupts().length) { await client.reload() }
}
function retryInterrupts() {
  if (agentSnapshotProjection(client.getSnapshot()).canRetryInterrupts) { client.retryInterrupts() }
}
function cancelInterrupts() {
  if (agentSnapshotProjection(client.getSnapshot()).canCancelInterrupts) { client.cancelInterrupts() }
}

onMounted(() => client.attach())
onUnmounted(() => {
  client.stop()
  unsubscribe()
  client.detach()
  client.dispose()
})
</script>

<template>
  <AgentEventRenderer :snapshot="snapshot" @approve="approve" @reject="reject" @retry="retry" @retry-interrupts="retryInterrupts" @cancel-interrupts="cancelInterrupts" />
</template>
```

这是原生 Wevu 示例；`endpoint` 必须是应用提供的实际绝对 HTTPS 地址，编译配置需启用 [Web Runtime](./index#原生ai-client-wevu)。应用输入区调用 `client.sendMessage(text)`，停止操作调用 `client.stop()`。此例选择卸载时停止；若业务允许后台运行，应由应用明确区分停止执行与视图 detach。H5 通常用 [Vue binding](./index#h5使用-vue-binding)；需要直接持有 client 时，将生命周期导入改为 `vue`，组件从 `@/components/agent-ui/conversation` 具名导入。

`subscribeSnapshot` 不会立即发送当前值，因此先读 `getSnapshot()`。不要手写快照、复制活动 transcript 或添加 reducer。批准/拒绝载荷是当前 **interrupt ID**；应用按 ID 找到 SDK 的 `tool-approval` 后解析布尔结果。UI 本身不发送请求或执行工具，也不授予业务权限；服务端必须重新检查授权并按 [官方审批流程](https://tanstack.com/ai/latest/docs/tools/tool-approval) 处理续传。

工具必须在客户端注册与服务端相同的名称和 schema，否则 SDK 会将中断作为不可处理的 unbound 中断展示。要求额外审批数据时，由应用提供表单并将校正后的 `payload` 交给 `resolveInterrupt(true, { payload })`；编辑工具参数时使用 `editedArgs`，不要修改旁路对象替代审批记录。校验失败会保留错误和重提入口；续传网络失败使用 `retryInterrupts()` 重试原审批事务，不能用 `reload()` 重新生成消息。

### 微信原生：工具详情与审批预览

连续的工具调用按消息原有顺序合成一个默认折叠的组。名称和状态来自 SDK；参数、结果、错误和耗时详情只显示应用显式提供的 `toolCallPreviews`，不会把 SDK 原始载荷直接展开。按当前会话的 `toolCallId` 提供已脱敏、截断的展示文本，例如：

```ts
import type { AgentToolCallPreview } from '@/components/agent-ui/types'

const toolCallPreviews: Record<string, AgentToolCallPreview> = {
  'lookup-1': { parameters: '仅公开文档', result: '找到两条来源', duration: '0.2s' },
}
```

同一 prop 也适用于原生 `AgentConversation`、`AgentChat` 和 `AgentAssistantSheet`；模型比较按 `left` / `right` 分别提供。更换会话时同步切换预览表。未提供详情时仍显示工具状态。这是展示控制，不会清除已传至客户端的敏感数据；服务端仍应限制返回内容。

子 Agent 只显示名称和状态，不展开其内嵌消息、工具参数或结果。结构化回答仍显示 SDK 的 `raw` 文本；应用不应把敏感内容放入回答。

原生 `AgentChat` 按每组首个 `toolCallId` 保存展开状态，不受流式消息 ID 改名或移入历史的影响。重试后的新调用默认折叠。切换会话时同步更新 `activeHistoryId`，避免跨会话复用展开状态。

原生商城演示也会在消息从当前回复移入历史时保留已展开的工具详情。

工具审批可由服务端在中断的 `metadata.varoApprovalPreview` 提供 `requestedBy`、`action`、`impact` 三个可选字符串。详情按当前审批卡片展示；没有预览时保留工具名称和审批说明，不从原始参数推断影响。“拒绝”只针对该审批，“取消中断”针对事务。

## Props

| Prop               | Type                                             | Default    | 说明                                         |
| ------------------ | ------------------------------------------------ | ---------- | -------------------------------------------- |
| `snapshot`         | `ChatClientSnapshot`                             | `required` | `@tanstack/ai-client` 返回的实际快照         |
| `retryable`        | `boolean`                                        | `true`     | 是否允许普通生成错误的重试；中断恢复单独处理 |
| `toolCallPreviews` | `Readonly<Record<string, AgentToolCallPreview>>` | `—`        | 仅原生；按 `toolCallId` 提供已脱敏的详情     |

## Events

| Event              | Payload  | 说明                                      |
| ------------------ | -------- | ----------------------------------------- |
| `approve`          | `string` | 请求批准该 interrupt ID；应用解析 `true`  |
| `reject`           | `string` | 请求拒绝该 interrupt ID；应用解析 `false` |
| `retry`            | `void`   | 无待处理中断时，请求重新生成              |
| `retryInterrupts`  | `void`   | 请求重试 SDK 标记为可重试的审批事务       |
| `cancelInterrupts` | `void`   | 请求应用取消当前中断事务                  |

## Slots

| Slot      | 说明         |
| --------- | ------------ |
| `actions` | 回答完成操作 |
| `default` | 后置扩展     |

::: info 平台差异

| Target | Import                                         |
| ------ | ---------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`      |
| weapp  | `@/components/agent-ui/AgentEventRenderer.vue` |

:::
