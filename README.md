# Varo

**English** | [简体中文](./README.zh-CN.md)

[Documentation](https://daguanren21.github.io/Varo/) · [GitHub Release](https://github.com/daguanren21/Varo/releases/tag/v1.0.1) · [npm organization](https://www.npmjs.com/org/varo-ui)

Varo is a registry-first component system for Vue 3 mobile H5 applications and `weapp-vite` mini programs. Its primary product is editable, target-specific component and Block source code that becomes part of the consuming application—not an opaque cross-platform UI runtime.

## Published packages

- [`@varo-ui/cli`](https://www.npmjs.com/package/@varo-ui/cli) — installs editable Registry source for H5 and Weapp targets
- [`@varo-ui/headless`](https://www.npmjs.com/package/@varo-ui/headless) — runtime-neutral state machines, events, controlled-state contracts, and utilities
- [`@varo-ui/h5`](https://www.npmjs.com/package/@varo-ui/h5) — tree-shakeable Vue components for mobile H5 products
- [`@varo-ui/weapp`](https://www.npmjs.com/package/@varo-ui/weapp) — component wrappers for the `weapp-vite` build chain
- [`@varo-ui/theme`](https://www.npmjs.com/package/@varo-ui/theme) — shared theme tokens and providers
- [`@varo-ui/ai`](https://www.npmjs.com/package/@varo-ui/ai) — Agent event protocol, streaming controller, SSE/chunk decoding, and safe Markdown model

## Current capabilities

- **H5 runtime catalog:** 56 component families
- **Weapp runtime catalog:** 56 component families; copy-owned Registry renderers ship as target-specific native Wevu SFCs, while pure adapters may re-export target primitives across the 45 high-consensus families plus `RegionPicker` and native `Map`
- **Agent Core:** shared event protocol, SSE/chunk transport, Markstream scheduling on H5, timed-frame scheduling on mini programs, and a safe incremental Markdown AST
- **Agent UI:** 42 dual-target components plus Agent Chat and Agent Workspace Blocks for scoped context, visible retrieval, tasks, thread versions, placement shells, conversations, streaming, tools, approvals, code, diffs, citations, media, tables, and workflows
- **Dual-target Blocks:** Login Form, Profile Card, Profile Edit, Product List, Order Filter, Agent Chat, and Agent Workspace
- **AI commerce demo:** real incremental events, reasoning and tool states, human approval for purchases and returns, order history, and address configuration
- **Registry targets:** `h5` and `weapp`
- **Mini-program styling:** Tailwind CSS v4, [`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss), and `@weapp-tailwindcss/merge`
- **Mini-program debugging:** built-in MCP, DevTools console bridge, Automator screenshots, and runtime smoke checks

## Product boundary

- The high-consensus Weapp Registry is based on the overlapping capabilities of [Vant Weapp](https://vant-ui.github.io/vant-weapp/), [NutUI](https://nutui.jd.com/h5/vue/4x/), [TDesign Mobile Vue](https://tdesign.tencent.com/mobile-vue/components/overview), and [TDesign MiniProgram](https://tdesign.tencent.com/miniprogram/components/overview).
- Motion and Agent interaction patterns reference [Beautiful UI](https://www.beautifului.dev/) and [beUI](https://beui.dev/), while production code remains native to Vue and mini-program runtimes.
- Both runtime catalogs contain 56 component families. The Weapp Registry exposes 45 high-consensus families plus `RegionPicker` and native `Map`; `calendar`, `cascader`, `date-picker`, `elevator`, `fixed-nav`, `number-keyboard`, `picker`, `range`, `short-password`, `side-navbar`, and `uploader` remain runtime-only until their native WeChat interactions are verified.
- H5 streaming uses [Markstream Core](https://github.com/Simon-He95/markstream-vue) scheduling and Markdown parsing. Mini programs use the same protocol and AST with a timed scheduler that does not depend on `requestAnimationFrame`.
- The machine-readable boundary is defined in [`registry/component-tiers.v0.1.json`](./registry/component-tiers.v0.1.json).

## Install editable source

```bash
# Native mini-program SFCs
pnpm dlx @varo-ui/cli add --target weapp button input card

# H5 source
pnpm dlx @varo-ui/cli add --target h5 button input card

# Dual-target business Block
pnpm dlx @varo-ui/cli add --target weapp blocks/product-list

# Dual-target Agent Chat Block
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat

# Agent UI suite
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui

# High-consensus mini-program components
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
```

The CLI does not overwrite existing files by default. Use `--force` only after confirming that local customizations may be replaced.

## Playground

```bash
pnpm dev:playground-h5
pnpm --filter @varo/playground-weapp dev:ai
```

`dev:ai` prepares the WeChat DevTools project, starts the MCP HTTP service, and forwards DevTools console output and uncaught errors to the active terminal.

## Verification

```bash
pnpm typecheck
pnpm test
pnpm build
```

See [RELEASING.md](./RELEASING.md) for the repoctl, npm OIDC, and documentation deployment workflow.
