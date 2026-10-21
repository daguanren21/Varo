# Wevu Registry Mode

The CLI copies native Wevu source for the selected profile into your project. Import and edit it from `src/components/ui/*`. See [Installation](/en/guide/installation#install-profiles-and-support-boundaries) for profiles and experimental support limits.

## One-Time Wevu Project Setup

Configure global styles and Tailwind once per project.

### Install Build And Style Dependencies

```bash
pnpm add wevu clsx @weapp-tailwindcss/merge
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
```

The CLI recursively copies Registry files and lists npm `Dependencies:` and `Dev dependencies:` without modifying `package.json` or running a package manager. After each `add`, use `pnpm add` / `pnpm add -D` to install reported packages that are missing, including component dependencies such as `@varo-ui/headless` and `@varo-ui/theme`. Native Registry source needs no Vue renderer; `@varo-ui/weapp` is another way to obtain native source.

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

Install at least one component and its dependencies to create `src/styles/`. In `vite.config.ts`, collect all CSS, put `varo.css` first, register it globally, and configure Tailwind:

```ts
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname
const registryStyles = readdirSync(resolve(root, 'src/styles'))
  .filter(name => name.endsWith('.css'))
  .sort((left, right) => left === 'varo.css' ? -1 : right === 'varo.css' ? 1 : left.localeCompare(right))

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    styles: [
      ...registryStyles.map(name => ({ source: `styles/${name}`, include: 'app.vue' })),
      { source: 'styles.css', include: 'app.vue' },
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

Each `styles.source` is relative to `srcRoot`. `themes/base` installs `src/styles/varo.css` with tokens and foundation rules only. Component manifests install their own CSS; Agent units also need `varo-agent.css` from `themes/agent`. After adding components, restart the build to collect all styles, including `varo.css`. This matches `apps/platform-smoke/vite.config.mjs`: foundation styles load before component CSS.

Load all these files globally through `weapp.styles` with `include: 'app.vue'`. Retain `styleIsolation: apply-shared` in native SFCs. Do not import global theme or component CSS into component-local `<style>` / WXSS: application-level selectors cannot appear in component WXSS. H5 Registry source automatically imports its full CSS dependency closure and does not use this native global registration.

### Supplemental Native Component Styles

Prefer Tailwind utilities. Use ordinary `<style>` blocks with component-specific classes for keyframes, complex grids, and other supplemental styles, while retaining `styleIsolation: apply-shared` in component JSON.

Do not use Vue `<style scoped>` in native components: the current build pipeline emits `[data-v-*]` attribute selectors, which component WXSS does not allow. Component styles must also avoid tag, ID, and attribute selectors. Express selected, disabled, and similar visual states with classes precomputed in script instead of selectors such as `[data-selected]`.

The repository's mini-program build recursively checks component WXSS and its stylesheet imports, failing on unsupported selectors. This component-only restriction does not require removing the `button` rules in the global application entry above.

## Install Components

```bash
pnpm dlx @varo-ui/cli add --target weapp button form toast
```

Replace the names at the end with the components you need. To install a Block or minimal Agent conversation:

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
```

`agent-chat` installs conversation components and dependencies only, excluding advanced, RAG, and fine-tune files. Install `components/agent-ui` for the full suite; see [Agent installation](/en/ai/) for individual units.

`--target alipay|tt|xhs|donut-android|donut-ios|donut-ohos` selects one of six experimental profiles, not interchangeable values for `weapp.platform`. Alipay, Douyin, and Xiaohongshu use their own compiler platforms; Donut uses the `weapp` compiler and host metadata. Every item and transitive dependency must explicitly support the selected profile, or installation fails without falling back to WeChat source. A successful build still needs device validation.

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
