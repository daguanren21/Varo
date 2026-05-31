import { getByPath, setByPath } from '@varo/utils'

export interface Ref<T> {
  value: T
}

export interface WritableRef<T> extends Ref<T> {
  value: T
}

export interface ReactiveRuntime {
  ref: <T>(value: T) => WritableRef<T>
  computed: {
    <T>(getter: () => T): Ref<T>
    <T>(options: { get: () => T; set: (value: T) => void }): WritableRef<T>
  }
}

export type FormValues = Record<string, unknown>
export type FormErrors = Record<string, string>
export type FormMeta = Record<string, boolean>
export type RuleResult = boolean | string | null | undefined
export type AsyncRuleResult = RuleResult | Promise<RuleResult>
export type FieldValidateTrigger = 'submit' | 'change' | 'blur'
export type FieldValidateTriggerConfig = FieldValidateTrigger | FieldValidateTrigger[]

export interface RuleContext<TValues extends FormValues = FormValues> {
  form: Pick<UseFormReturn<TValues>, 'getFieldValue' | 'setFieldValue' | 'values'>
  label?: string
  name: string
  params?: unknown
  values: TValues
}

export type RuleValidator<TValues extends FormValues = FormValues> = (
  value: unknown,
  context: RuleContext<TValues>
) => AsyncRuleResult

export interface RuleRecord<TValues extends FormValues = FormValues> extends Record<string, unknown> {
  message?: string
  trigger?: FieldValidateTriggerConfig
  validator?: RuleValidator<TValues>
}
export type FieldRule<TValues extends FormValues = FormValues> =
  | string
  | RuleRecord<TValues>
  | RuleValidator<TValues>
  | Array<string | RuleRecord<TValues> | RuleValidator<TValues>>
export type FormRules<TValues extends FormValues = FormValues> = Partial<
  Record<keyof TValues | string, FieldRule<TValues>>
>

export interface ValidationResult {
  errors: string[]
  valid: boolean
}

export interface FormValidationResult<TValues extends FormValues = FormValues> {
  errors: FormErrors
  valid: boolean
  values: TValues
}

export interface UseFormOptions<TValues extends FormValues = FormValues> {
  initialValues?: TValues
  rules?: FormRules<TValues>
  runtime?: ReactiveRuntime
  validateOnChange?: boolean
  values?: WritableRef<TValues>
}

export interface RegisterFieldOptions<TValues extends FormValues = FormValues> {
  label?: string
  rules?: FieldRule<TValues>
}

export interface UseFieldReturn<TValue = unknown> {
  dirty: Ref<boolean>
  errorMessage: Ref<string>
  errors: Ref<string[]>
  label?: string
  name: string
  reset: (value?: TValue) => void
  setRules: (rules?: FieldRule) => void
  setTouched: (touched: boolean) => void
  touched: Ref<boolean>
  unregister: () => void
  validate: (trigger?: FieldValidateTrigger) => Promise<ValidationResult>
  value: WritableRef<TValue>
}

export interface SubmitPayload<TValues extends FormValues = FormValues> {
  errors: FormErrors
  event?: unknown
  values: TValues
}

export interface UseFormReturn<TValues extends FormValues = FormValues> {
  dirty: WritableRef<FormMeta>
  errors: WritableRef<FormErrors>
  getFieldValue: <TValue = unknown>(name: string) => TValue
  handleSubmit: (
    onValid: (payload: SubmitPayload<TValues>) => unknown | Promise<unknown>,
    onInvalid?: (payload: SubmitPayload<TValues>) => unknown | Promise<unknown>
  ) => (event?: unknown) => Promise<FormValidationResult<TValues>>
  registerField: <TValue = unknown>(
    name: string,
    options?: RegisterFieldOptions<TValues>
  ) => UseFieldReturn<TValue>
  reset: (values?: TValues) => void
  rules: WritableRef<FormRules<TValues>>
  setFieldError: (name: string, error?: string) => void
  setFieldTouched: (name: string, touched: boolean) => void
  setFieldValue: <TValue = unknown>(name: string, value: TValue) => void
  setRules: (rules?: FormRules<TValues>) => void
  shouldValidateField: (name: string, trigger: Exclude<FieldValidateTrigger, 'submit'>) => boolean
  submitCount: WritableRef<number>
  touched: WritableRef<FormMeta>
  validate: () => Promise<FormValidationResult<TValues>>
  validateField: (name: string, trigger?: FieldValidateTrigger) => Promise<ValidationResult>
  validateOnChange: boolean
  values: WritableRef<TValues>
}

interface FieldRegistration<TValues extends FormValues = FormValues> {
  label?: string
  rules?: FieldRule<TValues>
}

interface NormalizedRule<TValues extends FormValues = FormValues> {
  message?: string
  name?: string
  params?: unknown
  trigger?: FieldValidateTriggerConfig
  validator?: RuleValidator<TValues>
}

const ruleRegistry = new Map<string, RuleValidator>()

function ref<T>(value: T): WritableRef<T> {
  return { value }
}

function computed<T>(getter: () => T): Ref<T>
function computed<T>(options: { get: () => T; set: (value: T) => void }): WritableRef<T>
function computed<T>(source: (() => T) | { get: () => T; set: (value: T) => void }) {
  if (typeof source === 'function') {
    return {
      get value() {
        return source()
      }
    }
  }

  return {
    get value() {
      return source.get()
    },
    set value(value: T) {
      source.set(value)
    }
  }
}

const defaultReactiveRuntime: ReactiveRuntime = {
  computed,
  ref
}

function resolveRuntime(runtime?: ReactiveRuntime): ReactiveRuntime {
  return runtime ?? defaultReactiveRuntime
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  return false
}

function getSize(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' || Array.isArray(value)) return value.length
  return Number(value)
}

function toLimit(params: unknown): number {
  if (Array.isArray(params)) return Number(params[0])
  return Number(params)
}

function fieldName(context: RuleContext): string {
  return context.label ?? context.name
}

export function defineRule(name: string, validator: RuleValidator): void {
  ruleRegistry.set(name, validator)
}

defineRule('required', (value, context) => {
  return !isEmpty(value) || `${fieldName(context)} 为必填项`
})

defineRule('min', (value, context) => {
  if (isEmpty(value)) return true
  const min = toLimit(context.params)
  return getSize(value) >= min || `${fieldName(context)} 至少为 ${min}`
})

defineRule('max', (value, context) => {
  if (isEmpty(value)) return true
  const max = toLimit(context.params)
  return getSize(value) <= max || `${fieldName(context)} 最多为 ${max}`
})

defineRule('length', (value, context) => {
  if (isEmpty(value)) return true
  const length = toLimit(context.params)
  return getSize(value) === length || `${fieldName(context)} 长度必须为 ${length}`
})

defineRule('email', (value, context) => {
  if (isEmpty(value)) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) || `${fieldName(context)} 请输入有效邮箱`
})

defineRule('pattern', (value, context) => {
  if (isEmpty(value)) return true
  const pattern = context.params instanceof RegExp ? context.params : new RegExp(String(context.params))
  return pattern.test(String(value)) || `${fieldName(context)} 格式不正确`
})

function parseParams(source: string): unknown {
  if (!source) return true
  const params = source.split(',').map((item) => item.trim())
  return params.length === 1 ? params[0] : params
}

function normalizeStringRule<TValues extends FormValues>(rule: string): NormalizedRule<TValues>[] {
  return rule
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separator = item.indexOf(':')
      if (separator === -1) return { name: item, params: true }
      return {
        name: item.slice(0, separator),
        params: parseParams(item.slice(separator + 1))
      }
    })
}

function normalizeRule<TValues extends FormValues>(
  rule?: FieldRule<TValues>
): NormalizedRule<TValues>[] {
  if (!rule) return []
  if (typeof rule === 'string') return normalizeStringRule(rule)
  if (typeof rule === 'function') return [{ validator: rule }]
  if (Array.isArray(rule)) return rule.flatMap((item) => normalizeRule<TValues>(item))

  if (typeof rule.validator === 'function') {
    return [
      {
        message: typeof rule.message === 'string' ? rule.message : undefined,
        trigger: rule.trigger,
        validator: rule.validator
      }
    ]
  }

  return Object.entries(rule)
    .filter(
      ([name, params]) =>
        name !== 'message' &&
        name !== 'trigger' &&
        name !== 'validator' &&
        params !== false &&
        params !== null &&
        params !== undefined
    )
    .map(([name, params]) => ({
      message: typeof rule.message === 'string' ? rule.message : undefined,
      name,
      params,
      trigger: rule.trigger
    }))
}

function normalizeResult(result: RuleResult, fallback: string): string | undefined {
  if (result === true || result === undefined || result === null) return undefined
  if (result === false) return fallback
  return result
}

function matchesTrigger<TValues extends FormValues>(
  rule: NormalizedRule<TValues>,
  trigger: FieldValidateTrigger
): boolean {
  if (trigger === 'submit') return true
  if (!rule.trigger) return false
  const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger]
  return triggers.includes(trigger)
}

function mergeMeta(source: FormMeta, name: string, value: boolean): FormMeta {
  return {
    ...source,
    [name]: value
  }
}

function mergeErrors(source: FormErrors, name: string, error?: string): FormErrors {
  const next = { ...source }

  if (error) {
    next[name] = error
  } else {
    delete next[name]
  }

  return next
}

export function useForm<TValues extends FormValues = FormValues>(
  options: UseFormOptions<TValues> = {}
): UseFormReturn<TValues> {
  const runtime = resolveRuntime(options.runtime)
  const initialValues = { ...(options.initialValues ?? {}) } as TValues
  const values = options.values ?? runtime.ref(initialValues)
  const rules = runtime.ref(options.rules ?? {})
  const errors = runtime.ref<FormErrors>({})
  const touched = runtime.ref<FormMeta>({})
  const dirty = runtime.ref<FormMeta>({})
  const submitCount = runtime.ref(0)
  const fields = new Map<string, FieldRegistration<TValues>>()
  const validateOnChange = options.validateOnChange ?? false

  const form: UseFormReturn<TValues> = {
    dirty,
    errors,
    getFieldValue<TValue = unknown>(name: string) {
      return getByPath(values.value, name) as TValue
    },
    handleSubmit(onValid, onInvalid) {
      return async (event?: unknown) => {
        submitCount.value += 1
        const result: FormValidationResult<TValues> = await form.validate()
        const payload: SubmitPayload<TValues> = {
          errors: result.errors,
          event,
          values: result.values
        }

        if (result.valid) {
          await onValid(payload)
        } else {
          await onInvalid?.(payload)
        }

        return result
      }
    },
    registerField<TValue = unknown>(name: string, fieldOptions: RegisterFieldOptions<TValues> = {}) {
      fields.set(name, fieldOptions)

      const field = {
        dirty: runtime.computed(() => Boolean(dirty.value[name])),
        errorMessage: runtime.computed(() => errors.value[name] ?? ''),
        errors: runtime.computed(() => (errors.value[name] ? [errors.value[name]] : [])),
        label: fieldOptions.label,
        name,
        reset(value?: TValue) {
          form.setFieldValue(name, value)
          form.setFieldTouched(name, false)
          dirty.value = mergeMeta(dirty.value, name, false)
          form.setFieldError(name)
        },
        setRules(nextRules?: FieldRule) {
          fields.set(name, {
            ...fields.get(name),
            rules: nextRules as FieldRule<TValues> | undefined
          })
        },
        setTouched(nextTouched: boolean) {
          form.setFieldTouched(name, nextTouched)
        },
        touched: runtime.computed(() => Boolean(touched.value[name])),
        unregister() {
          fields.delete(name)
          form.setFieldError(name)
        },
        validate(trigger?: FieldValidateTrigger) {
          return form.validateField(name, trigger)
        },
        value: runtime.computed<TValue>({
          get: () => form.getFieldValue<TValue>(name),
          set: (value) => form.setFieldValue(name, value)
        })
      }

      return field satisfies UseFieldReturn<TValue>
    },
    reset(nextValues?: TValues) {
      values.value = { ...(nextValues ?? initialValues) } as TValues
      errors.value = {}
      touched.value = {}
      dirty.value = {}
      submitCount.value = 0
    },
    rules,
    setFieldError(name: string, error?: string) {
      errors.value = mergeErrors(errors.value, name, error)
    },
    setFieldTouched(name: string, nextTouched: boolean) {
      touched.value = mergeMeta(touched.value, name, nextTouched)
    },
    setFieldValue<TValue = unknown>(name: string, value: TValue) {
      values.value = setByPath(values.value, name, value)
      dirty.value = mergeMeta(dirty.value, name, true)

      if (validateOnChange) {
        void form.validateField(name)
      }
    },
    setRules(nextRules?: FormRules<TValues>) {
      rules.value = nextRules ?? {}
    },
    shouldValidateField(name: string, trigger: Exclude<FieldValidateTrigger, 'submit'>) {
      const field = fields.get(name)
      const fieldRules = field?.rules ?? (rules.value as FormRules<TValues>)[name]

      return normalizeRule(fieldRules).some((rule) => matchesTrigger(rule, trigger))
    },
    submitCount,
    touched,
    async validate() {
      const names = new Set([...Object.keys(rules.value), ...fields.keys()])
      const nextErrors: FormErrors = {}

      await Promise.all(
        Array.from(names).map(async (name) => {
          const result = await form.validateField(name)
          if (!result.valid) {
            nextErrors[name] = result.errors[0] ?? `${name} is invalid`
          }
        })
      )

      errors.value = nextErrors

      return {
        errors: nextErrors,
        valid: Object.keys(nextErrors).length === 0,
        values: values.value
      }
    },
    async validateField(name: string, trigger: FieldValidateTrigger = 'submit') {
      const field = fields.get(name)
      const fieldRules = field?.rules ?? (rules.value as FormRules<TValues>)[name]
      const normalizedRules = normalizeRule(fieldRules).filter((rule) => matchesTrigger(rule, trigger))
      const fieldErrors: string[] = []
      const value = form.getFieldValue(name)

      for (const rule of normalizedRules) {
        const validator = rule.validator ?? (rule.name ? ruleRegistry.get(rule.name) : undefined)
        if (!validator) continue

        const result = await (validator as RuleValidator<TValues>)(value, {
          form,
          label: field?.label,
          name,
          params: rule.params,
          values: values.value
        })
        const error = normalizeResult(result, rule.message ?? `${field?.label ?? name} is invalid`)

        if (error) fieldErrors.push(error)
      }

      form.setFieldError(name, fieldErrors[0])

      return {
        errors: fieldErrors,
        valid: fieldErrors.length === 0
      }
    },
    validateOnChange,
    values
  }

  return form
}

export function useField<TValue = unknown, TValues extends FormValues = FormValues>(
  form: UseFormReturn<TValues>,
  name: string,
  options?: RegisterFieldOptions<TValues>
): UseFieldReturn<TValue> {
  return form.registerField<TValue>(name, options)
}
