<script setup lang="ts">
import type { ThemeDefinition } from '@varo-ui/theme/weapp'
import VThemeProvider from './ui/v-theme-provider.vue'

defineProps<{ component: string, theme: ThemeDefinition }>()
const variables = { '--varo-ui-bg': 'transparent' } as const
</script>

<template>
  <VThemeProvider :theme="theme" :variables="variables">
    <view class="docs-demo" :data-docs-component="component">
      <slot />
    </view>
  </VThemeProvider>
</template>

<component lang="json">
{
  "component": true,
  "options": { "styleIsolation": "apply-shared" }
}
</component>
