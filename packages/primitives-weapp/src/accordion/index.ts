import { defineComponent, h, inject, provide, toRef, useId, type PropType } from 'vue'
import {
  createPrimitiveContext,
  useAccordionRoot,
  type AccordionType,
  type AccordionValue,
  type UseAccordionRootResult
} from '@varo/primitives-core'
import { runInteractiveClick, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export { useAccordionRoot } from './hooks'
export type * from './types'
export type { AccordionType, AccordionValue } from '@varo/primitives-core'

interface AccordionItemContext {
  readonly disabled: boolean
  readonly value: string
}

const accordionContext = createPrimitiveContext<UseAccordionRootResult>('AccordionRoot')
const accordionItemContext = createPrimitiveContext<AccordionItemContext>('AccordionItem')
const provideAccordionContext = accordionContext.createProvider(provide)
const provideAccordionItemContext = accordionItemContext.createProvider(provide)
const useAccordionContext = accordionContext.createConsumer((key) =>
  inject<UseAccordionRootResult | undefined>(key, undefined)
)
const useAccordionItemContext = accordionItemContext.createConsumer((key) =>
  inject<AccordionItemContext | undefined>(key, undefined)
)

export const AccordionRoot = defineComponent({
  name: 'AccordionRoot',
  props: {
    as: {
      type: String,
      default: 'view'
    },
    collapsible: Boolean,
    defaultValue: {
      type: [String, Array] as PropType<AccordionValue>,
      default: undefined
    },
    disabled: Boolean,
    id: String,
    type: {
      type: String as PropType<AccordionType>,
      default: 'single'
    },
    value: {
      type: [String, Array] as PropType<AccordionValue>,
      default: undefined
    }
  },
  emits: ['update:value', 'valueChange'],
  setup(props, { attrs, emit, slots }) {
    const generatedId = useId()
    const valueControlled = usePropPresence('value')
    const accordion = useAccordionRoot({
      valueControlled,
      runtime: vueReactiveRuntime,
      collapsible: toRef(props, 'collapsible'),
      defaultValue: props.defaultValue,
      disabled: toRef(props, 'disabled'),
      id: props.id ?? generatedId,
      type: toRef(props, 'type'),
      value: toRef(props, 'value'),
      onValueChange(value) {
        emit('update:value', value)
        emit('valueChange', value)
      }
    })

    provideAccordionContext(accordion)
    return () => h(props.as, { ...attrs, ...accordion.attrs.root }, slots.default?.())
  }
})

export const AccordionItem = defineComponent({
  name: 'AccordionItem',
  props: {
    as: {
      type: String,
      default: 'view'
    },
    disabled: Boolean,
    value: {
      type: String,
      required: true
    }
  },
  setup(props, { attrs, slots }) {
    const accordion = useAccordionContext()
    provideAccordionItemContext({
      get disabled() {
        return props.disabled
      },
      get value() {
        return props.value
      }
    })

    return () =>
      h(props.as, { ...attrs, ...accordion.api.getItemAttrs(props.value, props.disabled) }, slots.default?.())
  }
})

export const AccordionTrigger = defineComponent({
  name: 'AccordionTrigger',
  props: {
    as: {
      type: String,
      default: 'button'
    }
  },
  setup(props, { attrs, slots }) {
    const accordion = useAccordionContext()
    const item = useAccordionItemContext()
    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...accordion.api.getTriggerAttrs(item.value, item.disabled),
          disabled: props.as === 'button' ? item.disabled || accordion.state.disabled.value : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: () => accordion.events.toggle(item.value, item.disabled),
              handler: attrs.onClick,
              interactive: !item.disabled && accordion.state.interactive.value
            })
          }
        },
        slots.default?.()
      )
  }
})

export const AccordionContent = defineComponent({
  name: 'AccordionContent',
  props: {
    as: {
      type: String,
      default: 'view'
    }
  },
  setup(props, { attrs, slots }) {
    const accordion = useAccordionContext()
    const item = useAccordionItemContext()
    return () =>
      accordion.api.isOpen(item.value)
        ? h(props.as, { ...attrs, ...accordion.api.getContentAttrs(item.value) }, slots.default?.())
        : null
  }
})
