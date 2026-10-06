import type { FieldRule, FormRules, SubmitPayload as FormSubmitPayload, FormValues, ReactiveRuntime, StandardSchemaV1, UseFormReturn } from '@varo-ui/headless'
import type { ComputedRef, InjectionKey, PropType, ShallowRef, StyleValue } from 'vue'
import { createVariantClass, useForm } from '@varo-ui/headless'
import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  shallowRef,
  useId,
  watch,
} from 'vue'
import '../../styles/varo.css'
import '../../styles/varo-form.css'

type FormLabelAlign = 'left' | 'center' | 'right'
type FormValidateTrigger = 'submit' | 'change' | 'blur'

interface FormItemControlContext {
  controlId: ShallowRef<string>
  defaultControlId: string
  disabled: ComputedRef<boolean>
  descriptionId: string
  descriptionVisible: ComputedRef<boolean>
  errorId: string
  errorVisible: ComputedRef<boolean>
  invalid: ComputedRef<boolean>
  labelId: string
  labelVisible: ComputedRef<boolean>
}

const formContextKey: InjectionKey<{
  form: UseFormReturn
  disabled: ComputedRef<boolean>
  showError: boolean
}> = Symbol('varo-form')
const formItemControlContextKey = 'varo-form-item-control' as unknown as InjectionKey<FormItemControlContext>

const vueRuntime: ReactiveRuntime = {
  computed,
  ref,
}

function normalizeLabelWidth(value: number | string | undefined): string | undefined {
  if (value === undefined || value === '') { return undefined }
  return typeof value === 'number' ? `${value}px` : value
}

export const VForm = defineComponent({
  name: 'VForm',
  props: {
    colon: Boolean,
    disabled: Boolean,
    model: {
      type: Object as PropType<FormValues | undefined>,
      default: undefined,
    },
    initialValues: {
      type: Object as PropType<FormValues | undefined>,
      default: undefined,
    },
    rules: {
      type: Object as PropType<FormRules>,
      default: undefined,
    },
    validationSchema: {
      type: Object as PropType<StandardSchemaV1<FormValues>>,
      default: undefined,
    },
    labelAlign: {
      type: String as PropType<FormLabelAlign>,
      default: 'left',
    },
    labelWidth: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined,
    },
    showError: {
      type: Boolean,
      default: true,
    },
    validateOnChange: {
      type: Boolean,
      default: undefined,
    },
  },
  emits: ['submit', 'failed', 'reset'],
  setup(props, { attrs, emit, expose, slots }) {
    const localValues = ref<FormValues>({ ...(props.initialValues ?? {}) })
    const values = computed<FormValues>({
      get: () => props.model ?? localValues.value,
      set: (nextValues) => {
        if (props.model) {
          Object.keys(props.model).forEach((key) => {
            if (!(key in nextValues)) { delete props.model?.[key] }
          })
          Object.assign(props.model, nextValues)
        }
        else {
          localValues.value = nextValues
        }
      },
    })
    const form = useForm({
      initialValues: (props.model ?? props.initialValues ?? {}) as FormValues,
      rules: props.rules,
      runtime: vueRuntime,
      validateOnChange: props.validateOnChange,
      validationSchema: props.validationSchema,
      values,
    })
    const classes = computed(() =>
      createVariantClass('varo-form', { disabled: props.disabled }),
    )
    const labelBasis = computed(() => normalizeLabelWidth(props.labelWidth))

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

    async function submit(event?: Event) {
      event?.preventDefault()
      if (props.disabled) { return }

      return form.handleSubmit(
        (payload) => {
          emit('submit', payload)
        },
        (payload) => {
          emit('failed', payload)
        },
      )(event)
    }

    function reset() {
      form.reset((props.initialValues ?? props.model ?? {}) as FormValues)
      emit('reset', {
        errors: form.errors.value,
        values: form.values.value,
      })
    }

    expose({
      form,
      reset,
      validate: form.validate,
      validateField: form.validateField,
    })

    return () => {
      const { class: className, style, ...formAttrs } = attrs

      return h(
        'form',
        {
          ...formAttrs,
          'class': [classes.value, className],
          'style': [
            {
              '--varo-form-label-width': labelBasis.value,
            },
            style as StyleValue,
          ],
          'data-disabled': String(props.disabled),
          'data-label-align': props.labelAlign,
          'onReset': (event: Event) => {
            event.preventDefault()
            reset()
          },
          'onSubmit': submit,
        },
        slots.default?.({ form }) ?? [],
      )
    }
  },
})

export const VFormItem = defineComponent({
  name: 'VFormItem',
  props: {
    colon: Boolean,
    description: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: undefined,
    },
    labelWidth: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined,
    },
    name: {
      type: String,
      required: true,
    },
    required: Boolean,
    rules: {
      type: [String, Object, Function, Array] as PropType<FieldRule | undefined>,
      default: undefined,
    },
    showError: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    validateTrigger: {
      type: String as PropType<FormValidateTrigger>,
      default: 'submit',
    },
  },
  setup(props, { attrs, slots }) {
    const context = inject(formContextKey)
    if (!context) {
      throw new Error('VFormItem must be used inside VForm')
    }
    const formContext = context

    const mergedRules = computed<FieldRule | undefined>(() => {
      const baseRules = props.rules ?? formContext.form.rules.value[props.name]

      if (!props.required) { return baseRules }

      if (!baseRules) {
        return { required: true }
      }

      if (typeof baseRules === 'string') {
        return baseRules.includes('required') ? baseRules : `required|${baseRules}`
      }

      if (Array.isArray(baseRules)) {
        return [{ required: true }, ...baseRules]
      }

      if (typeof baseRules === 'function') {
        return [{ required: true }, baseRules]
      }

      return {
        required: true,
        ...baseRules,
      }
    })
    const field = formContext.form.registerField(props.name, {
      label: props.label,
      rules: mergedRules.value,
    })
    const invalid = computed(() => field.errorMessage.value.length > 0)
    const shouldShowError = computed(() => props.showError ?? formContext.showError)
    const labelBasis = computed(() => normalizeLabelWidth(props.labelWidth))
    const itemId = `varo-form-item-${useId().replaceAll(':', '')}`
    const defaultControlId = `${itemId}-control`
    const controlId = shallowRef(defaultControlId)
    const errorId = `${itemId}-error`
    const descriptionId = `${itemId}-description`
    const labelId = `${itemId}-label`
    const labelVisible = computed(() => Boolean(props.label || slots.label))
    const descriptionVisible = computed(() => Boolean(props.description || slots.description))
    const errorVisible = computed(() => shouldShowError.value && invalid.value)
    const controlAriaDescribedBy = computed(() => [
      descriptionVisible.value ? descriptionId : undefined,
      errorVisible.value ? errorId : undefined,
    ].filter(Boolean).join(' ') || undefined)

    provide(formItemControlContextKey, {
      controlId,
      defaultControlId,
      disabled: formContext.disabled,
      descriptionId,
      descriptionVisible,
      errorId,
      errorVisible,
      invalid,
      labelId,
      labelVisible,
    })

    watch(mergedRules, rules => field.setRules(rules))
    onBeforeUnmount(() => field.unregister())

    function setValue(value: unknown) {
      if (formContext.disabled.value || Object.is(field.value.value, value)) { return }
      field.value.value = value
      if (props.validateTrigger === 'change') {
        void field.validate()
      }
      else if (formContext.form.shouldValidateField(props.name, 'change')) {
        void field.validate('change')
      }
    }

    function onBlur(event?: FocusEvent) {
      if (formContext.disabled.value) { return event }
      field.setTouched(true)
      if (props.validateTrigger === 'blur') {
        void field.validate()
      }
      else if (formContext.form.shouldValidateField(props.name, 'blur')) {
        void field.validate('blur')
      }
      return event
    }

    return () => {
      const { class: className, style, ...itemAttrs } = attrs

      return h(
        'div',
        {
          ...itemAttrs,
          'class': ['varo-form-item', className],
          'style': [
            labelBasis.value ? { '--varo-form-item-label-width': labelBasis.value } : undefined,
            style as StyleValue,
          ],
          'data-invalid': String(invalid.value),
          'data-name': props.name,
          'data-required': String(props.required),
          'data-validate-trigger': props.validateTrigger,
        },
        [
          labelVisible.value
            ? h('label', {
                class: 'varo-form-item__label',
                for: controlId.value === defaultControlId ? undefined : controlId.value,
                id: labelId,
              }, [
                slots.label?.() ?? props.label,
                props.colon ? h('span', { class: 'varo-form-item__colon' }, ':') : null,
              ])
            : null,
          h('div', { class: 'varo-form-item__body' }, [
            h(
              'div',
              {
                'aria-describedby': controlAriaDescribedBy.value,
                'aria-invalid': invalid.value || undefined,
                'aria-labelledby': labelVisible.value ? labelId : undefined,
                'class': 'varo-form-item__control',
                'role': 'group',
              },
              slots.default?.({
                errorMessage: field.errorMessage,
                field,
                onBlur,
                setValue,
                validate: field.validate,
                value: field.value,
              }) ?? [],
            ),
            descriptionVisible.value
              ? h('div', { class: 'varo-form-item__description', id: descriptionId }, slots.description?.() ?? props.description)
              : null,
            errorVisible.value
              ? h('div', { class: 'varo-form-item__error', id: errorId }, field.errorMessage.value)
              : null,
          ]),
        ],
      )
    }
  },
})

export type { FieldRule, FormRules, FormSubmitPayload, FormValues, UseFormReturn }
