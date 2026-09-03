<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    offset?: number | string
    span?: number | string
  }>(),
  {
    offset: 0,
    span: 24,
  },
)

const classes = computed(() =>
  cn(
    'varo-col',
    `span-${String(props.span)}`,
    `offset-${String(props.offset)}`,
    props.className,
  ),
)
const rootStyle = computed(() => ({
  '--varo-col-offset': props.offset,
  '--varo-col-span': props.span,
}))
</script>

<template>
  <view
    :class="classes"
    :style="rootStyle"
    :data-offset="String(props.offset)"
    :data-span="String(props.span)"
  >
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
