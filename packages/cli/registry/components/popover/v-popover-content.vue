<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { PopoverAlign, PopoverSide } from './popover-context'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { usePopoverContext } from './popover-context'

const props = withDefaults(
  defineProps<{
    align?: PopoverAlign
    as?: string
    className?: ClassValue
    side?: PopoverSide
  }>(),
  {
    align: 'center',
    as: 'div',
    side: 'bottom',
  },
)

const popover = usePopoverContext()
const classes = computed(() => cn('varo-popover__content', props.className))
const open = computed(() => popover.state.open.value)
const renderAsButton = computed(() => props.as === 'button')
const renderAsText = computed(() => props.as === 'span' || props.as === 'text')
const state = computed(() => open.value ? 'open' : 'closed')
const align = computed(() => props.align)
const side = computed(() => props.side)
</script>

<template>
  <block v-if="open">
    <button
      v-if="renderAsButton"
      :class="classes"
      role="dialog"
      :data-align="align"
      :data-side="side"
      :data-state="state"
    >
      <slot />
    </button>
    <text
      v-else-if="renderAsText"
      :class="classes"
      role="dialog"
      :data-align="align"
      :data-side="side"
      :data-state="state"
    >
      <slot />
    </text>
    <view
      v-else
      :class="classes"
      role="dialog"
      :data-align="align"
      :data-side="side"
      :data-state="state"
    >
      <slot />
    </view>
  </block>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
