<script setup lang="ts">
import type { ThemeCssVariableOverrides, ThemeDefinition } from '@varo-ui/theme/weapp'
import { createWeappThemeStyle } from '@varo-ui/theme/weapp'
import { computed } from 'wevu'

const props = defineProps<{
  theme: ThemeDefinition
  variables?: ThemeCssVariableOverrides
}>()

const themeStyle = computed(() => createWeappThemeStyle(props.theme, {
  variables: props.variables,
}))
</script>

<template>
  <view class="varo-theme-provider" :style="themeStyle">
    <slot />
  </view>
</template>

<style scoped>
.varo-theme-provider {
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 100%;
  color: var(--varo-ui-text);
  background-color: var(--varo-ui-bg);
}
</style>

<component lang="json">
{
  "component": true
}
</component>
