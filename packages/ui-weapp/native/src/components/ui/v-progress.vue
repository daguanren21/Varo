<script setup lang="ts">
import { computed } from 'wevu'

defineOptions({
  properties: {
    size: { type: null, value: 96 },
  },
})

const props = withDefaults(
  defineProps<{
    percentage?: number
    showText?: boolean
    size?: number | string
    status?: 'default' | 'active' | 'success' | 'warning' | 'danger'
    strokeWidth?: number
    type?: 'line' | 'circle'
  }>(),
  {
    percentage: 0,
    showText: true,
    size: 96,
    status: 'default',
    strokeWidth: 8,
    type: 'line',
  },
)

const value = computed(() => Math.min(100, Math.max(0, props.percentage)))
const size = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const style = computed(() => props.type === 'circle'
  ? {
      '--varo-progress-value': `${value.value * 3.6}deg`,
      '--varo-progress-stroke': `${props.strokeWidth}px`,
      'height': size.value,
      'width': size.value,
    }
  : { '--varo-progress-value': `${value.value}%`, '--varo-progress-stroke': `${props.strokeWidth}px` })
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
    :style="style"
  >
    <view v-if="type === 'line'" class="varo-progress__track">
      <text class="varo-progress__bar" />
    </view>
    <view v-else class="varo-progress__circle" />
    <text v-if="showText" class="varo-progress__text">
      <slot :value="value">
        {{ value }}%
      </slot>
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
