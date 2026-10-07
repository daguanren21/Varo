# Varo Retail — Taro Vue 3

An independently installable, editable source export of Varo's current retail application for **H5 and WeChat mini-programs**. The exporter follows the current retail route/import/Registry-style closure; this is not a second hand-maintained app, a compiled demo bundle, or a Wevu/uni-app compatibility runtime. `starter-manifest.json` records the selected framework, original source SHA256s, transformations, exported-file SHA256s and freshly resolved lockfile.

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

Copy `.env.example` to ignored `.env.local` and set `WEAPP_APP_ID` to your registered mini-program AppID. A shell value takes precedence. Every dev/build command runs `scripts/prepare-taro-project.mjs`, which validates the value and generates ignored root `project.config.json`. Taro copies this configuration through its compiler; no compiled artifacts are patched. Leave the value empty for compilation-only checks. No tourist AppID, fabricated AppID, key, or other credential is included.

Import **`dist/weapp`** directly into WeChat DevTools after building. The source and compiled AppID must match, and compiled `miniprogramRoot` must be `./`. An empty AppID is not a claim that DevTools login, preview/upload, device APIs, signing, or release works. Supply the real account/AppID and perform those checks separately; compiler and browser results are not device certification. Network domain validation remains enabled.

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

Edit `src/features/retail/config.ts` for the brand and scenario, `src/features/retail/data.ts` for local catalog content, and the `.retail-page-enter` variables in `src/App.vue` for the retail palette. Routes and navigation chrome belong to `src/app.config.ts`. Product assets are collected into `src/static`, including imported assets outside the original assets directory. URLs are `/static/...` in source and `static/...` in tab configuration. Keep app config as static `export default defineAppConfig({...})` with JSON-compatible values, so the verifier can compare today's edited routes with the compiler output rather than trusting the original export route list.

`App.vue` loads Tailwind, then base Varo tokens, then all reached Registry component styles, then retail overrides. Shared component CSS stays global. Taro's Vue components render in one host tree; native `apply-shared`/slot metadata is translated into this actual rendering model, not an ignored runtime shim. Unsupported isolated native metadata, property observers, unknown APIs, uncollected assets and path collisions fail conversion before publication.

The shared source converter preserves Vue typed props/defaults, distinguishes absence from supplied `false`, `0` and `''`, maps page/app lifecycle hooks to Taro hooks and component teardown to Vue, and preserves component event payloads and integer-cent calculations. Native `tap` bindings become Taro `click` bindings. Native host input events retain their actual `detail.value` shape. The editable H5-only keyboard/accessibility code is directly in the reached components, with lifecycle teardown; no Wevu/uni runtime is bundled.

The H5 input adapter observes asynchronous host-field hydration and disconnects on teardown. Fixed actions on tab pages use `--varo-retail-bottom`, derived from Taro's compiler-supported `taro-tabbar-height` constant and the safe-area inset. Non-tab and native pages retain a zero fallback. Do not replace the constant with `var(--taro-tabbar-height)`: Taro's H5 constant parser rewrites the matching text inside CSS variable names.

### Tailwind and compiler choice

This starter uses the supported **Taro webpack5** integration. Upstream's Taro Vite runner still peers Vite 4, which is outside Vite's security-maintenance window; current weapp-tailwindcss guidance also recommends Webpack for new Taro projects. See `DEPENDENCIES.md` for exact pins, primary-source links and the narrowly scoped webpack peer allowance.

Both targets register `WeappTailwindcss` once. Do not add another Tailwind Vite/PostCSS generator. `src/styles.css` explicitly scans exported Vue/TypeScript source, not `dist` or installed dependencies. WeChat gets escaped utility selectors and rem-to-rpx conversion; H5 retains browser utility classes. Taro's extra px scaling is disabled because the original component CSS is authored in physical CSS pixels. No Sass/Less preprocessing is required.

## Real boundaries, not backend/payment claims

The default service is local in-memory data. It demonstrates catalog/search/filtering, product details, quantity/cart state, address editing/selection, quote totals and mock orders. Reloading resets local state. Money uses integer cents. No real payment, order fulfillment, inventory authority, authentication, analytics, backend persistence or network credential is implemented or implied.

`src/features/retail/http-service.ts` is the copied, typed injected HTTP boundary. Wire it explicitly through the existing retail runtime owner and provide your own transport/base URL/authentication. Do not scatter new fetch logic across pages or place secrets in frontend source. Requote and validate authoritative price/inventory/address on the backend before real checkout. Existing local error and recovery states remain available for flow verification.

## What verification proves

The recursive native verifier checks current routes, app/page/component registration, JavaScript/WXS dependencies, imported/included WXML, recursive WXSS imports, native utility-class syntax, required global layout/theme output, real AppID/config consistency and byte-identical copied static assets. It rejects missing/unbundled/path-escaping references and unsupported dynamic script dependencies. It is build-closure evidence, not a security sandbox, browser interaction test, IDE test or device test.

Run the actual H5 shopping/detail/quantity/cart/address/quote/mock-order path, including invalid address and recoverable failures, after changes. Test native host behavior separately in DevTools/device with your account. Frozen installation and compiler success cannot certify those runtime behaviors.

## License and provenance

Varo source is MIT; retain `LICENSE` and attribution when distributing derivatives. Dependency licenses remain their owners' licenses; the package is not a transfer of exclusive rights to dependencies or third-party assets. Included assets are those reached from the source snapshot; review them and your replacements for your distribution context. No commercial permission gate or commercial license is added by this export.

Hashes describe the export snapshot, not your later edits. The manifest excludes its own digest to avoid self-reference. Source hashes identify uncommitted source changes that a Git revision alone cannot. Keep the emitted lockfile for repeatable frozen installs, and re-audit dependencies when updating it; an exact pin is not a perpetual security guarantee. Re-export only into a new or truly empty real directory: occupied destinations, files and symlinks are rejected rather than merged or overwritten.
