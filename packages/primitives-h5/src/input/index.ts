import { computed, defineComponent, h, nextTick, onMounted, ref, toRef, watch, type PropType } from 'vue'
import { useFieldRoot } from '@varo/primitives-core'
import { vueReactiveRuntime } from '../vue-runtime'

export { useInputRoot } from './hooks'
export type * from './types'

function callHandler(handler: unknown, event: Event) {
  if (typeof handler === 'function') {
    handler(event)
  }
}

export type InputFormatTrigger = 'onInput' | 'onBlur'

export interface InputAutosizeConfig {
  minRows?: number
  maxRows?: number
}

function resolveMaxLength(value: number | string | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  const normalized = Number(value)
  return Number.isFinite(normalized) && normalized >= 0 ? Math.trunc(normalized) : undefined
}

export const InputRoot = defineComponent({
  name: 'InputRoot',
  props: {
    value: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    defaultValue: {
      type: String,
      default: ''
    },
    disabled: Boolean,
    invalid: Boolean,
    placeholder: String,
    type: {
      type: String,
      default: 'text'
    },
    readonly: Boolean,
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
      type: [Boolean, Object] as PropType<boolean | InputAutosizeConfig>,
      default: false
    }
  },
  emits: ['update:value', 'valueChange', 'focus', 'blur'],
  setup(props, { attrs, emit, expose }) {
    const control = ref<HTMLInputElement | HTMLTextAreaElement>()
    const field = useFieldRoot({
      runtime: vueReactiveRuntime,
      defaultValue: props.defaultValue,
      value: toRef(props, 'value'),
      disabled: toRef(props, 'disabled'),
      invalid: toRef(props, 'invalid'),
      onValueChange(value) {
        emit('update:value', value)
        emit('valueChange', value)
      }
    })
    const isTextarea = computed(() => props.type === 'textarea')
    const maxLength = computed(() => resolveMaxLength(props.maxLength))
    const autosizeEnabled = computed(() => Boolean(props.autosize))

    function formatValue(value: string, trigger: InputFormatTrigger) {
      let nextValue = value

      if (props.formatter && props.formatTrigger === trigger) {
        nextValue = props.formatter(nextValue)
      }

      const limit = maxLength.value
      if (limit != null && nextValue.length > limit) {
        nextValue = nextValue.slice(0, limit)
      }

      return nextValue
    }

    function syncDomValue(value: string) {
      if (control.value && control.value.value !== value) {
        control.value.value = value
      }
    }

    function resizeTextarea() {
      if (!isTextarea.value || !autosizeEnabled.value) {
        return
      }

      void nextTick(() => {
        const element = control.value
        if (!element || !(element instanceof HTMLTextAreaElement)) {
          return
        }

        const autosize = typeof props.autosize === 'object' ? props.autosize : {}
        const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight || '20') || 20
        const minHeight = autosize.minRows ? autosize.minRows * lineHeight : 0
        const maxHeight = autosize.maxRows ? autosize.maxRows * lineHeight : Number.POSITIVE_INFINITY

        element.style.height = 'auto'
        const height = Math.min(Math.max(element.scrollHeight, minHeight), maxHeight)
        element.style.height = `${height}px`
        element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden'
      })
    }

    function updateValue(value: string, trigger: InputFormatTrigger) {
      if (props.readonly) {
        syncDomValue(field.state.value.value)
        return false
      }

      const nextValue = formatValue(value, trigger)
      const allowed = field.events.input(nextValue)
      syncDomValue(field.state.value.value)
      resizeTextarea()

      return allowed
    }

    function focus() {
      control.value?.focus()
    }

    function blur() {
      control.value?.blur()
    }

    function clear() {
      if (props.readonly) {
        return false
      }

      const allowed = field.api.setValue('')
      syncDomValue(field.state.value.value)
      resizeTextarea()
      return allowed
    }

    expose({
      blur,
      clear,
      focus,
      setValue: field.api.setValue
    })

    onMounted(resizeTextarea)
    watch(() => field.state.value.value, resizeTextarea)

    const inputAttrs = computed(() => ({
      ...attrs,
      ...field.attrs.input,
      ref: control,
      value: field.state.value.value,
      placeholder: props.placeholder,
      type: isTextarea.value ? undefined : props.type,
      readonly: props.readonly || undefined,
      rows: isTextarea.value ? props.rows : undefined,
      maxlength: maxLength.value,
      disabled: props.disabled || undefined,
      'aria-invalid': props.invalid || undefined,
      'data-autosize': String(autosizeEnabled.value),
      'data-disabled': String(props.disabled),
      'data-invalid': String(props.invalid),
      'data-readonly': String(props.readonly),
      onInput: (event: Event) => {
        const input = event.target as HTMLInputElement | null
        const nextValue = input?.value ?? ''
        const allowed = updateValue(nextValue, 'onInput')

        if (allowed) {
          callHandler(attrs.onInput, event)
        }
      },
      onFocus: (event: FocusEvent) => {
        emit('focus', event)
        callHandler(attrs.onFocus, event)
      },
      onBlur: (event: FocusEvent) => {
        if (props.formatTrigger === 'onBlur') {
          const input = event.target as HTMLInputElement | HTMLTextAreaElement | null
          updateValue(input?.value ?? field.state.value.value, 'onBlur')
        }

        emit('blur', event)
        callHandler(attrs.onBlur, event)
      }
    }))

    return () => h(isTextarea.value ? 'textarea' : 'input', inputAttrs.value)
  }
})
