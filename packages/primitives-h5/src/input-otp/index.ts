import type { InputOtpInputMode, InputOtpPattern, UseInputOtpRootResult } from '@varo-ui/headless'
import type { PropType } from 'vue'
import { useInputOtpRoot } from '@varo-ui/headless'
import { defineComponent, h, ref, toRef } from 'vue'
import { callHandler, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export type * from './types'

function readInputValue(event: Event) {
  return (event.target as HTMLInputElement | null)?.value ?? ''
}

export interface InputOtpRootExpose {
  blur: () => void
  clear: () => boolean
  focus: () => void
  setValue: (value: string) => boolean
}

export const InputOtpRoot = defineComponent({
  name: 'InputOtpRoot',
  inheritAttrs: false,
  props: {
    value: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    defaultValue: {
      type: String,
      default: '',
    },
    length: {
      type: Number,
      default: 6,
    },
    pattern: {
      type: [String, RegExp] as PropType<InputOtpPattern | undefined>,
      default: undefined,
    },
    inputMode: {
      type: String as PropType<InputOtpInputMode>,
      default: 'numeric',
    },
    accessibleLabel: String,
    disabled: Boolean,
    invalid: Boolean,
    readonly: Boolean,
  },
  emits: ['update:value', 'valueChange', 'complete', 'focus', 'blur'],
  setup(props, { attrs, emit, expose, slots }) {
    const control = ref<HTMLInputElement | null>(null)
    const valueControlled = usePropPresence('value')
    const otp = useInputOtpRoot({
      valueControlled,
      runtime: vueReactiveRuntime,
      defaultValue: props.defaultValue,
      value: toRef(props, 'value'),
      length: toRef(props, 'length'),
      pattern: toRef(props, 'pattern'),
      inputMode: toRef(props, 'inputMode'),
      disabled: toRef(props, 'disabled'),
      invalid: toRef(props, 'invalid'),
      readonly: toRef(props, 'readonly'),
      accessibleLabel: toRef(props, 'accessibleLabel'),
      onValueChange(value) {
        emit('update:value', value)
        emit('valueChange', value)
      },
      onComplete(value) {
        emit('complete', value)
      },
    })

    function focus() {
      control.value?.focus()
    }

    function blur() {
      control.value?.blur()
    }

    function clear() {
      const cleared = otp.events.clear()
      if (cleared) {
        syncInputValue()
      }
      return cleared
    }

    function syncInputValue() {
      if (control.value && control.value.value !== otp.state.value.value) {
        control.value.value = otp.state.value.value
      }
    }

    expose({ blur, clear, focus, setValue: otp.api.setValue })

    function renderCells() {
      return slots.default?.({
        activeIndex: otp.state.activeIndex.value,
        complete: otp.state.complete.value,
        focused: otp.state.focused.value,
        length: otp.state.length.value,
        value: otp.state.value.value,
      })
    }

    return () => {
      const { class: className, style, ...forwardedAttrs } = attrs
      const inputAttrs = {
        ...forwardedAttrs,
        ...otp.attrs.input,
        class: 'varo-input-otp__input',
        ref: control,
        type: 'text',
        value: otp.state.value.value,
        onBlur: (event: FocusEvent) => {
          otp.events.blur()
          emit('blur', event)
          callHandler(attrs.onBlur, event)
        },
        onFocus: (event: FocusEvent) => {
          otp.events.focus()
          emit('focus', event)
          callHandler(attrs.onFocus, event)
        },
        onInput: (event: Event) => {
          const accepted = otp.events.input(readInputValue(event))
          syncInputValue()
          if (accepted) {
            callHandler(attrs.onInput, event)
          }
        },
      }

      return h(
        'div',
        {
          ...otp.attrs.root,
          class: ['varo-input-otp', className],
          style,
        },
        [h('input', inputAttrs), renderCells()],
      )
    }
  },
})

export type InputOtpRootContext = UseInputOtpRootResult
