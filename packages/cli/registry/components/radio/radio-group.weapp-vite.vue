<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, provide } from 'wevu'
import { cn } from '../../lib/cn'
import { radioGroupKey, type RadioGroupContext, type RadioValue, type SelectionDirection } from './radio-context'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    direction?: SelectionDirection
    disabled?: boolean
    value?: RadioValue
  }>(),
  {
    direction: 'vertical',
    disabled: false,
    value: undefined,
  },
)

const emit = defineEmits<{
  change: [value: RadioValue]
  'update:value': [value: RadioValue]
}>()

const classes = computed(() => cn('varo-radio-group', props.className))

provide<RadioGroupContext>(radioGroupKey, {
  disabled: () => props.disabled,
  isChecked: value => props.value === value,
  select: (value) => {
    if (props.value === value) return
    emit('update:value', value)
    emit('change', value)
  },
})
</script>

<template>
  <view :class="classes" :data-direction="props.direction" :data-disabled="String(props.disabled)">
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
