import { computed, defineComponent, h, ref, type PropType, type StyleValue } from 'vue'
import { createVariantClass } from '@varo/shared'
import { useVaroTheme } from '@varo/theme'
import { InputRoot } from '@varo/primitives-weapp'
import type { PressableSize } from '@varo/primitives-weapp'

type InputAlign = 'left' | 'center' | 'right'
type InputClearTrigger = 'focus' | 'always'
type InputFormatTrigger = 'onInput' | 'onBlur'
type InputAutosize = boolean | { minRows?: number; maxRows?: number }
type InputRootExpose = {
  blur: () => void
  clear: () => boolean
  focus: () => void
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
      default: undefined
    },
    defaultValue: {
      type: String,
      default: ''
    },
    placeholder: String,
    type: {
      type: String,
      default: 'text'
    },
    maxLength: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined
    },
    formatter: {
      type: Function as PropType<(value: string) => string>,
      default: undefined
    },
    formatTrigger: {
      type: String as PropType<InputFormatTrigger>,
      default: 'onInput'
    },
    rows: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined
    },
    autosize: {
      type: [Boolean, Object] as PropType<InputAutosize>,
      default: false
    },
    size: {
      type: String as PropType<PressableSize>,
      default: 'md'
    },
    align: {
      type: String as PropType<InputAlign>,
      default: 'left'
    },
    label: {
      type: String,
      default: undefined
    },
    labelWidth: {
      type: [Number, String] as PropType<number | string | undefined>,
      default: undefined
    },
    prefixIcon: {
      type: String,
      default: undefined
    },
    suffixIcon: {
      type: String,
      default: undefined
    },
    errorMessage: {
      type: String,
      default: undefined
    },
    clearTrigger: {
      type: String as PropType<InputClearTrigger>,
      default: 'focus'
    }
  },
  emits: ['update:value', 'valueChange', 'clear', 'focus', 'blur'],
  setup(props, { attrs, emit, slots }) {
    const theme = useVaroTheme()
    const inputRoot = ref<InputRootExpose>()
    const focused = ref(false)
    const localValue = ref(props.defaultValue)
    const currentValue = computed(() => props.value ?? localValue.value)
    const labelBasis = computed(() => {
      if (props.labelWidth == null || props.labelWidth === '') {
        return undefined
      }

      return typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
    })
    const classes = computed(() =>
      createVariantClass('varo-input', {
        radius: theme.value.components.input.borderRadius,
        size: props.size,
        align: props.align,
        disabled: props.disabled,
        invalid: props.invalid,
        readonly: props.readonly,
        clearable: props.clearable
      })
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
        props.clearable &&
        currentValue.value.length > 0 &&
        !props.disabled &&
        !props.readonly &&
        (props.clearTrigger === 'always' || focused.value)
    )
    const wordLimit = computed(() => {
      const length = currentValue.value.length
      const maxLength = normalizedMaxLength.value
      return maxLength == null ? String(length) : `${length}/${maxLength}`
    })

    function updateCurrentValue(value: string) {
      if (props.value === undefined) {
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
          class: `varo-input__${slotName}`,
          'aria-hidden': icon ? 'true' : undefined
        },
        content
      )
    }

    return () => {
      const { class: className, style, ...inputAttrs } = attrs
      const prefix = renderAffix('prefix', props.prefixIcon)
      const suffix = renderAffix('suffix', props.suffixIcon)

      return h(
        'div',
        {
          class: [classes.value, className],
          style: style as StyleValue,
          'data-align': props.align,
          'data-clearable': String(props.clearable),
          'data-disabled': String(props.disabled),
          'data-focused': String(focused.value),
          'data-invalid': String(props.invalid),
          'data-readonly': String(props.readonly),
          'data-size': props.size
        },
        [
          props.label || slots.label
            ? h(
                'span',
                {
                  class: 'varo-input__label',
                  style: labelBasis.value ? { width: labelBasis.value, flexBasis: labelBasis.value } : undefined
                },
                slots.label?.() ?? props.label
              )
            : null,
          h('div', { class: 'varo-input__body' }, [
            prefix,
            h(InputRoot, {
              ...inputAttrs,
              ref: inputRoot,
              autosize: props.autosize,
              class: 'varo-input__control',
              defaultValue: props.defaultValue,
              disabled: props.disabled,
              formatTrigger: props.formatTrigger,
              formatter: props.formatter,
              invalid: props.invalid,
              maxLength: props.maxLength,
              placeholder: props.placeholder,
              readonly: props.readonly,
              rows: props.rows,
              style: { textAlign: props.align },
              type: props.type,
              value: props.value,
              onBlur: (event: FocusEvent) => {
                focused.value = false
                emit('blur', event)
              },
              onFocus: (event: FocusEvent) => {
                focused.value = true
                emit('focus', event)
              },
              onValueChange: updateCurrentValue
            }),
            showClear.value
              ? h(
                  'button',
                  {
                    class: 'varo-input__clear',
                    type: 'button',
                    'aria-label': 'Clear input',
                    onClick: clear,
                    onMousedown: (event: MouseEvent) => event.preventDefault()
                  },
                  '×'
                )
              : null,
            props.showWordLimit ? h('span', { class: 'varo-input__word-limit' }, wordLimit.value) : null,
            suffix
          ]),
          props.errorMessage ? h('div', { class: 'varo-input__error' }, props.errorMessage) : null
        ]
      )
    }
  }
})
