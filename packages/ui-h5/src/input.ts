import type { PressableSize } from '@varo/primitives-h5'
import type { ComputedRef, InjectionKey, PropType, ShallowRef, StyleValue } from 'vue'

import { InputRoot } from '@varo/primitives-h5'
import { createVariantClass } from '@varo/shared'
import { computed, defineComponent, getCurrentInstance, h, inject, onUpdated, ref, shallowRef, useId } from 'vue'
import { VIcon } from './icon'

type InputAlign = 'left' | 'center' | 'right'
type InputClearTrigger = 'focus' | 'always'
type InputFormatTrigger = 'onInput' | 'onBlur'
type InputAutosize = boolean | { minRows?: number, maxRows?: number }
interface InputRootExpose {
  blur: () => void
  clear: () => boolean
  focus: () => void
}

interface FormItemControlContext {
  controlId: ShallowRef<string>
  defaultControlId: string
  errorId: string
  errorVisible: ComputedRef<boolean>
  invalid: ComputedRef<boolean>
  labelId: string
  labelVisible: ComputedRef<boolean>
}

const hasOwn = Object.prototype.hasOwnProperty
const formItemControlContextKey = 'varo-form-item-control' as unknown as InjectionKey<FormItemControlContext>

function mergeAriaTokens(...values: unknown[]) {
  const tokens = values.flatMap(value => typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : [])
  return tokens.length > 0 ? [...new Set(tokens)].join(' ') : undefined
}

export const VInput = defineComponent({
  name: 'VInput',
  props: {
    disabled: Boolean,
    invalid: Boolean,
    readonly: Boolean,
    clearable: Boolean,
    showWordLimit: Boolean,
    value: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: String,
      default: '',
    },
    placeholder: String,
    type: {
      type: String,
      default: 'text',
    },
    maxLength: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined,
    },
    formatter: {
      type: Function as PropType<(value: string) => string>,
      default: undefined,
    },
    formatTrigger: {
      type: String as PropType<InputFormatTrigger>,
      default: 'onInput',
    },
    rows: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined,
    },
    autosize: {
      type: [Boolean, Object] as PropType<InputAutosize>,
      default: false,
    },
    size: {
      type: String as PropType<PressableSize>,
      default: 'md',
    },
    align: {
      type: String as PropType<InputAlign>,
      default: 'left',
    },
    label: {
      type: String,
      default: undefined,
    },
    labelWidth: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined,
    },
    prefixIcon: {
      type: String,
      default: undefined,
    },
    suffixIcon: {
      type: String,
      default: undefined,
    },
    errorMessage: {
      type: String,
      default: undefined,
    },
    clearTrigger: {
      type: String as PropType<InputClearTrigger>,
      default: 'focus',
    },
  },
  emits: ['update:value', 'valueChange', 'clear', 'focus', 'blur'],
  setup(props, { attrs, emit, slots }) {
    const instance = getCurrentInstance()
    const inputRoot = ref<InputRootExpose>()
    const focused = shallowRef(false)
    const localValue = shallowRef(props.defaultValue)
    const formItemControl = inject(formItemControlContextKey, null)
    const inputId = `varo-input-${useId().replaceAll(':', '')}`
    const ownControlId = `${inputId}-control`
    const ownErrorId = `${inputId}-error`
    const ownLabelId = `${inputId}-label`
    const labelVisible = computed(() => Boolean(props.label || slots.label))
    const effectiveInvalid = computed(() => props.invalid || formItemControl?.invalid.value || false)
    const controlId = computed(() => {
      const callerId = attrs.id
      return typeof callerId === 'string' && callerId.length > 0 ? callerId : ownControlId
    })

    function syncFormControlId() {
      if (!formItemControl) {
        return
      }

      const callerId = attrs.id
      formItemControl.controlId.value = typeof callerId === 'string' && callerId.length > 0
        ? callerId
        : ownControlId
    }

    syncFormControlId()
    onUpdated(syncFormControlId)
    const valueControlled = computed(() => {
      const vnodeProps = instance?.vnode.props
      return vnodeProps ? hasOwn.call(vnodeProps, 'value') : false
    })
    const currentValue = computed(() => (valueControlled.value ? props.value ?? '' : localValue.value))
    const labelBasis = computed(() => {
      if (props.labelWidth == null || props.labelWidth === '') {
        return undefined
      }

      return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
    })
    const classes = computed(() =>
      createVariantClass('varo-input', { size: props.size, align: props.align, disabled: props.disabled, invalid: effectiveInvalid.value, readonly: props.readonly, clearable: props.clearable }),
    )
    const normalizedMaxLength = computed(() => {
      if (props.maxLength == null || props.maxLength === '') {
        return undefined
      }

      const value = Number(props.maxLength)
      return Number.isFinite(value) && value >= 0 ? Math.trunc(value) : undefined
    })
    const showClear = computed(
      () =>
        props.clearable
        && currentValue.value.length > 0
        && !props.disabled
        && !props.readonly
        && (props.clearTrigger === 'always' || focused.value),
    )
    const wordLimit = computed(() => {
      const length = currentValue.value.length
      const maxLength = normalizedMaxLength.value
      return maxLength == null ? String(length) : `${length}/${maxLength}`
    })

    function updateCurrentValue(value: string) {
      if (!valueControlled.value) {
        localValue.value = value
      }

      emit('update:value', value)
      emit('valueChange', value)
    }

    function clear(event: MouseEvent) {
      event.preventDefault()

      if (props.disabled || props.readonly) {
        return
      }

      const cleared = inputRoot.value?.clear()
      if (cleared !== false && !inputRoot.value) {
        updateCurrentValue('')
      }

      emit('clear', event)
      inputRoot.value?.focus()
    }

    function renderAffix(slotName: 'prefix' | 'suffix', icon: string | undefined) {
      const content = slots[slotName]?.() ?? (icon ? [icon] : [])

      if (content.length === 0) {
        return null
      }

      return h(
        'span',
        {
          'class': `varo-input__${slotName}`,
          'aria-hidden': icon ? 'true' : undefined,
        },
        content,
      )
    }

    return () => {
      const {
        'aria-describedby': callerDescribedBy,
        'aria-labelledby': callerLabelledBy,
        class: className,
        id: _callerId,
        style,
        ...inputAttrs
      } = attrs
      const prefix = renderAffix('prefix', props.prefixIcon)
      const suffix = renderAffix('suffix', props.suffixIcon)
      const controlledValueProps = valueControlled.value ? { value: props.value } : {}
      const describedBy = mergeAriaTokens(
        callerDescribedBy,
        formItemControl?.errorVisible.value ? formItemControl.errorId : undefined,
        props.errorMessage ? ownErrorId : undefined,
      )
      const labelledBy = mergeAriaTokens(
        callerLabelledBy,
        formItemControl?.labelVisible.value ? formItemControl.labelId : undefined,
        labelVisible.value ? ownLabelId : undefined,
      )
      return h(
        'div',
        {
          'class': [classes.value, className],
          'style': style as StyleValue,
          'data-align': props.align,
          'data-clearable': String(props.clearable),
          'data-disabled': String(props.disabled),
          'data-focused': String(focused.value),
          'data-invalid': String(effectiveInvalid.value),
          'data-readonly': String(props.readonly),
          'data-size': props.size,
        },
        [
          labelVisible.value
            ? h(
                'label',
                {
                  class: 'varo-input__label',
                  for: controlId.value,
                  id: ownLabelId,
                  style: labelBasis.value ? { width: labelBasis.value, flexBasis: labelBasis.value } : undefined,
                },
                slots.label?.() ?? props.label,
              )
            : null,
          h('div', { class: 'varo-input__body' }, [
            prefix,
            h(InputRoot, {
              ...inputAttrs,
              ...controlledValueProps,
              'ref': inputRoot,
              'autosize': props.autosize,
              'class': 'varo-input__control',
              'aria-describedby': describedBy,
              'aria-labelledby': labelledBy,
              'defaultValue': props.defaultValue,
              'id': controlId.value,
              'disabled': props.disabled,
              'formatTrigger': props.formatTrigger,
              'formatter': props.formatter,
              'invalid': effectiveInvalid.value,
              'maxLength': props.maxLength,
              'placeholder': props.placeholder,
              'readonly': props.readonly,
              'rows': props.rows,
              'style': { textAlign: props.align },
              'type': props.type,
              'onBlur': (event: FocusEvent) => {
                focused.value = false
                emit('blur', event)
              },
              'onFocus': (event: FocusEvent) => {
                focused.value = true
                emit('focus', event)
              },
              'onValueChange': updateCurrentValue,
            }),
            showClear.value
              ? h(
                  'button',
                  {
                    'class': 'varo-input__clear',
                    'type': 'button',
                    'aria-label': 'Clear input',
                    'onClick': clear,
                    'onMousedown': (event: MouseEvent) => event.preventDefault(),
                  },
                  h(VIcon, { name: 'close', size: 14 }),
                )
              : null,
            props.showWordLimit ? h('span', { class: 'varo-input__word-limit' }, wordLimit.value) : null,
            suffix,
          ]),
          props.errorMessage ? h('div', { class: 'varo-input__error', id: ownErrorId }, props.errorMessage) : null,
        ],
      )
    }
  },
})
