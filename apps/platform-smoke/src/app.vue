<script setup lang="ts">
</script>

<template>
  <view class="platform-smoke-app">
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "pages": ["pages/index/index"],
  "window": {
    "navigationBarTitleText": "Varo platform smoke"
  }
}
</json>
