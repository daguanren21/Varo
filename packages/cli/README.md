# @varo-ui/cli

Install editable Varo component and Block source for your target platform.

## Usage

```bash
pnpm dlx @varo-ui/cli add --target h5 button input card
pnpm dlx @varo-ui/cli add --target weapp button input card
```

The CLI copies source into your project for that platform's renderer. It keeps existing files unless you pass `--force`, which replaces them without merging local changes. Install the npm dependencies listed in the output yourself.

## Deployment profiles

`--target` accepts exactly `h5`, `weapp`, `alipay`, `tt`, `xhs`, `donut-android`, `donut-ios`, or `donut-ohos`. Use `varo --help` for the current choices.

H5 uses browser source; the other profiles use the Wevu `weapp` renderer. Alipay, Douyin (`tt`), and Xiaohongshu (`xhs`) each use their named compiler platform. Donut profiles compile Weapp source for an Android, iOS, or OpenHarmony host. Profiles select deployment settings for those renderers; you still configure the application's AppID, permissions, SDK, signing, and host project.

H5 and Weapp are stable profiles. The six other profiles are experimental and need separate IDE, device, and Donut packaging checks. `add` explains this limitation in its output; `export` writes only JSON to stdout.

```bash
pnpm dlx @varo-ui/cli add --target alipay button input input-otp form checkbox switch drawer card
pnpm dlx @varo-ui/cli add --target donut-ios button input form drawer
```

Representative components available for the six experimental profiles are `button`, `input`, `input-otp`, `form`, `checkbox`, `switch`, `drawer`, `card`, and `icon`, with their utilities and themes. Check each manifest for the exact support list; other catalog and Agent items are not automatically included.

Repository native builds use `weapp-vite`/`wevu` 7.5.0; `@varo-ui/weapp` peers accept `>=7.2.1 <8`. Donut uses `weapp` compilation and selects its host with `mini-android`, `mini-ios`, or `mini-ohos` metadata. SDK setup, native packaging, and signing are separate from source installation.

Native manifests retain renderer-family `targets`, `files[].target`, `targetDependencies`, `targetDevDependencies`, and `targetRegistryDependencies` (`h5` or `weapp`). To admit additional deployment profiles, authors explicitly add `platforms`, for example:

```json
{
  "targets": ["h5", "weapp"],
  "platforms": ["alipay", "tt", "xhs", "donut-android", "donut-ios", "donut-ohos"]
}
```

Add this metadata to a complete native manifest; the fragment alone is not a Registry item. Every requested item and dependency must support the selected profile and declare its renderer. Missing support, unknown profile IDs, and incompatible renderer declarations fail before any consumer file is written, even with `--force`; the CLI never falls back to Weapp. H5 and Weapp installations continue to use `targets`, whether `platforms` is absent, empty, or contains only experimental profiles.

## Styles and native migration

`themes/base` contains tokens and foundation styles. Each component's manifest declares its CSS, and Agent units use the optional `themes/agent` dependency. Install a component with all its dependencies; copying only its renderer or the base stylesheet leaves required files out.

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

`components/agent-presentation` provides shared pure types and helpers. Under `components/`, you can install `agent-conversation`, `agent-workspace`, `agent-advanced`, and `agent-rag` separately. `agent-ui` installs the full suite and is not an alias for an older package. `blocks/agent-chat` installs only conversation dependencies, leaving out advanced, RAG, and fine-tuning files. These units support H5 and Weapp; other profiles need their own manifest declarations. Your application handles approval, networking, retries, and cancellation.

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

Export an item and all dependencies for its selected target as a self-contained [shadcn-vue registry item](https://www.shadcn-vue.com/docs/registry/registry-item-json):

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

Edit components, Blocks, and utilities in root `registry/`, and styles in `registry/themes/`. Run `pnpm sync:registry` to update package renderers, native source, playground installations, and docs Agent source and support data. The CLI's `prepack` step separately copies the Registry into the published package. Generated files, including `packages/cli/registry/`, should not be edited directly.

From the repository root, run `pnpm check:generated` to detect outdated generated files and `pnpm check:architecture` to check runtime and tooling imports. After synchronization and package builds, `pnpm check:consumers` exercises packed packages and fresh source installations. It checks profile roundtrips and verifies that rejected dependency sets write no files. All six public Varo packages use local tarballs; uncached third-party dependencies may need registry access.

`pnpm check:platforms` builds and checks all seven native profiles. Artifacts are in `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`, with application files in the nested `dist/` directory. These checks cover compiler output and metadata. IDE and device behavior, Donut packaging, signing, and independent release review need separate verification.

[Installation guide](https://varo.weapp.dev/guide/installation) · [Repository](https://github.com/daguanren21/Varo)
