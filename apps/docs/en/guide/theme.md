# Theme

Varo manages themes in `@varo-ui/theme`; wrapper components use visual tokens.

Registry styles live in `registry/themes/**/*`, with dependencies declared in component manifests. `themes/base` contains only tokens and foundation rules; component CSS installs with dependencies, and Agent units also require optional `themes/agent`. H5 source imports CSS automatically. Native projects must load all `src/styles/*.css` globally in `app.vue`, with `varo.css` first, never in component-local WXSS. See [Wevu Registry](/en/guide/shadcn-mode). Native npm projects globally load the complete `@varo-ui/weapp/style.css`.

## H5

```ts
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { createApp, shallowRef } from 'vue'

const activeTheme = shallowRef(createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133'
}))

createApp(App).use(VaroConfigProvider, { theme: activeTheme }).mount('#app')
```

Replacing `activeTheme.value` updates the application-level CSS variables. The provider restores the variables it owns when the app unmounts. Use `VaroThemeProvider` when multiple theme scopes share one document:

```vue
<script setup lang="ts">
import { VaroThemeProvider } from '@varo-ui/theme'
</script>

<template>
  <VaroThemeProvider :theme="activeTheme">
    <RouterView />
  </VaroThemeProvider>
</template>
```

Theme seeds use `#RGB` or `#RRGGBB` so Varo can derive contrast-safe foregrounds. When `VButton color` uses a CSS variable, named color, or `rgb()`, also provide `foreground-color`.

## Weapp build-time theme

For a fixed app-wide brand theme, the Vite integration appends all `page { --varo-ui-* }` variables to the configured app stylesheet.

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
pnpm dlx @varo-ui/cli add --target weapp components/theme-provider
```

A mini program App has no rendered DOM root. Bind runtime variables at each page root, normally through a shared page shell:

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

Replacing `activeTheme.value` recalculates inline CSS variables; Varo components in the provider's subtree inherit the update.

## Dark mode

`mode: 'dark'` generates the dark text, border, fill, and background scales while preserving WeChat Green and semantic colors:

```ts
const darkTheme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a',
  mode: 'dark'
})
```

## Principles

- Maintain separate layers for palette, semantic, and component tokens
- Use tokens in wrappers instead of hard-coding brand styles
- Share the same variables between H5 and Weapp, with separate integration for each target
