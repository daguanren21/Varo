# @varo-ui/weapp

Native Wevu `.vue` components and a resolver for Varo mini-program projects. The package exports source for the `weapp-vite` compiler; it contains neither Vue render functions nor a precompiled JavaScript runtime.

## Install

```bash
pnpm add @varo-ui/weapp wevu
pnpm add -D weapp-vite
```

The supported peer range for `weapp-vite` and `wevu` is `>=7.2.1 <8`.

## Usage

```vue
<script setup lang="ts">
import { VButton } from '@varo-ui/weapp'
</script>

<template>
  <VButton>Continue</VButton>
</template>
```

You can also import a component by filename:

```ts
import VButton from '@varo-ui/weapp/components/v-button.vue'
```

Both imports require the native SFC compiler and cannot run directly in a browser Vue application or plain Node.js. The npm package and editable installations use the same Registry source and dependencies.

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

`weapp.styles.source` resolves paths within the application source tree, so use the local file shown above, not an absolute `node_modules` path. Its CSS import loads the package stylesheet. The CSS-only export `@varo-ui/weapp/source/style.css` provides the same stylesheet.

Native `apply-shared` components use page tokens and global component selectors from the application stylesheet. Keep both package stylesheets out of component-local WXSS.

## Editable Registry source

```bash
pnpm dlx @varo-ui/cli add --target weapp button input card
```

Install the npm dependencies reported by the CLI. Registry installation copies all required CSS into `src/styles/`: `varo.css` contains tokens and foundation styles, component styles have separate files, and Agent components add `varo-agent.css`. Load all installed CSS files globally, with `varo.css` first, to include both base and component styles.

## Editable Registry source resolver

`VaroResolver` finds Varo SFCs already installed in your project and passes them to
`weapp-vite` for compilation when used. Unused components stay out of production entries.

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

The resolver only uses local source files; it neither selects npm components nor installs missing files. Load the npm stylesheet for npm components, or all installed styles for Registry components. Keep global CSS out of individual native SFCs. See `apps/platform-smoke/vite.config.mjs` and `apps/playground-weapp/vite.config.ts` for repository examples.

## Migration from the former Vue Weapp renderer

- `@varo-ui/weapp` now exports native SFC source. Recompile native consumers with the supported compiler instead of bundling the former Vue render functions.
- `@varo-ui/weapp/primitives` and the Vue-Weapp primitive renderer are removed, without a compatibility barrel. Compose native SFCs, or bind neutral `@varo-ui/headless` behavior to Wevu for custom native controls.
- H5 DOM primitives, including body-scroll locking, belong to `@varo-ui/h5/primitives`. Do not import them into native product code.
- Use `SubmitPayload` from `@varo-ui/headless` for form submit/failed handlers (`FormSubmitPayload` in installed form source exports). It contains `values`, `errors`, and optional `event: unknown`; a native event is not a DOM `Event`.
- Disabled/readonly inputs reject mutation; accepted changes notify once and no-ops do not notify. Native Drawer `openChange` carries one `[open, details]` tuple: destructure it and call `details.cancel()` synchronously before the state/model/close transition. Unlike the H5 callback, it does not supply two separate arguments.
- Review downstream edits before reinstalling source. `--force` replaces files; it does not merge customizations. Use `pnpm sync:registry` for repository-owned projections, never hand-edit `packages/ui-weapp/native`.

## Profiles and evidence limits

The `weapp` renderer is used by the `weapp`, `alipay`, `tt`, `xhs`, `donut-android`, `donut-ios`, and `donut-ohos` installation profiles. Only `weapp` is stable. For any of the six experimental profiles, every selected component and dependency must declare support in its manifest. Representative components are `button`, `input`, `input-otp`, `form`, `checkbox`, `switch`, `drawer`, `card`, and `icon`, with their utilities and themes. Use the CLI to select supported source; this list does not certify every npm export.

From the repository root:

```bash
pnpm check:platforms
pnpm --filter @varo/platform-smoke build:alipay
pnpm --filter @varo/platform-smoke verify:alipay
```

The first command builds/checks all seven native profiles. The latter two build/check one profile and recheck its existing artifacts, respectively. The IDE/artifact root is `apps/platform-smoke/.generated/<profile>/dist/<compilerPlatform>`; runtime files are inside its nested `dist/`.

Donut uses the WeChat compiler (`weapp`) and selects its host through `mini-android`, `mini-ios`, or `mini-ohos` metadata. Artifact checks cover reachable component files, templates and event bindings, global styles, and host metadata. SDK installation, native packaging, signing, simulator and device checks, and independent release review need separate verification. To use `open:<profile>`, supply your registered AppID and vendor tools; the command does not generate credentials. Run only trusted artifacts in the glass-easel browser preview, which provides neither security isolation nor proof of device behavior.

[Component documentation](https://varo.weapp.dev/components/) · [Repository](https://github.com/daguanren21/Varo)
