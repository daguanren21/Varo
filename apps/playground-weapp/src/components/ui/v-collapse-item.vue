<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VIcon from './v-icon.vue'
import { useCollapseContext } from './collapse-context'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    disabled?: boolean
    title?: string
    value: string
  }>(),
  {
    disabled: false,
    title: undefined,
  },
)

const collapse = useCollapseContext()
const isOpen = computed(() => collapse.api.isOpen(props.value))
const isDisabled = computed(() => props.disabled || collapse.state.disabled.value)
const state = computed(() => isOpen.value ? 'open' : 'closed')
const classes = computed(() => cn('varo-collapse-item', props.className))
const dataDisabled = computed(() => String(isDisabled.value))
const ariaDisabled = computed(() => isDisabled.value || undefined)
const triggerId = computed(() => {
  const attrs = collapse.api.getTriggerAttrs(props.value, props.disabled)
  return String(attrs.id)
})
const contentId = computed(() => {
  const attrs = collapse.api.getContentAttrs(props.value)
  return String(attrs.id)
})

function toggle() {
  collapse.events.toggle(props.value, props.disabled)
}
</script>

<template>
  <view
    :class="classes"
    :data-disabled="dataDisabled"
    :data-state="state"
    :data-value="props.value"
  >
    <button
      :id="triggerId"
      class="varo-collapse-item__trigger"
      :aria-controls="contentId"
      :aria-disabled="ariaDisabled"
      :aria-expanded="isOpen"
      :data-disabled="dataDisabled"
      :data-state="state"
      :data-value="props.value"
      :disabled="isDisabled"
      @click="toggle"
    >
      <view class="varo-collapse-item__title">
        <slot name="title">{{ props.title }}</slot>
      </view>
      <VIcon class-name="varo-collapse-item__chevron" name="chevronDown" :size="16" />
    </button>
    <view
      v-if="isOpen"
      :id="contentId"
      class="varo-collapse-item__content"
      role="region"
      :aria-labelledby="triggerId"
      :data-state="state"
      :data-value="props.value"
    >
      <slot />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
