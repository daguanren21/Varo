# @varo-ui/theme

Token-driven themes and providers for Varo H5 and mini-program components.

## Install

```bash
pnpm add @varo-ui/theme
```

## Entrypoints and style ownership

- `@varo-ui/theme` provides H5 Vue providers plus theme/token helpers.
- `@varo-ui/theme/weapp` provides native-safe pure theme/CSS helpers without the H5 provider or DOM binding.
- `@varo-ui/theme/weapp-vite` is a build-time plugin, not a native component runtime.
- Source subpaths `/source`, `/source/theme`, `/source/weapp`, and `/source/weapp-vite` remain declared exports. Native product code must use the native-safe branch, not the H5 root/provider.

The theme engine resolves variables; it is not a monolithic component stylesheet. Registry `themes/base` owns only tokens and foundation rules. Each ordinary component manifest owns its CSS from `registry/themes/components/**`; optional Agent tokens/native helpers belong to `themes/agent`, which depends on the base.

In the repository, edit `registry/themes/base/seed.json`, `foundation.css`, component CSS, or Agent token/helper sources, then run `pnpm sync:registry`. Base/Agent target CSS, package aggregate CSS, renderer style imports, and installed copies are generated. `pnpm check:generated` detects drift; do not patch a generated aggregate to fix a component style.

## H5 application theme

Use `VaroConfigProvider` when one theme owns the application-level CSS variables:

```ts
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { createApp, shallowRef } from 'vue'
import App from './App.vue'

const activeTheme = shallowRef(createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a'
}))

createApp(App)
  .use(VaroConfigProvider, { theme: activeTheme })
  .mount('#app')
```

The plugin provides the resolved theme for injection and binds its CSS variables to `document.documentElement` by default. Pass `target` in the configuration to bind another element. Replacing a reactive `theme` or `overrides` value updates the bound variables.

## H5 scoped theme

Use `VaroThemeProvider` to render a CSS-variable scope inside an application:

```vue
<script setup lang="ts">
import { createTheme, VaroThemeProvider } from '@varo-ui/theme'

const sectionTheme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a'
})
</script>

<template>
  <VaroThemeProvider :theme="sectionTheme">
    <RouterView />
  </VaroThemeProvider>
</template>
```

`VaroThemeProvider` applies the resolved variables to its wrapper element and provides the same theme to descendants. Its `overrides` prop accepts component and token overrides.

## Injection-only theme context

`provideVaroTheme({ theme, overrides })` only provides the resolved theme for descendants that call `useVaroTheme()`. It does not bind CSS variables or render a themed wrapper, so it is not a replacement for `VaroConfigProvider` or `VaroThemeProvider` when components need visual theme variables.

## Weapp build-time theme

```ts
import { resolve } from 'node:path'
import { createVaroWeappThemePlugin } from '@varo-ui/theme/weapp-vite'
import { defineConfig } from 'weapp-vite/config'
import { theme } from './src/theme'

export default defineConfig({
  plugins: [
    createVaroWeappThemePlugin({
      appStyle: resolve(import.meta.dirname, 'src/app.scss'),
      theme
    })
  ]
})
```

The plugin transforms source CSS before preprocessing and appends `page { --varo-ui-* }` declarations after native CSS emission, so styles loaded through native sidecars retain the configured theme overrides.

This generates theme variables, not the complete component style closure. Use `weapp-vite`/`wevu` 7.4.0 for the repository baseline. For Registry source installs, configure `weapp.styles` to include **every installed `src/styles/*.css`** in `app.vue`, with `varo.css` first and your application overrides afterward. For npm-native components, put `@import "@varo-ui/weapp/style.css";` in local `src/package.css` and globally register `{ source: 'package.css', include: 'app.vue' }` instead; an absolute package path is not a supported `weapp.styles.source`.

Do not import page/global CSS into component-local WXSS of `apply-shared` SFCs. H5 installed source imports its dependency CSS automatically; native source deliberately leaves global loading to the application. See the [native stylesheet configuration](../ui-weapp/README.md#global-npm-stylesheet) and repository `apps/platform-smoke/vite.config.mjs`.

## Weapp runtime theme switching

Install the editable provider:

```bash
pnpm dlx @varo-ui/cli add --target weapp components/theme-provider
```

Bind a reactive theme at each page root:

```vue
<script setup lang="ts">
import { createTheme } from '@varo-ui/theme/weapp'
import { shallowRef } from 'wevu'
import VThemeProvider from '@/components/ui/v-theme-provider.vue'

const activeTheme = shallowRef(createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a'
}))
</script>

<template>
  <VThemeProvider :theme="activeTheme">
    <view>Page content</view>
  </VThemeProvider>
</template>
```

Pass `mode: 'dark'` to generate the dark text, border, fill, background, shadow, and semantic soft-color scales.

Theme support does not broaden platform admission. `h5` and `weapp` are stable install profiles; `alipay`, `tt`, `xhs`, and the three Donut profiles are experimental and require explicit manifest admission for the whole selected closure. In particular, a theme helper or provider example is not proof that an item is admitted on every native host. Compiler/artifact checks do not certify SDK packaging, signing, or device theme behavior.

[Theme documentation](https://varo.weapp.dev/guide/theme) · [Repository](https://github.com/daguanren21/Varo)
