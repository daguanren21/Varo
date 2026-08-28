<script setup lang="ts">
import { computed } from 'wevu'

const props = withDefaults(
  defineProps<{
    checkable?: boolean
    checked?: boolean
    closeable?: boolean
    disabled?: boolean
    round?: boolean
    size?: 'sm' | 'md' | 'lg'
    tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
    variant?: 'solid' | 'soft' | 'outline'
  }>(),
  {
    checkable: false,
    checked: false,
    closeable: false,
    disabled: false,
    round: false,
    size: 'md',
    tone: 'default',
    variant: 'soft',
  },
)
const emit = defineEmits<{
  'change': [checked: boolean]
  'click': [event: unknown]
  'close': [event: unknown]
  'update:checked': [checked: boolean]
}>()
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
    :data-size="size"
    :data-tone="tone"
    :data-variant="variant"
    @click="click"
  >
    <text class="varo-tag__content">
      <slot />
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
