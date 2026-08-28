<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(defineProps<{
  align?: 'start' | 'center' | 'end' | 'stretch'
  className?: ClassValue
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
}>(), {
  align: 'center',
  justify: 'start',
})

const classes = computed(() => cn(
  'flex',
  props.align === 'start' && 'items-start',
  props.align === 'center' && 'items-center',
  props.align === 'end' && 'items-end',
  props.align === 'stretch' && 'items-stretch',
  props.justify === 'start' && 'justify-start',
  props.justify === 'center' && 'justify-center',
  props.justify === 'end' && 'justify-end',
  props.justify === 'between' && 'justify-between',
  props.justify === 'around' && 'justify-around',
  props.className,
))
</script>

<template>
  <view :class="classes">
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
