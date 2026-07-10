import { Fragment, defineComponent, h, inject, provide, toRef, type PropType } from 'vue'
import {
  createPrimitiveContext,
  usePopoverRoot,
  type UsePopoverRootResult
} from '@varo/primitives-core'
import { runInteractiveClick, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export { usePopoverRoot } from './hooks'
export type * from './types'

const popoverContext = createPrimitiveContext<UsePopoverRootResult>('PopoverRoot')
const providePopoverContext = popoverContext.createProvider(provide)
const usePopoverContext = popoverContext.createConsumer((key) =>
  inject<UsePopoverRootResult | undefined>(key, undefined)
)

export const PopoverRoot = defineComponent({
  name: 'PopoverRoot',
  props: {
    defaultOpen: Boolean,
    disabled: Boolean,
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    }
  },
  emits: ['update:open', 'openChange'],
  setup(props, { emit, slots }) {
    const openControlled = usePropPresence('open')
    const popover = usePopoverRoot({
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

    providePopoverContext(popover)
    return () => h(Fragment, slots.default?.())
  }
})

export const PopoverTrigger = defineComponent({
  name: 'PopoverTrigger',
  props: {
    as: {
      type: String,
      default: 'button'
    }
  },
  setup(props, { attrs, slots }) {
    const popover = usePopoverContext()
    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...popover.attrs.trigger,
          disabled: props.as === 'button' ? !popover.state.interactive.value : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: popover.events.toggle,
              handler: attrs.onClick,
              interactive: popover.state.interactive.value
            })
          }
        },
        slots.default?.()
      )
  }
})

export const PopoverContent = defineComponent({
  name: 'PopoverContent',
  props: {
    as: {
      type: String,
      default: 'view'
    }
  },
  setup(props, { attrs, slots }) {
    const popover = usePopoverContext()
    return () =>
      popover.state.open.value
        ? h(props.as, { ...attrs, ...popover.attrs.content }, slots.default?.())
        : null
  }
})

export const PopoverClose = defineComponent({
  name: 'PopoverClose',
  props: {
    as: {
      type: String,
      default: 'button'
    }
  },
  setup(props, { attrs, slots }) {
    const popover = usePopoverContext()
    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...popover.attrs.close,
          disabled: props.as === 'button' ? !popover.state.interactive.value : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: popover.events.close,
              handler: attrs.onClick,
              interactive: popover.state.interactive.value
            })
          }
        },
        slots.default?.()
      )
  }
})
