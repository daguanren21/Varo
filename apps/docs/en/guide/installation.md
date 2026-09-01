# Installation

## Recommended package path

- Product teams: use `@varo-ui/cli` to install owned source; runtime packages remain stable primitives and official wrappers
- H5, app, and mini-program targets share the platform-neutral state, event, and controlled-state contracts from `@varo-ui/headless`
- Mini-program projects use `weapp-vite` + `wevu` + Tailwind CSS v4 + `weapp-tailwindcss`

## Initialize a project

```bash
pnpm dlx create-weapp-vite@latest varo-app
cd varo-app
pnpm install
```

## Official wrappers

```bash
pnpm add vue @varo-ui/h5 @varo-ui/theme
pnpm add vue wevu@6.23.0 @varo-ui/weapp @varo-ui/theme
pnpm add @varo-ui/ai # only when the product needs Agent events and Markdown
```

## Primitives only

```bash
pnpm add @varo-ui/headless
```

## shadcn-style install

If you want the shadcn/ui workflow, copy source into the product project first, then wrap it for business needs:

```bash
pnpm dlx @varo-ui/cli add --target weapp button select card
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 button select card components/agent-ui
```

Components land in `src/components/ui/*`; blocks land in `src/components/blocks/*`. Your product can then create `UserSelect`, `DepartmentSelect`, and `ProductSelect` in `src/components/biz/*`.

The H5 registry covers all 56 runtime component families. The mini-program registry covers 45 high-consensus families; 15 Base Kit families ship native SFCs that compile to WXML/WXSS/JSON, while the extended set ships copy-owned, target-neutral TypeScript runtime source backed by mini-program primitives.

## Agent streaming

`@varo-ui/ai` is model-provider neutral. A backend emits `message.start`, `text.delta`, `reasoning.*`, `tool.*`, `approval.*`, `message.end`, and `done` events. H5 can connect Fetch/SSE; a mini program can feed `wx.request({ enableChunked: true })` chunks into `createAgentSseEventSource()`.

```ts
import { createAgentSseEventSource, createAgentStreamController } from '@varo-ui/ai'

const transport = createAgentSseEventSource()
const controller = createAgentStreamController()

requestTask.onChunkReceived(({ data }) => transport.feed(data))
void controller.connect(transport.source)
```

## Mini-program build chain

```bash
pnpm add -D weapp-vite@6.23.0 weapp-tailwindcss@^5.3.6 tailwindcss
pnpm add clsx @weapp-tailwindcss/merge
```

The mini-program Base Kit ships real Vue SFCs and consumes Tailwind v4 utilities through `styleIsolation: apply-shared`. Extended registry components use the same target-neutral runtime source with mini-program primitives. The `cn()` helper uses `@weapp-tailwindcss/merge`, preserving mini-program escaping behavior.

## Engineering notes

- Keep docs, playgrounds, and packages in the monorepo
- Consume published package entries externally; use source aliases only for workspace development
- H5 and mini-program wrappers share primitive naming, while `@varo-ui/h5` and `@varo-ui/weapp` own the visual layer

## Version notes

- `weapp-vite` is aligned to `6.23.0`
- `wevu` is aligned to `6.23.0`
- `weapp-tailwindcss` is aligned to `^5.3.6`
- Docs are powered by `VitePress 2.0.0-alpha.19`
- Vue packages are aligned on `Vue 3.5.41`, TypeScript, and `<script setup>`
