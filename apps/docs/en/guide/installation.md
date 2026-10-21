# Installation

## Recommended package path

- Prefer `@varo-ui/cli` for editable source; npm packages provide H5 components or native Wevu SFCs that require compilation
- `@varo-ui/headless` provides only platform-neutral state, event, and controlled-state contracts; H5 handles DOM behavior, focus, and page scroll locking
- Native projects use `weapp-vite` + `wevu` + Tailwind CSS v4 + `weapp-tailwindcss`, without a Vue renderer to simulate mini programs

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
# Only for Agent events and Markdown
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
    styles: [
      { source: 'package.css', include: 'app.vue' },
      { source: 'styles.css', include: 'app.vue' },
    ],
  },
})
```

See [Wevu Registry setup](/en/guide/shadcn-mode) for the `src/styles.css` Tailwind entry. Do not import package styles into component-local WXSS. `VaroResolver` from `@varo-ui/weapp/resolver` resolves Registry SFCs already installed in your project; it does not install components or replace global style setup.

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

`pnpm check:platforms` compiles all seven native profiles and checks their artifacts in `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`. The integrated compiler is 7.5.0. Donut uses the WeChat compiler with real host metadata. **Compilation and artifact checks cannot replace device validation.** Consumers must supply AppIDs, signing, host SDKs, IDE access, and device validation; the checks never fabricate credentials.

## Agent streaming

`@varo-ui/ai` is model-provider neutral. A backend emits `message.start`, `text.delta`, `reasoning.*`, `tool.*`, `approval.*`, `message.end`, and `done` events. H5 can connect Fetch/SSE; a mini program can feed `wx.request({ enableChunked: true })` chunks into `createAgentSseEventSource()`.

Install UI as needed: `agent-conversation`, `agent-workspace`, `agent-advanced`, and `agent-rag`. Shared `agent-presentation` contains only presentation types and pure helpers. `blocks/agent-chat` installs conversation components and dependencies without requiring the full `components/agent-ui` suite. See [Agent installation](/en/ai/). Your application handles approval execution, networking, retries, and cancellation policy.

```ts
import { createAgentSseEventSource, createAgentStreamController } from '@varo-ui/ai'

const transport = createAgentSseEventSource()
const controller = createAgentStreamController()

requestTask.onChunkReceived(({ data }) => transport.feed(data))
await controller.connect(transport.source)
```

`connect()` manages the event iterator's lifecycle. Protocol `done`/`error` events end the connection and request iterator cleanup; when the iterator ends naturally, the controller generates `done`.

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

The repository lockfile records the SDK versions required by this pipeline. The CLI does not automatically install those dependencies into external consumer projects. WeChat-specific capabilities, device performance, and final native visuals still require validation in WeChat.

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

The Web suite covers H5 and glass-easel preview; the Weapp suite uses a headless host for native compiled artifacts. Neither uses models or retries. Missing cases or targets, failures, and unexpected skips reject acceptance. Each run writes a unique `apps/e2e/.e2e/runs/<run-id>/run.json`, with screenshots and framework reports in the same run directory; reports are never reused. Legacy native smokes and capture entrypoints remain pending host acceptance.

The repository's pnpm patch for `@weapp-vite/miniprogram-automator@1.3.0` adds rendered-tree text observation for `rich-text` arrays/HTML and the native submit-button form default action. The patch lives at `patches/@weapp-vite__miniprogram-automator@1.3.0.patch` and applies only to a development test dependency. `apps/e2e/tests/runner/native-runtime.test.ts` exercises the real Launcher for entities, content updates, unsupported node/event filtering, named field values, custom form behaviors, and disabled buttons. Revalidate these scenarios when upgrading the SDK and remove the patch once upstream provides the behavior.

Headless is not a WeChat client: it does not provide real pixels, keyboard input, or touch geometry. Rendered-text assertions must read the rendered tree rather than application state. `pnpm test:e2e:devtools` separately requires authenticated WeChat DevTools, its automation port, and a valid local AppID. Device capabilities and final native visuals still require separate acceptance.

`pnpm check:full` checks source projections and architecture, then runs repoctl's basic checks and build, structural contracts, runner negative controls, real E2E, isolated consumers, and native profile artifact checks. Missing host prerequisites do not count as passing.

## Local Devframe MCP

Private `@varo/devtools` provides workspace tools through the Devframe stdio adapter, with no HTTP interface or shared state. It is not a production dependency. After installing the workspace, launch it from the repository root with Node 24:

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

## Version strategy

- The current native integration uses `weapp-vite` / `wevu` 7.5.0; npm packages require compatible 7.x versions, and upgrades need validation of each profile you use
- Production projects should follow their lockfile, package `peerDependencies`, and CI build result
- VitePress, Vue, and TypeScript move with the workspace upgrade policy
