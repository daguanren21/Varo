<script setup lang="ts">
withDefaults(defineProps<{
  isOpened?: boolean
  title?: string
}>(), {
  isOpened: false,
  title: '',
})
</script>

<template>
  <AedPopup :is-opened="isOpened" :title="title">
    <slot />
  </AedPopup>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
