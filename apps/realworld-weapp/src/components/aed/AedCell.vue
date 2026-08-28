<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

interface IconInfo {
  color?: string
  size?: number | string
  value?: string
}

const props = withDefaults(defineProps<{
  arrow?: string
  className?: ClassValue
  extraText?: string
  hasBorder?: boolean
  iconInfo?: IconInfo
  note?: string
  title?: string
}>(), {
  arrow: '',
  extraText: '',
  hasBorder: true,
  note: '',
  title: '',
})

const classes = computed(() => cn(
  'flex min-h-14 items-center gap-3 bg-white px-4 py-3',
  props.hasBorder && 'border-b border-slate-100',
  props.className,
))
const iconSize = computed(() => Number(props.iconInfo?.size) || 20)
</script>

<template>
  <view :class="classes" @tap="$emit('click', $event)">
    <VIcon v-if="iconInfo?.value" :color="iconInfo.color" :name="iconInfo.value" :size="iconSize" />
    <view class="min-w-0 flex-1">
      <text class="block text-base text-slate-900">
        {{ title }}
      </text>
      <text v-if="note" class="mt-1 block text-sm text-slate-500">
        {{ note }}
      </text>
    </view>
    <text v-if="extraText" class="max-w-[45%] text-right text-sm text-slate-500">
      {{ extraText }}
    </text>
    <text v-if="arrow" class="text-lg text-slate-400">
      ›
    </text>
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
