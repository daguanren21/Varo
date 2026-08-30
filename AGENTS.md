# Repository Guidelines

These rules apply to every AI assistant and every repository change.

## Project Overview

Varo is a Registry-first mobile UI system for two runtimes:

- **H5:** Vue 3 components published through `@varo-ui/h5`.
- **WeChat mini program:** `wevu` on `weapp-vite`, with public wrappers in `@varo-ui/weapp`.
- **Registry:** editable, target-specific components, utilities, themes, and Blocks installed by `@varo-ui/cli`.
- **Agent UI:** provider-neutral event, streaming, Markdown, tool, reasoning, and approval contracts published through `@varo-ui/ai`.

The Registry is the primary product surface. Prefer editable target-specific source over a cross-platform runtime abstraction.

## Architecture & Data Flow

The main UI dependency direction is:

```text
packages/primitives-core
  -> packages/primitives-h5 | packages/primitives-weapp
  -> packages/ui-h5 | packages/ui-weapp
  -> playgrounds and Registry consumers
```

- `primitives-core` owns platform-neutral state machines, controlled/uncontrolled state, attributes, and injected reactive contracts.
- Target primitive packages adapt those contracts to H5 DOM behavior or WeChat-native behavior.
- UI packages add `V*` components, themes, recipes, classes, and CSS.
- Shared cross-target files may contain types and pure functions only. Rendering and lifecycle code stays target-specific.
- Registry flow is `registry/**/registry.json` -> `packages/registry` validation -> `packages/cli` dependency planning and safe copying -> consumer-local `src/**`.
- Agent flow is `AsyncIterable<AgentStreamEvent>` -> stream controller/reducer -> immutable snapshot -> Vue refs -> rendered reasoning, tools, approval, and message UI. Cancellation must close iterators and subscribers.

Use injected `ReactiveRuntime` in framework-neutral primitives. Use Vue `provide`/`inject` for target component contexts and theme DI. Missing required component context is a programmer error and should fail immediately.

## Key Directories

- `packages/primitives-core/src/`: neutral state machines and contracts; representative pattern: `use-controllable-state.ts`.
- `packages/primitives-{h5,weapp}/src/`: runtime adapters and composable primitive parts.
- `packages/ui-{h5,weapp}/src/`: styled public component barrels and `V*` wrappers.
- `packages/{hooks,shared,utils,theme}/src/`: forms, recipes/classes, nested-path helpers, and theme injection.
- `packages/agent-core/src/`: Agent protocol, SSE, streaming controller, text pacing, and safe Markdown normalization.
- `registry/`: authored installable source and manifests. This is the source of truth.
- `packages/registry/src/`: Registry schema, catalog, and manifest validation.
- `packages/cli/src/`: Registry resolution, target filtering, filesystem safety, and installer CLI.
- `apps/playground-h5/src/`: H5 integration and Agent UI demonstration.
- `apps/playground-weapp/src/`: native Wevu pages, retail flows, and installed component source.
- `apps/docs/`: authored VitePress site. Root `docs/plans/` contains design records, not deployable site source.

## Development Commands

Use commands from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm lint
```

Prefer focused workspace commands while iterating:

```bash
pnpm --filter @varo/playground-h5 dev
pnpm --filter @varo/playground-weapp dev
pnpm --filter @varo/playground-weapp build
pnpm --filter @varo/playground-weapp smoke:retail
pnpm --filter @varo-ui/cli test
pnpm --filter @varo/registry test
pnpm --filter @varo/docs dev
DOCS_BASE=/Varo/ pnpm --filter @varo/docs build
```

- Root commands run through Turbo. `dev` is persistent and parallel.
- Current workspace `lint` scripts are placeholders; `pnpm lint` is not evidence of substantive source linting.
- `test:e2e` currently runs Vitest structural contracts, not a browser suite.
- Full repository/release verification uses `pnpm exec repo check --full`.

## Code Conventions & Common Patterns

- All packages are ESM and strict TypeScript. Use `import type` for type-only imports and explicit `index.ts` barrels.
- Use workspace package imports across package boundaries; use relative imports inside one package, app, or installed Registry tree.
- Public styled components use `V` + PascalCase (`VButton`). Primitive pieces use names such as `TabsRoot` and `TabsTrigger`. Composables use `useX` exports in kebab-case files.
- Prefer `shallowRef` plus immutable array/object replacement for external snapshots and app stores; derive projections with `computed`.
- Return early for disabled/no-op UI transitions. Throw for invalid configuration, missing context, duplicate connections, unsafe Registry paths, and dependency cycles. Convert transport failures into typed stream/channel failures.
- Await async validation and submit callbacks. Use `void` only for intentional fire-and-forget work. Always unsubscribe, destroy controllers, and close iterators during teardown.

### H5 and Weapp ownership

- H5 runtime code imports from `vue` and may use DOM semantics, keyboard navigation, focus, and ARIA attributes.
- Production code under `apps/playground-weapp/src`, Weapp-only Registry SFCs, and `*.weapp-vite.vue` files imports reactivity, component, and lifecycle APIs from `wevu`, never `vue`.
- Vitest may alias `wevu` to `vue` only for `@vue/test-utils`; production must not use a global Vue alias.
- Weapp components are native `.vue` SFCs with `<script setup lang="ts">`, mini-program elements, and a component JSON block.
- Feature pages and Blocks should compose Varo `V*` components instead of rebuilding controls from raw native elements. Native elements belong inside base component implementations.
- Weapp Registry manifests copy each public SFC explicitly. Never copy H5 render functions, `advanced.ts`, or monolithic H5 CSS into a Weapp target.

### Styling and WXML safety

- Weapp styling uses Tailwind utilities through `weapp-tailwindcss`.
- Consumer-class props use `className?: ClassValue` and merge defaults through copied `src/lib/cn`, backed by `@weapp-tailwindcss/merge`; H5 uses `tailwind-merge`.
- Reserve scoped CSS for keyframes, complex diff grids, generated-content effects, and platform quirks.
- Use real SVG/image icons rather than decorative text glyphs.
- Precompute complex accessibility labels and attribute values in script. Generated WXML attributes must not contain optional chaining, nullish coalescing, or ternary expressions.
- Every reachable `usingComponents` entry must resolve to `.js`, `.json`, and `.wxml`.

### Registry authoring

- Registry identifiers are lowercase kebab-case, optionally qualified by `blocks|components|hooks|templates|themes|utils`.
- Each item contains authored source plus `registry.json`: name, type, title, description, absolute docs route, targets, transitive `registryDependencies`, npm dependencies, and explicit per-target file mappings.
- Source variants use names such as `h5.vue`, `weapp-vite.vue`, and target-neutral `.types.ts`.
- Typical destinations are `src/components/ui/*`, `src/components/blocks/*`, and downstream business wrappers under `src/components/biz/*`.
- Blocks are portable typed page slices with injected data. Do not embed credentials, private APIs, authorization, analytics, work-item IDs, or one-off application glue.
- The installer reports npm dependencies but does not install them. It refuses existing destinations unless `--force`.

## Important Files

- `package.json`, `pnpm-workspace.yaml`, `turbo.json`: runtime, workspace, scripts, fixed release group, and task graph.
- `tsconfig.base.json`, `tsdown.config.ts`, `vitest.config.ts`: TypeScript, package build, and test defaults.
- `packages/ui-h5/vite.config.ts`, `packages/ui-weapp/tsdown.config.ts`: public UI build contracts.
- `apps/playground-weapp/vite.config.ts`: Weapp transforms, aliases, and output paths.
- `apps/playground-weapp/scripts/{prepare-devtools-project,verify-devtools-project}.mjs`: AppID/config generation and recursive component verification.
- `packages/registry/src/index.ts`, `packages/cli/src/index.ts`: Registry contract and install behavior.
- `apps/docs/.vitepress/config.ts`: bilingual navigation and `DOCS_BASE`.
- `repoctl.config.ts`, `.changeset/`, `.github/workflows/{ci,docs,release}.yml`, `RELEASING.md`: checks, release intents, publishing, and Pages deployment.

## Runtime/Tooling Preferences

- Required local runtime: Node `>=22.12.0`; CI uses Node 24.
- Required package manager: pnpm `11.24.0`. Do not use npm or yarn for workspace operations.
- Use Turbo for workspace orchestration, `tsdown` for most packages, Vite for H5/UI-H5, VitePress for docs, Vitest for tests, and `weapp-vite` plus `weapp-tailwindcss` for Weapp.
- Keep peer dependencies explicit; `autoInstallPeers` is disabled.
- Treat `dist/`, `.turbo/`, `coverage/`, `.vitepress/{cache,dist}`, `.weapp-vite/`, Weapp `devtools/`, and `packages/cli/registry/` as generated output. Edit root `registry/`; CLI `prepack` synchronizes its packaged copy.
- Stable DevTools output is `apps/playground-weapp/devtools/build/mp-weixin`; watcher output is `apps/playground-weapp/dist/dev/mp-weixin`. Never merge these output paths.
- Local AppID configuration belongs in ignored `apps/playground-weapp/project.local.json` or `WEAPP_APP_ID`. Never commit a developer AppID, `touristappid`, or fabricated `wx...` value.
- Release changes use repoctl change intents under `.changeset/`; do not hand-edit generated package versions or lock state.

## Testing & QA

- Vitest 4 with jsdom is the default. Component tests use `@vue/test-utils` and assert rendered behavior, accessibility state, emitted payloads, and state transitions.
- Tests live in `packages/<name>/tests/*.test.ts` or beside playground source as `src/*.test.ts`. App structural contracts live in `apps/*/e2e/*.spec.ts`.
- Use real filesystem/CLI integration tests for install, overwrite, traversal, and packaging behavior. Use source/manifests assertions only for contracts inherently encoded in files.
- No coverage threshold is configured; do not claim one.
- CI order is authoritative: `typecheck` -> `test` -> `test:e2e` -> workspace build -> docs build -> H5 build -> Weapp build.
- A Weapp component or Registry change must:
  1. Run focused Weapp typecheck and behavior tests.
  2. Run `pnpm --filter @varo/playground-weapp build`.
  3. Confirm the recursive component-path verifier passes.
  4. Confirm no target manifest or production import regresses to `advanced.ts`, H5 CSS, or Vue runtime imports.
  5. Confirm generated WXML/WXSS safety and transformed utility classes.
- For runtime-sensitive Weapp changes, follow behavior tests with the production build and a targeted `smoke:retail` or connected runtime smoke.
- For visual changes, inspect the actual H5 surface and the corresponding compiled Weapp surface; compilation alone is not visual proof.
