# Varo native retail starter

An MIT, editable WeChat mini-program project exported from the current Varo native retail implementation. It is not a second maintained application tree: the exporter follows the native pages, components, local services, helpers and assets at export time.

## Requirements and first run

Use Node **22.18+ within Node 22, 24.11+ within Node 24, or 26+**, and **pnpm 11.24.0**. Node 25 is outside this repository's supported runtime policy. The direct `wevu` and `weapp-vite` versions are pinned to **7.1.0**, matching the source baseline. Install registry dependencies with network access:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```

The export already includes `pnpm-lock.yaml`; do not replace a frozen install with an unlocked install to hide a mismatch. Export preparation only resolves the lock and does not install dependencies or run dependency lifecycle scripts. Normal installation permits only the native build dependencies listed in `pnpm-workspace.yaml`. The workspace file includes this project alone and does not link back to Varo.

`pnpm build` invokes the native compiler, prepares both local DevTools configurations and runs the recursive verifier. `pnpm verify` checks the existing production output: registered retail pages, page/component `.js`/`.json`/`.wxml` files, component generics, tab assets, recursive WXSS imports, supported component selectors and generated Tailwind utilities. It is a real path/style check, not a placeholder. It does not certify device behavior.

## AppID and development

```sh
cp .env.example .env.local
# Edit .env.local: set WEAPP_APP_ID to your own mini-program's actual AppID.
pnpm dev
```

No example AppID is supplied. An empty AppID supports compilation only. `.env.local` is loaded by the preparation script used by both `dev` and `build`. A shell-provided `WEAPP_APP_ID` takes precedence. Alternatively, use an ignored `project.local.json` with your actual `appid` property. Do not commit either local configuration file. Neither environment file is copied from the source repository during export.

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

Unrelated robot, Agent/AI, gallery, Registry showcase and plugin registrations are excluded. Native feature source paths are preserved. Imports into the source monorepo are rewritten to local pure-helper files; the generated headless barrel exports only the helpers consumed by native components. The unused renderer wildcard in `lib/varo-primitives.ts` is removed only after checking that reached consumers use its native reactive runtime binding. There is no `@varo/primitives-weapp` dependency, H5 renderer wrapper, Vite workspace alias or runtime compatibility layer.

Start data/API integration in `src/features/retail/runtime.ts`, which exports the default mock-backed `retailService`. Its local service is a simulation; no server URL, authentication or payment provider is configured by the exporter. `src/features/retail/http-service.ts` is included explicitly as an integration entry even though the default runtime does not import it. Its `createHttpRetailService` example requires an application-owned `RetailHttpTransport` implementation and actual API contract. Adapt authoritative prices, stock, address validation and order persistence at that service boundary rather than embedding private APIs in UI components. Keep integer-cent amounts and the native service's order/address snapshot contract intact.

Replace `retailConfig.brand` in `src/features/retail/config.ts`, product data/assets, tab images and app theme values for your application; `retailConfig.scenario` selects local demo scenarios. `src/styles/varo.css` and the reached native UI source remain editable. See the source repository's [technical guide](https://daguanren21.github.io/Varo/guide/retail-starter) for the service contracts, deterministic local scenarios and brand entry details.

## Version and integrity record

`starter-manifest.json` records the source Git revision, relative canonical input paths and SHA256 digests, exported file SHA256 digests (including the lockfile), exporter Node/pnpm versions, exact direct dependency versions, page inventory and source transformations. The manifest excludes its own digest. HEAD alone is not a claim that uncommitted source changes are committed; use the source hashes to identify the actual snapshot.

The source projection is deterministic for the same inputs. Transitive registry dependencies are resolved when exporting; retain the resulting lockfile for reproducible frozen installs of this artifact. Re-exporting later may resolve a different transitive lock and therefore a different lockfile digest. The manifest describes export-time files; normal development edits intentionally change those hashes.

To produce another snapshot, run this command **from the Varo repository**, after its dependencies are installed:

```sh
pnpm retail:export -- ../my-retail
```

The destination's parent must exist. The destination must be absent or an empty real directory outside Varo. Files, symlinks, hidden entries and occupied directories are rejected without overwrite. Generation and lock resolution happen in a temporary sibling directory; it is removed on failure and renamed into the destination only after successful preparation. The exporter never copies `node_modules`, local credentials or compiled output. Existing projects are not updated in place: export elsewhere and integrate intentional changes yourself.

## Limits and release prerequisites

The local runtime is an integration example, not a production commerce backend. Ancillary retail screens are local demonstrations and do not implement real fulfillment, refunds, invoices, identity verification or payment. A local order result is not a payment confirmation. Local data is not a durable multi-user database.

Before publishing, supply your own AppID, server domains, authentication, authoritative transaction APIs, privacy disclosures and any required platform permissions. Enable and validate domain checking for your actual environment; the provided local DevTools configuration has `urlCheck: false`. Review code, dependency and asset rights in `LICENSE` and `DEPENDENCIES.md`. Verify real devices and supported platforms, network failures, persisted orders, submission races and accessible interactions. A successful compiler/path check is not evidence of device, backend or production readiness.
