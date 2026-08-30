<script setup lang="ts">
import type { PropType } from 'wevu'
import { computed } from 'wevu'

const props = defineProps({
  checkable: { type: Boolean, default: false },
  checked: { type: Boolean, default: false },
  closeable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  label: { type: null as unknown as PropType<string>, default: '' },
  round: { type: Boolean, default: false },
  size: { type: null as unknown as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
  tone: {
    type: null as unknown as PropType<'default' | 'primary' | 'success' | 'warning' | 'danger'>,
    default: 'default',
  },
  variant: { type: null as unknown as PropType<'solid' | 'soft' | 'outline'>, default: 'soft' },
})
const emit = defineEmits<{
  'change': [checked: boolean]
  'click': [event: unknown]
  'close': [event: unknown]
  'update:checked': [checked: boolean]
}>()
const safeLabel = computed(() => props.label || '')
const safeSize = computed(() => props.size || 'md')
const safeTone = computed(() => props.tone || 'default')
const safeVariant = computed(() => props.variant || 'soft')
const checkableRole = computed(() => (props.checkable ? 'checkbox' : undefined))
const checkableValue = computed(() => (props.checkable ? props.checked : undefined))

function click(event: unknown) {
  if (props.disabled) { return }
  emit('click', event)
  if (!props.checkable) { return }
  const checked = !props.checked
  emit('update:checked', checked)
  emit('change', checked)
}

function close(event: { stopPropagation?: () => void }) {
  event.stopPropagation?.()
  if (!props.disabled) { emit('close', event) }
}
</script>

<template>
  <view
    class="varo-tag"
    :role="checkableRole"
    :aria-checked="checkableValue"
    :aria-disabled="disabled"
    :data-checked="String(checked)"
    :data-disabled="String(disabled)"
    :data-round="String(round)"
    :data-size="safeSize"
    :data-tone="safeTone"
    :data-variant="safeVariant"
    @click="click"
  >
    <text class="varo-tag__content">
      <slot>{{ safeLabel }}</slot>
    </text>
    <button v-if="closeable" class="varo-tag__close" type="button" :disabled="disabled" aria-label="Remove" @click="close">
      ×
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
