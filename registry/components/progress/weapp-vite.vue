<script setup lang="ts">
import { computed } from 'wevu'

const props = withDefaults(
  defineProps<{
    percentage?: number
    showText?: boolean
    status?: 'default' | 'active' | 'success' | 'warning' | 'danger'
    strokeWidth?: number
    type?: 'line' | 'circle'
  }>(),
  {
    percentage: 0,
    showText: true,
    status: 'default',
    strokeWidth: 8,
    type: 'line'
  }
)

const value = computed(() => Math.min(100, Math.max(0, props.percentage)))
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
    :style="{ '--varo-progress-value': `${value}%`, '--varo-progress-stroke': `${strokeWidth}px` }"
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
