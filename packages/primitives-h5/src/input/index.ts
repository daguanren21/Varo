import { computed, defineComponent, h, toRef, type PropType } from 'vue'
import { useFieldRoot } from '@varo/primitives-core'

export { useInputRoot } from './hooks'
export type * from './types'

function callHandler(handler: unknown, event: Event) {
  if (typeof handler === 'function') {
    handler(event)
  }
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
    }
  },
  emits: ['update:value', 'valueChange'],
  setup(props, { attrs, emit }) {
    const field = useFieldRoot({
      defaultValue: props.defaultValue,
      value: toRef(props, 'value'),
      disabled: toRef(props, 'disabled'),
      invalid: toRef(props, 'invalid'),
      onValueChange(value) {
        emit('update:value', value)
        emit('valueChange', value)
      }
    })

    const inputAttrs = computed(() => ({
      ...attrs,
      ...field.attrs.input,
      value: field.state.value.value,
      placeholder: props.placeholder,
      type: props.type,
      onInput: (event: Event) => {
        const input = event.target as HTMLInputElement | null
        const nextValue = input?.value ?? ''
        const allowed = field.events.input(nextValue)

        if (props.value !== undefined && input && input.value !== field.state.value.value) {
          input.value = field.state.value.value
        }

        if (allowed) {
          callHandler(attrs.onInput, event)
        }
      }
    }))

    return () => h('input', inputAttrs.value)
  }
})