# Wevu Registry Mode

The CLI copies Wevu 7 mini-program component source into your project. Import it from `src/components/ui/*` and edit it as application code.

## One-Time Wevu 7 Project Setup

Complete this global stylesheet and Tailwind setup once per project. Do not repeat it on individual component pages.

### Install Build And Style Dependencies

```bash
pnpm add wevu clsx @weapp-tailwindcss/merge
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
```

The CLI recursively copies Registry files and prints npm `Dependencies:` and `Dev dependencies:`, but it does not modify `package.json` or run a package manager. After every `add`, use `pnpm add` / `pnpm add -D` to install every reported package that is not already present. Depending on the selected components, the output can also include packages such as `@varo-ui/headless` and `@varo-ui/weapp`.

### Create The Tailwind Stylesheet Entry

Use the same Tailwind v4 entry as the Varo mini-program playground in `src/styles.css`:

```css
@layer theme, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css';

@layer base {
  button {
    line-height: inherit;
  }

  button::after {
    border: 0;
  }
}
```

### Register Managed Global Styles

Register the Tailwind entry and the Registry-installed theme file in the `weapp` section of `vite.config.ts`, together with the managed Tailwind configuration:

```ts
import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    styles: [
      { source: 'styles.css', include: 'app.vue' },
      { source: 'styles/varo.css', include: 'app.vue' },
    ],
    tailwindcss: {
      appType: 'weapp-vite',
      cssEntries: [resolve(root, 'src/styles.css')],
      cssOptions: {
        cssPreflight: false,
        rem2rpx: true,
        cssRemoveActivePseudoClass: true,
      },
      ignoreCallExpressionIdentifiers: ['cn'],
      logLevel: 'warn',
    },
  },
})
```

Each `styles` source is relative to `srcRoot`. The component dependency on `themes/base` installs `src/styles/varo.css`; `weapp.styles` injects both stylesheet entries into `app.vue` once, so do not import them again in individual pages or components.

### Supplemental Native Component Styles

Prefer Tailwind utilities. Use ordinary `<style>` blocks with component-specific classes for keyframes, complex grids, and other supplemental styles, while retaining `styleIsolation: apply-shared` in component JSON.

Do not use Vue `<style scoped>` in native components: the current build pipeline emits `[data-v-*]` attribute selectors, which component WXSS does not allow. Component styles must also avoid tag, ID, and attribute selectors. Express selected, disabled, and similar visual states with classes precomputed in script instead of selectors such as `[data-selected]`.

The repository's mini-program build recursively checks component WXSS and its stylesheet imports, failing on unsupported selectors. This component-only restriction does not require removing the `button` rules in the global application entry above.

## Install Components

```bash
pnpm dlx @varo-ui/cli add --target weapp button form toast
```

Replace the names at the end with the components you need. To install a Block or Agent UI:

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

Existing files are preserved by default. Use `--force` only after reviewing local changes:

```bash
pnpm dlx @varo-ui/cli add --target weapp --force button
```

## Use

```vue
<script setup lang="ts">
import { shallowRef } from 'wevu'
import VButton from '@/components/ui/v-button.vue'

const loading = shallowRef(false)
</script>

<template>
  <VButton :loading="loading" @click="loading = true">
    Save
  </VButton>
</template>
```

Component source, dependency utilities, and theme files stay in the application and can be edited directly.
