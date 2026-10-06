<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left'

const props = withDefaults(
  defineProps<{
    as?: string
    className?: ClassValue
    edges?: SafeAreaEdge[]
  }>(),
  {
    as: 'div',
    edges: () => ['bottom'],
  },
)

const classes = computed(() => cn('varo-safe-area', props.className))
const hasBottomInset = computed(() => String(props.edges.includes('bottom')))
const hasLeftInset = computed(() => String(props.edges.includes('left')))
const hasRightInset = computed(() => String(props.edges.includes('right')))
const hasTopInset = computed(() => String(props.edges.includes('top')))
const renderAsText = computed(() => props.as === 'span' || props.as === 'text')
</script>

<template>
  <text
    v-if="renderAsText"
    :class="classes"
    :data-bottom="hasBottomInset"
    :data-left="hasLeftInset"
    :data-right="hasRightInset"
    :data-top="hasTopInset"
  >
    <slot />
  </text>
  <view
    v-else
    :class="classes"
    :data-bottom="hasBottomInset"
    :data-left="hasLeftInset"
    :data-right="hasRightInset"
    :data-top="hasTopInset"
  >
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
