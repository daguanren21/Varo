<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VAvatar from './avatar.vue'

interface AvatarGroupItem {
  id: string | number
  src?: string
  alt?: string
  fallback?: string
}

defineOptions({
  properties: {
    max: { type: null, value: null },
  },
})

const props = withDefaults(
  defineProps<{
    items?: AvatarGroupItem[]
    max?: number
    overlap?: number | string
    size?: number | string
    ariaLabel?: string
    className?: ClassValue
  }>(),
  {
    items: () => [],
    max: undefined,
    overlap: 10,
    size: 40,
    ariaLabel: '',
    className: undefined,
  },
)

const classes = computed(() => cn('varo-avatar-group', props.className))
const visibleItems = computed(() => props.max == null ? props.items : props.items.slice(0, Math.max(0, props.max)))
const hiddenCount = computed(() => props.items.length - visibleItems.value.length)
const overflowLabel = computed(() => `${hiddenCount.value} more`)
const groupLabel = computed(() => props.ariaLabel || (hiddenCount.value > 0 ? overflowLabel.value : ''))
const groupStyle = computed(() => ({
  '--varo-avatar-group-overlap': typeof props.overlap === 'number' ? `${props.overlap}px` : props.overlap,
}))
const overflowStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size
  return { width: size, height: size }
})
</script>

<template>
  <view :class="classes" :style="groupStyle" :aria-label="groupLabel">
    <view v-for="item in visibleItems" :key="item.id" class="varo-avatar-group__item">
      <VAvatar :src="item.src" :alt="item.alt" :fallback="item.fallback" :size="props.size" />
    </view>
    <view v-if="hiddenCount" class="varo-avatar-group__more" :style="overflowStyle" :aria-label="overflowLabel">
      <text>+{{ hiddenCount }}</text>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared",
  "usingComponents": {
    "VAvatar": "./avatar"
  }
}
</json>
