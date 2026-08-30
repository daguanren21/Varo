<script setup lang="ts">
import { computed } from 'wevu'

const props = withDefaults(
  defineProps<{
    percentage?: number
    size?: number | string
    showText?: boolean
    status?: 'default' | 'active' | 'success' | 'warning' | 'danger'
    strokeWidth?: number
    type?: 'line' | 'circle'
  }>(),
  {
    percentage: 0,
    showText: true,
    status: 'default',
    size: 96,
    strokeWidth: 8,
    type: 'line'
  }
)

const value = computed(() => Math.min(100, Math.max(0, props.percentage)))
const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const progressStyle = computed(() => props.type === 'circle'
  ? {
      '--varo-progress-value': `${value.value * 3.6}deg`,
      '--varo-progress-stroke': `${props.strokeWidth}px`,
      height: dimension.value,
      width: dimension.value
    }
  : {
      '--varo-progress-scale': String(value.value / 100),
      '--varo-progress-stroke': `${props.strokeWidth}px`
    })
</script>

<template>
  <view
    class="varo-progress"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    aria-valuemax="100"
    :data-status="status"
    :data-type="type"
    :style="progressStyle"
  >
    <view class="varo-progress__track"><text class="varo-progress__bar" /></view>
    <text v-if="showText" class="varo-progress__text"><slot :value="value">{{ value }}%</slot></text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
