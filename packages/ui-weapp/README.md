# @varo-ui/weapp

Native Wevu `.vue` component source and a resolver for Varo mini-program projects. The package root is a source entry for the `weapp-vite` compiler, **not** a Vue render-function library or a precompiled JavaScript runtime.

## Install

```bash
pnpm add @varo-ui/weapp wevu@7.5.0
pnpm add -D --save-exact weapp-vite@7.5.0
```

The repository fixtures use `weapp-vite` and `wevu` 7.5.0. Both package peers remain `>=7.2.1 <8`; versions before 7.2.1 are outside the supported peer range.

For provider-context inheritance through plain native slots (`scopedSlotsRequireProps: true`), use 7.5.0 **with the compiler patch below**, compiled Wevu components, the WeChat target, and default attached setup. The upstream 7.5.0 runtime implements the [plain-slot protocol](https://github.com/weapp-vite/weapp-vite/pull/1174), but its compiler emits incomplete registration for template-bearing `app.vue` shells and scriptless Vue layouts. The patch fixes those compiler owners. This does not certify created setup, uncompiled third-party components, other platforms, or device behavior.

### Consumer compiler patch

The package ships `patches/weapp-vite@7.5.0.patch`. Apply it in the **consumer project root**; workspace patches do not propagate through npm dependencies. Registry/CLI source consumers need the same compiler fix and can obtain the patch with `pnpm add -D @varo-ui/weapp`, without importing its UI source into their application.

```bash
mkdir -p patches
cp node_modules/@varo-ui/weapp/patches/weapp-vite@7.5.0.patch patches/
```

Merge this entry into the consumer's `pnpm-workspace.yaml`:

```yaml
patchedDependencies:
  weapp-vite@7.5.0: patches/weapp-vite@7.5.0.patch
```

Run `pnpm install` and commit the copied patch, workspace configuration, and updated lockfile. The compiler must remain pinned to `7.5.0` while using this version-specific patch. When an upstream release replaces it, remove the patch only after app-shell and Vue layout slot ownership pass the consumer runtime checks.

## Usage

```vue
<script setup lang="ts">
import { VButton } from '@varo-ui/weapp'
</script>

<template>
  <VButton>Continue</VButton>
</template>
```

For a direct native source import, use the actual component filename:

```ts
import VButton from '@varo-ui/weapp/components/v-button.vue'
```

Both forms compile the native SFC. They are not drop-in imports for a browser Vue renderer or plain Node.js. The npm source tree is generated from the same Registry closure used by editable installations.

## Global npm stylesheet

Create a local application stylesheet, `src/package.css`:

```css
@import '@varo-ui/weapp/style.css';
```

Register that local file globally in `vite.config.ts`:

```ts
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    vue: { enable: true },
    styles: [
      {
        source: 'package.css',
        include: 'app.vue',
      },
    ],
  },
})
```

`weapp.styles.source` is resolved within the application source tree; do not give it an absolute `node_modules` path. The local CSS import lets the stylesheet resolver load the package aggregate. `@varo-ui/weapp/source/style.css` remains a CSS-only export of that same aggregate.

Do not import either stylesheet into component-local WXSS. Native `apply-shared` components receive page tokens and global component selectors from the application stylesheet.

## Editable Registry source

```bash
pnpm dlx @varo-ui/cli add --target weapp button input card
```

Install the npm dependencies reported by the CLI. Source installation brings the selected transitive CSS closure into `src/styles/`: `varo.css` is tokens/foundation, ordinary component styles are separate, and Agent installs add `varo-agent.css`. Load **all installed CSS files globally**, with `varo.css` first. A base-only stylesheet is not enough.

## Editable Registry source resolver

`VaroResolver` discovers only Varo SFCs already copied into the consumer project and lets
`weapp-vite` compile them on demand. Unreferenced candidates stay out of production entries.

```ts
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { VaroResolver } from '@varo-ui/weapp/resolver'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname
const styles = readdirSync(resolve(root, 'src/styles'))
  .filter(name => name.endsWith('.css'))
  .sort((left, right) => left === 'varo.css' ? -1 : right === 'varo.css' ? 1 : left.localeCompare(right))

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    vue: { enable: true },
    styles: styles.map(name => ({ source: `styles/${name}`, include: 'app.vue' })),
    autoImportComponents: {
      resolvers: [VaroResolver({ root })],
      typedComponents: true,
      vueComponents: true,
    },
  },
})
```

The default source directory is `src/components/ui`. Both `<VButton>` and `<v-button>` resolve
to copied files named `VButton.vue`, `vButton.vue`, or `v-button.vue`. The resolver does not
install components; continue using `@varo-ui/cli add --target weapp` to copy editable source.

`root` defaults to `process.cwd()`; the example supplies the config directory explicitly. Use `sourceRoot` and `componentsDir` if your local layout differs. Component candidates must remain inside the source root, and duplicate normalized names are rejected.

The resolver does not select npm components or install missing source. Use either the npm aggregate stylesheet or your installed source closure as appropriate; do not import global CSS from each native SFC. Repository examples are `apps/platform-smoke/vite.config.mjs` and `apps/playground-weapp/vite.config.ts`.

## Migration from the former Vue Weapp renderer

- `@varo-ui/weapp` now exports native SFC source. Recompile native consumers with the supported compiler instead of bundling the former Vue render functions.
- `@varo-ui/weapp/primitives` and the Vue-Weapp primitive renderer are removed, without a compatibility barrel. Compose native SFCs, or bind neutral `@varo-ui/headless` behavior to Wevu for custom native controls.
- H5 DOM primitives, including body-scroll locking, belong to `@varo-ui/h5/primitives`. Do not import them into native product code.
- Use `SubmitPayload` from `@varo-ui/headless` for form submit/failed handlers (`FormSubmitPayload` in installed form source exports). It contains `values`, `errors`, and optional `event: unknown`; a native event is not a DOM `Event`.
- Disabled/readonly inputs reject mutation; accepted changes notify once and no-ops do not notify. Native Drawer `openChange` carries one `[open, details]` tuple: destructure it and call `details.cancel()` synchronously before the state/model/close transition. Unlike the H5 callback, it does not supply two separate arguments.
- Review downstream edits before reinstalling source. `--force` replaces files; it does not merge customizations. Use `pnpm sync:registry` for repository-owned projections, never hand-edit `packages/ui-weapp/native`.

## Profiles and evidence limits

The `weapp` renderer serves `weapp`, `alipay`, `tt`, `xhs`, `donut-android`, `donut-ios`, and `donut-ohos` install profiles. Only `weapp` is stable; the six additional profiles are experimental and require explicit admission throughout the selected manifest dependency closure. The representative admitted set is `button`, `input`, `input-otp`, `form`, `checkbox`, `switch`, `drawer`, `card`, and `icon` plus required utilities/themes. This is not certification of every npm export; use the CLI profile gate for source selection.

From the repository root:

```bash
pnpm check:platforms
pnpm --filter @varo/platform-smoke build:alipay
pnpm --filter @varo/platform-smoke verify:alipay
```

The first command builds/checks all seven native profiles. The latter two build/check one profile and recheck its existing artifacts, respectively. The IDE/artifact root is `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`; runtime files are inside its nested `dist/`.

Donut uses the WeChat compiler (`weapp`) with distinct `mini-android`, `mini-ios`, or `mini-ohos` host metadata. Artifact checks validate reachable component files, target templates/event bindings, global styles, and host metadata, **not** SDK installation, native packaging, signing, simulator/device interactions, or independent release acceptance. The matching `open:<profile>` command requires your registered AppID and vendor tooling; it does not fabricate credentials. Browser glass-easel previews are trusted artifact tooling, not device proof or security isolation.

[Component documentation](https://varo.weapp.dev/components/) · [Repository](https://github.com/daguanren21/Varo)
