<script setup lang="ts">
import type { PropType } from 'wevu'
import { computed } from 'wevu'

const props = defineProps({
  color: { type: null as unknown as PropType<string>, default: '' },
  label: { type: null as unknown as PropType<string>, default: '' },
  name: { type: null as unknown as PropType<string>, default: '' },
  size: { type: null as unknown as PropType<number | string>, default: 16 },
  spin: { type: Boolean, default: false },
  tone: {
    type: null as unknown as PropType<'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted'>,
    default: 'default',
  },
})

const GLYPH_BY_NAME: Record<string, string> = {
  'back': '‹',
  'check': '✓',
  'chevron-down': '⌄',
  'chevronDown': '⌄',
  'chevron-left': '‹',
  'chevron-right': '›',
  'chevron-up': '⌃',
  'close': '×',
  'info': 'i',
  'location': '⌖',
  'menu': '☰',
  'minus': '−',
  'more': '•••',
  'plus': '+',
  'search': '⌕',
  'warning': '!',
}

const safeName = computed(() => props.name || '')
const safeTone = computed(() => props.tone || 'default')
const dimension = computed(() => {
  const value = props.size || 16
  return typeof value === 'number' ? `${value}px` : value
})
const accessibleLabel = computed(() => props.label || undefined)
const ariaHidden = computed(() => (props.label ? undefined : 'true'))
</script>

<template>
  <text
    class="varo-icon"
    :aria-hidden="ariaHidden"
    :aria-label="accessibleLabel"
    :data-name="safeName"
    :data-spin="String(props.spin)"
    :data-tone="safeTone"
    :style="{ color: props.color || '', fontSize: dimension, width: dimension, height: dimension }"
  >
    <slot>{{ GLYPH_BY_NAME[safeName] || safeName }}</slot>
  </text>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
