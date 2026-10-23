<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VIcon from './v-icon.vue'

defineOptions({
  options: { virtualHost: true },
  properties: {
    titleWidth: { type: null, value: null },
  },
})

const props = withDefaults(
  defineProps<{
    center?: boolean
    className?: ClassValue
    clickable?: boolean
    desc?: string
    descTextAlign?: CellDescTextAlign
    icon?: string
    isLink?: boolean
    roundRadius?: string
    size?: CellSize
    subTitle?: string
    title?: string
    titleWidth?: number | string
    to?: string
  }>(),
  {
    center: false,
    clickable: false,
    descTextAlign: 'right',
    isLink: false,
    size: 'default',
  },
)
const emit = defineEmits<{
  click: [event: unknown]
}>()
type CellDescTextAlign = 'left' | 'right'
type CellSize = 'default' | 'large'

interface KeyboardLikeEvent {
  detail?: { key?: string }
  key?: string
  preventDefault?: () => void
}

const link = computed(() => props.isLink || Boolean(props.to))
const clickable = computed(() => props.clickable || link.value)
const hasTarget = computed(() => Boolean(props.to))
const classes = computed(() =>
  cn(
    'varo-cell',
    `size-${props.size}`,
    `desc-align-${props.descTextAlign}`,
    props.center && 'center-true',
    clickable.value && 'clickable-true',
    link.value && 'link-true',
    props.className,
  ),
)
const rootStyle = computed(() =>
  props.roundRadius ? { '--varo-cell-round-radius': props.roundRadius } : undefined,
)
const titleStyle = computed(() => {
  if (props.titleWidth == null || props.titleWidth === '') { return undefined }
  const width = typeof props.titleWidth === 'number' ? `${props.titleWidth}px` : props.titleWidth
  return { flexBasis: width, width }
})
const rootRole = computed(() => (clickable.value ? 'button' : undefined))
const rootTabindex = computed(() => (clickable.value ? 0 : undefined))

function handleClick(event: unknown) {
  emit('click', event)
}

function handleKeydown(event: unknown) {
  if (typeof event !== 'object' || event === null) { return }
  const keyboardEvent = event as KeyboardLikeEvent
  const key = keyboardEvent.key || (keyboardEvent.detail && keyboardEvent.detail.key) || ''
  if (!clickable.value || (key !== 'Enter' && key !== ' ')) { return }
  if (keyboardEvent.preventDefault) { keyboardEvent.preventDefault() }
  emit('click', event)
}
</script>

<template>
  <navigator
    v-if="hasTarget"
    :url="props.to"
    :class="classes"
    :style="rootStyle"
    :data-center="String(props.center)"
    :data-clickable="String(clickable)"
    :data-desc-align="props.descTextAlign"
    :data-link="String(link)"
    :data-size="props.size"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <view v-if="$slots.icon || props.icon" class="varo-cell__icon">
      <slot name="icon">
        <text aria-hidden="true">
          {{ props.icon }}
        </text>
      </slot>
    </view>
    <view v-if="$slots.title || props.title || $slots.subTitle || props.subTitle || $slots.default" class="varo-cell__main">
      <view v-if="$slots.title || props.title" class="varo-cell__title" :style="titleStyle">
        <slot name="title">
          {{ props.title }}
        </slot>
      </view>
      <view v-if="$slots.subTitle || props.subTitle" class="varo-cell__subtitle">
        <slot name="subTitle">
          {{ props.subTitle }}
        </slot>
      </view>
      <view v-if="$slots.default" class="varo-cell__content">
        <slot />
      </view>
    </view>
    <view v-if="$slots.desc || props.desc" class="varo-cell__desc">
      <slot name="desc">
        {{ props.desc }}
      </slot>
    </view>
    <view v-if="$slots.link || props.isLink || props.to" class="varo-cell__link">
      <slot name="link">
        <VIcon name="chevron-right" />
      </slot>
    </view>
  </navigator>

  <view
    v-else
    :class="classes"
    :style="rootStyle"
    :role="rootRole"
    :tabindex="rootTabindex"
    :data-center="String(props.center)"
    :data-clickable="String(clickable)"
    :data-desc-align="props.descTextAlign"
    :data-link="String(link)"
    :data-size="props.size"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <view v-if="$slots.icon || props.icon" class="varo-cell__icon">
      <slot name="icon">
        <text aria-hidden="true">
          {{ props.icon }}
        </text>
      </slot>
    </view>
    <view v-if="$slots.title || props.title || $slots.subTitle || props.subTitle || $slots.default" class="varo-cell__main">
      <view v-if="$slots.title || props.title" class="varo-cell__title" :style="titleStyle">
        <slot name="title">
          {{ props.title }}
        </slot>
      </view>
      <view v-if="$slots.subTitle || props.subTitle" class="varo-cell__subtitle">
        <slot name="subTitle">
          {{ props.subTitle }}
        </slot>
      </view>
      <view v-if="$slots.default" class="varo-cell__content">
        <slot />
      </view>
    </view>
    <view v-if="$slots.desc || props.desc" class="varo-cell__desc">
      <slot name="desc">
        {{ props.desc }}
      </slot>
    </view>
    <view v-if="$slots.link || props.isLink || props.to" class="varo-cell__link">
      <slot name="link">
        <VIcon name="chevron-right" />
      </slot>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
