# Repository Guidelines

These rules apply to every AI assistant and every repository change.

## Project Overview

Varo is a Registry-first mobile UI system with two renderer families and explicit deployment profiles:

- **H5:** Vue 3 components published through `@varo-ui/h5`.
- **Native:** Wevu SFCs compiled by `weapp-vite`; `@varo-ui/weapp` publishes native source, not Vue render wrappers.
- **Registry:** editable, renderer-specific components, utilities, themes, and Blocks installed by `@varo-ui/cli`.
- **Profiles:** stable `h5`/`weapp`; experimental `alipay`, `tt`, `xhs`, `donut-android`, `donut-ios`, `donut-ohos`. Profile admission is not device certification.
- **Agent:** provider-neutral protocol/streaming in `@varo-ui/ai`; presentation source units in the Registry, with execution policy outside the UI.

The Registry is the primary product surface. Prefer editable target-specific source over a cross-platform runtime abstraction.

## Architecture & Data Flow

Authorship and generation flow:

```text
registry/components/** + registry/blocks/** + registry/themes/** + registry/utils/**
  -> pnpm sync:registry
       +-- packages/ui-h5/src renderer/style projections
       +-- packages/ui-weapp/native native SFC/lib/style tree
       +-- playground installed source + docs Agent source/support catalog
```

- `packages/shared` owns the single `ReactiveRuntime`, `Ref`, and `MaybeRef` contract. `hooks` and `primitives-core` consume it; do not create a core -> hooks -> core cycle.
- `@varo-ui/headless` (`packages/primitives-core`) exports framework- and DOM-neutral state, events, and form contracts. `packages/primitives-h5` owns Vue DOM rendering, focus, and body-scroll locking.
- Native components bind neutral behavior to `wevu` through `registry/utils/primitives/weapp-vite.ts`. There is no native Vue render primitive package or `@varo-ui/weapp/primitives` export.
- UI renderers are authored in the Registry. Package entrypoints, build configuration, and the native resolver retain their own package owners; generated renderer files are not a second authoring surface.
- Shared cross-target files contain types and pure helpers only. Rendering and lifecycle code stays target-specific. Product runtime code must not import Registry/CLI/build/preview tooling.
- Registry flow is `registry/**/registry.json` -> `packages/registry` validation -> `packages/cli` exact-profile dependency planning and safe copying -> consumer-local `src/**`.
- Agent flow is `AsyncIterable<AgentStreamEvent>` -> stream controller/reducer -> immutable snapshot -> target renderer. Iterator/subscriber cleanup belongs to the controller; network abort, retry, approval, and cancellation execution policy belongs to the application.
- Agent source units are `agent-presentation` (pure types/helpers), `agent-conversation`, `agent-workspace`, `agent-advanced`, and `agent-rag`. `agent-ui` deliberately composes the full suite; `blocks/agent-chat` must retain only its conversation closure.

Use injected `ReactiveRuntime` in neutral primitives. H5 uses Vue context; native code uses Wevu context. Missing required component context is a programmer error and should fail immediately. Export named contracts rather than `ReturnType<typeof concreteFunction>`; form submit/failed payloads use headless `SubmitPayload` (`values`, `errors`, optional platform-specific `event`).

## Key Directories

- `packages/primitives-core/src/`: neutral state machines and contracts; representative pattern: `use-controllable-state.ts`.
- `packages/primitives-h5/src/`: H5 DOM adapters and composable primitive parts.
- `packages/ui-h5/src/`: package entrypoints plus generated Registry renderers/styles; check generation headers before editing.
- `packages/ui-weapp/native/`: generated native npm source. `packages/ui-weapp/src/resolver.ts` owns local Registry component resolution.
- `packages/{hooks,shared,utils,theme}/src/`: neutral forms/reactivity, recipes/classes, nested-path helpers, and explicitly separated H5/native theme APIs.
- `packages/agent-core/src/`: Agent protocol, SSE, streaming controller, text pacing, and safe Markdown normalization.
- `registry/`: canonical authored source and manifests. `themes/base/seed.json` and `foundation.css` own the base; ordinary CSS is in `themes/components/**`, with ownership mapped by component manifests; optional Agent styles live in `themes/agent`.
- `packages/registry/src/`: Registry schema, catalog, exact profile table, and manifest/admission validation.
- `packages/cli/src/`: Registry resolution, target filtering, filesystem safety, and installer CLI.
- `apps/playground-h5/src/`: H5 integration and Agent UI demonstration.
- `apps/playground-weapp/src/`: native Wevu pages, retail flows, and installed component source.
- `apps/platform-smoke/`: shared CLI-installed fixture, native compiler matrix, artifact/host metadata verification, and explicit IDE prerequisites.
- `apps/docs/`: authored VitePress site plus generated Agent installs and `src/registry-catalog.json`. Root `docs/plans/` and `docs/superpowers/` are historical design records, not current implementation guidance.

## Development Commands

Use commands from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm sync:registry
pnpm check:generated
pnpm check:architecture
pnpm dev
pnpm build
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm lint
pnpm check:consumers
pnpm check:platforms
```

Prefer focused workspace commands while iterating:

```bash
pnpm --filter @varo/playground-h5 dev
pnpm --filter @varo/playground-weapp dev
pnpm --filter @varo/playground-weapp build
pnpm --filter @varo/playground-weapp smoke:retail
pnpm --filter @varo/platform-smoke build:alipay
pnpm --filter @varo/platform-smoke verify:alipay
pnpm --filter @varo-ui/cli test
pnpm --filter @varo/registry test
pnpm --filter @varo/docs dev
DOCS_BASE=/Varo/ pnpm --filter @varo/docs build
```

- Workspace `dev`/build/typecheck/test/lint commands use Turbo. `dev` is persistent and parallel.
- `sync:registry` runs the style aggregate, dependency-style import, and source/catalog generators. `check:generated` runs their non-writing drift checks, including obsolete outputs recorded in `scripts/registry-projections.json`. Sync removes an obsolete owned file only when its bytes still match the recorded digest; modified obsolete files or newly conflicting authored files reject before writes. Keep the generated inventory; never delete it to bypass ownership checks. In-place component style imports do not grant deletion ownership over authored renderers.
- Projection preflight protection is per owner invocation, not a transaction across the three generators. Do not run concurrent writers or claim crash/disk-failure rollback; only recorded whole-file projections are deletion-owned.
- `check:architecture` checks neutral/runtime/tooling boundaries and obsolete native Vue-render imports.
- Run `check:consumers` after generation and package builds: it packs the six public packages and exercises isolated npm/source consumers, dependency/style closure, and profile admission/roundtrips. It is not a device test.
- `check:platforms` builds and verifies all seven native artifact profiles; `build:<profile>` selects one and `verify:<profile>` only checks existing artifacts. Neither proves SDK packaging, signing, simulator, or device execution.
- Current workspace `lint` scripts are placeholders; `pnpm lint` is not evidence of substantive source linting. `test:e2e` runs Vitest structural contracts, not a browser suite.
- Full repository/release verification uses `pnpm exec repo check --full`; do not equate a documented command with a passed gate.
- During coordinated work, respect the integration owner's validation reservation: do not run project-wide builds, tests, linters, or formatters against siblings' in-flight changes.

## Code Conventions & Common Patterns

- All packages are ESM and strict TypeScript. Use `import type` for type-only imports and explicit `index.ts` barrels.
- Use workspace package imports across package boundaries; use relative imports inside one package, app, or installed Registry tree.
- Public styled components use `V` + PascalCase (`VButton`). Primitive pieces use names such as `TabsRoot` and `TabsTrigger`. Composables use `useX` exports in kebab-case files.
- Prefer `shallowRef` plus immutable array/object replacement for external snapshots and app stores; derive projections with `computed`.
- Reject disabled/readonly mutations and no-op changes before emitting accepted-change events. Drawer `openChange` is synchronously cancelable before state/update/close. Throw for invalid configuration, missing context, duplicate connections, unsafe Registry paths, and dependency cycles. Convert transport failures into typed stream/channel failures.
- Await async validation and submit callbacks. Use `void` only for intentional fire-and-forget work. Always unsubscribe, destroy controllers, and close iterators during teardown.

### H5 and Weapp ownership

- H5 runtime code imports from `vue` and may use DOM semantics, keyboard navigation, focus, and ARIA attributes.
- Production code under `apps/playground-weapp/src`, Weapp-only Registry SFCs, and `*.weapp-vite.vue` files imports reactivity, component, and lifecycle APIs from `wevu`, never `vue`.
- Vitest may alias `wevu` to `vue` only for `@vue/test-utils`; production must not use a global Vue alias.
- Native optional controlled props must preserve absence across native property initialization: use explicit `properties` metadata with `type: null, value: null`, then nullish presence checks (`!= null`) rather than Boolean coercion or `!== undefined`. Explicit `false`, `0`, and `''` remain supplied values. Normalize absent defaults before passing them to typed neutral helpers.
- Native multi-value events carry one tuple detail, not Vue-style callback arguments. Declare, emit, forward, and consume the tuple consistently; H5 keeps its Vue argument contract.
- Weapp components are native `.vue` SFCs with `<script setup lang="ts">`, mini-program elements, and a component JSON block.
- Feature pages and Blocks should compose Varo `V*` components instead of rebuilding controls from raw native elements. Native elements belong inside base component implementations.
- Weapp Registry manifests copy each public SFC explicitly. Never copy H5 render functions, `advanced.ts`, or monolithic H5 CSS into a Weapp target.
- `@varo-ui/weapp` root and `./components/*` expose native source; `./resolver` resolves installed local SFCs. Do not reintroduce a Vue-native renderer or compatibility re-export.
- `@varo-ui/h5` exposes root, `/primitives`, `/style.css`, and CSS-only `/source/style.css`. The TS `/source` entry is removed because it leaked private workspace dependencies.
- DOM event/focus/element claims belong only to H5. Native payloads must describe the actual host event shape; form `SubmitPayload.event` is `unknown`, not a promised browser `Event`.

### Styling and WXML safety

- Weapp styling uses Tailwind utilities through `weapp-tailwindcss`.
- `themes/base` is tokens plus foundation, not the full component/Agent stylesheet. Each component manifest owns its CSS; Agent units opt into `themes/agent`.
- H5 source imports the complete dependency CSS closure generated by `sync:registry`.
- Native `apply-shared` SFCs must not import global `src/styles/*.css` into component-local WXSS. Consumers load all installed CSS globally through `weapp.styles` with `include: 'app.vue'`, `varo.css` first. This keeps page tokens/global selectors out of component styles. Native npm consumers import complete `@varo-ui/weapp/style.css` from local `src/package.css` and register `{ source: 'package.css', include: 'app.vue' }`; do not use an absolute package path as the style source. See `packages/ui-weapp/README.md` and `apps/platform-smoke/vite.config.mjs`.
- Consumer-class props use `className?: ClassValue` and merge defaults through copied `src/lib/cn`, backed by `@weapp-tailwindcss/merge`; H5 uses `tailwind-merge`.
- Reserve scoped CSS for keyframes, complex diff grids, generated-content effects, and platform quirks.
- Use real SVG/image icons rather than decorative text glyphs.
- Precompute complex accessibility labels and attribute values in script. Generated WXML attributes must not contain optional chaining, nullish coalescing, or ternary expressions.
- Every reachable `usingComponents` entry must resolve to `.js`, `.json`, and the selected compiler's template extension (`.wxml`, `.axml`, `.ttml`, or `.xhsml`).

### Registry authoring

- Registry identifiers are lowercase kebab-case, optionally qualified by `blocks|components|hooks|templates|themes|utils`.
- Each item contains authored source plus `registry.json`: name, type, title, description, absolute docs route, targets, transitive `registryDependencies`, npm dependencies, and explicit per-target file mappings.
- Manifest `targets`, `files[].target`, and `target*Dependencies` remain renderer-family declarations (`h5`/`weapp`). `platforms` explicitly admits extra profiles. Every item in the selected transitive closure must admit an experimental profile; reject before writes, with no fallback to Weapp.
- Reuse `registryProfiles`, `getRegistryProfile`, and `isRegistryTarget` from `packages/registry`; do not create a separate compiler/host table. New-profile representative admission is `button`, `input`, `input-otp`, `form`, `checkbox`, `switch`, `drawer`, `card`, `icon` plus required utilities/themes; manifests are authoritative.
- Source variants use names such as `h5.vue`, `weapp-vite.vue`, and target-neutral `.types.ts`.
- Typical destinations are `src/components/ui/*`, `src/components/blocks/*`, and downstream business wrappers under `src/components/biz/*`.
- Blocks are portable typed page slices with injected data. Do not embed credentials, private APIs, authorization, analytics, work-item IDs, or one-off application glue.
- The installer reports npm dependencies but does not install them. It refuses existing destinations unless `--force`; forced replacement does not merge downstream customizations.

## Important Files

- `package.json`, `pnpm-workspace.yaml`, `turbo.json`: runtime, workspace, scripts, six-package fixed release group, and task graph.
- `tsconfig.base.json`, `tsdown.config.ts`, `vitest.config.ts`: TypeScript, package build, and test defaults.
- `packages/ui-h5/vite.config.ts`, `packages/ui-weapp/tsdown.config.ts`: H5 build and native resolver build contracts; native source is generated, not compiled into a Vue render bundle.
- `scripts/sync-{styles,component-styles,registry}.mjs`, `scripts/check-boundaries.mjs`: generation ownership and architecture enforcement.
- `scripts/verify-{consumers,platforms}.mjs`: packed/source consumer gate and native compiler/artifact gate.
- `apps/playground-weapp/vite.config.ts`, `apps/platform-smoke/vite.config.mjs`: native compiler setup, global style closure, and output paths.
- `apps/playground-weapp/scripts/{prepare-devtools-project,verify-devtools-project}.mjs`: AppID/config generation and recursive component verification.
- `packages/registry/src/index.ts`, `packages/cli/src/index.ts`: Registry contract and install behavior.
- `apps/docs/.vitepress/config.ts`: bilingual navigation and `DOCS_BASE`.
- `repoctl.config.ts`, `.changeset/`, `.github/workflows/{ci,docs,release}.yml`, `RELEASING.md`: checks, release intents, publishing, and Pages deployment.

## Runtime/Tooling Preferences

- Required local runtime: Node `^22.18.0 || ^24.11.0 || >=26.0.0`; CI uses Node 24. Vitest 5 and tsdown 0.23 exclude Node 25.
- Required package manager: pnpm `11.24.0`. Do not use npm or yarn for workspace operations.
- Use Turbo for workspace orchestration, `tsdown` for most packages, Vite for H5/UI-H5, VitePress for docs, Vitest for tests, and `weapp-vite` plus `weapp-tailwindcss` for native compilation. Repository compiler/runtime versions are `weapp-vite`/`wevu` 7.4.0; native peers remain `>=7.2.1 <8`.
- Keep peer dependencies explicit; `autoInstallPeers` is disabled.
- Treat `dist/`, `.turbo/`, `coverage/`, `.vitepress/{cache,dist}`, `.weapp-vite/`, Weapp `devtools/`, platform-smoke `.generated/`, and `packages/cli/registry/` as generated output, along with the Registry projections listed above. CLI `prepack` synchronizes its packaged Registry copy.
- Stable DevTools output is `apps/playground-weapp/devtools/build/mp-weixin`; watcher output is `apps/playground-weapp/dist/dev/mp-weixin`. Never merge these output paths.
- Native matrix IDE/artifact root: `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`, with application files in nested `dist/`. Donut's compiler platform is `weapp`; `mini-android`/`mini-ios`/`mini-ohos` metadata selects the host, not a new renderer/compiler.
- Artifact checks and trusted glass-easel browser previews do not prove IDE/device behavior. Same-origin preview iframes are not security sandboxes. Donut SDKs, native toolchains, signing, and registered AppIDs remain real external prerequisites.
- Local AppID configuration belongs in ignored `apps/playground-weapp/project.local.json` or `WEAPP_APP_ID`. Never commit a developer AppID, `touristappid`, or fabricated `wx...` value.
- Release changes use repoctl change intents under `.changeset/`; do not hand-edit generated package versions or lock state.

## Testing & QA

- Vitest 5 with jsdom is the default. Component tests use `@vue/test-utils` and assert rendered behavior, accessibility state, emitted payloads, and state transitions. Workspace scripts explicitly select the root config; the native playground and standalone Realworld app use their local configs.
- Tests live in `packages/<name>/tests/*.test.ts` or beside playground source as `src/*.test.ts`. App structural contracts live in `apps/*/e2e/*.spec.ts`.
- Use real filesystem/CLI integration tests for install, overwrite, traversal, and packaging behavior. Use source/manifests assertions only for contracts inherently encoded in files.
- No coverage threshold is configured; do not claim one.
- CI order is authoritative in `.github/workflows/ci.yml`: generated/architecture checks -> typecheck -> test -> test:e2e -> builds -> isolated consumers/native artifacts. Root `test` first runs the generator's real-filesystem regressions, then the workspace Turbo tests.
- A native component or Registry change needs integrated verification of:
  1. Canonical source generation and architecture boundaries.
  2. Focused native type/behavior contracts, then the production native build and recursive component-path verifier.
  3. No Vue runtime, removed primitive renderer, H5 CSS, or developer-tool imports in native product code.
  4. Generated templates, global style closure, and transformed utility classes for the selected profile.
  5. Fresh packed/source consumers when public exports, install plans, or style ownership change.
- For runtime-sensitive changes, follow behavior/compiler checks with a targeted `smoke:retail` or connected native runtime scenario. For visuals, inspect the actual H5 and corresponding native surface; compilation, structural tests, and browser artifact preview alone are not device/visual proof.
