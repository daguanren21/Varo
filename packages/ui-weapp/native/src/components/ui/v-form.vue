<script setup lang="ts">
import type { FormRules, SubmitPayload as FormSubmitPayload, FormValues, StandardSchemaV1 } from '@varo-ui/headless'
import { useForm } from '@varo-ui/headless'
import { computed, provide, shallowRef, watch } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { formContextKey } from './form-context'

type FormLabelAlign = 'left' | 'center' | 'right'

defineOptions({
  properties: { validateOnChange: { type: null, value: null } },
})

const props = withDefaults(
  defineProps<{
    colon?: boolean
    disabled?: boolean
    initialValues?: FormValues
    labelAlign?: FormLabelAlign
    labelWidth?: number | string
    model?: FormValues
    rules?: FormRules
    validationSchema?: StandardSchemaV1<FormValues>
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
    rules: undefined,
    showError: true,
    validateOnChange: undefined,
  },
)

const emit = defineEmits<{
  'failed': [payload: FormSubmitPayload]
  'reset': [payload: { errors: Record<string, string>, values: FormValues }]
  'submit': [payload: FormSubmitPayload]
  'update:model': [values: FormValues]
}>()

const localValues = shallowRef<FormValues>({ ...(props.model ?? props.initialValues ?? {}) })

const values = computed<FormValues>({
  get: () => localValues.value,
  set: (nextValues) => {
    localValues.value = nextValues
    if (props.model != null) {
      emit('update:model', nextValues)
    }
  },
})
const form = useForm({
  initialValues: (props.model ?? props.initialValues ?? {}) as FormValues,
  rules: props.rules,
  runtime: varoReactiveRuntime,
  validateOnChange: props.validateOnChange ?? undefined,
  validationSchema: props.validationSchema,
  values,
})
const labelWidth = computed(() => {
  if (props.labelWidth === undefined || props.labelWidth === '') { return '' }
  return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
})
const formStyle = computed(() => `--varo-form-label-width:${labelWidth.value}`)

watch(
  () => props.model,
  (model) => {
    if (model != null) { localValues.value = { ...model } }
  },
  { deep: true },
)
watch(
  () => props.rules,
  rules => form.setRules(rules),
  { deep: true },
)
watch(
  () => props.validationSchema,
  schema => form.setValidationSchema(schema),
)

provide(formContextKey, {
  form,
  disabled: computed(() => props.disabled),
  showError: props.showError,
})

async function submit(event?: unknown) {
  if (props.disabled) { return }
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
