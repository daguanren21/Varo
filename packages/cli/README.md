# @varo-ui/cli

CLI for installing editable, target-specific Varo components and blocks from the Registry.

## Usage

```bash
pnpm dlx @varo-ui/cli add --target h5 button input card
pnpm dlx @varo-ui/cli add --target weapp button input card
```

The CLI copies source into your project. It does not hide rendering behind a cross-platform runtime. Existing files are preserved unless `--force` is provided; forced replacement does not merge local customizations. Required npm dependencies are reported, not installed.

## Deployment profiles

`--target` accepts exactly `h5`, `weapp`, `alipay`, `tt`, `xhs`, `donut-android`, `donut-ios`, or `donut-ohos`. Use `varo --help` for the current choices.

H5 uses browser source; all other profiles select the Wevu `weapp` renderer family. Alipay, Douyin (`tt`), and Xiaohongshu (`xhs`) use their named compiler platform. Donut profiles compile Weapp source for the separate Android, iOS, or OpenHarmony host. A profile is not a new renderer and does not configure a consumer's AppID, permissions, SDK, signing, or host project.

H5 and Weapp are stable profiles. The six additional profiles are **experimental**: source admission does not certify native IDE/device interactions or a packaged Donut host. `add` reports that limit in its human-readable output; `export` keeps stdout JSON-only.

```bash
pnpm dlx @varo-ui/cli add --target alipay button input input-otp form checkbox switch drawer card
pnpm dlx @varo-ui/cli add --target donut-ios button input form drawer
```

The representative admitted components for the six experimental profiles are `button`, `input`, `input-otp`, `form`, `checkbox`, `switch`, `drawer`, `card`, and `icon`, plus their required utilities/themes. The manifests are authoritative; the rest of the catalog and Agent units are not implicitly admitted.

Use the repository baseline `weapp-vite`/`wevu` 7.4.0 for native compilation (`@varo-ui/weapp` peers remain `>=7.2.1 <8`). Donut uses `weapp` compilation with separate `mini-android`, `mini-ios`, or `mini-ohos` metadata; SDK/native packaging and signing are not performed by source installation.

Native manifests retain renderer-family `targets`, `files[].target`, `targetDependencies`, `targetDevDependencies`, and `targetRegistryDependencies` (`h5` or `weapp`). To admit additional deployment profiles, authors explicitly add `platforms`, for example:

```json
{
  "targets": ["h5", "weapp"],
  "platforms": ["alipay", "tt", "xhs", "donut-android", "donut-ios", "donut-ohos"]
}
```

This is admission metadata to add to a complete native manifest, not a standalone registry item. Every requested item and every selected transitive dependency must admit the new profile and declare its renderer. Missing admission, unknown profile IDs, and incompatible renderer declarations fail before consumer files are written, even with `--force`. No request falls back to Weapp. Existing H5/Weapp installs still follow `targets`, whether `platforms` is absent, empty, or lists only experimental profiles.

## Styles and native migration

`themes/base` now contains only tokens and foundation rules. Ordinary component styles have a unique manifest owner, and Agent units select optional `themes/agent`. Install the complete item closure rather than copying only its top-level renderer or treating the base theme as the whole library.

- **H5:** installed source imports the complete dependency CSS closure automatically.
- **Native source:** configure `weapp.styles` to include every installed `src/styles/*.css` in `app.vue`, with `varo.css` first. `apply-shared` SFCs must not import these page/global styles into component-local WXSS.
- **Native npm:** use `@varo-ui/weapp` root or `@varo-ui/weapp/components/v-button.vue` for native SFC source. Load `@varo-ui/weapp/style.css` through a local app stylesheet globally; see the [native package setup](../ui-weapp/README.md). The former Vue-native renderer and `@varo-ui/weapp/primitives` are removed, with no compatibility path.
- **H5 npm:** use `@varo-ui/h5` or `/primitives`, not the removed TypeScript `/source` export. `/style.css` and CSS-only `/source/style.css` remain available.

The CLI does not configure your compiler, Tailwind pipeline, global style entries, AppID, or vendor host. The repository's `apps/platform-smoke/vite.config.mjs` demonstrates native source loading with the full installed style closure.

## Agent source units

```bash
# Minimal chat closure
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-chat
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat

# Deliberately opt into the whole suite
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
```

`components/agent-presentation` owns pure shared types/helpers. `agent-conversation`, `agent-workspace`, `agent-advanced`, and `agent-rag` are separately installable units under `components/`. `agent-ui` composes the full suite; it is not a legacy alias. `blocks/agent-chat` selects only conversation dependencies, not advanced, RAG, or fine-tuning files. These are H5/Weapp source units, not extra profile certifications. Approval/network/retry/cancellation execution policy stays in the consuming application.

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

Standard definitions default to H5. A Varo export declares the exact profile in `meta.varo.target`, including values such as `"weapp"` or `"donut-ios"`. Imports preserve that profile when `--target` is omitted. An incompatible explicit `--target` or transitive item's profile is rejected, even when both profiles share the Weapp renderer. No Vue-to-Wevu or host conversion occurs. Native Varo registries retain their default Weapp target.

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

The JSON uses `registry:file`, inline `content`, and explicit `~/src/...` targets so shadcn-vue preserves Varo's installation paths. Transitive files and npm dependencies are included; no Varo-specific dependency names remain for the external installer to resolve. Use separate exports for each deployment profile. The export records `meta.varo.target`, but external installers do not enforce Varo's profile choice: use the matching project, runtime packages, and theme setup. This is registry-protocol compatibility, not Vue-to-Wevu conversion or native device certification.

Exports require valid UTF-8 file contents; non-UTF-8 bytes are rejected instead of silently replaced. `add` still copies binary assets byte-for-byte. Both installation and export reject destination trees where a file is also another file's parent directory, including case-insensitive conflicts.

Compatibility was exercised with shadcn-vue 2.8.2 in a project with `components.json` and a TypeScript path alias configuration. Other tools that delegate to shadcn-vue can consume the same hosted JSON. Varo's `add --registry` can also consume the exported single-item JSON directly.

## Programmatic API

`resolveRegistryItems()` is asynchronous for both local and remote registries. Existing synchronous consumers must add `await`; failures reject the returned Promise. `PlannedRegistryFile.sourcePath` identifies a local absolute path or HTTP(S) source. Inline published files additionally carry `content`, so their provenance path need not exist on disk. Pass `projectRoot` when resolving consumer-specific aliases programmatically.

`RegistryTarget` identifies the selected deployment profile; `RegistryRenderer` identifies the `h5`/`weapp` source family. `RegistryInstallPlan.target` preserves the exact profile, while planned files keep their renderer in `target`. Standard imports normalize `items[].targets` to that renderer and retain the exact admitted profile in `items[].platforms`.

Repository tooling can import `registryProfiles`, `getRegistryProfile(target)`, and `isRegistryTarget(value)` from `@varo/registry/source`. `registryProfiles` is an immutable record keyed by the eight IDs; its records are also immutable. Each record contains `id`, `renderer`, `compilerPlatform` (`null` for H5), `host`, and `maturity`, plus `os` only for Donut. The lookup rejects unknown IDs; it never chooses a fallback profile. Enumerate it with `Object.values(registryProfiles)` instead of maintaining a separate compiler/host table.

```ts
import { exportRegistryItem, resolveRegistryItems } from '@varo-ui/cli'

const plan = await resolveRegistryItems(['button'], { target: 'h5' })
const payload = await exportRegistryItem('blocks/my-block', {
  registryRoot: 'https://ui.example.com/registry/',
  target: 'h5',
})
```

## Repository development and verification

Canonical components/Blocks/utilities live in root `registry/`; styles live in `registry/themes/`. `pnpm sync:registry` generates package renderers/native source, repository installs, and the docs Agent source/support catalog. CLI `prepack` separately copies that Registry into the published CLI package. Do not hand-edit generated projections or the packaged `packages/cli/registry/` tree.

From the repository root, `pnpm check:generated` rejects projection drift and `pnpm check:architecture` checks runtime/tooling boundaries. After synchronization and package builds, `pnpm check:consumers` exercises actual packed-package and fresh source consumers, including profile roundtrips and rejected-closure no-write behavior. It uses local tarballs for all six Varo public packages; non-Varo dependencies may require registry access when the local cache is cold.

`pnpm check:platforms` builds/checks all seven native compiler/artifact profiles. Artifacts are under `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>` (application files in nested `dist/`). These checks validate compiler output and metadata, not IDE/device behavior, Donut SDK packaging, signing, or an independent verifier's acceptance.

[Installation guide](https://varo.weapp.dev/guide/installation) · [Repository](https://github.com/daguanren21/Varo)
