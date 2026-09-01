# Wevu Registry Mode

The CLI copies Wevu mini-program component source into your project. Import it from `src/components/ui/*` and edit it as application code.

## Install

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
