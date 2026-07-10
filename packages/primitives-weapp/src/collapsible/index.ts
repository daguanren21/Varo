import { defineComponent, h, inject, provide, toRef, type PropType } from 'vue'
import {
  createPrimitiveContext,
  useCollapsibleRoot,
  type UseCollapsibleRootResult
} from '@varo/primitives-core'
import { runInteractiveClick, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export { useCollapsibleRoot } from './hooks'
export type * from './types'

const collapsibleContext = createPrimitiveContext<UseCollapsibleRootResult>('CollapsibleRoot')
const provideCollapsibleContext = collapsibleContext.createProvider(provide)
const useCollapsibleContext = collapsibleContext.createConsumer((key) =>
  inject<UseCollapsibleRootResult | undefined>(key, undefined)
)

export const CollapsibleRoot = defineComponent({
  name: 'CollapsibleRoot',
  props: {
    as: {
      type: String,
      default: 'view'
    },
    defaultOpen: Boolean,
    disabled: Boolean,
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    }
  },
  emits: ['update:open', 'openChange'],
  setup(props, { attrs, emit, slots }) {
    const openControlled = usePropPresence('open')
    const collapsible = useCollapsibleRoot({
      openControlled,
      runtime: vueReactiveRuntime,
      defaultOpen: props.defaultOpen,
      disabled: toRef(props, 'disabled'),
      open: toRef(props, 'open'),
      onOpenChange(open) {
        emit('update:open', open)
        emit('openChange', open)
      }
    })

    provideCollapsibleContext(collapsible)
    return () => h(props.as, { ...attrs, ...collapsible.attrs.root }, slots.default?.())
  }
})

export const CollapsibleTrigger = defineComponent({
  name: 'CollapsibleTrigger',
  props: {
    as: {
      type: String,
      default: 'button'
    }
  },
  setup(props, { attrs, slots }) {
    const collapsible = useCollapsibleContext()
    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...collapsible.attrs.trigger,
          disabled: props.as === 'button' ? !collapsible.state.interactive.value : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: collapsible.events.toggle,
              handler: attrs.onClick,
              interactive: collapsible.state.interactive.value
            })
          }
        },
        slots.default?.()
      )
  }
})

export const CollapsibleContent = defineComponent({
  name: 'CollapsibleContent',
  props: {
    as: {
      type: String,
      default: 'view'
    }
  },
  setup(props, { attrs, slots }) {
    const collapsible = useCollapsibleContext()
    return () =>
      collapsible.state.open.value
        ? h(props.as, { ...attrs, ...collapsible.attrs.content }, slots.default?.())
        : null
  }
})
