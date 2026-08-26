<script setup lang="ts">
withDefaults(
  defineProps<{
    interactive?: boolean
    padding?: boolean
    variant?: 'default' | 'outline' | 'elevated' | 'muted'
  }>(),
  {
    interactive: false,
    padding: true,
    variant: 'default'
  }
)
</script>

<template>
  <view
    :class="[
      'varo-card',
      `varo-card--${variant}`,
      padding && 'varo-card--padded',
      interactive && 'varo-card--interactive'
    ]"
    :data-interactive="String(interactive)"
    :data-variant="variant"
  >
    <view v-if="$slots.header || $slots.title || $slots.description" class="varo-card__header">
      <slot name="header">
        <text v-if="$slots.title" class="varo-card__title"><slot name="title" /></text>
        <text v-if="$slots.description" class="varo-card__description"><slot name="description" /></text>
      </slot>
    </view>
    <view class="varo-card__content"><slot /></view>
    <view v-if="$slots.footer" class="varo-card__footer"><slot name="footer" /></view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
