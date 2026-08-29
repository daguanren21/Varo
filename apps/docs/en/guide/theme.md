# Theme

Varo keeps theme ownership inside `@varo-ui/theme` so wrappers can remain token-driven.

## H5

```ts
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
```

## Weapp build-time theme

Use the Vite integration for a fixed app-wide brand theme. It appends the complete `page { --varo-ui-* }` contract to the configured app stylesheet.

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

## Weapp runtime switching

Install the editable target component:

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite components/theme-provider
```

A mini program App has no rendered DOM root. Bind runtime variables at each page root, normally through a shared page shell:

```vue
<script setup lang="ts">
import { createTheme } from '@varo-ui/theme/weapp'
import { shallowRef } from 'wevu'
import VThemeProvider from '@/components/ui/v-theme-provider.vue'

const activeTheme = shallowRef(createTheme({
  primary: '#0f766e',
  success: '#15803d',
  warning: '#c2410c',
  error: '#b91c1c',
  neutral: '#172033'
}))
</script>

<template>
  <VThemeProvider :theme="activeTheme">
    <view>Page content</view>
  </VThemeProvider>
</template>
```

Replacing `activeTheme.value` recomputes the provider's inline CSS Variables, updating every Varo component in its subtree through CSS inheritance.

## Principles

- palette, semantic, and component tokens stay layered
- wrappers consume tokens instead of hard-coding brand styles
- H5 and Weapp share the variable contract while keeping target-specific integration
