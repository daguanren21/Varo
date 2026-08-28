<script setup lang="ts" generic="T extends object = WechatMiniprogram.IAnyObject">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(defineProps<{
  className?: ClassValue
  height?: number | string
  items?: T[]
  reachBottomThreshold?: number | string
}>(), {
  height: '100%',
  items: () => [],
  reachBottomThreshold: 50,
})

const emit = defineEmits<{
  reachBottom: []
}>()
defineSlots<{
  default: (props: { index: number, item: T }) => unknown
  footer: () => unknown
  header: () => unknown
}>()

const classes = computed(() => cn('block w-full', props.className))
const styles = computed(() => ({ height: typeof props.height === 'number' ? `${props.height}px` : props.height }))
function itemKey(item: T, index: number) {
  if ('id' in item && (typeof item.id === 'string' || typeof item.id === 'number')) { return item.id }
  return index
}
</script>

<template>
  <scroll-view
    scroll-y
    :class="classes"
    :lower-threshold="Number(reachBottomThreshold)"
    :style="styles"
    @scrolltolower="emit('reachBottom')"
  >
    <slot name="header" />
    <view v-for="(item, index) in items" :key="itemKey(item, index)" class="aed-virtual-list__item">
      <slot :index="index" :item="item" />
    </view>
    <slot name="footer" />
  </scroll-view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
