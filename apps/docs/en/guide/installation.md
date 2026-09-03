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
pnpm add vue wevu @varo-ui/weapp @varo-ui/theme
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

The H5 registry covers all 56 runtime component families. The mini-program registry covers 45 high-consensus families. Copy-owned mini-program renderers ship as target-specific native Wevu SFCs that compile directly to WXML/WXSS/JSON; pure adapters may re-export target primitives, and only types, pure functions, and headless primitives are shared across targets.

## Agent streaming

`@varo-ui/ai` is model-provider neutral. A backend emits `message.start`, `text.delta`, `reasoning.*`, `tool.*`, `approval.*`, `message.end`, and `done` events. H5 can connect Fetch/SSE; a mini program can feed `wx.request({ enableChunked: true })` chunks into `createAgentSseEventSource()`.

```ts
import { createAgentSseEventSource, createAgentStreamController } from '@varo-ui/ai'

const transport = createAgentSseEventSource()
const controller = createAgentStreamController()

requestTask.onChunkReceived(({ data }) => transport.feed(data))
await controller.connect(transport.source)
```

`connect()` owns the event-iterator lifecycle: protocol `done`/`error` events settle the connection and request iterator cleanup; natural iterator exhaustion synthesizes `done`.

## Mini-program build chain

```bash
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
pnpm add clsx @weapp-tailwindcss/merge
```

Copy-owned mini-program Registry components use native Wevu SFCs and consume Tailwind v4 utilities through `styleIsolation: apply-shared`. Rendering and lifecycle code remain target-specific; pure adapters may re-export target primitives, and cross-target sharing is limited to types, pure functions, and headless primitives. The `cn()` helper uses `@weapp-tailwindcss/merge`, preserving mini-program escaping behavior.

## Engineering notes

- Keep docs, playgrounds, and packages in the monorepo
- Consume published package entries externally; use source aliases only for workspace development
- H5 and mini-program wrappers share primitive naming, while `@varo-ui/h5` and `@varo-ui/weapp` own the visual layer

## Version strategy

- Use the current compatible toolchain; docs do not pin specific `weapp-vite`, `wevu`, or `weapp-tailwindcss` versions
- Production projects should follow their lockfile, package `peerDependencies`, and CI build result
- VitePress, Vue, and TypeScript move with the workspace upgrade policy
