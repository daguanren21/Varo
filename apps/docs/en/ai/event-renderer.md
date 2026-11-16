# AgentEventRenderer

Read-only projection of reasoning, tools, responses, and pending approval interrupts from an actual TanStack AI `ChatClientSnapshot`. It neither consumes a private event protocol nor owns active messages or execution policy.

## Demo

<AgentComponentDemo component="event-renderer" locale="en" />

## Basic Usage

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

This is a native Wevu example. Supply an actual application-owned absolute HTTPS `endpoint` and enable [Web Runtime](./index#native-ai-client-wevu) in the compiler configuration. Your composer calls `client.sendMessage(text)`; stop calls `client.stop()`. This example chooses to stop on unmount. If work may continue in the background, explicitly distinguish stopping execution from detaching a view. H5 normally uses the [Vue binding](./index#h5-use-the-vue-binding). For a direct H5 client, import lifecycle APIs from `vue` and the named component from `@/components/agent-ui/conversation`.

`subscribeSnapshot` does not emit the current value immediately, so read `getSnapshot()` first. Do not build a snapshot by hand, copy the active transcript, or add another reducer. Approval/rejection payloads are current **interrupt IDs**: the application resolves the SDK's matching `tool-approval` with a boolean. The UI performs no requests or tool execution and grants no business permission. The server must authorize again and handle resume fields following the [official approval flow](https://tanstack.com/ai/latest/docs/tools/tool-approval).

## Props

| Prop       | Type                  | Default    | Description           |
| ---------- | --------------------- | ---------- | --------------------- |
| `snapshot` | `ChatClientSnapshot` | `required` | Actual snapshot from `@tanstack/ai-client` |

## Events

| Event     | Payload  | Description |
| --------- | -------- | ----------- |
| `approve` | `string` | Request approval of this interrupt ID; application resolves `true` |
| `reject`  | `string` | Request denial of this interrupt ID; application resolves `false` |
| `retry`   | `void`   | Retry       |

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
