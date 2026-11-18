# Dependency and asset notes

## Varo source

Varo retail source, native UI, selected helpers, and starter tooling use the repository's MIT license. Keep `LICENSE` and copyright notices when redistributing substantial portions. `starter-manifest.json` records source paths and hashes. Helpers are copied from the repository, with no private workspace package downloads.

## Registry dependencies

Read direct dependency versions from [`package.json`](./package.json). SPDX declarations below come from package metadata. Check upstream license texts and notices for the resolved dependency graph; Varo's MIT license does not replace them.

| Package                    | Declared license | Role                                                                                   |
| -------------------------- | ---------------- | -------------------------------------------------------------------------------------- |
| `wevu`                     | MIT              | Native component/reactivity runtime                                                    |
| `@weapp-tailwindcss/merge` | MIT              | Native-compatible class merging                                                        |
| `clsx`                     | MIT              | Class value composition                                                                |
| `weapp-vite`               | MIT              | Native compiler and published Web API runtime injection                                |
| `weapp-tailwindcss`        | MIT              | Mini-program style transforms                                                          |
| `tailwindcss`              | MIT              | Utility generation                                                                     |
| `vite`                     | MIT              | Build pipeline                                                                         |
| `vue`                      | MIT              | Compiler/tooling dependency; application code imports `wevu`, not H5 renderer wrappers |
| `typescript`               | Apache-2.0       | TypeScript tooling                                                                     |
| `miniprogram-api-typings`  | MIT              | WeChat API declarations                                                                |
| `@types/node`              | MIT              | Node tooling declarations                                                              |
| `@babel/core`              | MIT              | Compiler peer dependency                                                               |
| `esbuild`                  | MIT              | Production minification                                                                |
| `postcss-selector-parser`  | MIT              | Compiled component selector verification                                               |
| `@csstools/css-tokenizer`  | MIT              | CSS escape decoding for recursive stylesheet verification                              |

`pnpm-lock.yaml` fixes the export's resolved dependency graph; [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) declares overrides. Before redistribution, check `LICENSE`/`NOTICE` files for all installed dependencies, bundled code, and native binaries. This table covers direct dependencies only.

## Assets

The exporter copies only statically reached assets from the native source and the retail tab icons. Product images currently originate under `apps/playground-weapp/src/assets/retail/`; tab icons originate under `apps/playground-weapp/src/assets/tabbar/`. Their exact copied paths and digests appear in the manifest. No remote image download or additional asset license grant happens during export.

Per-image rights records are incomplete. The repository license does not establish photographic, design, trademark, or model-release rights for demo assets. Before publishing, use assets you own or have verified permission to use, with required attribution. Product names and demo branding grant no additional rights.

The starter keeps system fonts and adds no font files. Review any media you add and its network-domain requirements before publishing.
