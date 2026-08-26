<script setup lang="ts">
</script>

<template>
  <view class="app-root">
    <slot />
  </view>
</template>

<style>
@import './styles.css';
@import './styles/varo.css';

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
  "pages": ["pages/mall/index", "pages/index/index"],
  "window": {
    "navigationBarTitleText": "Varo AI 商城",
    "navigationBarBackgroundColor": "#e1251b",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f5f5f5"
  }
}
</json>
