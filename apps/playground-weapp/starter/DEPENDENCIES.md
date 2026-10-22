# Dependency and asset notes

## Varo source

Varo retail source, native UI, selected helpers, and starter tooling use the repository's MIT license. Keep `LICENSE` and copyright notices when redistributing substantial portions. `starter-manifest.json` records source paths and hashes. Helpers are copied from the repository, with no private workspace package downloads.

## Registry dependencies

Versions and SPDX declarations below come from installed package metadata. Check upstream license texts and notices for the resolved dependency graph; Varo's MIT license does not replace them.

| Package                    | Direct version | Declared license | Role                                                                                   |
| -------------------------- | -------------- | ---------------- | -------------------------------------------------------------------------------------- |
| `wevu`                     | 7.5.0          | MIT              | Native component/reactivity runtime                                                    |
| `@weapp-tailwindcss/merge` | 2.2.3          | MIT              | Native-compatible class merging                                                        |
| `clsx`                     | 2.1.1          | MIT              | Class value composition                                                                |
| `weapp-vite`               | 7.5.0          | MIT              | Native compiler and watcher                                                            |
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
| `@csstools/css-tokenizer`  | 4.0.2          | MIT              | CSS escape decoding for recursive stylesheet verification                              |

`pnpm-lock.yaml` fixes this export's dependency graph. The pnpm configuration retains the `undici` 7.29.0 override and Vue 3.5.42 pin. Before redistribution, check `LICENSE`/`NOTICE` files for all installed dependencies, bundled code, and native binaries. This table covers direct dependencies only.

## Assets

The exporter copies only statically reached assets from the native source and the retail tab icons. Product images currently originate under `apps/playground-weapp/src/assets/retail/`; tab icons originate under `apps/playground-weapp/src/assets/tabbar/`. Their exact copied paths and digests appear in the manifest. No remote image download or additional asset license grant happens during export.

Per-image rights records are incomplete. The repository license does not establish photographic, design, trademark, or model-release rights for demo assets. Before publishing, use assets you own or have verified permission to use, with required attribution. Product names and demo branding grant no additional rights.

The starter keeps system fonts and adds no font files. Review any media you add and its network-domain requirements before publishing.
