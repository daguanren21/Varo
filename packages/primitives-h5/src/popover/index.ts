import type { UsePopoverRootResult } from '@varo-ui/headless'
import type { PropType, ShallowRef } from 'vue'
import {
  createPrimitiveContext,
  usePopoverRoot,

} from '@varo-ui/headless'
import {
  defineComponent,
  Fragment,
  h,
  inject,
  onBeforeUnmount,
  onMounted,

  provide,
  shallowRef,

  toRef,
} from 'vue'
import { runInteractiveClick, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export { usePopoverRoot } from './hooks'
export type * from './types'

interface PopoverRuntimeContext {
  contentElement: ShallowRef<HTMLElement | undefined>
  popover: UsePopoverRootResult
  triggerElement: ShallowRef<HTMLElement | undefined>
}

const popoverContext = createPrimitiveContext<PopoverRuntimeContext>('PopoverRoot')
const providePopoverContext = popoverContext.createProvider(provide)
const usePopoverContext = popoverContext.createConsumer(key =>
  inject<PopoverRuntimeContext | undefined>(key, undefined),
)

export const PopoverRoot = defineComponent({
  name: 'PopoverRoot',
  props: {
    defaultOpen: Boolean,
    disabled: Boolean,
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  emits: ['update:open', 'openChange'],
  setup(props, { emit, slots }) {
    const openControlled = usePropPresence('open')
    const contentElement = shallowRef<HTMLElement>()
    const triggerElement = shallowRef<HTMLElement>()
    const popover = usePopoverRoot({
      openControlled,
      runtime: vueReactiveRuntime,
      defaultOpen: props.defaultOpen,
      disabled: toRef(props, 'disabled'),
      open: toRef(props, 'open'),
      onOpenChange(open) {
        emit('update:open', open)
        emit('openChange', open)
      },
    })

    function handleDocumentKeydown(event: KeyboardEvent) {
      if (popover.state.open.value && event.key === 'Escape') {
        popover.events.onEscapeKeyDown()
      }
    }

    function handleDocumentPointerdown(event: PointerEvent) {
      if (!popover.state.open.value || !(event.target instanceof Node)) {
        return
      }

      if (
        triggerElement.value?.contains(event.target)
        || contentElement.value?.contains(event.target)
      ) {
        return
      }

      popover.events.onInteractOutside()
    }

    onMounted(() => {
      document.addEventListener('keydown', handleDocumentKeydown)
      document.addEventListener('pointerdown', handleDocumentPointerdown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleDocumentKeydown)
      document.removeEventListener('pointerdown', handleDocumentPointerdown)
    })

    providePopoverContext({ contentElement, popover, triggerElement })

    return () => h(Fragment, slots.default?.())
  },
})

export const PopoverTrigger = defineComponent({
  name: 'PopoverTrigger',
  props: {
    as: {
      type: String,
      default: 'button',
    },
  },
  setup(props, { attrs, slots }) {
    const context = usePopoverContext()

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...context.popover.attrs.trigger,
          ref: context.triggerElement,
          disabled: props.as === 'button' ? !context.popover.state.interactive.value : undefined,
          type: props.as === 'button' ? attrs.type ?? 'button' : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: context.popover.events.toggle,
              handler: attrs.onClick,
              interactive: context.popover.state.interactive.value,
            })
          },
        },
        slots.default?.(),
      )
  },
})

export const PopoverContent = defineComponent({
  name: 'PopoverContent',
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const context = usePopoverContext()

    return () =>
      context.popover.state.open.value
        ? h(
            props.as,
            {
              ...attrs,
              ...context.popover.attrs.content,
              ref: context.contentElement,
            },
            slots.default?.(),
          )
        : null
  },
})

export const PopoverClose = defineComponent({
  name: 'PopoverClose',
  props: {
    as: {
      type: String,
      default: 'button',
    },
  },
  setup(props, { attrs, slots }) {
    const context = usePopoverContext()

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...context.popover.attrs.close,
          disabled: props.as === 'button' ? !context.popover.state.interactive.value : undefined,
          type: props.as === 'button' ? attrs.type ?? 'button' : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: context.popover.events.close,
              handler: attrs.onClick,
              interactive: context.popover.state.interactive.value,
            })
          },
        },
        slots.default?.(),
      )
  },
})
