# @varo-ui/theme

Token-driven themes and providers for Varo H5 and mini-program components.

## Install

```bash
pnpm add @varo-ui/theme
```

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

The plugin appends `page { --varo-ui-* }` declarations to the app stylesheet.

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

[Theme documentation](https://daguanren21.github.io/Varo/guide/theme) · [Repository](https://github.com/daguanren21/Varo)
