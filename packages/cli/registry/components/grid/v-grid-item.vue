<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { GridContext, GridDirection } from './grid-context'
import { computed, inject } from 'wevu'
import { cn } from '../../lib/cn'
import { gridContextKey } from './grid-context'

interface KeyboardLikeEvent {
  detail?: { key?: string }
  key?: string
  preventDefault?: () => void
}

const props = withDefaults(
  defineProps<{
    badge?: number | string
    className?: ClassValue
    clickable?: boolean
    dot?: boolean
    icon?: string
    span?: number | string
    text?: string
    to?: string
    url?: string
  }>(),
  {
    clickable: undefined,
    dot: false,
    span: 1,
  },
)

const emit = defineEmits<{
  click: [event: unknown]
}>()

const grid = inject<GridContext | undefined>(gridContextKey, undefined)
const hasNavigation = computed(() => Boolean(props.url || props.to))
const navigationTarget = computed(() => (props.url == null ? props.to : props.url))
const clickable = computed(() => {
  if (props.clickable !== undefined) { return props.clickable }
  if (grid !== undefined) { return grid.clickable }
  return hasNavigation.value
})
const direction = computed<GridDirection>(() => (grid === undefined ? 'vertical' : grid.direction))
const classes = computed(() => cn('varo-grid__item', props.className))
const rootStyle = computed(() => ({
  '--varo-grid-item-span': props.span,
}))
const rootRole = computed(() => (!hasNavigation.value && clickable.value ? 'button' : undefined))
const rootTabindex = computed(() => (!hasNavigation.value && clickable.value ? 0 : undefined))
const badgeText = computed(() => (props.badge == null ? '' : String(props.badge)))
const badgeWide = computed(() => String(badgeText.value.length > 1))

function handleClick(event: unknown) {
  emit('click', event)
}

function handleKeydown(event: unknown) {
  if (typeof event !== 'object' || event === null) { return }
  const keyboardEvent = event as KeyboardLikeEvent
  const key = keyboardEvent.key || (keyboardEvent.detail && keyboardEvent.detail.key) || ''
  if (!clickable.value || hasNavigation.value || (key !== 'Enter' && key !== ' ')) { return }
  if (keyboardEvent.preventDefault) { keyboardEvent.preventDefault() }
  emit('click', event)
}
</script>

<template>
  <navigator
    v-if="hasNavigation"
    :url="navigationTarget"
    :class="classes"
    :style="rootStyle"
    :data-clickable="String(clickable)"
    :data-direction="direction"
    :data-dot="String(props.dot)"
    :data-span="String(props.span)"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <view v-if="$slots.icon || props.icon || props.badge || props.dot" class="varo-grid__icon-wrap">
      <slot name="icon">
        <text v-if="props.icon" class="varo-grid__icon">{{ props.icon }}</text>
      </slot>
      <text v-if="props.badge != null" class="varo-grid__badge" :data-wide="badgeWide">
        {{ badgeText }}
      </text>
      <text v-if="props.dot" class="varo-grid__dot" />
    </view>
    <slot name="text">
      <text v-if="props.text" class="varo-grid__text">{{ props.text }}</text>
    </slot>
    <slot />
  </navigator>

  <view
    v-else
    :class="classes"
    :style="rootStyle"
    :role="rootRole"
    :tabindex="rootTabindex"
    :data-clickable="String(clickable)"
    :data-direction="direction"
    :data-dot="String(props.dot)"
    :data-span="String(props.span)"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <view v-if="$slots.icon || props.icon || props.badge || props.dot" class="varo-grid__icon-wrap">
      <slot name="icon">
        <text v-if="props.icon" class="varo-grid__icon">{{ props.icon }}</text>
      </slot>
      <text v-if="props.badge != null" class="varo-grid__badge" :data-wide="badgeWide">
        {{ badgeText }}
      </text>
      <text v-if="props.dot" class="varo-grid__dot" />
    </view>
    <slot name="text">
      <text v-if="props.text" class="varo-grid__text">{{ props.text }}</text>
    </slot>
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
