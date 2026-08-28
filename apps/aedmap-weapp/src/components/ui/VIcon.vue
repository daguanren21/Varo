<script setup lang="ts">
import { computed } from 'wevu'

const props = withDefaults(
  defineProps<{
    color?: string
    label?: string
    name: string
    size?: number | string
    spin?: boolean
    tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted'
  }>(),
  {
    color: '',
    label: '',
    size: 16,
    spin: false,
    tone: 'default',
  },
)

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

const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const accessibleLabel = computed(() => props.label || undefined)
const ariaHidden = computed(() => (props.label ? undefined : true))
</script>

<template>
  <text
    class="varo-icon"
    :aria-hidden="ariaHidden"
    :aria-label="accessibleLabel"
    :data-name="name"
    :data-spin="String(spin)"
    :data-tone="tone"
    :style="{ color, fontSize: dimension, width: dimension, height: dimension }"
  >
    <slot>{{ GLYPH_BY_NAME[name] || name }}</slot>
  </text>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
