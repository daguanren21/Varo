<script setup lang="ts">
import type { PropType } from 'wevu'
import { computed } from 'wevu'
import VImage from './v-image.vue'

const props = defineProps({
  alt: { type: null as unknown as PropType<string>, default: '' },
  fallback: { type: null as unknown as PropType<string>, default: '' },
  shape: { type: String as PropType<'circle' | 'rounded' | 'square'>, default: 'circle' },
  size: { type: null as unknown as PropType<number | string>, default: 40 },
  src: { type: null as unknown as PropType<string>, default: '' },
})

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
