# Varo

**English** | [简体中文](./README.zh-CN.md)

[Documentation](https://varo.weapp.dev/) · [GitHub Release](https://github.com/daguanren21/Varo/releases/tag/v1.0.1) · [npm organization](https://www.npmjs.com/org/varo-ui)

Varo is a registry-first component system for Vue 3 mobile H5 applications and `weapp-vite` mini programs. Its primary product is editable, target-specific component and Block source code that becomes part of the consuming application—not an opaque cross-platform UI runtime.

## Published packages

- [`@varo-ui/cli`](https://www.npmjs.com/package/@varo-ui/cli) — installs editable Registry source for the selected deployment profile
- [`@varo-ui/headless`](https://www.npmjs.com/package/@varo-ui/headless) — framework- and DOM-neutral state machines, events, controlled-state contracts, and utilities
- [`@varo-ui/h5`](https://www.npmjs.com/package/@varo-ui/h5) — tree-shakeable Vue components for mobile H5 products
- [`@varo-ui/weapp`](https://www.npmjs.com/package/@varo-ui/weapp) — native Wevu `.vue` source and a resolver for the `weapp-vite` compiler, not a Vue render runtime
- [`@varo-ui/theme`](https://www.npmjs.com/package/@varo-ui/theme) — shared theme tokens and providers
- [`@varo-ui/ai`](https://www.npmjs.com/package/@varo-ui/ai) — Agent event protocol, streaming controller, SSE/chunk decoding, and safe Markdown model

## Current capabilities

- **H5 components:** styled Vue components and DOM primitives, with editable Registry source
- **Native components:** target-specific Wevu SFCs; npm and Registry installations derive from the same authored source
- **Agent Core:** shared event protocol, SSE/chunk transport, Markstream scheduling on H5, timed-frame scheduling on mini programs, and a safe incremental Markdown AST
- **Agent UI:** conversation, workspace, advanced, and RAG source units plus Agent Chat and Agent Workspace Blocks for scoped context, retrieval, tasks, thread versions, streaming, tools, approvals, code, diffs, citations, media, tables, and workflows
- **Dual-target Blocks:** Login Form, Profile Card, Profile Edit, Product List, Order Filter, Agent Chat, and Agent Workspace
- **AI commerce demo:** real incremental events, reasoning and tool states, human approval for purchases and returns, order history, and address configuration
- **Renderer families:** `h5` and `weapp`; deployment profiles are listed below
- **Mini-program styling:** Tailwind CSS v4, [`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss), and `@weapp-tailwindcss/merge`
- **Mini-program debugging:** built-in MCP, DevTools console bridge, Automator screenshots, and runtime smoke checks

## Product boundary

- The high-consensus Weapp Registry is based on the overlapping capabilities of [Vant Weapp](https://vant-ui.github.io/vant-weapp/), [NutUI](https://nutui.jd.com/h5/vue/4x/), [TDesign Mobile Vue](https://tdesign.tencent.com/mobile-vue/components/overview), and [TDesign MiniProgram](https://tdesign.tencent.com/miniprogram/components/overview).
- Motion and Agent interaction patterns reference [Beautiful UI](https://www.beautifului.dev/) and [beUI](https://beui.dev/), while production code remains native to Vue and mini-program runtimes.
- Component availability comes from each `registry/**/registry.json` manifest and its complete dependency closure. A browser example or a component in the H5 catalog does not imply native availability.
- H5 streaming uses [Markstream Core](https://github.com/Simon-He95/markstream-vue) scheduling and Markdown parsing. Mini programs use the same protocol and AST with a timed scheduler that does not depend on `requestAnimationFrame`.
- [`registry/component-tiers.v0.1.json`](./registry/component-tiers.v0.1.json) records product tiers; installation admission is owned by the manifests and the profile table in [`packages/registry/src/index.ts`](./packages/registry/src/index.ts).

## Source ownership

Author component renderers in `registry/components/**`, Blocks in `registry/blocks/**`, and styles in `registry/themes/**`. `pnpm sync:registry` generates the H5 renderer projections in `packages/ui-h5/src`, the native npm tree in `packages/ui-weapp/native`, repository playground installs, and the docs Agent source/support catalog. Do not edit those projections directly.

`packages/shared` owns the single neutral `ReactiveRuntime` contract. `@varo-ui/headless` exposes neutral behavior; H5 owns DOM rendering, focus, and body-scroll locking. Native SFCs bind headless behavior to `wevu` without importing Vue render primitives.

`themes/base` contains tokens and foundation rules only. Ordinary component CSS has one manifest owner; Agent tokens/helpers are optional `themes/agent` dependencies. H5 source imports its complete dependency CSS closure. Native `apply-shared` components instead receive that closure from the application stylesheet.

## Deployment profiles

| Install target  | Renderer | Compiler platform | Host / maturity                         |
| --------------- | -------- | ----------------- | --------------------------------------- |
| `h5`            | `h5`     | Browser build     | Browser / stable                        |
| `weapp`         | `weapp`  | `weapp`           | WeChat mini program / stable            |
| `alipay`        | `weapp`  | `alipay`          | Alipay mini program / experimental      |
| `tt`            | `weapp`  | `tt`              | Douyin mini program / experimental      |
| `xhs`           | `weapp`  | `xhs`             | Xiaohongshu mini program / experimental |
| `donut-android` | `weapp`  | `weapp`           | Donut Android / experimental            |
| `donut-ios`     | `weapp`  | `weapp`           | Donut iOS / experimental                |
| `donut-ohos`    | `weapp`  | `weapp`           | Donut OpenHarmony / experimental        |

The six experimental profiles require explicit admission for every item in the selected transitive closure. Missing admission fails before writes; the CLI never falls back to Weapp. The representative admitted component set is `button`, `input`, `input-otp`, `form`, `checkbox`, `switch`, `drawer`, `card`, and `icon`, with required utilities/themes. Manifests remain authoritative; this is not certification of the wider catalog or Agent UI on those profiles.

Use `weapp-vite` and `wevu` **7.4.0** for the repository fixtures. The native package peers remain `>=7.2.1 <8`. Donut uses WeChat compilation plus separate `mini-android`, `mini-ios`, or `mini-ohos` host metadata, not an Android/iOS/OpenHarmony compiler target. SDK installation, signing, AppIDs, vendor IDEs, and device execution remain separate prerequisites; no identities or credentials are fabricated.

## Install editable source

```bash
# Native mini-program SFCs
pnpm dlx @varo-ui/cli add --target weapp button input card

# H5 source
pnpm dlx @varo-ui/cli add --target h5 button input card

# Experimental profile: only explicitly admitted source
pnpm dlx @varo-ui/cli add --target alipay button input input-otp form checkbox switch drawer card

# Dual-target business Block
pnpm dlx @varo-ui/cli add --target weapp blocks/product-list

# Dual-target Agent Chat Block
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat

# Deliberately install the full Agent UI suite
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui

# High-consensus mini-program components
pnpm dlx @varo-ui/cli add --target weapp action-sheet collapse dialog list notice-bar popover skeleton steps
```

The CLI reports npm dependencies but does not install them. It does not overwrite existing files by default. Use `--force` only after reviewing local customizations; it replaces files and does not merge downstream edits.

For native source installs, load **every installed `src/styles/*.css` file globally** using `weapp.styles` entries with `include: 'app.vue'`, with `varo.css` first. Do not import these global styles from component-local WXSS: page tokens and global selectors do not belong there. Native npm consumers put `@import "@varo-ui/weapp/style.css";` in local `src/package.css` and register `{ source: 'package.css', include: 'app.vue' }` globally, not an absolute package path. See the [native package setup](./packages/ui-weapp/README.md) and [`apps/platform-smoke/vite.config.mjs`](./apps/platform-smoke/vite.config.mjs).

## Breaking migration

1. **Native rendering:** replace the former Vue-rendered `@varo-ui/weapp` implementation and removed `@varo-ui/weapp/primitives` imports with native SFCs compiled by Wevu/`weapp-vite`. The package root now exports native source; direct imports such as `@varo-ui/weapp/components/v-button.vue` are supported. `@varo-ui/weapp/resolver` resolves locally installed Registry SFCs, not a compatibility runtime.
2. **H5 imports:** replace TypeScript imports from the removed `@varo-ui/h5/source` with `@varo-ui/h5` or `@varo-ui/h5/primitives`. For editable code, install Registry source. `@varo-ui/h5/style.css` and the CSS-only `@varo-ui/h5/source/style.css` remain public; the removed TS entry leaked private workspace dependencies.
3. **Neutral behavior:** import state/form contracts from `@varo-ui/headless`; move `useBodyScrollLock` imports to `@varo-ui/h5/primitives` in H5 code only. Do not emulate DOM locking on native hosts. Form submit/failed handlers receive the named `SubmitPayload` (`FormSubmitPayload` in form source exports), containing `values`, `errors`, and optional platform-specific `event`, not a raw DOM event.
4. **Styles:** stop treating `themes/base` as a monolithic component/Agent stylesheet. Reinstall the required item closure and apply the native global loading rule above; H5 installed source brings its dependency CSS imports.
5. **Agent installs:** choose `components/agent-conversation`, `components/agent-workspace`, `components/agent-advanced`, or `components/agent-rag` as needed. `components/agent-presentation` owns pure shared types/helpers. `blocks/agent-chat` selects conversation dependencies, not advanced/RAG/fine-tuning UI; `components/agent-ui` deliberately selects the full suite. Approval, network, retry, and cancellation execution policy remains application-owned.

Input disabled/readonly states reject mutation; accepted changes emit once and no-ops emit no change. Drawer `openChange` cancellation is synchronous and precedes state mutation, model updates, and close notification. Update handlers to these contracts rather than retaining old forwarding behavior.

## Playground

```bash
pnpm dev:playground-h5
pnpm --filter @varo/playground-weapp dev:ai
```

`dev:ai` prepares the WeChat DevTools project, starts the MCP HTTP service, and forwards DevTools console output and uncaught errors to the active terminal.

## Documentation development

```bash
pnpm run docs:dev
```

This starts VitePress at `http://localhost:5173`. In-page H5 examples are browser interactions; native source tabs show source, not a simulated native renderer. The separate glass-easel preview is trusted compiled-artifact tooling. Its same-origin iframe is not a security sandbox, and a browser artifact preview is not IDE/device proof.

The preview keeps native Dialog diagnostics in a separate `dialog` scenario so its known context failure does not prevent base-control and Drawer checks. Plain-slot Dialog/Menu context remains blocked by [weapp-vite #1172](https://github.com/weapp-vite/weapp-vite/issues/1172) on the 7.4.0 fixture baseline; this is not a device-runtime conclusion or a downstream compatibility workaround.

## Verification

```bash
pnpm sync:registry
pnpm check:generated
pnpm check:architecture
pnpm typecheck
pnpm test
pnpm build
pnpm check:consumers
pnpm check:platforms
```

- `sync:registry` regenerates owned projections; `check:generated` rejects drift, including obsolete outputs recorded in `scripts/registry-projections.json`, without writing. Sync deletes obsolete files only when their bytes match the recorded digest; modified obsolete files and newly claimed authored paths reject before that owner's mutations. Authored renderers receiving generated style imports are never deletion-owned. Preflight protection is per generator invocation, not a transaction across all three scripts or a rollback guarantee for disk failures; do not run concurrent writers or delete the inventory to bypass a conflict.
- `check:architecture` checks neutral/runtime/tooling import boundaries and rejects obsolete Vue-native renderer imports.
- After generation and builds, `check:consumers` exercises packed public packages and fresh CLI source installs in isolated consumers. It checks published dependency/entrypoint isolation, H5/native compilation, source/style closure, minimal Agent Chat installs, and fail-closed profile roundtrips; it is not a device test.
- `check:platforms` builds and checks all seven native compiler/artifact profiles. To select one, use `pnpm --filter @varo/platform-smoke build:alipay` (or another native profile). `verify:alipay` checks existing artifacts without rebuilding.

The native fixture IDE/artifact root is exactly `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`; application files are in its nested `dist/`. Checks follow reachable component files, platform markup/event bindings, global style closure, IDE paths, and Donut host metadata. These commands do **not** prove simulator/device behavior, SDK packaging, signing, or approval by an independent verifier. To open an artifact, use the corresponding `open:<profile>` command with your registered AppID and installed vendor tools; missing prerequisites fail explicitly.

The Realworld fixture creates its app-owned manager with `createAedPinia()` in [`src/store/manager.ts`](./apps/realworld-weapp/src/store/manager.ts). Install it before creating stores: native `app.vue` calls `use(pinia)`; local runtime consumers use `createApp({}).use(manager)`. Its plugin persists only the AED store through `$subscribe`, preserving the `realworld-weapp-state` storage format, including nested-only updates. Navigation payloads remain transient, and disposing a store/manager releases persistence. Do not replace this with a setup-local deep watch or a bare, unconfigured `createPinia()` when persistence is required. Local store/bootstrap smoke does not execute real `wx.login`, update checks, or device launch.

Use pnpm `11.24.0` and Node `^22.18.0 || ^24.11.0 || >=26.0.0`. Vitest 5 and tsdown 0.23 exclude Node 25. TypeScript remains on 6.x for `vue-tsc` and the compiler API used by the native-artifact preview; jsdom remains on 29.x because 30.x requires newer Node patch versions than this workspace's supported minimums.

Vitest 5 no longer discovers configuration in parent directories. Workspace test scripts explicitly select the shared root configuration and restrict discovery to the current package. The Weapp playground instead selects its native-SFC test configuration with jsdom; the standalone Realworld app retains its local configuration.

H5 uses vite-plugin-dts 5's `bundleTypes` with an explicit `@microsoft/api-extractor` dependency so both published type entrypoints include their bundled private workspace types rather than referencing monorepo source paths.

See [RELEASING.md](./RELEASING.md) for the repoctl, npm OIDC, and documentation deployment workflow.
