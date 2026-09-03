<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { RadioGroupContext, RadioValue } from './radio-context'
import { createVariantClass } from '@varo-ui/headless'
import { computed, inject } from 'wevu'
import { cn } from '../../lib/cn'
import { radioGroupKey } from './radio-context'

const props = withDefaults(
  defineProps<{
    checked?: boolean
    className?: ClassValue
    disabled?: boolean
    label?: string
    value: RadioValue
  }>(),
  {
    checked: undefined,
    disabled: false,
    label: undefined,
  },
)

const emit = defineEmits<{
  change: [value: RadioValue]
  'update:checked': [value: boolean]
}>()

const group = inject<RadioGroupContext>(radioGroupKey)
const checked = computed(() => group?.isChecked(props.value) ?? Boolean(props.checked))
const disabled = computed(() => props.disabled || Boolean(group?.disabled()))
const classes = computed(() =>
  cn(
    createVariantClass('varo-radio', {
      radius: '12px',
      checked: checked.value,
      disabled: disabled.value,
    }),
    props.className,
  ),
)
const checkedAttribute = computed(() => String(checked.value))
const disabledAttribute = computed(() => String(disabled.value))

function select() {
  if (disabled.value) return

  if (group) {
    group.select(props.value)
    return
  }

  emit('update:checked', true)
  emit('change', props.value)
}
</script>

<template>
  <button
    :class="classes"
    type="button"
    role="radio"
    :aria-checked="checked"
    :aria-disabled="disabled"
    :data-checked="checkedAttribute"
    :data-disabled="disabledAttribute"
    :disabled="disabled"
    @click="select"
  >
    <view class="varo-radio__icon" aria-hidden="true">
      <slot name="icon">
        <view v-if="checked" class="varo-radio__dot" />
      </slot>
    </view>
    <text class="varo-radio__label">
      <template v-if="$slots.label">
        <slot name="label" />
      </template>
      <slot v-else>{{ props.label }}</slot>
    </text>
  </button>
</template>

<style scoped>
.varo-radio__dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
