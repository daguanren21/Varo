<script setup lang="ts">
import { computed } from 'wevu'
import VImage from './v-image.vue'

// WeChat validates initial child bindings before Wevu applies setup defaults.
defineOptions({
  properties: {
    alt: { type: null, value: '' },
    fallback: { type: null, value: '' },
    src: { type: null, value: '' },
  },
})

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
    src: '',
  },
)

const safeAlt = computed(() => props.alt || '')
const safeFallback = computed(() => props.fallback || '')
const safeSource = computed(() => props.src || '')
const dimension = computed(() => {
  const value = props.size || 40
  return typeof value === 'number' ? `${value}px` : value
})
</script>

<template>
  <view
    class="varo-avatar"
    role="img"
    :aria-label="safeAlt || undefined"
    :data-shape="props.shape"
    :style="{ width: dimension, height: dimension }"
  >
    <VImage v-if="safeSource" :src="safeSource" :alt="safeAlt" width="100%" height="100%" fit="cover">
      <template #error>
        <text class="varo-avatar__fallback">
          <slot name="fallback">
            {{ safeFallback }}
          </slot>
        </text>
      </template>
    </VImage>
    <text v-else class="varo-avatar__fallback">
      <slot name="fallback">
        {{ safeFallback }}
      </slot>
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
