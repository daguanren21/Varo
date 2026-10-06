<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    disabled?: boolean
    loading?: boolean
    loadingText?: string
    threshold?: number
  }>(),
  {
    className: undefined,
    disabled: false,
    loading: false,
    loadingText: '加载中',
    threshold: 64,
  },
)

const emit = defineEmits<{
  refresh: []
}>()

const classes = computed(() => cn('varo-pull-refresh', props.className))
const dataDisabled = computed(() => String(props.disabled))
const dataState = computed(() => props.loading ? 'loading' : 'idle')
const refresherEnabled = computed(() => !props.disabled)

function refresh() {
  if (!props.disabled && !props.loading) {
    emit('refresh')
  }
}
</script>

<template>
  <scroll-view
    :class="classes"
    scroll-y
    refresher-default-style="black"
    :refresher-enabled="refresherEnabled"
    :refresher-threshold="props.threshold"
    :refresher-triggered="props.loading"
    :aria-busy="props.loading"
    :data-disabled="dataDisabled"
    :data-state="dataState"
    @refresherrefresh="refresh"
  >
    <slot />
    <view v-if="props.loading" class="varo-pull-refresh__native-status" aria-live="polite">
      {{ props.loadingText }}
    </view>
  </scroll-view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
