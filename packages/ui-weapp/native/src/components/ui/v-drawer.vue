<script setup lang="ts">
import type { DialogOpenChangeDetails, DrawerPlacement } from '@varo-ui/headless'
import type { ClassValue } from '../../lib/cn'
import { useDrawerRoot } from '@varo-ui/headless'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { varoReactiveRuntime } from '../../lib/varo-primitives'

defineOptions({
  properties: {
    open: { type: null, value: null },
  },
})

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    className?: ClassValue
    customStyle?: string | Record<string, string | number>
    defaultOpen?: boolean
    open?: boolean
    placement?: DrawerPlacement
    disabled?: boolean
    overlay?: boolean
    closeable?: boolean
    closeIcon?: string
    round?: boolean
    safeAreaInsetBottom?: boolean
    closeOnClickOverlay?: boolean
    zIndex?: number | string
  }>(),
  {
    closeIcon: '×',
    closeOnClickOverlay: true,
    defaultOpen: false,
    open: undefined,
    overlay: true,
    placement: 'right',
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
  'openChange': [payload: [open: boolean, details: DialogOpenChangeDetails]]
  'close': []
  'clickOverlay': []
}>()

const openControlled = computed(() => props.open != null)
const drawer = useDrawerRoot({
  runtime: varoReactiveRuntime,
  defaultOpen: props.defaultOpen,
  open: computed(() => props.open),
  openControlled,
  placement: computed(() => props.placement),
  disabled: computed(() => props.disabled),
  closeOnOverlayClick: computed(() => props.closeOnClickOverlay),
  onOpenChange(open, details) {
    emit('openChange', [open, details])
    if (details.canceled) { return }
    emit('update:open', open)
    if (!open) { emit('close') }
  },
})

const currentOpen = computed(() => drawer.state.open.value)
const dataState = computed(() => currentOpen.value ? 'open' : 'closed')
const drawerLabel = computed(() => props.ariaLabel ?? (props.closeable ? 'Drawer' : undefined))
const dataRound = computed(() => String(Boolean(props.round)))
const dataSafeAreaInsetBottom = computed(() => String(Boolean(props.safeAreaInsetBottom)))
const classes = computed(() => cn('varo-drawer', props.className))
const contentStyle = computed(() => {
  if (props.zIndex == null) { return undefined }
  const zIndex = Number(props.zIndex)
  return { zIndex: Number.isFinite(zIndex) ? zIndex + 1 : props.zIndex }
})
const overlayStyle = computed(() => props.zIndex == null ? undefined : { zIndex: props.zIndex })

function handleOverlayClick() {
  emit('clickOverlay')
  drawer.events.onOverlayClick()
}

function handleClose() {
  drawer.events.close()
}
</script>

<template>
  <view
    v-if="currentOpen"
    :class="classes"
    :style="props.customStyle"
    :data-placement="props.placement"
    :data-state="dataState"
  >
    <view
      v-if="props.overlay"
      class="varo-drawer__overlay"
      :style="overlayStyle"
      aria-hidden="true"
      @click="handleOverlayClick"
    />
    <view
      class="varo-drawer__content"
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      :aria-label="drawerLabel"
      :data-placement="props.placement"
      :data-round="dataRound"
      :data-safe-area-inset-bottom="dataSafeAreaInsetBottom"
      data-state="open"
      :style="contentStyle"
    >
      <slot />
      <button
        v-if="props.closeable"
        class="varo-drawer__close"
        type="button"
        aria-label="Close drawer"
        @click="handleClose"
      >
        {{ props.closeIcon }}
      </button>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
