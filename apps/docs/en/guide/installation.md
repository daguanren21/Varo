# Installation

## Recommended package path

- Prefer `@varo-ui/cli` for editable source; npm packages provide H5 components or native Wevu SFCs that require compilation
- `@varo-ui/headless` provides only platform-neutral state, event, and controlled-state contracts; H5 handles DOM behavior, focus, and page scroll locking
- Native projects use `weapp-vite` + `wevu` + Tailwind CSS v4 + `weapp-tailwindcss`, without a Vue renderer to simulate mini programs

Use the Node and pnpm versions declared in the root [`package.json`](https://github.com/daguanren21/Varo/blob/main/package.json) (`engines` and `packageManager`).

## Initialize a project

```bash
pnpm dlx create-weapp-vite@latest varo-app
cd varo-app
pnpm install
```

## Official wrappers

```bash
# H5
pnpm add vue @varo-ui/h5 @varo-ui/theme
# Native Wevu project (choose one path; no extra Vue renderer is needed)
pnpm add wevu @varo-ui/weapp @varo-ui/theme
pnpm add -D weapp-vite
# Only for Markdown, text pacing, and thread-version helpers
pnpm add @varo-ui/ai
```

On H5, import components from the public entry and load styles at application entry:

```ts
import { VButton } from '@varo-ui/h5'
import '@varo-ui/h5/style.css'
```

H5 public entries are the package root, `/primitives`, `/style.css`, and `/source/style.css`; the last is CSS-only, not a TypeScript component entry. For editable components, use the Registry instead of package-internal source paths.

The `@varo-ui/weapp` root exports native Wevu SFCs. You can also import individual files directly:

```ts
import VButton from '@varo-ui/weapp/components/v-button.vue'
```

These SFCs require native compilation and cannot mount in a browser as Vue Parts. For npm usage, create a local stylesheet at `src/package.css`:

```css
@import '@varo-ui/weapp/style.css';
```

Then register that local file in your existing `weapp` configuration, retaining the project's Tailwind options. Do not pass an absolute `node_modules` path as `weapp.styles.source`: the compiler ignores it.

```ts
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    vue: {
      enable: true,
      template: { nativeSlotContext: true, scopedSlotsRequireProps: true },
    },
    styles: [
      { source: 'package.css', include: 'app.vue' },
      { source: 'styles.css', include: 'app.vue' },
    ],
  },
})
```

See [Wevu Registry setup](/en/guide/shadcn-mode) for the `src/styles.css` Tailwind entry. Do not import package styles into component-local WXSS. `VaroResolver` from `@varo-ui/weapp/resolver` resolves Registry SFCs already installed in your project; it does not install components or replace global style setup.

On WeChat, use an unpatched `weapp-vite` and `wevu` pair at 7.11.1 or newer within the declared peer range. This is the verified baseline for slot ownership through app shells and scriptless layouts. Enable both `weapp.vue.template.nativeSlotContext` and `scopedSlotsRequireProps` with default attached setup for native slot context. See the [native-slot configuration](https://vite.weapp.dev/config/vue#weapp-vue-template) and [runtime evidence limits](#deterministic-e2e-and-evidence-boundaries).

## Primitives only

```bash
pnpm add @varo-ui/headless
```

Headless has no UI or DOM side effects. Import unstyled H5 Parts from `@varo-ui/h5/primitives`. Native projects compose Registry SFCs or bind headless to Wevu reactivity; there is no equivalent Vue Parts entry.

## shadcn-style install

Use the CLI to install source into your project and adapt it, as with shadcn/ui:

```bash
pnpm dlx @varo-ui/cli add --target weapp button select card
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 button select card
```

Components land in `src/components/ui/*`; blocks land in `src/components/blocks/*`. Your product can then create `UserSelect`, `DepartmentSelect`, and `ProductSelect` in `src/components/biz/*`.

Registry manifests list installable components and all required dependencies; component counts or similar APIs do not establish platform support. H5 source automatically imports required CSS. Native Wevu SFCs are compiled into platform artifacts. Only types, pure functions, and headless state contracts are shared across renderers.

Third-party components do not need to be merged upstream: use `add --registry <local-directory-or-http(s)-url>` to install an independent registry. Authors can use `export --target <profile> <item>` to generate JSON for shadcn-vue. See [Publish an independent registry](/en/blocks/build-your-own#publish-an-independent-registry) for layouts, publishing commands, and runtime boundaries.

### Install profiles and support boundaries

There are only two renderers, `h5` and `weapp`. `--target` selects an exact install profile:

| `--target`      | Renderer | Compiler platform | Host                     | Maturity     |
| --------------- | -------- | ----------------- | ------------------------ | ------------ |
| `h5`            | `h5`     | —                 | Browser                  | stable       |
| `weapp`         | `weapp`  | `weapp`           | WeChat mini program      | stable       |
| `alipay`        | `weapp`  | `alipay`          | Alipay mini program      | experimental |
| `tt`            | `weapp`  | `tt`              | Douyin mini program      | experimental |
| `xhs`           | `weapp`  | `xhs`             | Xiaohongshu mini program | experimental |
| `donut-android` | `weapp`  | `weapp`           | Donut Android            | experimental |
| `donut-ios`     | `weapp`  | `weapp`           | Donut iOS                | experimental |
| `donut-ohos`    | `weapp`  | `weapp`           | Donut HarmonyOS          | experimental |

Each experimental profile requires explicit support in the item manifest and every transitive dependency. Any missing declaration rejects installation before writes, with no fallback to `weapp`. Representative supported components are `button`, `input`, `input-otp`, `form`, `checkbox`, `switch`, `drawer`, `card`, and `icon`, with required dependencies. Current manifests define the exact list; this does not imply support for the remaining catalog or Agent UI.

```bash
pnpm dlx @varo-ui/cli add --target alipay button input input-otp form checkbox switch drawer card
```

`pnpm check:platforms` compiles all seven native profiles and checks artifacts in `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`. Donut uses the WeChat compiler with host metadata, not a separate native renderer. See [runtime evidence limits](#deterministic-e2e-and-evidence-boundaries) for IDE, SDK, signing, and device requirements.

## Agent streaming

Use TanStack AI directly for chat. `@tanstack/ai` defines upstream `UIMessage` and AG-UI `StreamChunk`; `@tanstack/ai-client` owns messages, `ChatClientSnapshot`, connections, interrupts, and abort. H5 uses `useChat` from `@tanstack/ai-vue`; native uses `ChatClient` with Wevu. `@varo-ui/ai` retains safe Markdown, text pacing, and thread-version helpers only, without a private event protocol, stream controller, channel, SSE decoder, or event parser.

Install UI as needed: `agent-conversation`, `agent-workspace`, `agent-advanced`, and `agent-rag`. Shared `agent-presentation` contains only display types and pure helpers. `AgentPartStatus`, `AgentStreamStatus`, and `AgentToolPart` live in installed `components/agent-ui/types`, not a core protocol or SDK state. SDK status is `ready | submitted | streaming | error`; do not replace it with a display status. `blocks/agent-chat` installs conversation dependencies without requiring the full suite. Static history retains `AgentConversationMessage[]`; snapshot props take actual `client.getSnapshot()` results, without rebuilding snapshots or reducing events.

Enable the official [Web Runtime configuration](https://vite.weapp.dev/config/web-runtime-globals) in your native compiler configuration:

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

Use the SDK's standard `fetchServerSentEvents` adapter, without a bespoke `wx.request` transport or Web API polyfills. The host must supply real response status, headers, and incremental chunks; a fully buffered response is not streaming. Import native reactivity and lifecycle APIs from `wevu`, without the Vue binding. Web Runtime does not simulate browser Cookie/CORS behavior, and stream consumption is not network-level backpressure.

Renderer `approve` / `reject` events carry an interrupt ID. The application finds the matching `tool-approval` in `client.getInterrupts()`, checks eligibility, and calls `resolveInterrupt(true)` / `resolveInterrupt(false)`. The UI performs no network or tool execution and grants no business permission. Credentials, business execution and authorization, retry policy, and server cancellation propagation belong to the application. See [Agent integration](/en/ai/) for complete H5 / native examples and official TanStack references.

## Mini-program build chain

```bash
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
pnpm add clsx @weapp-tailwindcss/merge
```

Native Registry components use application-global styles through `styleIsolation: apply-shared`. `themes/base` contains only tokens and foundation rules. Each ordinary component manifest declares its CSS, while optional `themes/agent` contains the additional Agent styles. The `cn()` helper uses `@weapp-tailwindcss/merge` to preserve mini-program escaping behavior.

`@varo-ui/cli` only copies Registry files and prints `Dependencies:` / `Dev dependencies:`; it does not install npm packages. After each `add`, install every reported dependency not already present. Globally register all installed `src/styles/*.css` in `app.vue`, with `varo.css` first; loading only base or importing these files inside components is insufficient. See the [one-time Wevu Registry setup](/en/guide/shadcn-mode) for the full configuration.

## Preview mini-program artifacts in a browser

The private `@varo/weapp-web` package previews trusted compiled artifacts during development. It is unpublished and must not be a production UI dependency. Its Vite plugin compiles Wevu artifacts into `virtual:varo-native-artifacts`; the preview handles `wx` APIs and native elements. It runs generated JS, JSON, WXML, and WXSS through glass-easel's DOM backend without substituting H5 business components. Narrow windows scale the display while retaining the selected native viewport width. **The same-origin iframe is neither a security sandbox nor a WeChat client.** Do not load untrusted artifacts. Unsupported login, payment, and other capabilities fail without fabricated success.

Build and preview the production output manually:

```bash
pnpm exec turbo run build --filter=@varo/playground-weapp-preview
pnpm --filter @varo/playground-weapp-preview preview
```

The production preview defaults to `http://127.0.0.1:4182`; deployable files are in `apps/playground-weapp-preview/dist`. Use `pnpm test:e2e:web` below for deterministic browser regressions. The runner starts and cleans up its services, checking native artifact interactions, event counts, context, stream stop/resume, layout boundaries, and error recovery.

The repository lockfile records SDK versions. The CLI does not install those dependencies into external consumer projects. See [runtime evidence limits](#deterministic-e2e-and-evidence-boundaries).

The H5 and Mini Program documentation tabs share example groups, locale, theme, and device framing. Registered component and Primitive Mini Program examples run compiled Wevu artifacts with input, selection, validation, dynamic arrays, file selection, and error recovery. Expand **View code** for installation commands and native source. H5-only components are labeled.

`pnpm --filter @varo/docs dev` and `pnpm --filter @varo/docs build` prepare the native preview dependencies automatically. Docs serve the complete preview at `${DOCS_BASE}weapp-preview/`, with no separate preview server. Development uses artifacts prepared at startup; restart the docs development server after editing native demos or the preview runtime. Run `DOCS_PREVIEW_URL=http://localhost:5173/ pnpm --filter @varo/docs smoke:native-preview` to check every registered scene, 320/390px layouts, and interaction regressions including both languages, light/dark themes, and form submission. For production previews, use the actual address, such as `http://localhost:4173/Varo/`, retaining any deployment subpath. Set `DOCS_PREVIEW_CASES=form-file-picker,form-array-en-dark` to run selected cases.

### Deterministic E2E and evidence boundaries

Private `@varo/e2e` is development tooling, excluded from Registry installs and the component runtime. Run E2E tests and structural contract checks separately:

```bash
pnpm --filter @varo/e2e exec playwright-core install chromium
pnpm build
pnpm test:contracts
pnpm test:e2e:web
pnpm test:e2e:weapp
```

The Web suite covers H5 and glass-easel preview; the Weapp suite uses a headless host for native compiled artifacts. Neither uses models or retries. Missing cases or targets, failures, and unexpected skips reject acceptance. Each run writes a unique `apps/e2e/.e2e/runs/<run-id>/run.json`, with screenshots and framework reports in the same run directory; reports are never reused. Legacy native smokes and capture entrypoints require separate host validation.

The native suite uses `@weapp-vite/miniprogram-automator`. Headless is not a WeChat client: it provides no real pixels, keyboard input, or touch geometry, and cannot fully observe every `rich-text` surface. Read rendered text from the rendered tree, not application state; validate unobservable behavior on a supported host.

The native-slot configuration above uses WeChat's default attached setup. It does not establish created-setup or other-profile runtime support. Browser previews and compiled artifacts do not establish IDE/device behavior or final native visuals. Same-origin previews execute trusted artifacts and are not security sandboxes.

`pnpm test:e2e:devtools` requires authenticated WeChat DevTools, its automation port, and a valid local AppID. Other native hosts require their vendor IDEs, SDKs, toolchains, and signing. Supply real credentials; compilation and artifact checks do not replace simulator or device validation.

`pnpm check:full` checks source projections and architecture, then runs repoctl's basic checks and build, structural contracts, runner negative controls, real E2E, isolated consumers, and native profile artifact checks. Missing host prerequisites do not count as passing.

## Local Devframe MCP

Private `@varo/devtools` provides workspace tools through the Devframe stdio adapter, with no HTTP interface or shared state. It is not a production dependency. Use Node 24.22.1 or newer in the Node 24 line, or Node 26.12.1 or newer, satisfying both the root and devtools manifests. The private MCP tools do not support Node 22. After installing the workspace with its declared pnpm version, launch it from the repository root:

```bash
# Read-only by default: Block catalog/manifests/source and installation plans
node packages/devtools/src/cli.ts
# Explicitly enable fixed preview/check/E2E commands, not arbitrary shell execution
node packages/devtools/src/cli.ts --allow-execution
```

An MCP client launches the process and keeps its stdin/stdout connection open. Tools are `varo_blocks_list`, `varo_blocks_get`, `varo_blocks_source`, `varo_install_plan`, `varo_preview_open`, `varo_checks_run`, `varo_e2e_run`, and `varo_evidence_read`. Read-only install planning reuses CLI profile, dependency, and conflict checks without copying files or installing npm dependencies.

Execution accepts only fixed enums: preview `h5` / `weapp-preview`, check `generated` / `architecture`, and E2E suite `web` / `weapp` / `devtools`. Previews bind loopback only; request cancellation or server shutdown cleans up owned processes. A successful E2E MCP call is not a passing test verdict: inspect the returned `status` and `exitCode`.

`varo_evidence_read` accepts only a `runId` created by that server session and artifact kind `run` / `report`. Arbitrary paths, foreign-session runs, and modified evidence are rejected. Responses are capped at 256 KiB. Larger framework reports can be registered as run evidence up to 16 MiB, but oversized reads are rejected while the `run` summary remains readable.

## Engineering notes

- Keep docs, playgrounds, and packages in the monorepo
- Consume public package entries or installed Registry source, not private TypeScript paths inside packages
- Author in `registry/components/**/*` and `registry/themes/**/*`; `pnpm sync:registry` generates package, playground, and docs source projections, while `pnpm check:generated` / `pnpm check:architecture` enforce drift and boundaries

## Dependency compatibility

- Keep `weapp-vite` and `wevu` aligned; native consumer compatibility is declared in [`@varo-ui/weapp` peer dependencies](https://github.com/daguanren21/Varo/blob/main/packages/ui-weapp/package.json).
- Resolve exact versions from manifests and lockfiles; validate the selected profile after dependency changes.
