# @varo-ui/cli

CLI for installing editable, target-specific Varo components and blocks from the Registry.

## Usage

```bash
pnpm dlx @varo-ui/cli add --target h5 button input card
pnpm dlx @varo-ui/cli add --target weapp button input card
```

The CLI copies source into your project. It does not hide rendering behind a cross-platform runtime. Existing files are preserved unless `--force` is provided.

## Third-party registries

Install from an independently maintained Varo Registry without contributing it upstream:

```bash
pnpm dlx @varo-ui/cli add --registry ./registry --target h5 blocks/my-block
pnpm dlx @varo-ui/cli add --registry https://ui.example.com/registry/ --target weapp blocks/my-block
```

For native Varo manifests, `--registry` selects a local directory or an HTTP(S) root with the same layout as Varo's authored `registry/`. For example, `blocks/my-block` loads `blocks/my-block/registry.json` below that root. A file's `from: "registry/blocks/my-block/weapp-vite.vue"` loads `blocks/my-block/weapp-vite.vue` below the same root. All transitive `registryDependencies`, including target-specific dependencies, resolve there; include those manifests and sources in your registry. There is no fallback to the bundled registry.

Only install sources you trust. Remote roots cannot contain credentials, queries, or fragments; redirects are rejected. Each HTTP response is limited to 10 MiB and 30 seconds. File destinations remain confined to the project's `src/`, with the same symlink, collision, no-clobber, and rollback protections as bundled installs. npm dependencies are reported, not installed.

## Standard shadcn-vue inputs

`add` and `export` also accept standard `registry.json` catalogs (`name`, `homepage`, `items`) and individual `registry-item.json` definitions. Keep the standard `files.path` / `files.type` fields; no Varo `from`, `to`, or `targets` fields are required.

```bash
pnpm dlx @varo-ui/cli add --registry ./registry.json hello-world
pnpm dlx @varo-ui/cli add --registry ./hello-world.json hello-world
pnpm dlx @varo-ui/cli add --registry https://ui.example.com/r/registry.json hello-world
pnpm dlx @varo-ui/cli export --registry ./registry.json hello-world > hello-world.json
```

Without inline `content`, file paths resolve relative to the selected manifest's directory. Published items with inline `content`, including empty strings, need no backing source file. A directory containing `registry.json` is also accepted; remote standard documents use explicit `.json` URLs rather than the native directory-root convention.

Standard definitions default to H5. A Varo export can declare `meta.varo.target: "weapp"`; an incompatible explicit `--target` is rejected rather than converting Vue to Wevu. Native Varo registries retain their default Weapp target.

Default destinations preserve nested component directories:

| File type                              | Destination                |
| -------------------------------------- | -------------------------- |
| `registry:component`, `registry:block` | `src/components`           |
| `registry:ui`                          | `src/components/ui`        |
| `registry:hook`, `registry:composable` | `src/composables`          |
| `registry:lib`                         | `src/lib`                  |
| `registry:file`, `registry:page`       | Explicit `target` required |

Explicit targets win and must remain under `src/` (`~/src/...` is accepted). Consumer `components.json` aliases are resolved through the project's TypeScript/JSONC configuration. Imports between installed JS/TS/Vue script files are relocated with AST parsing when their destinations differ; unrelated code and npm imports are not rewritten.

Dependency names in a catalog resolve in that catalog. Individual item files can reference sibling `<name>.json` items; explicit HTTP(S) item URLs support cross-registry dependencies. Unknown names do not silently resolve to a public registry. Supported item/file types are `registry:block`, `registry:component`, `registry:ui`, `registry:hook`, `registry:composable`, `registry:lib`, `registry:page`, `registry:file`, `registry:theme`, and `registry:style`; file/page entries require an explicit target. This implements file-based registry inputs, not shadcn-vue project configuration: `css`, `cssVars`, `tailwind`, `envVars`, and style `extends` are rejected. Npm auto-install, framework conversion, `registry:base`, and `registry:font` are not supported.

## Export for shadcn-vue

Export one item and its selected target's complete dependency closure as a self-contained [shadcn-vue registry item](https://www.shadcn-vue.com/docs/registry/registry-item-json):

```bash
mkdir -p public/r
pnpm dlx @varo-ui/cli export --registry ./registry --target h5 blocks/my-block > public/r/my-block.json
# Serve public/ on your own static host, then run in an initialized shadcn-vue project:
pnpm dlx shadcn-vue@latest add https://ui.example.com/r/my-block.json
```

The JSON uses `registry:file`, inline `content`, and explicit `~/src/...` targets so shadcn-vue preserves Varo's installation paths. Transitive files and npm dependencies are included; no Varo-specific dependency names remain for the external installer to resolve. Use separate exports for H5 and Weapp. The export records `meta.varo.target`, but external installers do not enforce Varo's runtime choice: use the matching project, runtime packages, and theme setup. This is registry-protocol compatibility, not Vue-to-Wevu conversion.

Exports require valid UTF-8 file contents; non-UTF-8 bytes are rejected instead of silently replaced. `add` still copies binary assets byte-for-byte. Both installation and export reject destination trees where a file is also another file's parent directory, including case-insensitive conflicts.

Compatibility was exercised with shadcn-vue 2.8.2 in a project with `components.json` and a TypeScript path alias configuration. Other tools that delegate to shadcn-vue can consume the same hosted JSON. Varo's `add --registry` can also consume the exported single-item JSON directly.

## Programmatic API

`resolveRegistryItems()` is asynchronous for both local and remote registries. Existing synchronous consumers must add `await`; failures reject the returned Promise. `PlannedRegistryFile.sourcePath` identifies a local absolute path or HTTP(S) source. Inline published files additionally carry `content`, so their provenance path need not exist on disk. Pass `projectRoot` when resolving consumer-specific aliases programmatically.

```ts
import { exportRegistryItem, resolveRegistryItems } from '@varo-ui/cli'

const plan = await resolveRegistryItems(['button'], { target: 'h5' })
const payload = await exportRegistryItem('blocks/my-block', {
  registryRoot: 'https://ui.example.com/registry/',
  target: 'h5',
})
```

[Installation guide](https://daguanren21.github.io/Varo/guide/installation) · [Repository](https://github.com/daguanren21/Varo)
