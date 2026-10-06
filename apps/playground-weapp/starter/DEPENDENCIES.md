# Dependency and asset notes

## Varo source

The native retail source, copied native UI, automatically selected pure helper source and starter tooling are provided under the repository's MIT license. Preserve `LICENSE` and upstream copyright notices when redistributing substantial portions. Source hashes and relative locations are recorded in `starter-manifest.json`; helper files are extracted from the source repository, not fetched from private workspace packages.

## Registry dependencies

The following direct versions and SPDX license declarations were read from the source baseline's installed package metadata. Upstream license texts, notices and the exact resolved transitive graph remain authoritative. They are not replaced by Varo's MIT license.

| Package                    | Direct version | Declared license | Role                                                                                   |
| -------------------------- | -------------- | ---------------- | -------------------------------------------------------------------------------------- |
| `wevu`                     | 7.1.0          | MIT              | Native component/reactivity runtime                                                    |
| `@weapp-tailwindcss/merge` | 2.2.3          | MIT              | Native-compatible class merging                                                        |
| `clsx`                     | 2.1.1          | MIT              | Class value composition                                                                |
| `weapp-vite`               | 7.1.0          | MIT              | Native compiler and watcher                                                            |
| `weapp-tailwindcss`        | 5.5.3          | MIT              | Mini-program style transforms                                                          |
| `tailwindcss`              | 4.3.3          | MIT              | Utility generation                                                                     |
| `vite`                     | 8.2.2          | MIT              | Build pipeline                                                                         |
| `vue`                      | 3.5.42         | MIT              | Compiler/tooling dependency; application code imports `wevu`, not H5 renderer wrappers |
| `typescript`               | 6.0.3          | Apache-2.0       | TypeScript tooling                                                                     |
| `miniprogram-api-typings`  | 5.2.3          | MIT              | WeChat API declarations                                                                |
| `@types/node`              | 26.1.0         | MIT              | Node tooling declarations                                                              |
| `@babel/core`              | 8.0.1          | MIT              | Compiler peer dependency                                                               |
| `esbuild`                  | 0.28.2         | MIT              | Production minification                                                                |
| `postcss-selector-parser`  | 7.1.6          | MIT              | Compiled component selector verification                                               |

`pnpm-lock.yaml` fixes the resolved transitive graph for this export. The local pnpm policy retains the source baseline's `undici` 7.29.0 override and pins Vue 3.5.42. Before redistribution, inspect the installed dependency `LICENSE`/`NOTICE` files and the licenses for that exact graph, including bundled dependencies and native binaries. This table is a direct-dependency inventory, not an exhaustive legal audit or a claim that all transitive dependencies are MIT.

## Assets

The exporter copies only statically reached assets from the native source and the retail tab icons. Product images currently originate under `apps/playground-weapp/src/assets/retail/`; tab icons originate under `apps/playground-weapp/src/assets/tabbar/`. Their exact copied paths and digests appear in the manifest. No remote image download or additional asset license grant happens during export.

The repository does not contain a complete per-image provenance/rights record for these demo assets. Inclusion under the repository license is not proof of independent photographic, design, trademark or model-release rights. Treat the missing provenance record as a release gate: use assets you own or have verified rights to, and retain required attributions. Do not infer additional rights from the exporter, product names or demonstration branding.

No custom font file is introduced by the starter template; the native app's system-font stack is preserved. Review any fonts, logos, photos, icons and other media you add, as well as their network-domain requirements, before publishing.
