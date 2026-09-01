<script setup lang="ts">
import type { FieldRule } from '@varo-ui/headless'
import type { VaroFormContext } from './form-context'
import { computed, inject, onBeforeUnmount, watch } from 'wevu'
import { formContextKey } from './form-context'

interface PublicRef<T> {
  value: T
}
type FormValidateTrigger = 'submit' | 'change' | 'blur'

const props = withDefaults(
  defineProps<{
    colon?: boolean
    label?: string
    labelWidth?: number | string
    name: string
    required?: boolean
    rules?: FieldRule
    showError?: boolean
    validateTrigger?: FormValidateTrigger
  }>(),
  {
    colon: false,
    label: '',
    labelWidth: undefined,
    required: false,
    rules: undefined,
    showError: undefined,
    validateTrigger: 'submit',
  },
)

const context = inject<VaroFormContext>(formContextKey)
if (!context) {
  throw new Error('VFormItem must be used inside VForm')
}
const formContext = context
const mergedRules = computed<FieldRule | undefined>(() => {
  const baseRules = props.rules ?? formContext.form.rules.value[props.name]
  if (!props.required) { return baseRules }
  if (!baseRules) { return { required: true } }
  if (typeof baseRules === 'string') { return baseRules.includes('required') ? baseRules : `required|${baseRules}` }
  if (Array.isArray(baseRules)) { return [{ required: true }, ...baseRules] }
  if (typeof baseRules === 'function') { return [{ required: true }, baseRules] }
  return { required: true, ...baseRules }
})
const field = formContext.form.registerField(props.name, {
  label: props.label,
  rules: mergedRules.value,
})
const slotErrorMessage = field.errorMessage as PublicRef<string>
const slotField = field as unknown as Record<string, unknown>
const slotValidate = field.validate as (trigger?: FormValidateTrigger) => Promise<{ errors: string[], valid: boolean }>
const slotValue = field.value as PublicRef<unknown>
const invalid = computed(() => field.errorMessage.value.length > 0)
const shouldShowError = computed(() => props.showError ?? formContext.showError)
const labelWidth = computed(() => {
  if (props.labelWidth === undefined || props.labelWidth === '') { return '' }
  return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
})
const itemStyle = computed(() => `--varo-form-item-label-width:${labelWidth.value}`)

watch(mergedRules, rules => field.setRules(rules))
onBeforeUnmount(() => field.unregister())

function setValue(value: unknown) {
  field.value.value = value
  if (props.validateTrigger === 'change') {
    void field.validate()
  }
  else if (formContext.form.shouldValidateField(props.name, 'change')) {
    void field.validate('change')
  }
}

function onBlur(event?: unknown) {
  field.setTouched(true)
  if (props.validateTrigger === 'blur') {
    void field.validate()
  }
  else if (formContext.form.shouldValidateField(props.name, 'blur')) {
    void field.validate('blur')
  }
  return event
}
</script>

<template>
  <view
    class="varo-form-item"
    :style="itemStyle"
    :data-invalid="String(invalid)"
    :data-name="props.name"
    :data-required="String(props.required)"
    :data-validate-trigger="props.validateTrigger"
  >
    <view v-if="props.label || $slots.label" class="varo-form-item__label">
      <slot name="label">
        {{ props.label }}
      </slot>
      <text v-if="props.colon" class="varo-form-item__colon">
        :
      </text>
    </view>
    <view class="varo-form-item__body">
      <view class="varo-form-item__control">
        <slot
          :error-message="slotErrorMessage"
          :field="slotField"
          :on-blur="onBlur"
          :set-value="setValue"
          :validate="slotValidate"
          :value="slotValue"
        />
      </view>
      <view v-if="shouldShowError && invalid" class="varo-form-item__error">
        {{ field.errorMessage.value }}
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
