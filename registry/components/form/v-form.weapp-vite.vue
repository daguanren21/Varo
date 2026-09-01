<script setup lang="ts">
import type { FormRules, FormValues, UseFormReturn } from '@varo-ui/headless'
import { useForm } from '@varo-ui/headless'
import { computed, provide, shallowRef, watch } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { formContextKey } from './form-context'

type FormLabelAlign = 'left' | 'center' | 'right'
type FormSubmitPayload = Parameters<ReturnType<UseFormReturn['handleSubmit']>>[0]

const props = withDefaults(
  defineProps<{
    colon?: boolean
    disabled?: boolean
    initialValues?: FormValues
    labelAlign?: FormLabelAlign
    labelWidth?: number | string
    model?: FormValues
    rules?: FormRules
    showError?: boolean
    validateOnChange?: boolean
  }>(),
  {
    colon: false,
    disabled: false,
    initialValues: undefined,
    labelAlign: 'left',
    labelWidth: undefined,
    model: undefined,
    rules: () => ({}),
    showError: true,
    validateOnChange: false,
  },
)

const emit = defineEmits<{
  failed: [payload: FormSubmitPayload]
  reset: [payload: { errors: Record<string, string>, values: FormValues }]
  submit: [payload: FormSubmitPayload]
}>()

const localValues = shallowRef<FormValues>({ ...(props.initialValues ?? {}) })
function replaceValues(target: FormValues, nextValues: FormValues) {
  Object.keys(target).forEach((key) => {
    if (!(key in nextValues)) { delete target[key] }
  })
  Object.assign(target, nextValues)
}

const values = computed<FormValues>({
  get: () => props.model ?? localValues.value,
  set: (nextValues) => {
    if (props.model) {
      replaceValues(props.model, nextValues)
      return
    }
    localValues.value = nextValues
  },
})
const form = useForm({
  initialValues: (props.model ?? props.initialValues ?? {}) as FormValues,
  rules: props.rules,
  runtime: varoReactiveRuntime,
  validateOnChange: props.validateOnChange,
  values,
})
const labelWidth = computed(() => {
  if (props.labelWidth === undefined || props.labelWidth === '') { return '' }
  return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
})
const formStyle = computed(() => `--varo-form-label-width:${labelWidth.value}`)

watch(
  () => props.rules,
  rules => form.setRules(rules),
  { deep: true },
)

provide(formContextKey, {
  form,
  showError: props.showError,
})

async function submit(event?: unknown) {
  return form.handleSubmit(
    payload => emit('submit', payload),
    payload => emit('failed', payload),
  )(event)
}

function reset() {
  form.reset((props.initialValues ?? props.model ?? {}) as FormValues)
  emit('reset', {
    errors: form.errors.value,
    values: form.values.value,
  })
}

defineExpose({
  form,
  reset,
  validate: form.validate,
  validateField: form.validateField,
})
</script>

<template>
  <form
    class="varo-form"
    :style="formStyle"
    :data-disabled="String(props.disabled)"
    :data-label-align="props.labelAlign"
    @submit="submit"
    @reset="reset"
  >
    <slot :form="form" />
  </form>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
