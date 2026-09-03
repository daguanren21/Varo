<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

type IconTone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    color?: string
    label?: string
    name: string
    size?: number | string
    spin?: boolean
    tone?: IconTone
  }>(),
  {
    size: 16,
    spin: false,
    tone: 'default',
  },
)

function svgDataUri(body: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const ICON_SOURCE_BY_NAME: Record<string, string> = {
  check: svgDataUri('<path d="m5 12 4 4 10-9"/>'),
  chevronDown: svgDataUri('<path d="m6 9 6 6 6-6"/>'),
  chevronLeft: svgDataUri('<path d="m15 18-6-6 6-6"/>'),
  chevronRight: svgDataUri('<path d="m9 18 6-6-6-6"/>'),
  chevronUp: svgDataUri('<path d="m18 15-6-6-6 6"/>'),
  close: svgDataUri('<path d="M18 6 6 18M6 6l12 12"/>'),
  danger: svgDataUri('<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6m0-6 6 6"/>'),
  info: svgDataUri('<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>'),
  location: svgDataUri('<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'),
  menu: svgDataUri('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  minus: svgDataUri('<path d="M5 12h14"/>'),
  more: svgDataUri('<circle cx="5" cy="12" r="1.5" fill="#000" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="#000" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="#000" stroke="none"/>'),
  plus: svgDataUri('<path d="M12 5v14M5 12h14"/>'),
  search: svgDataUri('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
  success: svgDataUri('<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>'),
  warning: svgDataUri('<path d="M10.3 4.2 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>'),
}

const ICON_ALIAS_BY_NAME: Record<string, string> = {
  'back': 'chevronLeft',
  'chevron-down': 'chevronDown',
  'chevron-left': 'chevronLeft',
  'chevron-right': 'chevronRight',
  'chevron-up': 'chevronUp',
}

const accessibleLabel = computed(() => props.label || undefined)
const ariaHidden = computed(() => (props.label ? undefined : 'true'))
const classes = computed(() => cn('varo-icon', props.className))
const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const iconRole = computed(() => (props.label ? 'img' : undefined))
const iconSource = computed(() => {
  const assetName = ICON_ALIAS_BY_NAME[props.name] ?? props.name
  return ICON_SOURCE_BY_NAME[assetName]
})
const assetStyle = computed(() => {
  const maskImage = iconSource.value ? `url("${iconSource.value}")` : undefined
  return {
    backgroundColor: 'currentColor',
    height: '100%',
    maskImage,
    maskPosition: 'center',
    maskRepeat: 'no-repeat',
    maskSize: 'contain',
    WebkitMaskImage: maskImage,
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    width: '100%',
  }
})
const rootStyle = computed(() => ({
  color: props.color,
  fontSize: dimension.value,
  height: dimension.value,
  width: dimension.value,
}))
</script>

<template>
  <view
    :class="classes"
    :role="iconRole"
    :style="rootStyle"
    :aria-hidden="ariaHidden"
    :aria-label="accessibleLabel"
    :data-name="props.name"
    :data-spin="String(props.spin)"
    :data-tone="props.tone"
  >
    <slot>
      <view v-if="iconSource" class="varo-icon__asset" :style="assetStyle" aria-hidden="true" />
      <text v-else>{{ props.name }}</text>
    </slot>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
