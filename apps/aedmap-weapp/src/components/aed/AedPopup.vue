<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { cn } from '../../lib/cn'

withDefaults(defineProps<{
  className?: ClassValue
  isOpened?: boolean
  title?: string
}>(), {
  isOpened: false,
  title: '',
})

const emit = defineEmits<{
  cancel: []
  close: []
}>()
</script>

<template>
  <view v-if="isOpened" :class="cn('fixed inset-0 z-50 flex items-end bg-black/50', className)" @tap="emit('cancel')">
    <view class="w-full rounded-t-3xl bg-white p-4" @tap.stop>
      <view class="mb-4 flex items-center justify-between">
        <text class="text-lg font-semibold text-slate-900">
          {{ title }}
        </text>
        <button class="m-0 bg-transparent p-2 text-slate-500" @tap="emit('close')">
          关闭
        </button>
      </view>
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
