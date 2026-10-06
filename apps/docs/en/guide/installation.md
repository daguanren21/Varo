# Installation

## Recommended package path

- Product teams: use `@varo-ui/cli` to install owned source; npm packages provide H5 components or native Wevu SFCs for compilation
- `@varo-ui/headless` provides only platform-neutral state, event, and controlled-state contracts; DOM, focus, and page scroll locking belong to H5
- Native projects use `weapp-vite` + `wevu` + Tailwind CSS v4 + `weapp-tailwindcss`, not a Vue renderer that simulates mini programs

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

H5 public entries are the package root, `/primitives`, `/style.css`, and `/source/style.css`. The last remains a valid CSS subpath, not a TypeScript component entry. Use Registry for editable components instead of importing package-internal source.

The `@varo-ui/weapp` root exports real native Wevu SFCs. Individual files can also be imported directly:

```ts
import VButton from '@varo-ui/weapp/components/v-button.vue'
```

These SFCs require the native compiler; they are not Vue Parts for browser mounting. For npm consumption, first create the local application stylesheet `src/package.css`:

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

Headless includes neither UI nor DOM side effects. H5 unstyled Parts come from `@varo-ui/h5/primitives`. Native consumers compose Registry SFCs or bind headless to Wevu reactivity; there is no equivalent Vue Parts entry.

## shadcn-style install

If you want the shadcn/ui workflow, copy source into the product project first, then wrap it for business needs:

```bash
pnpm dlx @varo-ui/cli add --target weapp button select card
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 button select card
```

Components land in `src/components/ui/*`; blocks land in `src/components/blocks/*`. Your product can then create `UserSelect`, `DepartmentSelect`, and `ProductSelect` in `src/components/biz/*`.

Registry manifests define installable components and their complete dependency closure; component counts or similar APIs do not establish platform support. H5 source automatically imports its CSS closure. Native source ships as Wevu SFCs compiled into platform artifacts. Only types, pure functions, and headless state contracts are shared across renderers.

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

Each of the six new profiles requires explicit admission in the item manifest and every transitive dependency. Missing admission rejects the install before writes; it never falls back to `weapp`. The representative admitted components are `button`, `input`, `input-otp`, `form`, `checkbox`, `switch`, `drawer`, `card`, and `icon`, with required dependencies. Current manifests are authoritative; this does not admit the rest of the catalog or Agent UI.

```bash
pnpm dlx @varo-ui/cli add --target alipay button input input-otp form checkbox switch drawer card
```

The repository's `pnpm check:platforms` runs real compiler/artifact checks for all seven native profiles, writing `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`. The current integrated compiler is 7.4.0. Donut uses the WeChat compiler with real per-host metadata. **Compiler/artifact success is not device certification.** Consumers supply AppIDs, signing, host SDKs, IDE access, and device validation; no credentials are fabricated.

## Agent streaming

`@varo-ui/ai` is model-provider neutral. A backend emits `message.start`, `text.delta`, `reasoning.*`, `tool.*`, `approval.*`, `message.end`, and `done` events. H5 can connect Fetch/SSE; a mini program can feed `wx.request({ enableChunked: true })` chunks into `createAgentSseEventSource()`.

Choose UI units as needed: `agent-conversation`, `agent-workspace`, `agent-advanced`, and `agent-rag`. Shared `agent-presentation` contains only presentation types and pure helpers. `blocks/agent-chat` installs the conversation closure without requiring `components/agent-ui`; the latter is an intentional full-suite choice. See [Agent installation](/en/ai/). Approval execution, networking, retry, and cancellation policy remain application-owned.

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

Native Registry components consume application-global styles through `styleIsolation: apply-shared`. `themes/base` contains only tokens and foundation rules; each ordinary component manifest owns its CSS, and optional `themes/agent` owns Agent additions. The `cn()` helper uses `@weapp-tailwindcss/merge`, preserving mini-program escaping behavior.

`@varo-ui/cli` only copies Registry files and prints `Dependencies:` / `Dev dependencies:`; it does not install npm packages. After each `add`, install every reported dependency not already present. Globally register all installed `src/styles/*.css` in `app.vue`, with `varo.css` first; loading only base or importing these files inside components is insufficient. See the [one-time Wevu Registry setup](/en/guide/shadcn-mode) for the full configuration.

## Preview mini-program artifacts in a browser

The private `@varo/weapp-web` package is development tooling for trusted compiled artifacts: its Vite plugin compiles Wevu artifacts into `virtual:varo-native-artifacts`, and the harness handles `wx` APIs and native elements. It is not published and must not become a production UI dependency. The host runs Wevu-generated JS, JSON, WXML, and WXSS through glass-easel's DOM backend rather than substituting H5 business components. Narrow windows scale the presentation while preserving the selected native viewport width. **A same-origin iframe is not a security sandbox, a WeChat client, or device proof.** Do not load untrusted artifacts. Unsupported capabilities such as login and payment fail explicitly instead of returning fabricated success.

Build and verify the production surface:

```bash
pnpm exec turbo run build --filter=@varo/playground-weapp-preview
pnpm --filter @varo/playground-weapp-preview preview
# Run in another terminal; a local Chrome installation is required
pnpm --filter @varo/playground-weapp-preview smoke:browser
```

The production preview defaults to `http://127.0.0.1:4182`; deployable files are in `apps/playground-weapp-preview/dist`. The browser smoke exercises native interaction, event counts, context, stream stop/resume, layout boundaries, and error recovery, and writes screenshots to a temporary directory. Set `PREVIEW_URL` to test another running preview.

The repository lockfile records the SDK versions required by this pipeline. The CLI does not automatically install those dependencies into external consumer projects. WeChat-specific capabilities, device performance, and final native visuals still require validation in WeChat.

Documentation H5 tabs provide browser interaction. Native tabs show target source and support evidence, not H5/Vue components masquerading as a live mini program. Compiled-artifact browser previews and device validation are separate evidence categories.

## Engineering notes

- Keep docs, playgrounds, and packages in the monorepo
- Consume public package entries or installed Registry source, not private TypeScript paths inside packages
- Author in `registry/components/**/*` and `registry/themes/**/*`; `pnpm sync:registry` generates package, playground, and docs source projections, while `pnpm check:generated` / `pnpm check:architecture` enforce drift and boundaries

## Version strategy

- The current native integration uses `weapp-vite` / `wevu` 7.4.0; npm packages require compatible 7.x versions, and upgrades need validation of each profile you use
- Production projects should follow their lockfile, package `peerDependencies`, and CI build result
- VitePress, Vue, and TypeScript move with the workspace upgrade policy
