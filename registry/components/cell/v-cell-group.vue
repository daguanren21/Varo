<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = defineProps<{
  className?: ClassValue
  desc?: string
  title?: string
}>()

const classes = computed(() => cn('varo-cell-group', props.className))
</script>

<template>
  <view :class="classes">
    <view v-if="$slots.title || props.title || $slots.desc || props.desc" class="varo-cell-group__header">
      <view v-if="$slots.title || props.title" class="varo-cell-group__title">
        <slot name="title">
          {{ props.title }}
        </slot>
      </view>
      <view v-if="$slots.desc || props.desc" class="varo-cell-group__desc">
        <slot name="desc">
          {{ props.desc }}
        </slot>
      </view>
    </view>
    <view class="varo-cell-group__body">
      <slot />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
