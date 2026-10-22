# Varo

**English** | [简体中文](./README.zh-CN.md)

[Documentation](https://varo.weapp.dev/) · [DeepWiki](https://deepwiki.com/daguanren21/Varo) · [GitHub Release](https://github.com/daguanren21/Varo/releases/tag/v1.0.1) · [npm organization](https://www.npmjs.com/org/varo-ui)

Varo provides components and Blocks for Vue 3 mobile H5 applications and `weapp-vite` mini programs. Install source for your target through the Registry, then edit and maintain it in your application.

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

- The core Weapp Registry components draw on features shared by [Vant Weapp](https://vant-ui.github.io/vant-weapp/), [NutUI](https://nutui.jd.com/h5/vue/4x/), [TDesign Mobile Vue](https://tdesign.tencent.com/mobile-vue/components/overview), and [TDesign MiniProgram](https://tdesign.tencent.com/miniprogram/components/overview).
- Motion and Agent interaction patterns reference [Beautiful UI](https://www.beautifului.dev/) and [beUI](https://beui.dev/), while production code remains native to Vue and mini-program runtimes.
- A component's supported platforms are declared in its `registry/**/registry.json` manifest and those of all its dependencies. An H5 catalog entry or browser example does not establish native support.
- H5 streaming uses [Markstream Core](https://github.com/Simon-He95/markstream-vue) scheduling and Markdown parsing. Mini programs use the same protocol and AST with a timed scheduler that does not depend on `requestAnimationFrame`.
- [`registry/component-tiers.v0.1.json`](./registry/component-tiers.v0.1.json) records product tiers. The manifests and profile table in [`packages/registry/src/index.ts`](./packages/registry/src/index.ts) determine which platforms an installation supports.

## Source ownership

Write components in `registry/components/**`, Blocks in `registry/blocks/**`, and styles in `registry/themes/**`. Run `pnpm sync:registry` to generate `packages/ui-h5/src`, `packages/ui-weapp/native`, playground copies, and the docs Agent source and support catalog. Make changes in the Registry source; generated files should not be edited directly.

`packages/shared` defines the shared `ReactiveRuntime` interface. `@varo-ui/headless` provides framework- and platform-neutral interaction logic. H5 handles DOM rendering, focus, and body-scroll locking; native SFCs use the headless logic through `wevu`, without Vue render primitives.

`themes/base` contains tokens and foundation rules. Each component's manifest declares its CSS; Agent tokens and helpers come from the optional `themes/agent` dependency. H5 source imports all CSS needed by the component and its dependencies. Native `apply-shared` components load those styles through the application stylesheet.

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

To install one of the six experimental profiles, the selected components and every dependency must explicitly support it. If any item does not, the CLI fails before writing files instead of falling back to Weapp. Representative supported components are `button`, `input`, `input-otp`, `form`, `checkbox`, `switch`, `drawer`, `card`, and `icon`, with their required utilities and themes. Check the manifests for the exact list. This does not certify the full catalog or Agent UI on those platforms.

Repository fixtures use `weapp-vite` and `wevu` **7.5.0**; native package peers accept `>=7.2.1 <8`. Donut uses the WeChat compiler and selects its host through `mini-android`, `mini-ios`, or `mini-ohos` metadata. It has no separate Android, iOS, or OpenHarmony compiler target. You still need SDKs, vendor IDEs, registered AppIDs, signing, and device checks. The repository does not supply identities or credentials.

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

Install the npm dependencies listed by the CLI yourself. Existing files are kept by default. Review local customizations before using `--force`, which replaces files without merging your changes.

For native source installs, load **every installed `src/styles/*.css` file globally** using `weapp.styles` entries with `include: 'app.vue'`, with `varo.css` first. Do not import these global styles from component-local WXSS: page tokens and global selectors do not belong there. Native npm consumers put `@import "@varo-ui/weapp/style.css";` in local `src/package.css` and register `{ source: 'package.css', include: 'app.vue' }` globally, not an absolute package path. See the [native package setup](./packages/ui-weapp/README.md) and [`apps/platform-smoke/vite.config.mjs`](./apps/platform-smoke/vite.config.mjs).

## Breaking migration

1. **Native rendering:** replace the former Vue-rendered `@varo-ui/weapp` implementation and removed `@varo-ui/weapp/primitives` imports with native SFCs compiled by Wevu/`weapp-vite`. The package root now exports native source; direct imports such as `@varo-ui/weapp/components/v-button.vue` are supported. `@varo-ui/weapp/resolver` resolves locally installed Registry SFCs, not a compatibility runtime.
2. **H5 imports:** replace TypeScript imports from the removed `@varo-ui/h5/source` with `@varo-ui/h5` or `@varo-ui/h5/primitives`. For editable code, install Registry source. `@varo-ui/h5/style.css` and the CSS-only `@varo-ui/h5/source/style.css` remain public; the removed TS entry leaked private workspace dependencies.
3. **Neutral behavior:** import state/form contracts from `@varo-ui/headless`; move `useBodyScrollLock` imports to `@varo-ui/h5/primitives` in H5 code only. Do not emulate DOM locking on native hosts. Form submit/failed handlers receive the named `SubmitPayload` (`FormSubmitPayload` in form source exports), containing `values`, `errors`, and optional platform-specific `event`, not a raw DOM event.
4. **Styles:** stop treating `themes/base` as a monolithic component/Agent stylesheet. Reinstall the required item closure and apply the native global loading rule above; H5 installed source brings its dependency CSS imports.
5. **Agent installs:** choose `components/agent-conversation`, `components/agent-workspace`, `components/agent-advanced`, or `components/agent-rag` as needed. `components/agent-presentation` owns pure shared types/helpers. `blocks/agent-chat` selects conversation dependencies, not advanced/RAG/fine-tuning UI; `components/agent-ui` deliberately selects the full suite. Approval, network, retry, and cancellation execution policy remains application-owned.

Input rejects edits while disabled or readonly. It notifies once when a value changes and sends no change event when the value stays the same. Cancel Drawer `openChange` synchronously in the handler to prevent the subsequent state change, model update, and close notification. Update existing handlers to follow these rules and remove the old event forwarding logic.

## Playground

```bash
pnpm dev:playground-h5
pnpm --filter @varo/playground-weapp dev:ai
```

`dev:ai` prepares the WeChat DevTools project, starts the MCP HTTP service, and forwards DevTools console output and uncaught errors to the active terminal.

Native Blocks used only by `blocks-lab` are generated in `apps/playground-weapp/src/blocks-lab/components/blocks/`. Shared UI, Agent components, and helpers stay in the main source tree. `pnpm sync:registry` handles these paths and import changes; public Registry installations still use `src/components/blocks/`. The production build rejects a main package above 2 MiB or a synchronous reference to an unavailable sibling subpackage.

After native compilation, `localize-native-components.mjs` places subpackage-only component artifacts beside their consumers while keeping shared scripts and assets at their existing paths. CSS `url(...)` and quoted or URL-form `@import` references are decoded before resolving files and escaped when rebased, including CSS hexadecimal escapes, spaces, quotes, parentheses, and query/hash suffixes. External and data URLs retain their spelling. Missing dependencies and destination conflicts reject before any compiler output is changed; the production and exported-starter style verifiers use the same CSS reference parser.

## Documentation development

```bash
pnpm run docs:dev
```

This starts VitePress at `http://localhost:5173` and prepares the native preview artifacts. The H5 and Mini Program tabs share device framing, example cases, language, and theme. Mini Program examples run compiled Wevu SFCs through glass-easel; their editable source remains available under **View code**. H5-only components retain explicit platform support boundaries.

The preview keeps native Dialog diagnostics in a separate `dialog` scenario. The 7.5.0 compiler/runtime includes the upstream plain-slot context implementation from [weapp-vite #1174](https://github.com/weapp-vite/weapp-vite/pull/1174) for compiled Wevu components on WeChat with `scopedSlotsRequireProps: true` and default attached setup; it does not extend the protocol to created setup or other platforms. All registered documentation scenarios are exercised by `DOCS_PREVIEW_URL=http://localhost:5173/ pnpm --filter @varo/docs smoke:native-preview`. This trusted same-origin preview is not a security sandbox or WeChat IDE/device certification.

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

- `sync:registry` generates files; `check:generated` checks for drift, including obsolete outputs in `scripts/registry-projections.json`, without writing. Sync deletes obsolete files only if their bytes match the recorded digest. If an obsolete output was edited, or a new output path conflicts with an authored file, that generator fails before writing. Authored renderers receiving style imports are never deleted. Preflight applies per generator, without a transaction across all three scripts or disk-failure rollback. Do not run writers concurrently or delete the inventory to bypass conflicts.
- `check:architecture` checks imports between shared logic, runtime code, and tooling, rejecting old Vue-native renderer imports.
- After generation and builds, `check:consumers` checks packed packages and fresh CLI installations in isolated projects: dependency/entrypoint isolation, H5/native compilation, complete source/style dependencies, minimal Agent Chat installs, and profile roundtrips with rejection of unsupported profiles. It does not run devices.
- `check:platforms` builds and checks seven native profiles. Use `pnpm --filter @varo/platform-smoke build:alipay` for one platform; `verify:alipay` checks existing artifacts.
- `test:e2e:runner` checks runner gates and native locator semantics. `aria-hidden` excludes nodes and descendants from role queries without hiding their pixels or blocking explicit XPath actions; visually hidden and disabled controls remain non-actionable.
- Native custom-event listeners must preserve the declared event spelling, such as `@update:modelValue`. Wevu normalizes colon events to lowercase with `:` replaced by `-`; adding a hyphen inside `modelValue` changes the event name and prevents the model update.

Native artifacts are in `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`, with application files in the nested `dist/`. Checks cover component references, templates and events, complete global styles, IDE paths, and Donut host metadata. Simulators, devices, SDK packaging, signing, and independent release review need separate verification. To use `open:<profile>`, supply a registered AppID and vendor tools; missing prerequisites fail the command.

Realworld creates its manager with `createAedPinia()` in [`src/store/manager.ts`](./apps/realworld-weapp/src/store/manager.ts). Install it before creating stores: call `use(pinia)` in native `app.vue` or `createApp({}).use(manager)` in local consumers. Through `$subscribe`, the plugin persists only the AED store in `realworld-weapp-state` format, including nested updates. Navigation data stays transient; disposing the store or manager releases subscriptions. Keep this configuration for persistence, rather than a setup-local deep watch or bare `createPinia()`. Local checks do not run `wx.login`, update checks, or device launch.

Use pnpm `11.24.0` and Node `^22.18.0 || ^24.11.0 || >=26.0.0`. Vitest 5 and tsdown 0.23 exclude Node 25. TypeScript remains on 6.x for `vue-tsc` and the compiler API used by the native-artifact preview; jsdom remains on 29.x because 30.x requires newer Node patch versions than this workspace's supported minimums.

Vitest 5 no longer discovers configuration in parent directories. Workspace test scripts explicitly select the shared root configuration and restrict discovery to the current package. The Weapp playground instead selects its native-SFC test configuration with jsdom; the standalone Realworld app retains its local configuration.

H5 uses vite-plugin-dts 5's `bundleTypes` with an explicit `@microsoft/api-extractor` dependency so both published type entrypoints include their bundled private workspace types rather than referencing monorepo source paths.

See [RELEASING.md](./RELEASING.md) for the repoctl, npm OIDC, and documentation deployment workflow.
