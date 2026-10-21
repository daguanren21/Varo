# @varo-ui/theme

Theme tokens and providers for Varo H5 and mini-program components.

## Install

```bash
pnpm add @varo-ui/theme
```

## Entrypoints and style ownership

- `@varo-ui/theme` provides H5 Vue providers plus theme/token helpers.
- `@varo-ui/theme/weapp` provides native-safe pure theme/CSS helpers without the H5 provider or DOM binding.
- `@varo-ui/theme/weapp-vite` is a build-time plugin, not a native component runtime.
- Source subpaths `/source`, `/source/theme`, `/source/weapp`, and `/source/weapp-vite` remain declared exports. Native product code must use the native-safe branch, not the H5 root/provider.

The theme engine resolves CSS variables. Component styles are installed separately: Registry `themes/base` contains tokens and foundation rules, component manifests declare CSS from `registry/themes/components/**`, and optional Agent tokens and native helpers come from `themes/agent`, which depends on the base.

To change repository styles, edit `registry/themes/base/seed.json`, `foundation.css`, component CSS, or Agent token/helper sources, then run `pnpm sync:registry`. This generates base and Agent CSS for each target, package stylesheets, renderer imports, and installed copies. Use `pnpm check:generated` to check for drift; fix component styles in their source files before regenerating.

## H5 application theme

Use `VaroConfigProvider` to apply one theme's CSS variables across the application:

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

`provideVaroTheme({ theme, overrides })` makes the resolved theme available to descendants through `useVaroTheme()`. It neither binds CSS variables nor renders a wrapper. Use `VaroConfigProvider` or `VaroThemeProvider` when components also need those variables applied to the page.

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

The plugin generates theme variables; you still need the component styles. Repository builds use `weapp-vite`/`wevu` 7.5.0. For Registry installations, configure `weapp.styles` to load every installed `src/styles/*.css` file in `app.vue`, starting with `varo.css` and ending with your application overrides. For native npm components, put `@import "@varo-ui/weapp/style.css";` in local `src/package.css` and register `{ source: 'package.css', include: 'app.vue' }` globally. `weapp.styles.source` does not accept an absolute package path.

Keep page and global CSS out of component-local WXSS in `apply-shared` SFCs. H5 source imports dependency CSS automatically; native applications load it globally. See the [native stylesheet configuration](../ui-weapp/README.md#global-npm-stylesheet) and `apps/platform-smoke/vite.config.mjs`.

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

Check platform support for the components using the theme. `h5` and `weapp` are stable installation profiles. `alipay`, `tt`, `xhs`, and the three Donut profiles are experimental: each component and all its dependencies must declare support in their manifests. A theme helper or provider example alone does not establish that support. SDK packaging, signing, and device theme behavior need verification beyond compiler and artifact checks.

[Theme documentation](https://varo.weapp.dev/guide/theme) · [Repository](https://github.com/daguanren21/Varo)
