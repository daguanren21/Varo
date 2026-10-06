import type { PropType } from 'vue'
import type { InputOtpInputMode, InputOtpPattern } from '../../lib/varo-primitives'
import { createVariantClass } from '@varo-ui/headless'
import { computed, defineComponent, getCurrentInstance, h } from 'vue'
import { InputOtpRoot } from '../../lib/varo-primitives'
import '../../styles/varo.css'
import '../../styles/varo-input-otp.css'

const hasOwn = Object.prototype.hasOwnProperty
type InputOtpSize = 'sm' | 'md' | 'lg'

export const VInputOtp = defineComponent({
  name: 'VInputOtp',
  props: {
    value: { type: String as PropType<string | undefined>, default: undefined },
    defaultValue: { type: String, default: '' },
    length: { type: Number, default: 6 },
    pattern: { type: [String, RegExp] as PropType<InputOtpPattern | undefined>, default: '[0-9]' },
    inputMode: { type: String as PropType<InputOtpInputMode>, default: 'numeric' },
    inputAriaLabel: { type: String, default: 'One-time password' },
    size: { type: String as PropType<InputOtpSize>, default: 'md' },
    separator: String,
    mask: Boolean,
    disabled: Boolean,
    invalid: Boolean,
    readonly: Boolean,
  },
  emits: ['update:value', 'valueChange', 'complete', 'focus', 'blur'],
  setup(props, { attrs, emit, slots }) {
    const instance = getCurrentInstance()
    const valueControlled = computed(() => {
      const vnodeProps = instance?.vnode.props
      return vnodeProps ? hasOwn.call(vnodeProps, 'value') : false
    })
    const classes = computed(() => createVariantClass('varo-input-otp', {
      disabled: props.disabled,
      invalid: props.invalid,
      readonly: props.readonly,
      size: props.size,
    }))

    function renderCells(slotProps: { activeIndex: number, focused: boolean, length: number, value: string }) {
      const cells = Array.from({ length: slotProps.length }, (_, index) => {
        const character = slotProps.value[index] ?? ''
        return [
          h('span', {
            'aria-hidden': 'true',
            'class': 'varo-input-otp__cell',
            'data-active': String(slotProps.focused && slotProps.activeIndex === index),
            'data-filled': String(Boolean(character)),
            'data-index': String(index),
          }, props.mask && character ? '•' : character),
          index < slotProps.length - 1 && props.separator
            ? h('span', { 'aria-hidden': 'true', 'class': 'varo-input-otp__separator' }, props.separator)
            : null,
        ]
      })
      return h('div', { 'aria-hidden': 'true', 'class': 'varo-input-otp__cells' }, cells.flat())
    }

    return () => h(
      InputOtpRoot,
      {
        ...attrs,
        ...valueControlled.value ? { value: props.value } : {},
        'class': [classes.value, attrs.class],
        'data-size': props.size,
        'defaultValue': props.defaultValue,
        'disabled': props.disabled,
        'inputMode': props.inputMode,
        'length': props.length,
        'pattern': props.pattern,
        'readonly': props.readonly,
        'invalid': props.invalid,
        'accessibleLabel': props.inputAriaLabel,
        'onBlur': (event: FocusEvent) => emit('blur', event),
        'onComplete': (value: string) => emit('complete', value),
        'onFocus': (event: FocusEvent) => emit('focus', event),
        'onUpdate:value': (value: string) => {
          emit('update:value', value)
          emit('valueChange', value)
        },
      },
      {
        default: (slotProps: { activeIndex: number, complete: boolean, focused: boolean, length: number, value: string }) => [
          renderCells(slotProps),
          slots.default?.(),
        ],
      },
    )
  },
})
