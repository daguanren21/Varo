# AgentEventRenderer

从 TanStack AI 的真实 `ChatClientSnapshot` 只读投影推理、工具、回答和待审批中断；不消费私有事件协议，也不拥有活动消息或执行策略。

## 案例

<AgentComponentDemo component="event-renderer" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import { ChatClient, fetchServerSentEvents } from '@tanstack/ai-client'
import { onMounted, onUnmounted, shallowRef } from 'wevu'
import AgentEventRenderer from '@/components/agent-ui/AgentEventRenderer.vue'

const props = defineProps<{ endpoint: string, threadId: string }>()
const client = new ChatClient({
  connection: fetchServerSentEvents(props.endpoint),
  threadId: props.threadId,
})
const snapshot = shallowRef<ChatClientSnapshot>(client.getSnapshot())
const unsubscribe = client.subscribeSnapshot(() => {
  snapshot.value = client.getSnapshot()
})

function resolveApproval(id: string, approved: boolean) {
  if (client.getSnapshot().interruptState.resuming) return
  const interrupt = client.getInterrupts().find(item => item.id === id)
  if (interrupt?.kind === 'tool-approval' && interrupt.canResolve) {
    interrupt.resolveInterrupt(approved)
  }
}
function approve(id: string) { resolveApproval(id, true) }
function reject(id: string) { resolveApproval(id, false) }
async function retry() { await client.reload() }

onMounted(() => client.attach())
onUnmounted(() => {
  client.stop()
  unsubscribe()
  client.detach()
  client.dispose()
})
</script>

<template>
  <AgentEventRenderer :snapshot="snapshot" @approve="approve" @reject="reject" @retry="retry" />
</template>
```

这是原生 Wevu 示例；`endpoint` 必须是应用提供的实际绝对 HTTPS 地址，编译配置需启用 [Web Runtime](./index#原生ai-client-wevu)。应用输入区调用 `client.sendMessage(text)`，停止操作调用 `client.stop()`。此例选择卸载时停止；若业务允许后台运行，应由应用明确区分停止执行与视图 detach。H5 通常用 [Vue binding](./index#h5使用-vue-binding)；需要直接持有 client 时，将生命周期导入改为 `vue`，组件从 `@/components/agent-ui/conversation` 具名导入。

`subscribeSnapshot` 不会立即发送当前值，因此先读 `getSnapshot()`。不要手写快照、复制活动 transcript 或添加 reducer。批准/拒绝载荷是当前 **interrupt ID**；应用按 ID 找到 SDK 的 `tool-approval` 后解析布尔结果。UI 本身不发送请求或执行工具，也不授予业务权限；服务端必须重新检查授权并按 [官方审批流程](https://tanstack.com/ai/latest/docs/tools/tool-approval) 处理续传。

## Props

| Prop       | Type                  | Default    | 说明       |
| ---------- | --------------------- | ---------- | ---------- |
| `snapshot` | `ChatClientSnapshot` | `required` | `@tanstack/ai-client` 返回的实际快照 |

## Events

| Event     | Payload  | 说明     |
| --------- | -------- | -------- |
| `approve` | `string` | 请求批准该 interrupt ID；应用解析 `true` |
| `reject`  | `string` | 请求拒绝该 interrupt ID；应用解析 `false` |
| `retry`   | `void`   | 重试     |

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
