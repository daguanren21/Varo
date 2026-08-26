<script setup lang="ts">
import VIcon from './v-icon.vue'
import VImage from './v-image.vue'

withDefaults(
  defineProps<{
    description?: string
    icon?: string
    image?: string
    size?: 'sm' | 'md' | 'lg'
    title?: string
  }>(),
  {
    description: '暂无数据',
    icon: 'info',
    image: '',
    size: 'md',
    title: ''
  }
)
</script>

<template>
  <view class="varo-empty" role="status" :data-size="size">
    <view class="varo-empty__visual" aria-hidden="true">
      <slot name="image">
        <VImage v-if="image" :src="image" width="100%" height="100%" fit="contain" />
        <VIcon v-else :name="icon" :size="size === 'lg' ? 44 : size === 'sm' ? 28 : 36" />
      </slot>
    </view>
    <text v-if="title || $slots.title" class="varo-empty__title"><slot name="title">{{ title }}</slot></text>
    <text class="varo-empty__description"><slot name="description">{{ description }}</slot></text>
    <view v-if="$slots.default" class="varo-empty__action"><slot /></view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
