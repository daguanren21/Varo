# Dependency and asset notes

## Varo source and ownership

The converted retail source, selected editable UI/helper files and starter tooling originate from Varo under its MIT license. Preserve `LICENSE` and upstream copyright notices when redistributing substantial portions. The exporter records actual source paths, conversions and hashes in `starter-manifest.json`. There is no manually copied framework renderer or second authored product UI in the template.

Dependency packages retain their own license terms. Varo's MIT license does not relicense DCloud, Vue or any transitive dependency.

## Official framework basis

The package basis is DCloud's official [`uni-preset-vue` `vite-ts` branch](https://github.com/dcloudio/uni-preset-vue/tree/vite-ts), inspected at tree revision **`6fb81ac3c5736b8b0a83e667b3ed90223d458dd8`**. Its [package manifest](https://raw.githubusercontent.com/dcloudio/uni-preset-vue/vite-ts/package.json) specifies DCloud **`3.0.0-5020420260813003`**, Vite **`5.2.8`** and Vue **`^3.4.21`**. This starter pins Vue **`3.4.21`** to match the published compiler/runtime dependency family, and installs only the **H5** and **mp-weixin** platform packages plus common framework packages. It does not install every platform from the upstream preset.

The official entry/manifest conventions are adapted without upstream demo pages or logos. The ESM Vite configuration loads the pinned CommonJS uni plugin's published `default` property explicitly through Node's `createRequire`; it does not alias Vue or bypass a package export.

This starter deliberately replaces the preset's vulnerable Vite `5.2.8` with **`6.4.3`**. The exact uni-plugin dependency overrides pair it with `@vitejs/plugin-legacy` **`6.1.1`** and `@vitejs/plugin-vue-jsx` **`4.2.0`**, and update that plugin's Vite peer to the validated version. Strict peer checking remains enabled. This is a tested starter-specific toolchain, not a claim that upstream declares Vite 6 support. The older server's [cross-origin source/HMR exposure](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6) also affects loopback addresses; binding locally alone is not a fix. Do not restore the old pin or weaken CORS, allowed-host or HMR-token checks.

`patches/@dcloudio__uni-h5@3.0.0-5020420260813003.patch` fixes the pinned browser input/textarea event owner: flush pending throttled input before blur and cancel pending input/value timers on unmount. Without this, queued input can cancel a normalized-value repaint after blur or arrive after form submission. The patch preserves the framework's event payloads and normal typing cadence; there is no component timestamp filter, forced remount, private-state access or WeChat runtime patch. It is applied through pnpm's version-specific `patchedDependencies`; retain the patch with the lockfile. When upgrading uni, review whether upstream fixes supersede it and repeat rapid out-of-range typing, quick refocus and immediate form-save checks against the real H5 controls.

The standalone pnpm layout is deliberately `nodeLinker: hoisted`. The pinned `@dcloudio/vite-plugin-uni/dist/config/resolve.js` forces `preserveSymlinks: true`; an isolated pnpm layout leaves the merge package's runtime imports unresolved during the real build. Hoisting resolves the installed dependency graph without adding transitive packages as direct dependencies or replacing framework resolution. Only required native build scripts are enabled; `core-js` and `core-js-pure` postinstall scripts print funding notices and are explicitly disabled.

Primary integration references:

- [Official uni-app CLI creation/build/output conventions](https://uniapp.dcloud.net.cn/quickstart-cli.html).
- [Official manifest configuration](https://uniapp.dcloud.net.cn/collocation/manifest.html).
- [weapp-tailwindcss: uni-app CLI Vue 3/Vite](https://tw.weapp.dev/docs/quick-start/frameworks/uni-app-vite).
- [weapp-tailwindcss: H5 and mini-program targets](https://tw.weapp.dev/docs/multi-platform).
- [Class merge runtime: disable escaping for Web](https://tw.weapp.dev/docs/community/packages-runtime/merge).
- Published pinned DCloud `uni-mp-vite` `dist/plugins/manifestJson.js` and `uni-cli-shared` `dist/json/mp/project.js`: supplying `src/project.config.json` uses that local configuration rather than synthesizing a tourist AppID for an empty manifest value.

Documentation websites evolve independently of pinned packages. Review the installed package APIs and repeat real builds when upgrading. These source references are design evidence, not evidence that installation, typechecking, builds or runtime interactions have passed for an export.

## Direct dependencies

The versions below are pinned in this template's package manifest. License declarations were read from registry metadata for those versions. The installed `LICENSE`/`NOTICE` files and exact lockfile graph remain authoritative.

| Package                     | Version                  | Declared license | Role                                                                           |
| --------------------------- | ------------------------ | ---------------- | ------------------------------------------------------------------------------ |
| `@dcloudio/uni-app`         | `3.0.0-5020420260813003` | Apache-2.0       | Uni application and lifecycle APIs                                             |
| `@dcloudio/uni-components`  | `3.0.0-5020420260813003` | Apache-2.0       | Shared uni components                                                          |
| `@dcloudio/uni-h5`          | `3.0.0-5020420260813003` | Apache-2.0       | H5 platform                                                                    |
| `@dcloudio/uni-mp-weixin`   | `3.0.0-5020420260813003` | Apache-2.0       | WeChat platform                                                                |
| `@dcloudio/uni-cli-shared`  | `3.0.0-5020420260813003` | Apache-2.0       | Official build utilities                                                       |
| `@dcloudio/vite-plugin-uni` | `3.0.0-5020420260813003` | Apache-2.0       | Official compiler and CLI                                                      |
| `@dcloudio/types`           | `3.4.31`                 | Apache-2.0       | Explicit uni-app peer/global types                                             |
| `vue`, `@vue/runtime-core`  | `3.4.21`                 | MIT              | Vue runtime and component types                                                |
| `vue-i18n`                  | `9.1.9`                  | MIT              | Official preset's internationalization dependency                              |
| `@weapp-tailwindcss/merge`  | `2.2.3`                  | MIT              | Platform-aware utility merging                                                 |
| `clsx`                      | `2.1.1`                  | MIT              | Class value composition                                                        |
| `tailwindcss`               | `4.3.3`                  | MIT              | Utility source definitions                                                     |
| `weapp-tailwindcss`         | `5.5.3`                  | MIT              | H5/mini-program utility generation and transforms                              |
| `vite`                      | `6.4.3`                  | MIT              | Security-patched starter toolchain; exact uni-plugin overrides described above |
| `typescript`                | `5.9.3`                  | Apache-2.0       | Source checking and verifier JavaScript parsing                                |
| `vue-tsc`                   | `3.1.0`                  | MIT              | SFC/source typechecking                                                        |
| `@types/node`               | `22.10.4`                | MIT              | Node tooling declarations                                                      |
| `postcss`                   | `8.5.6`                  | MIT              | Explicit build peer and compiled CSS parsing                                   |
| `postcss-selector-parser`   | `7.1.6`                  | MIT              | Compiled selector verification                                                 |
| `postcss-value-parser`      | `4.2.0`                  | MIT              | Compiled CSS import/URL verification                                           |
| `htmlparser2`               | `12.0.0`                 | MIT              | WXML dependency and attribute parsing                                          |

The lockfile fixes the resolved graph for one export. With `autoInstallPeers: false`, required Vue, Vite, uni types, TypeScript and PostCSS peers are explicitly declared rather than silently installed. This list is not an exhaustive legal/security audit of transitive packages, bundled code or native binaries. Inspect the actual installed graph and preserve required notices before redistribution.

The official basis is not a promise that every pinned tool is current or independently security-hardened. In particular, the publisher marks `vue-i18n` 9 unsupported. Coordinate framework updates as a single tested uni-app family. Changes to the documented Vite overrides or input patch require frozen installation, peer/type checks, both builds, browser interaction and development-server security/HMR verification. No source-repository lockfile or broad monorepo override is copied into this standalone project.

## Assets

Reached source assets are rehomed under `src/static/` while retaining their source-relative paths. This includes retail product media, tab icons and feature-local media such as the retail logo. `starter-manifest.json` records each exported path/hash and its source inputs. Export does not download remote imagery or grant additional media rights.

The source repository lacks a complete per-image provenance/rights record for its demonstration media. Inclusion under the repository license is not independent proof of photographic, trademark, design or model-release rights. Treat that missing record as a publication gate: replace media with assets you own or have verified rights to, and retain the necessary attributions. Do not infer rights from product names, example branding or the export tool.

No custom font is introduced by this template; the source system-font stack is retained. Review added fonts, photos, logos, icons, other media and network-domain requirements separately before publishing.
