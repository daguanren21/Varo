<script setup lang="ts">
import { createTheme, VaroConfigProvider } from '@varo/theme'

const theme = createTheme({
  primary: '#0f766e',
  success: '#15803d',
  warning: '#c2410c',
  error: '#b91c1c',
  neutral: '#172033'
})

// Keep provider config available for page-level composition.
void theme
void VaroConfigProvider
</script>

<template>
  <view class="app-root">
    <slot />
  </view>
</template>

<style>
page {
  background: #f4f7fb;
  color: #172033;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.app-root {
  min-height: 100vh;
}
</style>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/app.json",
  "pages": ["pages/index/index"],
  "window": {
    "navigationBarTitleText": "Varo Weapp Playground",
    "navigationBarBackgroundColor": "#0f766e",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f4f7fb"
  }
}
</json>
