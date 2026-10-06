<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { PopoverContext } from './popover-context'
import { usePopoverRoot } from '@varo-ui/headless'
import { computed, provide } from 'wevu'
import { cn } from '../../lib/cn'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { popoverContextKey } from './popover-context'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    defaultOpen?: boolean
    disabled?: boolean
    open?: boolean
  }>(),
  {
    defaultOpen: false,
    disabled: false,
    open: undefined,
  },
)

const emit = defineEmits<{
  openChange: [open: boolean]
  'update:open': [open: boolean]
}>()

const disabled = computed(() => props.disabled)
const open = computed(() => props.open)
const openControlled = computed(() => props.open !== undefined)
const popover = usePopoverRoot({
  runtime: varoReactiveRuntime,
  defaultOpen: props.defaultOpen,
  disabled,
  open,
  openControlled,
  onOpenChange(nextOpen) {
    emit('update:open', nextOpen)
    emit('openChange', nextOpen)
  },
})

provide<PopoverContext>(popoverContextKey, popover)

const classes = computed(() => cn('varo-popover', props.className))
</script>

<template>
  <view :class="classes">
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
