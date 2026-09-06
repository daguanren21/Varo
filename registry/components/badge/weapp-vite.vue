<script setup lang="ts">
import { computed } from 'wevu'

// WeChat validates union props against one native type before Wevu normalizes them.
defineOptions({
  properties: {
    content: { type: null },
  },
})

const props = withDefaults(
  defineProps<{
    content?: number | string
    dot?: boolean
    max?: number
    showZero?: boolean
    tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
    variant?: 'solid' | 'soft' | 'outline'
  }>(),
  {
    dot: false,
    max: 99,
    showZero: false,
    tone: 'danger',
    variant: 'solid',
  },
)

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
