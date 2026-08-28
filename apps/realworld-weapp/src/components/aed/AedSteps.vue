<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

interface StepItem {
  desc?: string
  title?: string
}

const props = withDefaults(defineProps<{
  className?: ClassValue
  current?: number | string
  items?: StepItem[]
}>(), {
  current: 0,
  items: () => [],
})

const classes = computed(() => cn('flex items-start', props.className))
const steps = computed(() => props.items.map((item, index) => {
  const active = index <= Number(props.current)
  return {
    ...item,
    active,
    key: `${index}-${item.title ?? ''}`,
    markerClass: active ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500',
    number: index + 1,
    titleClass: active ? 'text-orange-600' : 'text-slate-500',
  }
}))
</script>

<template>
  <view :class="classes">
    <view v-for="step in steps" :key="step.key" class="relative flex flex-1 flex-col items-center text-center">
      <view class="z-10 flex h-7 w-7 items-center justify-center rounded-full text-sm" :class="step.markerClass">
        {{ step.number }}
      </view>
      <text class="mt-2 text-sm" :class="step.titleClass">
        {{ step.title }}
      </text>
      <text v-if="step.desc" class="mt-1 text-xs text-slate-400">
        {{ step.desc }}
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
