# AI Agent Components

TanStack AI owns AG-UI events, active messages, stream state, tool interrupts, and request abort. Varo UI only consumes SDK state for presentation. `@varo-ui/ai` provides safe Markdown, text pacing, and thread-version helpers, not a private protocol, stream controller, channel, SSE decoder, or event parser. Registry installs editable UI source.

## Install

```bash
# H5: Vue SDK binding
pnpm add @varo-ui/ai @tanstack/ai @tanstack/ai-client @tanstack/ai-vue
# Native: headless SDK + Wevu only, without the Vue binding
# pnpm add @varo-ui/ai @tanstack/ai @tanstack/ai-client wevu
# Minimal conversation unit; choose H5 or Weapp
pnpm dlx @varo-ui/cli add --target h5 components/agent-conversation
pnpm dlx @varo-ui/cli add --target weapp components/agent-conversation

# Install a Block directly; no full-suite prerequisite
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-workspace
```

The CLI copies source and lists npm dependencies; install all listed packages separately with `pnpm add` / `pnpm add -D`. `blocks/agent-chat` includes only conversation components and dependencies, excluding advanced, RAG, fine-tune, and workspace UI.

| Registry unit                   | Contents                                                                          | Installed H5 entry                               |
| ------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| `components/agent-presentation` | Shared presentation types, status meanings, and pure helpers; no execution policy | `@/components/agent-ui/presentation`, `types`    |
| `components/agent-conversation` | Messages, Markdown, streaming, reasoning, tools, approval, and input              | `@/components/agent-ui/conversation`             |
| `components/agent-workspace`    | Source scope, retrieval progress, tasks, thread versions, and workspace layout    | `@/components/agent-ui/workspace`                |
| `components/agent-advanced`     | Optional diffs, tables, media, workflows, fine-tune controls, and related UI      | `@/components/agent-ui/advanced`, `supplemental` |
| `components/agent-rag`          | RAG progress and source-linked answers                                            | `@/components/agent-ui/AgentRagPipeline.vue`     |
| `components/agent-ui`           | Full suite containing the units above                                             | `@/components/agent-ui`                          |

Only when the product needs the full suite:

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
# Use --target weapp in a native project
```

::: info Imports
For a minimal H5 install, use the matching unit entry above, for example `import { AgentComposer } from '@/components/agent-ui/conversation'`. Detail-page examples importing `@/components/agent-ui` assume an explicit full-suite install; do not use that aggregate entry with a minimal install. Mini programs import the matching native `.vue` file, such as `@/components/agent-ui/AgentComposer.vue`.
:::

H5 source imports the required CSS. Native units depend on `themes/agent`; load all `src/styles/*.css` globally in `app.vue`, with `varo.css` first, as described in [Wevu Registry](/en/guide/shadcn-mode). The application handles approval execution, networking, retries, and cancellation. Presentation components do not authorize actions.

## State and ownership

| Owner                                | Data / responsibility                                                                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tanstack/ai`                       | Upstream `UIMessage`, AG-UI `StreamChunk`, server-side model and tool APIs                                                                                |
| `@tanstack/ai-client`                | `ChatClient`, actual `ChatClientSnapshot`, active messages, connections, abort, and interrupt resolution                                                  |
| `@tanstack/ai-vue`                   | H5 `useChat`, exposing SDK state through Vue refs with scope cleanup                                                                                      |
| `@varo-ui/ai`                        | Markdown AST / safe views, presentation text pacing, and thread-version helpers                                                                           |
| Registry `components/agent-ui/types` | Pure display types including `AgentPartStatus`, `AgentStreamStatus`, `AgentToolPart`, `AgentChoice`, and `AgentConversationMessage`                       |
| Application / server                 | Identity and business authorization, provider credentials, tool implementations, source scope, storage, retry policy, and server cancellation propagation |

SDK `status` is `ready | submitted | streaming | error`. Display `AgentPartStatus` is `waiting | running | completed | failed`; `AgentStreamStatus` is `idle | streaming | waiting | completed | failed | cancelled`. These are not SDK states or wire enums and must not replace SDK `status`. `ready` alone does not establish success or cancellation. Derive pure display projections from actual results, without another event reducer.

`AgentToolPart` fields `id`, `name`, `input`, `output`, `summary`, `error`, and `status` describe tool UI only. `AgentConversationEntry` accepts either static `AgentConversationMessage` entries or SDK `UIMessage` entries; `agentConversationHistory(snapshot)` preserves original message/part references rather than flattening tool receipts. The SDK owns the active transcript. Pass the actual `ChatClientSnapshot` from `client.getSnapshot()`, not a hand-built approximation or a collection of hook refs.

Import `agentMessageText(message: UIMessage | undefined): string` and `agentCurrentMessage(snapshot: ChatClientSnapshot): UIMessage | undefined` from installed `@/components/agent-ui/presentation`. They are read-only presentation helpers, not network event parsers.

## H5: use the Vue binding

This example requires an application-owned `/api/chat` endpoint. The server uses TanStack `chat()` and `toServerSentEventsResponse()` to return AG-UI SSE, validates requests, and enforces business permissions. Keep model credentials on the server, never in source examples, Registry files, or browser bundles.

```vue
<script setup lang="ts">
import { fetchServerSentEvents, useChat } from '@tanstack/ai-vue'
import { ref } from 'vue'
import { AgentMarkdown } from '@/components/agent-ui/conversation'
import { agentMessageText } from '@/components/agent-ui/presentation'

const input = ref('')
const { messages, status, isLoading, error, sendMessage, stop } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
  threadId: 'support-chat',
})

async function submit() {
  const text = input.value.trim()
  if (!text || isLoading.value) { return }
  input.value = ''
  await sendMessage(text)
}
</script>

<template>
  <p>SDK: {{ status }}</p>
  <AgentMarkdown v-for="message in messages" :key="message.id" :content="agentMessageText(message)" :final="!isLoading" />
  <p v-if="error">
    {{ error.message }}
  </p>
  <form @submit.prevent="submit">
    <input v-model="input" :disabled="isLoading">
    <button v-if="isLoading" type="button" @click="stop">
      Stop
    </button>
    <button v-else type="submit">
      Send
    </button>
  </form>
</template>
```

This minimal example renders text only. See [AgentEventRenderer](./event-renderer) for reasoning, tools, and approval presentation, and [AgentChat](./agent-chat) for static history. When holding a `ChatClient` directly, use its actual snapshot rather than reconstructing one from `useChat`.

## Native: ai-client + Wevu

Import native SFC reactivity and lifecycle APIs from `wevu`, and the client from `@tanstack/ai-client`. Do not use `vue` or `@tanstack/ai-vue` in native product code. Enable Web Runtime in the compiler configuration:

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

On WeChat, enable both `nativeSlotContext` and `scopedSlotsRequireProps` with default attached setup. See [runtime evidence limits](/en/guide/installation#deterministic-e2e-and-evidence-boundaries).

Keep the SDK's standard `fetchServerSentEvents` adapter with an application-owned absolute HTTPS endpoint. Web Runtime supplies the Fetch / Streams / decoding / cancellation APIs; do not add a `wx.request` transport or bespoke polyfills. Read `getSnapshot()` first, then update a Wevu `shallowRef` with `subscribeSnapshot()`. The application manages view attach/detach, subscription cleanup, and client disposal; see the complete [AgentEventRenderer](./event-renderer) example. Call SDK `stop()` to abort the active request. The application decides whether closing a view also cancels business work.

The host must supply real status, headers, and chunks before the response ends. Do not assume 200 or present a fully buffered response as streaming. Web Runtime does not simulate browser Cookie/CORS behavior or provide network-level backpressure. See the [official Web Runtime configuration](https://vite.weapp.dev/config/web-runtime-globals).

## Approvals and local demos

Both `approve` and `reject` from `AgentEventRenderer`, and AgentChat forwarding those events, carry an **interrupt ID string**, not a choice value or tool name. The application finds that ID with `kind === 'tool-approval'` in `client.getInterrupts()`, checks `canResolve`, and calls `resolveInterrupt(true)` / `resolveInterrupt(false)`. H5 `useChat` exposes an `interrupts` ref for the same ID lookup. A UI event grants no business permission and executes neither network requests nor tools. The server still authorizes the operation and forwards `parentRunId` / `resume` as described upstream.

Local demos may emit standard AG-UI chunks through SDK `stream(async function* ...)`, but must identify themselves as local logic, not provider requests, model reasoning, or actual costs. Business tasks, source scope, and upload acknowledgements remain application-domain state; a chat protocol does not authorize them.

Official references: [Vue API](https://tanstack.com/ai/latest/docs/api/ai-vue), [ChatClient API](https://tanstack.com/ai/latest/docs/api/ai-client), [AG-UI events](https://tanstack.com/ai/latest/docs/chat/stream-events), and [tool approval](https://tanstack.com/ai/latest/docs/tools/tool-approval).

## Demo

<AgentComponentsDemo locale="en" />

::: warning RAG boundary
`AgentRagPipeline` only renders controlled state and emits `run`, `cancel`, and `selectSource`. Implement retrieval, model requests, and source authorization in your application.
:::

## Blocks

- [AgentChat](./agent-chat): conversation, streaming, tools, approvals, and input.
- [AgentWorkspace](./agent-workspace): sources, retrieval, tasks, versions, and layout.
- [Agent Decision Card](./agent-decision) and [Agent Inbox](./agent-inbox): native WeChat question cards and a controlled task list without the chat SDK.

::: info Platforms
H5 uses RAF for presentation text pacing and WeChat mini programs use timed frames; both use the same safe Markdown AST. TanStack AI manages chat transport and state. Agent items support only `h5` / `weapp`; experimental compilation of base components does not extend Agent UI support.
:::
