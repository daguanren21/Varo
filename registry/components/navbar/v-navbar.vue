<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, useSlots } from 'wevu'
import { cn } from '../../lib/cn'
import VIcon from './v-icon.vue'

const props = withDefaults(
  defineProps<{
    border?: boolean
    className?: ClassValue
    fixed?: boolean
    leftAriaLabel?: string
    leftArrow?: boolean
    leftText?: string
    placeholder?: boolean
    rightAriaLabel?: string
    rightText?: string
    title?: string
  }>(),
  {
    border: true,
    fixed: false,
    leftArrow: false,
    placeholder: false,
  },
)
const emit = defineEmits<{
  clickLeft: [event: unknown]
  clickRight: [event: unknown]
}>()
const slots = useSlots()

const classes = computed(() => cn('varo-navbar', props.className))
const hasLeft = computed(() => Boolean(props.leftArrow || props.leftText || slots.left))
const hasRight = computed(() => Boolean(props.rightText || slots.right))
const leftAriaHidden = computed(() => (hasLeft.value ? undefined : 'true'))
const leftLabel = computed(() => props.leftAriaLabel ?? props.leftText ?? (props.leftArrow ? '返回' : undefined))
const leftTabIndex = computed(() => (hasLeft.value ? undefined : -1))
const rightAriaHidden = computed(() => (hasRight.value ? undefined : 'true'))
const rightLabel = computed(() => props.rightAriaLabel ?? props.rightText)
const rightTabIndex = computed(() => (hasRight.value ? undefined : -1))

function clickLeft(event: unknown) {
  emit('clickLeft', event)
}

function clickRight(event: unknown) {
  emit('clickRight', event)
}
</script>

<template>
  <view
    :class="classes"
    :data-border="String(props.border)"
    :data-fixed="String(props.fixed)"
    :data-placeholder="String(props.placeholder)"
  >
    <button
      class="varo-navbar__left"
      type="button"
      :aria-hidden="leftAriaHidden"
      :aria-label="leftLabel"
      :tabindex="leftTabIndex"
      @click="clickLeft"
    >
      <slot name="left">
        <VIcon v-if="props.leftArrow" class-name="varo-navbar__arrow" name="back" />
        {{ props.leftText }}
      </slot>
    </button>
    <view class="varo-navbar__title">
      <slot name="title">{{ props.title }}</slot>
    </view>
    <button
      class="varo-navbar__right"
      type="button"
      :aria-hidden="rightAriaHidden"
      :aria-label="rightLabel"
      :tabindex="rightTabIndex"
      @click="clickRight"
    >
      <slot name="right">{{ props.rightText }}</slot>
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
