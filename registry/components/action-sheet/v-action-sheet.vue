<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VLoading from './v-loading.vue'
import VPopup from './v-popup.vue'

interface ActionSheetItem {
  color?: string
  description?: string
  disabled?: boolean
  loading?: boolean
  name: string
  value?: unknown
}

interface RenderedAction {
  dataLoading: string
  disabled: boolean
  index: number
  item: ActionSheetItem
  key: string
  style: { color: string } | undefined
}

const props = withDefaults(
  defineProps<{
    actions?: ActionSheetItem[]
    cancelText?: string
    className?: ClassValue
    closeOnSelect?: boolean
    description?: string
    title?: string
    visible?: boolean
  }>(),
  {
    actions: () => [],
    cancelText: undefined,
    closeOnSelect: true,
    description: undefined,
    title: undefined,
    visible: undefined,
  },
)

const emit = defineEmits<{
  cancel: []
  close: [reason: 'cancel' | 'overlay' | 'select']
  select: [payload: { index: number, item: ActionSheetItem }]
  'update:visible': [visible: boolean]
}>()

const classes = computed(() => cn('varo-action-sheet', props.className))
const renderedActions = computed<RenderedAction[]>(() =>
  props.actions.map((item, index) => ({
    dataLoading: String(Boolean(item.loading)),
    disabled: Boolean(item.disabled || item.loading),
    index,
    item,
    key: `${index}-${item.name}`,
    style: item.color ? { color: item.color } : undefined,
  })),
)

function close(reason: 'cancel' | 'overlay' | 'select') {
  emit('update:visible', false)
  emit('close', reason)
}

function updateVisible(visible: boolean) {
  emit('update:visible', visible)
}

function select(action: RenderedAction) {
  if (action.disabled) { return }
  emit('select', { index: action.index, item: action.item })
  if (props.closeOnSelect) { close('select') }
}

function cancel() {
  emit('cancel')
  close('cancel')
}
</script>

<template>
  <VPopup
    :class-name="classes"
    :close-on-click-overlay="true"
    position="bottom"
    :round="true"
    :safe-area-inset-bottom="true"
    :visible="props.visible"
    @update:visible="updateVisible"
    @click-overlay="close('overlay')"
  >
    <view v-if="$slots.header || props.title || props.description" class="varo-action-sheet__header">
      <slot name="header">
        <text v-if="props.title" class="varo-action-sheet__title">{{ props.title }}</text>
        <text v-if="props.description" class="varo-action-sheet__description">{{ props.description }}</text>
      </slot>
    </view>
    <view class="varo-action-sheet__actions">
      <button
        v-for="action in renderedActions"
        :key="action.key"
        class="varo-action-sheet__action"
        :disabled="action.disabled"
        :style="action.style"
        :data-loading="action.dataLoading"
        @click="select(action)"
      >
        <VLoading v-if="action.item.loading" size="sm" />
        <text class="varo-action-sheet__name">{{ action.item.name }}</text>
        <text v-if="action.item.description" class="varo-action-sheet__item-description">
          {{ action.item.description }}
        </text>
      </button>
    </view>
    <slot />
    <button v-if="props.cancelText" class="varo-action-sheet__cancel" @click="cancel">
      {{ props.cancelText }}
    </button>
  </VPopup>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
