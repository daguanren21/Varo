<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    text?: string
    tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  }>(),
  {
    size: 'md',
    text: '',
    tone: 'default'
  }
)
</script>

<template>
  <view class="varo-loading" role="status" :data-size="size" :data-tone="tone">
    <text class="varo-loading__spinner" aria-hidden="true" />
    <text v-if="text || $slots.default" class="varo-loading__text"><slot>{{ text }}</slot></text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
