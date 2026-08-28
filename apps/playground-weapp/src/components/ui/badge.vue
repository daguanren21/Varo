<script setup lang="ts">
import type { PropType } from 'wevu'
import { computed } from 'wevu'

const props = defineProps({
  content: { type: null as unknown as PropType<number | string | undefined>, default: undefined },
  dot: { type: Boolean, default: false },
  max: { type: Number, default: 99 },
  showZero: { type: Boolean, default: false },
  tone: {
    type: String as PropType<'default' | 'primary' | 'success' | 'warning' | 'danger'>,
    default: 'danger',
  },
  variant: {
    type: String as PropType<'solid' | 'soft' | 'outline'>,
    default: 'solid',
  },
})

const displayContent = computed(() => {
  if (props.dot) { return '' }
  if (typeof props.content === 'number' && props.content > props.max) { return `${props.max}+` }
  return props.content ?? ''
})
const visible = computed(() => props.dot || props.content === undefined || props.showZero || props.content !== 0)
</script>

<template>
  <text
    v-if="visible"
    class="varo-badge"
    role="status"
    :data-dot="String(dot)"
    :data-tone="tone"
    :data-variant="variant"
  >
    <slot>{{ displayContent }}</slot>
  </text>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
