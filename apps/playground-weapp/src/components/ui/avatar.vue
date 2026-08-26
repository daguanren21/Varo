<script setup lang="ts">
import { computed } from 'wevu'
import VImage from './v-image.vue'

const props = withDefaults(
  defineProps<{
    alt?: string
    fallback?: string
    shape?: 'circle' | 'rounded' | 'square'
    size?: number | string
    src?: string
  }>(),
  {
    alt: '',
    fallback: '',
    shape: 'circle',
    size: 40,
    src: ''
  }
)

const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <view
    class="varo-avatar"
    role="img"
    :aria-label="alt || undefined"
    :data-shape="shape"
    :style="{ width: dimension, height: dimension }"
  >
    <VImage v-if="src" :src="src" :alt="alt" width="100%" height="100%" fit="cover">
      <template #error>
        <text class="varo-avatar__fallback"><slot name="fallback">{{ fallback }}</slot></text>
      </template>
    </VImage>
    <text v-else class="varo-avatar__fallback"><slot name="fallback">{{ fallback }}</slot></text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
