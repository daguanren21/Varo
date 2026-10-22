# Varo native retail starter

An editable, MIT-licensed WeChat mini-program project exported from Varo's retail application. The exporter collects the current pages, components, local services, helpers, and assets from that application.

## Requirements and first run

Use Node **22.18+ within Node 22, 24.11+ within Node 24, or 26+**, and **pnpm 11.24.0**. Node 25 is outside this repository's supported runtime policy. Compiler/runtime dependencies are listed in `DEPENDENCIES.md`. Install registry dependencies with network access:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```

Use the included `pnpm-lock.yaml` for frozen installs. Export resolves the lockfile without installing dependencies or running lifecycle scripts. Installation allows only the native build dependencies listed in `pnpm-workspace.yaml`, which contains this standalone project without links to Varo.

`pnpm build` compiles the app, prepares both local DevTools configurations, and runs the verifier. `pnpm verify` checks existing production output: retail pages, page/component `.js`/`.json`/`.wxml` files, component generics, tab assets, WXSS imports, supported selectors, and generated Tailwind utilities.

## AppID and development

```sh
cp .env.example .env.local
# Edit .env.local: set WEAPP_APP_ID to your own mini-program's actual AppID.
pnpm dev
```

Supply your own AppID; an empty value allows compilation only. Both `dev` and `build` load `.env.local`, with shell `WEAPP_APP_ID` taking precedence. You can also set `appid` in ignored `project.local.json`. Keep both local configuration files out of version control. The exporter does not copy environment files from the source repository.

- Development watcher: `dist/dev/mp-weixin/`; import `dist/dev/` in WeChat DevTools.
- Production compiler: `devtools/build/mp-weixin/`; import `devtools/build/` in WeChat DevTools.
- Both generated `project.config.json` files point to their sibling `mp-weixin/` directory.
- `pnpm prepare:weapp` runs `weapp-vite prepare` for compiler-generated configuration/types; it does not generate the local DevTools configurations.

Keep development and production output separate. The DevTools configuration uses the baseline WeChat library version `3.5.5`; validate the final application against the actual supported devices/library versions. The compiler configuration does not start an MCP service.

## Source layout and integration

```text
src/
  app.vue                         # Retail-only registration and native app styles
  pages/retail-*/                  # Home, categories, cart and profile tabs
  retail-goods/                   # Goods browsing/detail routes
  retail-order/                   # Checkout and local order routes
  retail-user/                    # Address/profile routes
  retail-coupon/, retail-promotion/
  features/retail/                # Typed data, service/store and brand configuration
  components/retail/, components/ui/
  composables/, lib/, styles/
  assets/                        # Only reached local assets and tab icons
  vendor/varo/packages/           # Automatically selected MIT pure-helper source
scripts/
  prepare-devtools-project.mjs
  verify-devtools-project.mjs
starter-manifest.json
pnpm-lock.yaml
```

Unrelated robot, Agent/AI, gallery, Registry showcase and plugin registrations are excluded. Native feature source paths are preserved. Imports into the source monorepo are rewritten to local pure-helper files; the generated headless barrel exports only the helpers consumed by native components. `lib/varo-primitives.ts` binds those neutral helpers to the native reactive runtime. There is no `@varo/primitives-weapp` dependency, H5 renderer wrapper, Vite workspace alias or runtime compatibility layer.

Stylesheet declaration `url()` paths resolve relative to the stylesheet or SFC, including bare paths such as `assets/hero.svg`. Local `@import` targets must name an exact file; a bare import may also name a dependency declared in `package.json`, including `@scope/package` roots. If both a local file and a declared package match, export rejects the ambiguity: use `./` to select the local file. CSS references retain their query/fragment suffixes and spelling, and do not use JavaScript extension or directory-index fallbacks. Missing local files, source escapes and symlinks reject before publication.

Start API integration in `src/features/retail/runtime.ts`, which selects the simulated `retailService`. The exporter configures no server, authentication, or payment provider. To connect a backend, use the included `src/features/retail/http-service.ts`: its `createHttpRetailService` requires your `RetailHttpTransport` and API contract, and is not imported by default. Handle authoritative prices, stock, address validation, and order persistence there. Preserve integer-cent amounts and order/address snapshots.

Replace `retailConfig.brand` in `src/features/retail/config.ts`, product data/assets, tab images and app theme values for your application; `retailConfig.scenario` selects local demo scenarios. `src/styles/` and the reached native UI source remain editable. `vite.config.ts` loads foundation (`varo.css`) before component styles, globally into `app.vue`. See the source repository's [technical guide](https://daguanren21.github.io/Varo/guide/retail-starter) for the service contracts, deterministic local scenarios and brand entry details.

## Version and integrity record

`starter-manifest.json` records the source Git revision, relative input paths and SHA256s, exported-file SHA256s including the lockfile, Node/pnpm versions, exact direct dependencies, pages, and source transformations. It excludes its own hash. Source hashes identify uncommitted changes that the Git revision cannot.

The same inputs produce the same source output. Later exports may resolve different transitive dependencies, so keep each export's lockfile for reproducible frozen installs. Manifest hashes describe export-time files and will change when you edit them.

To produce another snapshot, run this command **from the Varo repository**, after its dependencies are installed:

```sh
pnpm retail:export -- ../my-retail
```

The destination's parent must exist. Export into an absent or empty real directory outside Varo; files, symlinks, hidden entries, and occupied directories are rejected. Preparation runs in a temporary sibling directory, which is removed on failure and renamed to the destination on success. The exporter excludes `node_modules`, local credentials, and compiled output. To update an existing project, export elsewhere and merge the changes yourself.

## Limits and release prerequisites

The local service simulates retail flows. It provides no production backend, durable multi-user storage, fulfillment, refunds, invoices, identity verification, or payment. A simulated order is not proof of payment.

Before publishing, configure your AppID, server domains, authentication, transaction APIs, privacy disclosures, and required permissions. Enable domain checking; local DevTools configuration uses `urlCheck: false`. Review `LICENSE` and `DEPENDENCIES.md` for code, dependency, and asset rights. Test supported devices, network failures, order persistence, submission races, and accessible interactions separately from compiler and path checks.
