<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { createVariantClass } from '@varo-ui/headless'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VInput from './v-input.vue'
import VIcon from './v-icon.vue'

const props = withDefaults(
  defineProps<{
    actionText?: string
    className?: ClassValue
    clearable?: boolean
    disabled?: boolean
    inputAriaLabel?: string
    placeholder?: string
    value?: string
  }>(),
  {
    actionText: '',
    clearable: true,
    disabled: false,
    placeholder: 'Search',
    value: '',
  },
)

const emit = defineEmits<{
  'blur': [event: unknown]
  'cancel': []
  'clear': [event: unknown]
  'focus': [event: unknown]
  'search': [value: string]
  'update:value': [value: string]
}>()

const rootClass = computed(() =>
  cn(
    createVariantClass('varo-searchbar', {
      radius: '12px',
      disabled: props.disabled,
    }),
    props.className,
  ),
)
const dataDisabled = computed(() => String(props.disabled))

function update(value: string) {
  emit('update:value', value)
}

function search() {
  emit('search', props.value)
}

function clear(event: unknown) {
  emit('clear', event)
}

function focus(event: unknown) {
  emit('focus', event)
}

function blur(event: unknown) {
  emit('blur', event)
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <form
    :class="rootClass"
    role="search"
    :data-disabled="dataDisabled"
    @submit="search"
  >
    <view class="varo-searchbar__body">
      <VInput
        :aria-label="props.inputAriaLabel"
        :clearable="props.clearable"
        clear-trigger="always"
        confirm-type="search"
        :disabled="props.disabled"
        :placeholder="props.placeholder"
        :value="props.value"
        @blur="blur"
        @clear="clear"
        @confirm="search"
        @focus="focus"
        @update:value="update"
      >
        <template #prefix>
          <VIcon name="search" :size="18" />
        </template>
      </VInput>
    </view>
    <button
      v-if="props.actionText || $slots.action"
      class="varo-searchbar__action"
      type="button"
      @click="cancel"
    >
      <slot name="action">
        {{ props.actionText }}
      </slot>
    </button>
  </form>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
