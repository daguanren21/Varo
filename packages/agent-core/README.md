# @varo-ui/ai

Provider-neutral Agent event protocol, SSE/chunk decoding, streaming controller, and safe Markdown view model for Varo applications.

## Install

```bash
pnpm add @varo-ui/ai
```

## Usage

For an application-owned chunked request, feed its bytes to the transport and connect the normalized event stream:

```ts
import { createAgentSseEventSource, createAgentStreamController } from '@varo-ui/ai'

const transport = createAgentSseEventSource()
const controller = createAgentStreamController()

requestTask.onChunkReceived(({ data }) => transport.feed(data))
await controller.connect(transport.source)
```

`connect()` owns the iterator lifecycle: protocol `done`/`error` events settle the connection and request iterator cleanup, while natural iterator exhaustion synthesizes `done`.

The application must call `transport.end()` on normal transport completion or `transport.fail(error)` on request failure. Unsubscribe UI listeners and call `controller.destroy()` at teardown. Controller cancellation closes its iterator and local streaming lifecycle; it does not authorize a purchase, execute a tool, abort an application's network request, or choose a retry policy.

The root export provides the compiled protocol/controller API; `@varo-ui/ai/source` remains an explicit source entry. Neither entry is a provider SDK or a renderer. Shared presentation types/helpers live in the Registry `agent-presentation` unit, while target lifecycle/render code remains in H5 or native source.

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

The controller owns an immutable acyclic version graph. `append()` and `fork()` activate the new version; invalid ids, missing parents, cycles, and post-destroy mutations fail immediately.

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

`blocks/agent-chat` selects the conversation closure and does not pull advanced/RAG/fine-tuning source. When migrating from an all-in-one install, choose the unit you actually use; manually reconcile existing local customizations before any `--force` replacement. The CLI reports npm dependencies without installing them.

Rendered Agent units depend on optional `themes/agent`; `themes/base` no longer carries Agent tokens/helpers. H5 source brings dependency CSS imports. Native source consumers load all installed `src/styles/*.css` globally through `weapp.styles` with `include: 'app.vue'`, `varo.css` first, including `varo-agent.css`. Do not import page/global CSS from component-local WXSS.

These units declare H5/Weapp renderer support. The experimental `alipay`, `tt`, `xhs`, `donut-android`, `donut-ios`, and `donut-ohos` profiles do not gain Agent admission merely by sharing the native renderer; the complete selected manifest closure must explicitly admit a profile.

Registry source and styles are canonical. `pnpm sync:registry` projects them into the playgrounds and docs Agent source; `pnpm check:generated` detects drift. After generation and package builds, `pnpm check:consumers` checks the minimal Chat closure in actual CLI consumers. None of these commands asserts provider/network execution policy or device certification.

[Documentation](https://varo.weapp.dev/ai/) · [Repository](https://github.com/daguanren21/Varo)
