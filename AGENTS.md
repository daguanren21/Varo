# Varo Agent Architecture Contract

These rules apply to every agent and every change in this repository.

## Platform ownership

- H5 runtime: Vue 3.
- Mini-program runtime: `wevu` on `weapp-vite`.
- Mini-program styling: `weapp-tailwindcss`.
- Mini-program class conflict resolution: `@weapp-tailwindcss/merge` through the copied `src/lib/cn` helper.
- The Registry is the primary product surface. Consumers receive editable target-specific source, not a cross-platform runtime black box.

## Weapp runtime rules

- Production code under `apps/playground-weapp/src`, Weapp-only Registry SFCs, and `*.weapp-vite.vue` files MUST import reactivity, component, and lifecycle APIs from `wevu`.
- Production Weapp code MUST NOT import runtime APIs from `vue`. `vue` is allowed only for H5 code and test tooling such as `@vue/test-utils`.
- Vitest MAY alias `wevu` to `vue` only for `@vue/test-utils`. Production MUST NOT alias `vue` globally; target-specific source imports `wevu` explicitly.
- Weapp components MUST be native `.vue` SFCs using `<script setup lang="ts">`, mini-program elements such as `<view>`, `<text>`, `<button>`, `<image>`, `<input>`, `<picker>`, and `<scroll-view>`, plus a component JSON block.
- Weapp Registry manifests MUST copy each public component SFC explicitly. They MUST NOT copy H5 render-function implementations or monolithic H5 CSS into the Weapp target.
- Shared cross-target files may contain types and pure functions only. Platform rendering and lifecycle code stays target-specific.

## Styling rules

- Tailwind utilities are the primary styling API for Weapp SFCs.
- Components accepting consumer classes MUST expose `className?: ClassValue` and merge it with defaults through `cn(...)`.
- `src/lib/cn` for Weapp MUST resolve to `@weapp-tailwindcss/merge`; H5 uses `tailwind-merge`.
- Scoped CSS is reserved for behavior utilities cannot express cleanly: keyframes, complex diff grids, generated-content effects, and platform quirks. It MUST NOT replace the utility-first component contract.
- Do not introduce raw decorative glyphs when an actual SVG/image icon is required.

## WXML safety

- Complex accessibility labels and attribute values MUST be precomputed in script.
- Generated WXML attributes MUST NOT contain optional chaining, nullish coalescing, or ternary expressions.
- Every reachable `usingComponents` entry MUST resolve to `.js`, `.json`, and `.wxml` files.

## Build and DevTools

- Production DevTools output: `apps/playground-weapp/devtools/build/mp-weixin`.
- Dev watcher output: `apps/playground-weapp/dist/dev/mp-weixin`.
- These directories MUST remain isolated so a watcher cannot delete the stable DevTools build.
- Local AppID configuration belongs in ignored `apps/playground-weapp/project.local.json` or `WEAPP_APP_ID`. Never commit a developer AppID, `touristappid`, or a fabricated `wx...` value.
- `pnpm --filter @varo/playground-weapp build` MUST run the recursive component-path verifier and fail on unresolved component entries.

## Required verification

For any Weapp component or Registry change:

1. Run Weapp typecheck and behavior tests.
2. Run the production Weapp build.
3. Confirm the component-path verifier passes.
4. Confirm no Weapp target manifest or production import regresses to `advanced.ts`, H5 CSS, or Vue runtime imports.
5. For visual changes, inspect the actual H5 surface and ensure the corresponding Weapp SFC compiles to WXML with transformed utility classes.
