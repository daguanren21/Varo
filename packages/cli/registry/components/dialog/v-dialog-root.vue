<script setup lang="ts">
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import type { ClassValue } from '../../lib/cn'
import type { DialogContext } from './dialog-context'
import { useDialogRoot } from '@varo-ui/headless'
import { computed, provide } from 'wevu'
import { cn } from '../../lib/cn'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { dialogContextKey } from './dialog-context'

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
  'openChange': [open: boolean, details: DialogOpenChangeDetails]
  'update:open': [open: boolean]
}>()

let dialogRootSeq = 0

const disabled = computed(() => props.disabled)
const open = computed(() => props.open)
const openControlled = computed(() => props.open !== undefined)
const dialogId = `varo-dialog-${++dialogRootSeq}`
const dialog = useDialogRoot({
  id: dialogId,
  runtime: varoReactiveRuntime,
  defaultOpen: props.defaultOpen,
  disabled,
  open,
  openControlled,
  onOpenChange(nextOpen, details) {
    emit('openChange', nextOpen, details)
    if (details.canceled) {
      return
    }
    emit('update:open', nextOpen)
  },
})

provide<DialogContext>(dialogContextKey, dialog)

const classes = computed(() => cn('varo-dialog', props.className))
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
