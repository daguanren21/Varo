# @varo-ui/theme

Token-driven themes and providers for Varo H5 and mini-program components.

## Install

```bash
pnpm add @varo-ui/theme
```

## H5 usage

```ts
import { createTheme, provideVaroTheme } from '@varo-ui/theme'

const theme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a'
})
provideVaroTheme({ theme })
```

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
pnpm dlx @varo-ui/cli add --target weapp-vite components/theme-provider
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
