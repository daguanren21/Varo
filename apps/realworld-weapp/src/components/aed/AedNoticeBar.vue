<script setup lang="ts">
import { computed } from 'wevu'

const props = withDefaults(defineProps<{
  close?: boolean
  marquee?: boolean
  showMore?: boolean
  single?: boolean
  text?: string
}>(), {
  close: false,
  marquee: false,
  showMore: false,
  single: false,
  text: '',
})

const visible = defineModel<boolean>('visible', { default: true })
const textClasses = computed(() => props.single ? 'truncate' : '')
</script>

<template>
  <view v-if="visible" class="flex items-center gap-2 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    <text class="shrink-0">
      通知
    </text>
    <text class="min-w-0 flex-1" :class="textClasses">
      {{ text }}<slot />
    </text>
    <text v-if="showMore">
      ›
    </text>
    <button v-if="close" class="m-0 bg-transparent p-1 text-amber-700" @tap="visible = false">
      ×
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
