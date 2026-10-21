# Varo retail starter for uni-app Vue 3

An editable retail simulation for H5 and WeChat mini programs. The exporter converts Varo's current native retail application into a standalone uni-app Vue 3 project; this template supplies its tooling. Varo source and tooling use MIT, while dependencies keep their own licenses (see `DEPENDENCIES.md`).

## Requirements and first run

Use Node **22.18+ within Node 22, 24.11+ within Node 24, or 26+**, and **pnpm 11.24.0**. Node 25 is outside the source repository's supported runtime policy. Registry access is required for installation.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm verify
```

Keep the included `pnpm-lock.yaml` for frozen installs. `pnpm-workspace.yaml` contains only this project, disables automatic peer installation, and permits the listed native build scripts. It disables the `core-js`/`core-js-pure` funding banners. The export has no private workspace dependencies or source-repository links. Resolving its lockfile does not install, build, or run the project.

Keep `nodeLinker: hoisted`. The pinned uni Vite plugin preserves symlinks, preventing class-merge dependencies from resolving under pnpm's isolated layout. Hoisting changes the package layout without Vue aliases or added transitive dependencies.

Retain the exact Vite/plugin overrides and versioned uni H5 input patch in `pnpm-workspace.yaml`. They protect the development-server boundary and preserve rapid input/blur ordering; see `DEPENDENCIES.md` for their rationale and upgrade checks. The repository stores the package manifest as `package.json.template` because this shell is not an installed workspace package. Export emits a normal `package.json`; run the commands above in that assembled project.

Run these checks on each export:

| Command                    | Operation                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev` / `pnpm dev:h5` | Prepare local uni configuration, then start the H5 development server on loopback.                                                                         |
| `pnpm dev:mp-weixin`       | Prepare local uni configuration, then watch/compile WeChat output.                                                                                         |
| `pnpm typecheck`           | Run `vue-tsc` against exported TypeScript, Vue SFCs and their declarations. Dependency declarations use `skipLibCheck`; application source remains strict. |
| `pnpm build:h5`            | Compile the production H5 application into `dist/build/h5/`.                                                                                               |
| `pnpm build:mp-weixin`     | Compile into `dist/build/mp-weixin/`, then run the recursive native artifact verifier.                                                                     |
| `pnpm build`               | Run both production builds, H5 first and WeChat second.                                                                                                    |
| `pnpm verify`              | Check existing production WeChat artifacts without rebuilding or launching DevTools.                                                                       |

uni-app requires `createSSRApp` in `src/main.ts` even for this non-SSR project. Only H5 and `mp-weixin` packages and commands are included.

## AppID and generated configuration

```sh
cp .env.example .env.local
# Edit .env.local: set WEAPP_APP_ID to your own mini-program's actual AppID.
pnpm dev:mp-weixin
```

Use your own AppID; an empty value permits compilation but no DevTools or device access. Shell `WEAPP_APP_ID` overrides this project's `.env.local`. The script reads no parent environment files and checks only that the value is empty or has the WeChat AppID format; account ownership still needs authorization.

Edit **`manifest.config.json`** for app metadata, H5 routing and `mp-weixin` settings. Before every development or build command, `scripts/prepare-uni-project.mjs` generates these ignored files:

- `src/manifest.json`: uni-app's manifest, with the local WeChat AppID applied.
- `src/project.config.json`: the native project configuration, with the same AppID and `miniprogramRoot: "./"`.

Commands overwrite generated files, so edit their source configuration instead. Keep the WeChat AppID in `.env.local` or the shell. The separate DCloud `appid` in `manifest.config.json` stays empty; cloud services and uni statistics are disabled.

The pinned compiler substitutes a tourist AppID when the manifest AppID is empty. Supplying the source project config preserves the empty value without patching compiled output.

### Output directories and DevTools import roots

| Mode                       | Output and directory to import in WeChat DevTools |
| -------------------------- | ------------------------------------------------- |
| WeChat development watcher | **`dist/dev/mp-weixin/`**                         |
| WeChat production build    | **`dist/build/mp-weixin/`**                       |

Import the platform directory itself, not `dist/dev/`, `dist/build/`, or the source root. Its `project.config.json` points to `./`. Open and authenticate DevTools yourself. Library version `3.5.5` comes from the native starter; check it on supported devices. Domain checking is enabled, so configure approved domains when connecting a backend.

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
  styles.css, styles/              # Editable Tailwind entry and Registry styles
  static/                         # Reached local images, icons and feature assets
  vendor/varo/packages/            # Selected framework-neutral helper source
scripts/
  prepare-uni-project.mjs
  verify-native.mjs
starter-manifest.json
pnpm-lock.yaml
```

The exporter generates routes, the app component, UI, and helpers from retail source. Components use Vue, page/app hooks use `@dcloudio/uni-app`, and platform calls use uni APIs. The project includes no Wevu runtime, native compiler, repository Vite aliases, or internal renderer imports. Edit routes in `src/pages.json`; the verifier compares compiled pages with that file.

Conversion preserves prop defaults, event payloads, and asset paths. H5 bindings add Enter/Space activation and copy ARIA attributes to HTML inputs; WeChat builds exclude them. Blur commits the current value before submission and discards older queued input. Fixed actions use `--window-bottom` for the H5 tab bar. These adaptations cover the exported retail source, not arbitrary Wevu projects. Unsupported APIs or configuration fail export; there is no global runtime shim or no-op fallback.

Start API integration in `src/features/retail/runtime.ts`, which selects the simulated `retailService`. Connect the included `src/features/retail/http-service.ts` using your `RetailHttpTransport` and API contract. Preserve integer-cent amounts and order/address snapshots. Handle pricing, stock, authentication, address validation, and order persistence in that service.

Set `retailConfig.brand` in `src/features/retail/config.ts` and replace product data, images, tab assets, and theme values. `retailConfig.scenario` selects demo scenarios. Order, payment, fulfillment, refund, invoice, and identity screens use local simulations; their results do not confirm real transactions.

## Tailwind 4 and global Varo styles

`src/App.vue` loads `./styles.css`, then exported `./styles/` files with `varo.css` first, followed by retail token overrides in its unscoped style block. Keep that order. `src/styles.css` imports Tailwind's theme and utilities and scans exported Vue/TypeScript, including copied recipes. The template maintains no separate palette or UI stylesheet.

`WeappTailwindcss` runs **after** the official uni plugin, with `cssEntries` pointing at that real imported CSS file. It remains enabled for both platforms:

- `UNI_PLATFORM=mp-weixin` generates native-safe selectors/classes and converts rem units to rpx.
- `UNI_PLATFORM=h5` uses the plugin's browser target and retains browser class syntax and rem units.
- Native `cn` merging and H5 non-escaping merging live in the converted `src/lib/cn.ts`. The build's `ignoreCallExpressionIdentifiers: ['cn']` keeps utility merging and build-time class transformation consistent.
- The existing source's reset is retained; the template does not add a global Tailwind preflight that would restyle uni native controls.

Do not also register `@tailwindcss/vite` or `@tailwindcss/postcss`: that would create a second Tailwind generator. This project uses plain CSS and does not need Sass. Put static files in `src/static/`, referenced as `/static/...` from source and `static/...` in tab icon configuration; the compiler owns platform output placement.

## What the native verifier checks

`scripts/verify-native.mjs` consumes the actual `dist/build/mp-weixin/` output and fails on:

- Missing, duplicate or unexpected registered pages compared with the current `src/pages.json`.
- Missing page/component `.js`, `.json` or `.wxml`, including recursive `usingComponents` and generic defaults.
- Missing recursive JavaScript imports/requires, WXML imports/includes or WXS modules; non-local dependencies, unresolved dynamic script dependencies and references escaping output are rejected.
- Missing tab icons, literal WXML/JavaScript static asset references, recursive WXSS imports or local CSS URL assets.
- Copied files under `src/static/` missing or differing in the production output.
- Unprocessed Tailwind directives/classes, unsupported component selectors, or absent global flex utility/Varo theme tokens.
- Invalid/nonlocal AppID configuration or the wrong DevTools import root.

The verifier does not run application JavaScript, resolve runtime-generated asset URLs, download remote/data/wxfile assets, check network services, or render H5. Test dynamic behavior, converted source, visuals, and WeChat device behavior in the actual runtime.

## Provenance and reproducibility

`starter-manifest.json` records the source revision, relative input paths and SHA256s, exported-file hashes, exact dependencies, pages, conversions, and Node/pnpm versions. It includes the lockfile and excludes its own hash. Local configuration and compiled output are created later; editing source changes the recorded hashes.

The same source inputs produce the same source output. Later exports may resolve different transitive versions; keep each export's lockfile for reproducible installs.

To produce a new snapshot, run **from an installed Varo repository**:

```sh
pnpm retail:export -- --framework uni-app ../my-retail-uni
```

The destination parent must exist; the destination must be absent or a real empty directory outside Varo. The exporter does not update an existing consumer in place. Export elsewhere, then integrate deliberate changes. Local credentials, dependencies and compiled output are not copied from the source repository.

## Release prerequisites

Run both builds and typechecking, then exercise product → cart → address/checkout → simulated order on actual narrow/wide H5 pages. Check quantity, checkbox/input events, navigation, loading/error paths, image loading, keyboard/focus and reduced-motion behavior. Separately validate WeChat DevTools and real supported devices with your own AppID. Build/path checks are not evidence of those interactions.

Before publishing, connect real services, confirm asset rights, audit dependencies, supply authentication and authorized transaction APIs, and review platform disclosures and network permissions. The compiler uses Vue 3.4 and upstream `vue-i18n` 9, which is unsupported. See `DEPENDENCIES.md` for Vite security fixes and the input patch. Update the uni release family together and repeat platform checks; do not bump internals just to silence warnings. The template adds no commercial/support commitments or production backend/payment service.
