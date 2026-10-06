# AI Agent Components

`@varo-ui/ai` provides events, streaming control, and Markdown contracts. Registry installs editable UI source.

## Install

```bash
pnpm add @varo-ui/ai
# Minimal conversation unit; choose H5 or Weapp
pnpm dlx @varo-ui/cli add --target h5 components/agent-conversation
pnpm dlx @varo-ui/cli add --target weapp components/agent-conversation

# Install a Block directly; no full-suite prerequisite
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-workspace
```

The CLI copies source and reports npm dependencies without installing them. Run `pnpm add` / `pnpm add -D` for all reported packages afterward. `blocks/agent-chat` pulls only the conversation closure, excluding advanced, RAG, fine-tune, and workspace UI.

| Registry unit                   | Contents                                                                          | Installed H5 entry                               |
| ------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| `components/agent-presentation` | Shared presentation types, status meanings, and pure helpers; no execution policy | `@/components/agent-ui/presentation`, `types`    |
| `components/agent-conversation` | Messages, Markdown, streaming, reasoning, tools, approval, and input              | `@/components/agent-ui/conversation`             |
| `components/agent-workspace`    | Source scope, retrieval progress, tasks, thread versions, and workspace layout    | `@/components/agent-ui/workspace`                |
| `components/agent-advanced`     | Optional diffs, tables, media, workflows, fine-tune controls, and related UI      | `@/components/agent-ui/advanced`, `supplemental` |
| `components/agent-rag`          | RAG progress and source-linked answers                                            | `@/components/agent-ui/AgentRagPipeline.vue`     |
| `components/agent-ui`           | Deliberate full suite composing the units above                                   | `@/components/agent-ui`                          |

Only when the product needs the full suite:

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
# Use --target weapp in a native project
```

::: info Imports
For a minimal H5 install, use the matching unit entry above, for example `import { AgentComposer } from '@/components/agent-ui/conversation'`. Detail-page examples importing `@/components/agent-ui` assume an explicit full-suite install; do not use that aggregate entry with a minimal install. Mini programs import the matching native `.vue` file, such as `@/components/agent-ui/AgentComposer.vue`.
:::

H5 source imports its own CSS closure. Native units depend on `themes/agent`; globally load every `src/styles/*.css` in `app.vue`, with `varo.css` first, as shown in [Wevu Registry](/en/guide/shadcn-mode). Application code owns approval execution, networking, retry, and cancellation policy; presentation components do not authorize actions.

## Demo

<AgentComponentsDemo locale="en" />

::: warning RAG boundary
`AgentRagPipeline` only renders controlled state and emits `run`, `cancel`, and `selectSource`. Product code owns retrieval, model requests, and source authorization.
:::

## Blocks

- [AgentChat](./agent-chat): conversation, streaming, tools, approvals, and input.
- [AgentWorkspace](./agent-workspace): sources, retrieval, tasks, versions, and layout.

::: info Platforms
H5 uses RAF scheduling; WeChat mini programs use timed frames. Both consume the same safe Markdown AST. Agent items currently admit only `h5` / `weapp`; successful experimental compilation of base components does not admit Agent UI for additional profiles. Native demo tabs show source/support evidence, not a live Vue mini program or device proof.
:::
