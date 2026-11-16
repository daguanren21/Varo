# AgentEventRenderer

Read-only rendering of ordered active-message parts, tool results, and approval transactions from an actual TanStack `ChatClientSnapshot`. Chat errors and interrupt validation/resume errors are displayed separately. Approval actions bind the displayed interrupt ID, thread, run and generation, rejecting stale controls. AgentConversation retains full history; the UI owns neither messages, execution nor authorization policy.

## Demo

<AgentComponentDemo component="event-renderer" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import { toolDefinition } from '@tanstack/ai/client'
import { ChatClient, fetchServerSentEvents } from '@tanstack/ai-client'
import { onMounted, onUnmounted, shallowRef } from 'wevu'
import AgentEventRenderer from '@/components/agent-ui/AgentEventRenderer.vue'
import { agentSnapshotProjection } from '@/components/agent-ui/presentation'

// Match the server's tool name and schemas; do not register a client executor here.
const applyChange = toolDefinition({ name: 'apply_change', description: 'Apply an application change after approval', needsApproval: true }).client()

const props = defineProps<{ endpoint: string, threadId: string }>()
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
  if (client.getSnapshot().interruptState.resuming) return
  const interrupt = client.getInterrupts().find(item => item.id === id)
  if (interrupt?.kind === 'tool-approval' && interrupt.canResolve && (interrupt.status === 'pending' || interrupt.status === 'error')) {
    interrupt.resolveInterrupt(approved)
  }
}
function approve(id: string) { resolveApproval(id, true) }
function reject(id: string) { resolveApproval(id, false) }
async function retry() { if (!client.getInterrupts().length) await client.reload() }
function retryInterrupts() {
  if (agentSnapshotProjection(client.getSnapshot()).canRetryInterrupts) client.retryInterrupts()
}
function cancelInterrupts() {
  if (agentSnapshotProjection(client.getSnapshot()).canCancelInterrupts) client.cancelInterrupts()
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

This is a native Wevu example. Supply an actual application-owned absolute HTTPS `endpoint` and enable [Web Runtime](./index#native-ai-client-wevu) in the compiler configuration. Your composer calls `client.sendMessage(text)`; stop calls `client.stop()`. This example chooses to stop on unmount. If work may continue in the background, explicitly distinguish stopping execution from detaching a view. H5 normally uses the [Vue binding](./index#h5-use-the-vue-binding). For a direct H5 client, import lifecycle APIs from `vue` and the named component from `@/components/agent-ui/conversation`.

`subscribeSnapshot` does not emit the current value immediately, so read `getSnapshot()` first. Do not build a snapshot by hand, copy the active transcript, or add another reducer. Approval/rejection payloads are current **interrupt IDs**: the application resolves the SDK's matching `tool-approval` with a boolean. The UI performs no requests or tool execution and grants no business permission. The server must authorize again and handle resume fields following the [official approval flow](https://tanstack.com/ai/latest/docs/tools/tool-approval).

Register matching client tool names and schemas; otherwise the SDK exposes an unbound, unresolvable interrupt. For approvals requiring extra data, the application owns the form and passes corrected data through `resolveInterrupt(true, { payload })`. Use `editedArgs` for tool-argument edits instead of mutating a side-channel object. Validation failure keeps its errors and resubmission entry visible; retry a resume transport failure through `retryInterrupts()`, not a new message generation through `reload()`.

## Props

| Prop       | Type                  | Default    | Description           |
| ---------- | --------------------- | ---------- | --------------------- |
| `snapshot` | `ChatClientSnapshot` | `required` | Actual snapshot from `@tanstack/ai-client` |
| `retryable` | `boolean` | `true` | Allow regeneration retry; interrupt recovery is separate |

## Events

| Event     | Payload  | Description |
| --------- | -------- | ----------- |
| `approve` | `string` | Request approval of this interrupt ID; application resolves `true` |
| `reject`  | `string` | Request denial of this interrupt ID; application resolves `false` |
| `retry` | `void` | Request regeneration when no interrupt is pending |
| `retryInterrupts` | `void` | Request retry of an SDK-retryable approval transaction |
| `cancelInterrupts` | `void` | Ask the application to cancel the current interrupt transaction |

## Slots

| Slot      | Description        |
| --------- | ------------------ |
| `actions` | Completion actions |
| `default` | Trailing content   |

::: info Target notes

| Target | Import                                         |
| ------ | ---------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`      |
| weapp  | `@/components/agent-ui/AgentEventRenderer.vue` |

:::
