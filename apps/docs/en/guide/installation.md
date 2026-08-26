# Installation

## Recommended package path

- Product teams: use `@varo/cli` to install owned source; runtime packages remain stable primitives and official wrappers
- H5 uses `@varo/primitives-h5`; mini programs use `@varo/primitives-weapp`
- Mini-program projects use `weapp-vite` + `wevu` + Tailwind CSS v4 + `weapp-tailwindcss`

## Initialize a project

```bash
pnpm dlx create-weapp-vite@latest varo-app
cd varo-app
pnpm install
```

## Official wrappers

```bash
pnpm add vue @varo/ui-h5 @varo/theme
pnpm add vue wevu@6.17.8 @varo/ui-weapp @varo/theme
pnpm add @varo/agent-core # only when the product needs Agent events and Markdown
```

## Primitives only

```bash
pnpm add vue @varo/primitives-h5
pnpm add vue wevu@6.17.8 @varo/primitives-weapp
```

## shadcn-style install

If you want the shadcn/ui workflow, copy source into the product project first, then wrap it for business needs:

```bash
pnpm dlx @varo/cli add --target weapp-vite button select card
pnpm dlx @varo/cli add --target weapp-vite action-sheet collapse dialog list notice-bar popover skeleton steps
pnpm dlx @varo/cli add --target weapp-vite components/agent-ui
pnpm dlx @varo/cli add --target weapp-vite blocks/profile-edit
pnpm dlx @varo/cli add --target h5 button select card components/agent-ui
```

Components land in `src/components/ui/*`; blocks land in `src/components/blocks/*`. Your product can then create `UserSelect`, `DepartmentSelect`, and `ProductSelect` in `src/components/biz/*`.

The H5 registry covers all 56 runtime component families. The mini-program registry covers 45 high-consensus families; 15 Base Kit families ship native SFCs that compile to WXML/WXSS/JSON, while the extended set ships copy-owned, target-neutral TypeScript runtime source backed by mini-program primitives.

## Agent streaming

`@varo/agent-core` is model-provider neutral. A backend emits `message.start`, `text.delta`, `reasoning.*`, `tool.*`, `approval.*`, `message.end`, and `done` events. H5 can connect Fetch/SSE; a mini program can feed `wx.request({ enableChunked: true })` chunks into `createAgentSseEventSource()`.

```ts
import { createAgentSseEventSource, createAgentStreamController } from '@varo/agent-core'

const transport = createAgentSseEventSource()
const controller = createAgentStreamController()

requestTask.onChunkReceived(({ data }) => transport.feed(data))
void controller.connect(transport.source)
```

## Mini-program build chain

```bash
pnpm add -D weapp-vite@6.17.8 weapp-tailwindcss@^5.1.8 tailwindcss
pnpm add clsx @weapp-tailwindcss/merge
```

The mini-program Base Kit ships real Vue SFCs and consumes Tailwind v4 utilities through `styleIsolation: apply-shared`. Extended registry components use the same target-neutral runtime source with mini-program primitives. The `cn()` helper uses `@weapp-tailwindcss/merge`, preserving mini-program escaping behavior.

## Engineering notes

- Keep docs, playgrounds, and packages in the monorepo
- Consume published package entries externally; use source aliases only for workspace development
- H5 and mini-program wrappers share primitive naming, while `@varo/ui-h5` and `@varo/ui-weapp` own the visual layer

## Version notes

- `weapp-vite` is aligned to `6.17.8`
- `wevu` is aligned to `6.17.8`
- `weapp-tailwindcss` is aligned to `^5.1.8`
- Docs are powered by `VitePress 2.0.0-alpha.19`
- Vue packages are aligned on `Vue 3.5.41`, TypeScript, and `<script setup>`
