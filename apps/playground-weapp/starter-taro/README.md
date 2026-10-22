# Varo Retail — Taro Vue 3

Editable Varo retail source for H5 and WeChat mini-programs, exported as a standalone Taro project. The exporter collects the current routes, imports, and Registry styles; it generates source rather than a compiled bundle or compatibility runtime. `starter-manifest.json` records the framework, source SHA256s, transformations, exported-file SHA256s, and resolved lockfile.

## Run from this directory

Use Node `^22.18.0 || ^24.11.0 || >=26.0.0` and **pnpm 11.24.0**. No Varo workspace build or global Taro installation is required.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm dev:h5
```

The H5 development server binds to **127.0.0.1:5173**, with hash routing. `pnpm dev` is the same H5 entry. Do not expose a development compiler to the public network.

```sh
pnpm dev:weapp       # WeChat compiler watcher
pnpm build:h5       # production web output: dist/h5
pnpm build:weapp    # production native output: dist/weapp; includes recursive verification
pnpm build          # both production compilers, in order
pnpm verify         # verify existing dist/weapp against current source configuration
```

The target output roots do not overwrite each other. `pnpm typecheck` checks editable source and compiler configuration, without generating artifacts. `pnpm verify` does not compile. To serve a production H5 build, use a static server rooted at `dist/h5`; the app uses hash routes and root-relative `/static/...` assets.

### Your own AppID

Copy `.env.example` to ignored `.env.local` and set `WEAPP_APP_ID` to your registered AppID; a shell value takes precedence. Every dev/build command runs `scripts/prepare-taro-project.mjs` to validate it and generate ignored root `project.config.json`. Taro copies this file during compilation, without patching output. Empty AppIDs support compilation only; no tourist AppID or credentials are included.

After building, import `dist/weapp` into WeChat DevTools. Source and compiled AppIDs must match, and compiled `miniprogramRoot` must be `./`. Use your real account to check login, preview/upload, device APIs, signing, and release. Compiler or browser results cannot replace those checks. Network domain validation stays enabled.

## Source ownership and editing

```text
config/index.ts                   # Taro Vue 3 + webpack5 + one Tailwind generator
src/app.ts                        # Standard Vue createApp entry consumed by Taro
src/App.vue                       # Global style imports and retail theme overrides
src/app.config.ts                 # Current routes, subpackages, navigation and tab bar
src/**/index.config.ts            # Page settings translated from native page JSON
src/pages/retail-*/               # Main retail pages
src/retail-*/                     # Retail subpackages
src/features/retail/              # Brand, types, local/HTTP service, store, navigation
src/components/retail/            # Application composition
src/components/blocks/            # Reached retail blocks
src/components/ui/                # Editable Vue component source
src/lib/                         # Local class merging and injected Vue reactivity
src/styles.css                   # Tailwind entry and explicit source discovery
src/styles/                      # Reached global Registry stylesheet closure
src/static/                      # Reached local assets, preserving their source paths
src/vendor/varo/packages/        # Only reached framework-neutral helper source
scripts/prepare-taro-project.mjs
scripts/verify-native.mjs
starter-manifest.json
pnpm-lock.yaml
LICENSE
```

Set brand and scenario in `src/features/retail/config.ts`, catalog data in `src/features/retail/data.ts`, and palette variables under `.retail-page-enter` in `src/App.vue`. Edit routes and navigation in `src/app.config.ts`. Assets, including imports from outside the original assets directory, are collected under `src/static`. Use `/static/...` in source and `static/...` for tab icons. Keep static `export default defineAppConfig({...})` with JSON-compatible values so verification follows your current routes.

`App.vue` loads Tailwind, base Varo tokens, Registry component styles, then retail overrides. Component CSS stays global. Taro's Vue components share one host tree, so conversion adapts native `apply-shared` and slot metadata to it. Unsupported isolated metadata, property observers, unknown APIs, uncollected assets, and path collisions fail conversion before publication.

The converter preserves typed props/defaults, supplied `false`, `0`, and `''` versus absence, event payloads, and integer-cent calculations. It maps page/app hooks to Taro and component teardown to Vue. Native `tap` becomes Taro `click`; host input events keep `detail.value`. H5 keyboard and accessibility bindings stay in the components with teardown. No Wevu/uni runtime is bundled.

The H5 input adapter observes asynchronous host-field hydration and disconnects on teardown. Fixed actions on tab pages use `--varo-retail-bottom`, derived from Taro's compiler-supported `taro-tabbar-height` constant and the safe-area inset. Non-tab and native pages retain a zero fallback. Do not replace the constant with `var(--taro-tabbar-height)`: Taro's H5 constant parser rewrites the matching text inside CSS variable names.

### Tailwind and compiler choice

This starter uses the supported **Taro webpack5** integration. Upstream's Taro Vite runner still peers Vite 4, which is outside Vite's security-maintenance window; current weapp-tailwindcss guidance also recommends Webpack for new Taro projects. See `DEPENDENCIES.md` for exact pins, primary-source links and the narrowly scoped webpack peer allowance.

Both targets register `WeappTailwindcss` once. Do not add another Tailwind Vite/PostCSS generator. `src/styles.css` explicitly scans exported Vue/TypeScript source, not `dist` or installed dependencies. WeChat gets escaped utility selectors and rem-to-rpx conversion; H5 retains browser utility classes. Taro's extra px scaling is disabled because the original component CSS is authored in physical CSS pixels. No Sass/Less preprocessing is required.

## Real boundaries, not backend/payment claims

The in-memory service demonstrates catalog search/filtering, product details, quantity and cart state, address editing/selection, quote totals, and mock orders. Reloading resets it. Money uses integer cents. It provides no real payment, fulfillment, authoritative inventory, authentication, analytics, backend persistence, or network credentials.

Connect `src/features/retail/http-service.ts` through the retail runtime with your transport, base URL, and authentication. Keep requests in that service and secrets out of frontend source. Before checkout, the backend must revalidate prices, stock, and addresses. Use the local error and recovery states to check the flow.

## What verification proves

The native verifier checks routes, app/page/component registration, JavaScript/WXS dependencies, WXML imports/includes, WXSS imports, utility syntax, global layout/theme output, AppID/config consistency, and byte-identical static assets. It rejects missing, unbundled, or path-escaping references and unsupported dynamic script dependencies. It checks build output, not runtime behavior, and provides no security sandbox.

After changes, exercise H5 shopping, details, quantities, cart, addresses, quotes, and mock orders, including invalid addresses and recoverable failures. Check native behavior in DevTools and on devices with your account; frozen installation and compilation do not cover it.

## License and provenance

Varo source is MIT; keep `LICENSE` and attribution when distributing derivatives. Dependencies retain their own licenses, and the export grants no exclusive dependency or asset rights. Review included assets and replacements for your distribution. The export adds no commercial license or permission requirement.

Manifest hashes describe the export snapshot and exclude the manifest itself. Source hashes also identify uncommitted changes. Keep the lockfile for frozen installs and review dependencies when updating it; pinned versions still need security review. Re-export into a new or empty real directory. Existing files, symlinks, and occupied directories are rejected.
