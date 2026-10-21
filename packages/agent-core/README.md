# @varo-ui/ai

Agent event types, SSE/chunk decoding, a streaming controller, and a safe Markdown view model for Varo applications. The protocol is independent of the model provider.

## Install

```bash
pnpm add @varo-ui/ai
```

## Usage

For a chunked request made by your application, feed incoming bytes to the transport and connect its event stream to the controller:

```ts
import { createAgentSseEventSource, createAgentStreamController } from '@varo-ui/ai'

const transport = createAgentSseEventSource()
const controller = createAgentStreamController()

requestTask.onChunkReceived(({ data }) => transport.feed(data))
await controller.connect(transport.source)
```

`connect()` manages the iterator: a protocol `done` or `error` event settles the connection and requests iterator cleanup. If the iterator ends naturally, the controller produces `done`.

Call `transport.end()` when the request completes normally, or `transport.fail(error)` when it fails. During teardown, unsubscribe UI listeners and call `controller.destroy()`. Canceling the controller closes its iterator and ends local streaming. Your application still handles network aborts, purchase approval, tool execution, and retry decisions.

Import the compiled protocol and controller API from the package root, or use the source entry `@varo-ui/ai/source`. Both provide data and control APIs, without a provider SDK or renderer. Shared presentation types and helpers are in the Registry's `agent-presentation` unit; H5 and native sources handle their own rendering and lifecycle.

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

The controller stores versions in an immutable, acyclic graph. `append()` and `fork()` select the new version. Invalid ids, missing parents, cycles, and changes after destruction fail immediately.

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
