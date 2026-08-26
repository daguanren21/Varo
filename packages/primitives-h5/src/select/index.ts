import { Fragment, defineComponent, h, inject, provide, toRef, type PropType } from 'vue'
import {
  createSelectRootConsumer,
  createSelectRootProvider,
  provideSelectRootContext,
  useSelectRoot,
  useSelectRootContext,
  type SelectOption,
  type SelectValue as SelectPrimitiveValue
} from '@varo/primitives-core'
import { vueReactiveRuntime } from '../vue-runtime'
import { usePropPresence } from '../vue-control'

export { useSelectRoot } from './hooks'
export type * from './types'

const provideRuntimeSelectRootContext = createSelectRootProvider(provide)
const useRuntimeSelectRootContext = createSelectRootConsumer(inject)

function callHandler(handler: unknown, event: Event) {
  if (typeof handler === 'function') {
    handler(event)
  }
}

export const SelectRoot = defineComponent({
  name: 'SelectRoot',
  props: {
    defaultOpen: Boolean,
    defaultValue: {
      type: [String, Number, Array] as PropType<SelectPrimitiveValue>,
      default: undefined
    },
    disabled: Boolean,
    multiple: Boolean,
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      default: () => []
    },
    placeholder: {
      type: String,
      default: undefined
    },
    readonly: Boolean,
    value: {
      type: [String, Number, Array] as PropType<SelectPrimitiveValue>,
      default: undefined
    }
  },
  emits: ['update:open', 'openChange', 'update:value', 'valueChange'],
  setup(props, { emit, slots }) {
    const openControlled = usePropPresence('open')
    const valueControlled = usePropPresence('value')
    const select = useSelectRoot({
      openControlled,
      valueControlled,
      runtime: vueReactiveRuntime,
      defaultOpen: props.defaultOpen,
      defaultValue: props.defaultValue,
      disabled: toRef(props, 'disabled'),
      multiple: toRef(props, 'multiple'),
      open: toRef(props, 'open'),
      options: toRef(props, 'options'),
      placeholder: toRef(props, 'placeholder'),
      readonly: toRef(props, 'readonly'),
      value: toRef(props, 'value'),
      onOpenChange(open) {
        emit('update:open', open)
        emit('openChange', open)
      },
      onValueChange(value) {
        emit('update:value', value)
        emit('valueChange', value)
      }
    })

    provideRuntimeSelectRootContext(provideSelectRootContext(select))

    return () => h(Fragment, slots.default?.())
  }
})

export const SelectTrigger = defineComponent({
  name: 'SelectTrigger',
  props: {
    as: {
      type: String,
      default: 'button'
    }
  },
  setup(props, { attrs, slots }) {
    const select = useSelectRootContext(useRuntimeSelectRootContext())

    return () => {
      const { class: attrClass, onClick: userClick, ...restAttrs } = attrs

      return h(
        props.as,
        {
          ...restAttrs,
          ...select.attrs.trigger,
          class: [attrClass],
          disabled: props.as === 'button' ? !select.state.interactive.value : undefined,
          type: props.as === 'button' ? attrs.type ?? 'button' : undefined,
          onClick: (event: MouseEvent) => {
            callHandler(userClick, event)
            select.events.toggle()
          }
        },
        slots.default?.()
      )
    }
  }
})

export const SelectValue = defineComponent({
  name: 'SelectValue',
  props: {
    as: {
      type: String,
      default: 'span'
    },
    placeholder: {
      type: String,
      default: undefined
    }
  },
  setup(props, { attrs, slots }) {
    const select = useSelectRootContext(useRuntimeSelectRootContext())

    function hasValue(value: SelectPrimitiveValue) {
      return Array.isArray(value) ? value.length > 0 : value !== undefined
    }

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...select.attrs.value
        },
        slots.default?.({ value: select.state.value.value, text: select.state.displayValue.value }) ??
          (hasValue(select.state.value.value) ? select.state.displayValue.value : props.placeholder ?? select.state.displayValue.value)
      )
  }
})

export const SelectContent = defineComponent({
  name: 'SelectContent',
  props: {
    as: {
      type: String,
      default: 'div'
    }
  },
  setup(props, { attrs, slots }) {
    const select = useSelectRootContext(useRuntimeSelectRootContext())

    return () => {
      if (!select.state.open.value) {
        return null
      }

      return h(props.as, { ...attrs, ...select.attrs.content }, slots.default?.())
    }
  }
})

export const SelectGroup = defineComponent({
  name: 'SelectGroup',
  props: {
    as: {
      type: String,
      default: 'div'
    }
  },
  setup(props, { attrs, slots }) {
    const select = useSelectRootContext(useRuntimeSelectRootContext())

    return () => h(props.as, { ...attrs, ...select.api.getGroupAttrs() }, slots.default?.())
  }
})

export const SelectLabel = defineComponent({
  name: 'SelectLabel',
  props: {
    as: {
      type: String,
      default: 'div'
    }
  },
  setup(props, { attrs, slots }) {
    const select = useSelectRootContext(useRuntimeSelectRootContext())

    return () => h(props.as, { ...attrs, ...select.attrs.label }, slots.default?.())
  }
})

export const SelectItem = defineComponent({
  name: 'SelectItem',
  props: {
    as: {
      type: String,
      default: 'button'
    },
    option: {
      type: Object as PropType<SelectOption>,
      required: true
    }
  },
  setup(props, { attrs, slots }) {
    const select = useSelectRootContext(useRuntimeSelectRootContext())

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...select.api.getItemAttrs(props.option),
          disabled: props.as === 'button' ? props.option.disabled : undefined,
          type: props.as === 'button' ? attrs.type ?? 'button' : undefined,
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event)
            select.events.select(props.option)
          }
        },
        slots.default?.({ option: props.option }) ?? props.option.label
      )
  }
})
