<script setup lang="ts">
import type { ClassValue } from '@weapp-tailwindcss/merge'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(defineProps<{
  className?: ClassValue
  color?: string
  content?: string
  fontSize?: number
  fontWeight?: number | string
  gapX?: number
  gapY?: number
  offsetX?: number
  offsetY?: number
  opacity?: number
  rotate?: number
  zIndex?: number
}>(), {
  className: undefined,
  color: '#172033',
  content: 'Varo',
  fontSize: 14,
  fontWeight: 500,
  gapX: 160,
  gapY: 96,
  offsetX: 0,
  offsetY: 0,
  opacity: 0.12,
  rotate: -22,
  zIndex: 9,
})

function normalizeOffset(offset: number, gap: number) {
  const phase = ((offset % gap) + gap) % gap
  return phase > gap / 2 ? phase - gap : phase
}

const watermarkTiles = Array.from({ length: 80 }, (_, index) => index)
const classes = computed(() => cn('varo-watermark', props.className))
const rootStyle = computed(() => {
  const gapX = Math.max(24, props.gapX)
  const gapY = Math.max(24, props.gapY)
  return [
    `--varo-watermark-color: ${props.color}`,
    `--varo-watermark-font-size: ${Math.max(1, props.fontSize)}px`,
    `--varo-watermark-font-weight: ${props.fontWeight}`,
    `--varo-watermark-gap-x: ${gapX}px`,
    `--varo-watermark-gap-y: ${gapY}px`,
    `--varo-watermark-offset-x: ${normalizeOffset(props.offsetX, gapX)}px`,
    `--varo-watermark-offset-y: ${normalizeOffset(props.offsetY, gapY)}px`,
    `--varo-watermark-opacity: ${Math.min(1, Math.max(0, props.opacity))}`,
    `--varo-watermark-rotate: ${props.rotate}deg`,
    `--varo-watermark-z-index: ${props.zIndex}`,
  ].join('; ')
})
</script>

<template>
  <view
    :class="classes"
    :data-watermark="props.content"
    :style="rootStyle"
  >
    <view class="varo-watermark__content">
      <slot />
    </view>
    <view
      v-if="props.content.length > 0"
      aria-hidden="true"
      class="varo-watermark__overlay"
    >
      <text
        v-for="tile in watermarkTiles"
        :key="tile"
        class="varo-watermark__item"
      >
        {{ props.content }}
      </text>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
