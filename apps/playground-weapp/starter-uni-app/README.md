# Varo retail starter for uni-app Vue 3

An editable, standalone retail simulation for **H5 and WeChat mini programs**. The exporter converts the current Varo native retail source into uni-app Vue 3 source; this template supplies only the project/tooling shell. It does not maintain another renderer or product UI tree. Varo source and this tooling are MIT; framework and dependency licenses are separate (see `DEPENDENCIES.md`).

## Requirements and first run

Use Node **22.18+ within Node 22, 24.11+ within Node 24, or 26+**, and **pnpm 11.24.0**. Node 25 is outside the source repository's supported runtime policy. Registry access is required for installation.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm verify
```

The export includes `pnpm-lock.yaml`. Keep it and use a frozen install rather than hiding a dependency mismatch with an unlocked install. `pnpm-workspace.yaml` includes only this project, disables automatic peer installation, and permits only the listed native dependency build scripts. The `core-js`/`core-js-pure` funding-banner scripts are explicitly disabled. There are no source-repository links or private workspace dependencies. Lock resolution during export is not an install, build, or runtime check.

Keep `nodeLinker: hoisted`: the pinned uni Vite plugin preserves symlinks, which otherwise prevents the class-merging package from resolving its installed runtime dependencies in pnpm's isolated layout. This is a standalone package-layout setting, not a Vue alias or a transitive-dependency workaround.

Retain the exact Vite/plugin overrides and versioned uni H5 input patch in `pnpm-workspace.yaml`. They protect the development-server boundary and preserve rapid input/blur ordering; see `DEPENDENCIES.md` for their rationale and upgrade checks. The repository stores the package manifest as `package.json.template` because this shell is not an installed workspace package. Export emits a normal `package.json`; run the commands above in that assembled project.

Commands describe the intended verification workflow, **not a claim that this particular export has passed it**:

| Command                    | Operation                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm dev:h5` | Prepare local uni configuration, then start the H5 development server on loopback.                                                                         |
| `pnpm dev:mp-weixin`       | Prepare local uni configuration, then watch/compile WeChat output.                                                                                         |
| `pnpm typecheck`           | Run `vue-tsc` against exported TypeScript, Vue SFCs and their declarations. Dependency declarations use `skipLibCheck`; application source remains strict. |
| `pnpm build:h5`            | Compile the production H5 application into `dist/build/h5/`.                                                                                               |
| `pnpm build:mp-weixin`     | Compile into `dist/build/mp-weixin/`, then run the recursive native artifact verifier.                                                                     |
| `pnpm build`               | Run both production builds, H5 first and WeChat second.                                                                                                    |
| `pnpm verify`              | Check existing production WeChat artifacts without rebuilding or launching DevTools.                                                                       |

`createSSRApp` in `src/main.ts` is the official uni-app entry contract, not an SSR deployment claim. Only H5 and `mp-weixin` are supported here; no other platform packages or commands are supplied.

## AppID and generated configuration

```sh
cp .env.example .env.local
# Edit .env.local: set WEAPP_APP_ID to your own mini-program's actual AppID.
pnpm dev:mp-weixin
```

No example AppID is provided. An empty value permits compilation only and does not grant DevTools/device access. A shell-provided `WEAPP_APP_ID` takes precedence over the same key in this project's `.env.local`. The preparation script reads that exact local file, not environment files from parent directories. It accepts only an empty value or the WeChat AppID shape; it cannot prove ownership or authorization.

Edit **`manifest.config.json`** for app metadata, H5 routing and `mp-weixin` settings. Before every development or build command, `scripts/prepare-uni-project.mjs` generates these ignored files:

- `src/manifest.json`: uni-app's manifest, with the local WeChat AppID applied.
- `src/project.config.json`: the native project configuration, with the same AppID and `miniprogramRoot: "./"`.

Do not edit those generated files; the next command replaces them. Keep WeChat AppID input in `.env.local` or the shell, not the tracked manifest configuration. The top-level `appid` in `manifest.config.json` is the separate DCloud identifier and is deliberately empty; this local example does not configure DCloud cloud services. uni statistics are disabled.

The source project configuration is intentional: the pinned official compiler substitutes a tourist AppID when generating its own project config for an empty manifest AppID. Supplying the documented source project config path preserves the empty value without patching compiled output or impersonating an account.

### Output directories and DevTools import roots

| Mode                       | Output and directory to import in WeChat DevTools |
| -------------------------- | ------------------------------------------------- |
| WeChat development watcher | **`dist/dev/mp-weixin/`**                         |
| WeChat production build    | **`dist/build/mp-weixin/`**                       |

Import the platform directory itself, **not** `dist/dev/`, `dist/build/`, or the source root. Each contains its own `project.config.json` pointing at `./`. The template neither opens nor authenticates DevTools. Library version `3.5.5` is a configuration baseline inherited from the native starter, not device certification. Domain checking is enabled; configure real approved domains when replacing the local service.

The H5 build uses hash routing. Serve `dist/build/h5/` over HTTP rather than opening `index.html` with `file://`. For a non-root deployment, review the H5 router base and deployment URL in the official uni-app documentation before building. Development servers are loopback-only by default; do not expose this pinned toolchain as a public service.

## Editable source and integration boundaries

```text
manifest.config.json              # Editable app/platform configuration
vite.config.ts                    # Official uni plugin + Tailwind integration
src/
  main.ts                         # createApp() returning createSSRApp(App)
  App.vue                         # Converted app hooks and global styles; no page renderer
  pages.json                      # Converted retail routes, page options and tab bar
  pages/retail-*/                  # Retail tab routes
  retail-goods/, retail-order/, retail-user/
  retail-coupon/, retail-promotion/
  components/retail/, components/ui/
  features/retail/                 # Service/store, data and brand configuration
  composables/, lib/
  styles.css, styles/varo.css      # Editable Tailwind entry and Varo styles
  static/                         # Reached local images, icons and feature assets
  vendor/varo/packages/            # Selected framework-neutral helper source
scripts/
  prepare-uni-project.mjs
  verify-mp-weixin.mjs
starter-manifest.json
pnpm-lock.yaml
```

The exporter provides the routes, app component, UI and helpers, not this template. Framework composition APIs use Vue; page/application hooks use `@dcloudio/uni-app`; platform interactions use uni APIs. The generated project has no Wevu runtime, native compiler dependency, repository Vite aliases, or imported internal renderer tree. Add or edit routes in `src/pages.json`; the verifier compares compiled pages against that current file rather than hardcoding the export-time route count.

The conversion also preserves the reached component contracts: Vue prop defaults replace native property initialization, native event payloads remain consistent, and static asset URLs move with their files. H5-only DOM bindings provide Enter/Space activation and copy field ARIA attributes onto the actual HTML inputs; they are excluded from WeChat compilation. Blur commits the current field value before submission and discards older queued input events. Fixed bottom actions account for the H5 tab bar through `--window-bottom`. These are scoped source adaptations, not a general-purpose Wevu-to-uni-app converter or a global runtime shim. Unsupported native APIs/configurations fail the export instead of receiving no-op fallbacks.

Start API integration at `src/features/retail/runtime.ts`, which selects the local simulated `retailService`. The included `src/features/retail/http-service.ts` is an editable transport boundary requiring an application-owned `RetailHttpTransport` and actual API contract. Preserve integer-cent money and order/address snapshot semantics. Put authoritative pricing, stock, authentication, address validation and order persistence behind that service boundary rather than embedding private APIs into UI components.

Replace `retailConfig.brand` in `src/features/retail/config.ts`, product data, images, tab assets and app theme values for your application. `retailConfig.scenario` selects local demo scenarios. Local orders, payment result screens, fulfillment, refunds, invoices and identity screens are simulations, not connected production services or proof of payment.

## Tailwind 4 and global Varo styles

`src/App.vue` imports `./styles.css` first and `./styles/varo.css` second in its unscoped style block; the app's retail token overrides follow both imports. Keep this order. `src/styles.css` owns the Tailwind theme/utility imports and explicit source discovery for exported Vue/TypeScript, including the copied helper recipes. There is no second manually maintained palette or UI stylesheet in the template.

`WeappTailwindcss` runs **after** the official uni plugin, with `cssEntries` pointing at that real imported CSS file. It remains enabled for both platforms:

- `UNI_PLATFORM=mp-weixin` generates native-safe selectors/classes and converts rem units to rpx.
- `UNI_PLATFORM=h5` uses the plugin's browser target and retains browser class syntax and rem units.
- Native `cn` merging and H5 non-escaping merging live in the converted `src/lib/cn.ts`. The build's `ignoreCallExpressionIdentifiers: ['cn']` keeps utility merging and build-time class transformation consistent.
- The existing source's reset is retained; the template does not add a global Tailwind preflight that would restyle uni native controls.

Do not also register `@tailwindcss/vite` or `@tailwindcss/postcss`: that would create a second Tailwind generator. This project uses plain CSS and does not need Sass. Put static files in `src/static/`, referenced as `/static/...` from source and `static/...` in tab icon configuration; the compiler owns platform output placement.

## What the native verifier checks

`scripts/verify-mp-weixin.mjs` consumes the actual `dist/build/mp-weixin/` output and fails on:

- Missing, duplicate or unexpected registered pages compared with the current `src/pages.json`.
- Missing page/component `.js`, `.json` or `.wxml`, including recursive `usingComponents` and generic defaults.
- Missing recursive JavaScript imports/requires, WXML imports/includes or WXS modules; non-local dependencies, unresolved dynamic script dependencies and references escaping output are rejected.
- Missing tab icons, literal WXML/JavaScript static asset references, recursive WXSS imports or local CSS URL assets.
- Copied files under `src/static/` missing or differing in the production output.
- Unprocessed Tailwind directives/classes, unsupported component selectors, or absent global flex utility/Varo theme tokens.
- Invalid/nonlocal AppID configuration or the wrong DevTools import root.

It does not execute application JavaScript, evaluate arbitrary runtime-generated asset URLs, download remote/data/wxfile assets, verify network services, render H5, or certify WeChat runtime/device behavior. Dynamic business behavior, source-to-runtime conversion and visual quality require actual runtime checks.

## Provenance and reproducibility

`starter-manifest.json` records source revision, relative input paths and SHA256 digests, exported file hashes, exact direct dependencies, page inventory, source conversions and exporter Node/pnpm versions. The lockfile is included; the manifest excludes its own hash. Prepared local configuration and compiled output are not export-time source. Normal consumer edits intentionally change recorded hashes.

The same source inputs produce the same source projection. Registry resolution happens at export time, so a later export can resolve different transitive versions. Preserve the particular export's lockfile for reproducible installs.

To produce a new snapshot, run **from an installed Varo repository**:

```sh
pnpm retail:export -- --framework uni-app ../my-retail-uni
```

The destination parent must exist; the destination must be absent or a real empty directory outside Varo. The exporter does not update an existing consumer in place. Export elsewhere, then integrate deliberate changes. Local credentials, dependencies and compiled output are not copied from the source repository.

## Release prerequisites

Run both builds and typechecking, then exercise product → cart → address/checkout → simulated order on actual narrow/wide H5 pages. Check quantity, checkbox/input events, navigation, loading/error paths, image loading, keyboard/focus and reduced-motion behavior. Separately validate WeChat DevTools and real supported devices with your own AppID. Build/path checks are not evidence of those interactions.

Before publishing, replace simulation APIs, confirm asset rights, audit the pinned dependency graph, supply authentication/authorized transaction APIs and platform disclosures, and review network/domain permissions. The official compiler basis retains Vue 3.4 and upstream `vue-i18n` 9, which its publisher marks unsupported; the starter's security-patched Vite toolchain and scoped input patch are documented in `DEPENDENCIES.md`. Do not independently bump framework internals to silence package warnings; migrate the uni release family coherently and repeat platform validation. This template does not expand Varo's commercial/support boundaries or configure a production backend/payment service.
