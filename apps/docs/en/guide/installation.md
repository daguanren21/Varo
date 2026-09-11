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

Third-party components do not need to be merged upstream: use `add --registry <local-directory-or-http(s)-url>` to install an independent registry. Authors can also use `export --target h5|weapp <item>` to generate JSON for shadcn-vue. See [Publish an independent registry](/en/blocks/build-your-own#publish-an-independent-registry) for layouts, publishing commands, and runtime boundaries.

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

`@varo-ui/cli` only copies Registry files and prints `Dependencies:` / `Dev dependencies:`; it does not install npm packages. After each `add`, install every reported dependency that the project does not already contain. See the [one-time Wevu Registry setup](/en/guide/shadcn-mode) for managed registration of `src/styles.css` and the Registry theme at `src/styles/varo.css`, plus the complete Tailwind options.

## Preview mini-program artifacts in a browser

Start the standalone Web compatibility preview from the Varo repository root:

```bash
pnpm --filter @varo/playground-weapp-preview dev
```

The development command builds the mini program first, then serves button, controlled-input, slot/lifecycle, and Agent scenarios at `http://127.0.0.1:5182`. After changing native examples, run `pnpm --filter @varo/playground-weapp-preview prepare:artifacts` to refresh their compiled artifacts.

The wx runtime now lives in the private `@varo/weapp-web` package: a Vite plugin compiles Wevu artifacts into `virtual:varo-native-artifacts`, and a replaceable harness owns `wx` APIs and native elements. The playground is only a sandbox consumer; the package is not published yet. The host runs Wevu-generated JS, JSON, WXML, and WXSS through glass-easel's DOM backend rather than substituting H5 business components. Narrow windows scale the presentation while preserving the selected native viewport width. **This is not a WeChat-client or device emulator.** Unsupported capabilities such as login and payment fail explicitly instead of returning fabricated success.

Build and verify the production surface:

```bash
pnpm exec turbo run build --filter=@varo/playground-weapp-preview
pnpm --filter @varo/playground-weapp-preview preview
# Run in another terminal; a local Chrome installation is required
pnpm --filter @varo/playground-weapp-preview smoke:browser
```

The production preview defaults to `http://127.0.0.1:4182`; deployable files are in `apps/playground-weapp-preview/dist`. The browser smoke exercises native interaction, event counts, context, stream stop/resume, layout boundaries, and error recovery, and writes screenshots to a temporary directory. Set `PREVIEW_URL` to test another running preview.

The repository lockfile records the SDK versions required by this pipeline. The CLI does not automatically install those dependencies into external consumer projects. WeChat-specific capabilities, device performance, and final native visuals still require validation in WeChat.

## Engineering notes

- Keep docs, playgrounds, and packages in the monorepo
- Consume published package entries externally; use source aliases only for workspace development
- H5 and mini-program wrappers share primitive naming, while `@varo-ui/h5` and `@varo-ui/weapp` own the visual layer

## Version strategy

- Use the current compatible toolchain; docs do not pin specific `weapp-vite`, `wevu`, or `weapp-tailwindcss` versions
- Production projects should follow their lockfile, package `peerDependencies`, and CI build result
- VitePress, Vue, and TypeScript move with the workspace upgrade policy
