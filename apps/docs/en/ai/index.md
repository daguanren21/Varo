# AI Agent Components

`@varo-ui/ai` provides events, streaming control, and Markdown contracts. Registry installs editable UI source.

## Install

```bash
pnpm add @varo-ui/ai
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui

# Blocks
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-workspace
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-workspace
```

::: info Imports
Use named exports from `@/components/agent-ui` on H5. Mini programs import the matching `.vue` file.
:::

## Demo

<AgentComponentsDemo locale="en" />

::: warning RAG boundary
`AgentRagPipeline` only renders controlled state and emits `run`, `cancel`, and `selectSource`. Product code owns retrieval, model requests, and source authorization.
:::

## Blocks

- [AgentChat](./agent-chat): conversation, streaming, tools, approvals, and input.
- [AgentWorkspace](./agent-workspace): sources, retrieval, tasks, versions, and layout.

::: info Platforms
H5 uses RAF scheduling; mini programs use timed frames. Both consume the same safe Markdown AST.
:::
