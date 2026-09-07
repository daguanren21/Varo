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

`--registry` selects a local directory or an HTTP(S) root with the same layout as Varo's authored `registry/`. For example, `blocks/my-block` loads `blocks/my-block/registry.json` below that root. A file's `from: "registry/blocks/my-block/weapp-vite.vue"` loads `blocks/my-block/weapp-vite.vue` below the same root. All transitive `registryDependencies`, including target-specific dependencies, resolve there; include those manifests and sources in your registry. There is no fallback to the bundled registry.

Only install sources you trust. Remote roots cannot contain credentials, queries, or fragments; redirects are rejected. Each HTTP response is limited to 10 MiB and 30 seconds. File destinations remain confined to the project's `src/`, with the same symlink, collision, no-clobber, and rollback protections as bundled installs. npm dependencies are reported, not installed.

## Export for shadcn-vue

Export one item and its selected target's complete dependency closure as a self-contained [shadcn-vue registry item](https://www.shadcn-vue.com/docs/registry/registry-item-json):

```bash
mkdir -p public/r
pnpm dlx @varo-ui/cli export --registry ./registry --target h5 blocks/my-block > public/r/my-block.json
# Serve public/ on your own static host, then run in an initialized shadcn-vue project:
pnpm dlx shadcn-vue@latest add https://ui.example.com/r/my-block.json
```

The JSON uses `registry:file`, inline `content`, and explicit `~/src/...` targets so shadcn-vue preserves Varo's installation paths. Transitive files and npm dependencies are included; no Varo-specific dependency names remain for the external installer to resolve. Use separate exports for H5 and Weapp. The export records `meta.varo.target`, but external installers do not enforce Varo's runtime choice: use the matching project, runtime packages, and theme setup. This is registry-protocol compatibility, not Vue-to-Wevu conversion.

Compatibility was exercised with shadcn-vue 2.8.2 in a project with `components.json` and a TypeScript path alias configuration. Other tools that delegate to shadcn-vue can consume the same hosted JSON. Varo's own `add --registry` reads Varo manifests; use shadcn-vue to install the exported JSON.

## Programmatic API

`resolveRegistryItems()` is asynchronous for both local and remote registries. Existing synchronous consumers must add `await`; failures reject the returned Promise. `PlannedRegistryFile.sourcePath` is a local absolute path or an HTTP(S) URL.

```ts
import { exportRegistryItem, resolveRegistryItems } from '@varo-ui/cli'

const plan = await resolveRegistryItems(['button'], { target: 'h5' })
const payload = await exportRegistryItem('blocks/my-block', {
  registryRoot: 'https://ui.example.com/registry/',
  target: 'h5',
})
```

[Installation guide](https://daguanren21.github.io/Varo/guide/installation) · [Repository](https://github.com/daguanren21/Varo)
