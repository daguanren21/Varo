<script setup lang="ts">
import { provide } from 'wevu'
import { checkboxGroupKey, type CheckboxGroupContext, type CheckboxValue } from './selection-context'

const props = withDefaults(
  defineProps<{
    direction?: 'horizontal' | 'vertical'
    disabled?: boolean
    max?: number
    value?: CheckboxValue[]
  }>(),
  {
    direction: 'vertical',
    disabled: false,
    max: undefined,
    value: () => []
  }
)

const emit = defineEmits<{
  change: [value: CheckboxValue[]]
  'update:value': [value: CheckboxValue[]]
}>()

provide<CheckboxGroupContext>(checkboxGroupKey, {
  disabled: () => props.disabled,
  isChecked: (value) => props.value.includes(value),
  toggle: (value) => {
    const next = [...props.value]
    const index = next.indexOf(value)
    if (index >= 0) next.splice(index, 1)
    else {
      if (props.max !== undefined && next.length >= props.max) return
      next.push(value)
    }
    emit('update:value', next)
    emit('change', next)
  }
})
</script>

<template>
  <view class="varo-checkbox-group" :data-direction="direction" :data-disabled="String(disabled)">
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
