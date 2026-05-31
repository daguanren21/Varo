import {
  Fragment,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  toRef,
  type PropType
} from 'vue'
import {
  createDialogRootConsumer,
  createDialogRootProvider,
  provideDialogRootContext,
  useDialogRoot,
  useDialogRootContext
} from '@varo/primitives-core'
import { vueReactiveRuntime } from '../vue-runtime'

export { useDialogRoot } from './hooks'
export type * from './types'

const provideRuntimeDialogRootContext = createDialogRootProvider(provide)
const useRuntimeDialogRootContext = createDialogRootConsumer(inject)

function callHandler(handler: unknown, event: Event) {
  if (typeof handler === 'function') {
    handler(event)
  }
}

export const DialogRoot = defineComponent({
  name: 'DialogRoot',
  props: {
    defaultOpen: Boolean,
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    disabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    }
  },
  emits: ['update:open', 'openChange'],
  setup(props, { emit, slots }) {
    const dialog = useDialogRoot({
      runtime: vueReactiveRuntime,
      defaultOpen: props.defaultOpen,
      open: toRef(props, 'open'),
      disabled: toRef(props, 'disabled'),
      onOpenChange(open) {
        emit('update:open', open)
        emit('openChange', open)
      }
    })

    function handleDocumentKeydown(event: KeyboardEvent) {
      if (!dialog.state.open.value || event.key !== 'Escape') {
        return
      }

      dialog.events.onEscapeKeyDown()
    }

    onMounted(() => {
      document.addEventListener('keydown', handleDocumentKeydown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleDocumentKeydown)
    })

    provideRuntimeDialogRootContext(provideDialogRootContext(dialog))

    return () => h(Fragment, slots.default?.())
  }
})

export const DialogTrigger = defineComponent({
  name: 'DialogTrigger',
  props: {
    as: {
      type: String,
      default: 'button'
    }
  },
  setup(props, { attrs, slots }) {
    const dialog = useDialogRootContext(useRuntimeDialogRootContext())

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...dialog.attrs.trigger,
          'data-state': dialog.state.open.value ? 'open' : 'closed',
          disabled: dialog.state.disabled.value,
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event)
            dialog.events.toggle()
          }
        },
        slots.default?.()
      )
  }
})

export const DialogOverlay = defineComponent({
  name: 'DialogOverlay',
  props: {
    as: {
      type: String,
      default: 'div'
    }
  },
  setup(props, { attrs, slots }) {
    const dialog = useDialogRootContext(useRuntimeDialogRootContext())

    return () => {
      if (!dialog.state.open.value) {
        return null
      }

      return h(
        props.as,
        {
          ...attrs,
          ...dialog.attrs.overlay,
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event)
            dialog.events.onOverlayClick()
          }
        },
        slots.default?.()
      )
    }
  }
})

export const DialogContent = defineComponent({
  name: 'DialogContent',
  props: {
    as: {
      type: String,
      default: 'div'
    }
  },
  setup(props, { attrs, slots }) {
    const dialog = useDialogRootContext(useRuntimeDialogRootContext())

    return () => {
      if (!dialog.state.open.value) {
        return null
      }

      return h(props.as, { ...attrs, ...dialog.attrs.content }, slots.default?.())
    }
  }
})

export const DialogClose = defineComponent({
  name: 'DialogClose',
  props: {
    as: {
      type: String,
      default: 'button'
    }
  },
  setup(props, { attrs, slots }) {
    const dialog = useDialogRootContext(useRuntimeDialogRootContext())

    return () =>
      h(
        props.as,
        {
          ...attrs,
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event)
            dialog.events.close()
          }
        },
        slots.default?.()
      )
  }
})
