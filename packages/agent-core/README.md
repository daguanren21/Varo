# @varo-ui/ai

Safe Markdown models, text pacing, and thread-version helpers for Varo applications. This package does not own chat events, transport, active messages, tool execution, or approvals. Import TanStack AI directly for those contracts.

## Install

```bash
pnpm add @varo-ui/ai
```

## Usage

Parse progressively received text without introducing a chat protocol:

```ts
import { createStreamingMarkdownParser } from '@varo-ui/ai'

const parser = createStreamingMarkdownParser()
const nodes = parser.parse('## Answer\n\nIncremental text', { final: false })
const finalNodes = parser.parse('## Answer\n\nComplete text.', { final: true })
parser.reset()
```

`createTextStream` provides presentation-only text pacing. H5 uses Markstream scheduling; native renderers use timed frames. This does not replace the SDK's message state or determine whether a network run finished. The package root and `@varo-ui/ai/source` expose the retained Markdown, text-pacing, and thread APIs, not a private protocol or transport.

## Chat state belongs to TanStack AI

- H5: `useChat` from `@tanstack/ai-vue`.
- Native: `ChatClient` from `@tanstack/ai-client`, subscribed through Wevu reactivity; never use the Vue binding in native product code.
- Messages and events: upstream `UIMessage` and AG-UI `StreamChunk` from `@tanstack/ai`. Snapshot props take `ChatClientSnapshot` from `@tanstack/ai-client`, obtained with `client.getSnapshot()`; do not construct a Varo-shaped replacement.
- SDK statuses are `ready | submitted | streaming | error`. Registry `AgentStreamStatus` / `AgentPartStatus` are display projections, not SDK state or wire enums. `AgentToolPart`, `AgentChoice`, and `AgentConversationMessage` also belong to installed `components/agent-ui/types`, not this package. Static history remains a presentation API.

The migration baseline is `@tanstack/ai` 1.4.0, `@tanstack/ai-client` 1.1.0, and `@tanstack/ai-vue` 1.0.1. There are no compatibility exports for the removed event/controller/channel/SSE/parser APIs.

For `weapp-vite` / `wevu` 7.10.0, use Node `^22.23.4 || ^24.22.1 || >=26.12.1` and enable the published Web Runtime in your compiler configuration:

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

On WeChat, the explicit `nativeSlotContext` / `scopedSlotsRequireProps` options select 7.10.0's upstream native slot/app-shell implementation instead of the old compiler patch and bootstrap. Configuration alone does not prove current runtime behavior. Validate default attached setup independently; do not infer created-setup or other-profile support from it.

Then use the SDK's standard `fetchServerSentEvents` adapter with an application-owned endpoint. Do not add a bespoke `wx.request` transport or duplicate Web API polyfills. The host must supply real response status, headers, and incremental chunks; this setting does not certify DevTools, devices, or other native profiles. See [Web Runtime configuration](https://vite.weapp.dev/config/web-runtime-globals).

`AgentEventRenderer` approval/rejection events carry an interrupt ID. The application finds the matching `kind === 'tool-approval'` in `client.getInterrupts()` and calls its `resolveInterrupt(true)` / `resolveInterrupt(false)` when eligible. Authorization, provider credentials, business execution, retry policy, and server-side cancellation propagation stay application-owned; the SDK owns active messages and request abort. See [TanStack client](https://tanstack.com/ai/latest/docs/api/ai-client), [Vue](https://tanstack.com/ai/latest/docs/api/ai-vue), [AG-UI events](https://tanstack.com/ai/latest/docs/chat/stream-events), and [tool approval](https://tanstack.com/ai/latest/docs/tools/tool-approval).

The Registry's `agent-presentation` unit owns pure display helpers, including `agentMessageText(message: UIMessage | undefined): string` and `agentCurrentMessage(snapshot: ChatClientSnapshot): UIMessage | undefined`. Import them from installed `components/agent-ui/presentation`; they do not reduce events or execute tools.

### Markdown runtime portability

Both package entries use the same private `runtime/markdown-parser.mjs` bundle, shipped in the npm archive. The upstream parser initializes its entity trie through browser `atob` and encodes HTML details code blocks through `btoa`; native hosts need not provide either global. The private build injects local base64 decoding and encoding instead of modifying `globalThis` or requiring Node `Buffer`. Consumers do not need a polyfill or an extra build step.

In this workspace, installation prepares that generated bundle. After cleaning `packages/agent-core/runtime`, run `pnpm --filter @varo-ui/ai build:runtime` before consuming the source entry. `pnpm --filter @varo-ui/ai build` and package `prepack` rebuild it as well. Author changes in `build/` and the tsdown configurations, never in generated `runtime/`.

The parser dependency is pinned so consumer-visible node types match the bundled runtime. Bundled dependency licenses, including the parser's embedded dependencies, are preserved in `THIRD_PARTY_NOTICES.txt`; update that inventory when upgrading the parser or base64 implementation.

## Thread versions

```ts
import { createAgentThreadController } from '@varo-ui/ai'

const thread = createAgentThreadController()
thread.append({ id: 'root', label: 'Initial answer' })
thread.fork('root', { id: 'verified', label: 'Verified branch' })
thread.select('root')
```

The helper stores versions in an immutable, acyclic graph. `append()` and `fork()` select the new version. Invalid ids, missing parents, cycles, and changes after destruction fail immediately. This is an application-owned presentation graph, not the SDK's active transcript, AG-UI run state, or server persistence.

## Install presentation source separately

```bash
# Conversation-only dependency closure
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat

# Optional individual units
pnpm dlx @varo-ui/cli add --target h5 components/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp components/agent-rag

# Intentional full suite
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
```

| Registry item                   | Responsibility                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `components/agent-presentation` | Pure presentation types and helpers shared by renderers                                  |
| `components/agent-conversation` | Conversation, Markdown, streaming, reasoning, tools, approvals, and composition          |
| `components/agent-workspace`    | Context/retrieval receipts, task presentation, thread versions, and workspace placement  |
| `components/agent-advanced`     | Optional diffs, media, citations, tables, workflows, fine-tuning controls, and artifacts |
| `components/agent-rag`          | Retrieval pipeline progress and source-linked answers                                    |
| `components/agent-ui`           | Deliberate composition of the full suite, not a compatibility alias                      |

`blocks/agent-chat` installs conversation dependencies without advanced, RAG, or fine-tuning source. When replacing an all-in-one installation, choose the units you use and reconcile local edits before replacing files with `--force`. Install the npm dependencies reported by the CLI separately.

Rendered Agent units depend on optional `themes/agent`; `themes/base` no longer carries Agent tokens/helpers. H5 source brings dependency CSS imports. Native source consumers load all installed `src/styles/*.css` globally through `weapp.styles` with `include: 'app.vue'`, `varo.css` first, including `varo-agent.css`. Do not import page/global CSS from component-local WXSS.

These units support H5 and Weapp. To install them for experimental `alipay`, `tt`, `xhs`, `donut-android`, `donut-ios`, or `donut-ohos` profiles, every selected item and dependency must explicitly declare support; sharing the native renderer does not grant it.

Edit source and styles in the Registry, then run `pnpm sync:registry` to update playground and docs copies. `pnpm check:generated` detects drift. After generation and package builds, `pnpm check:consumers` checks minimal Chat installations in actual CLI consumers. Provider and network execution remain the application's responsibility, and device behavior needs separate verification.

[Documentation](https://varo.weapp.dev/ai/) · [Repository](https://github.com/daguanren21/Varo)
