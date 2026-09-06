import type { InjectionKey, PropType, ShallowRef } from 'vue'
import {
  createDialogRootConsumer,
  createDialogRootProvider,
  provideDialogRootContext,
  useDialogRoot,
  useDialogRootContext,
} from '@varo-ui/headless'
import {
  defineComponent,
  Fragment,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  toRef,
  useId,
  watch,
} from 'vue'
import { usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export { useDialogRoot } from './hooks'
export type * from './types'

interface DialogDomContext {
  content: ShallowRef<HTMLElement | null>
  overlay: ShallowRef<HTMLElement | null>
  trigger: ShallowRef<HTMLElement | null>
}

interface InertRecord {
  count: number
  initiallyInert: boolean
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')
const dialogDomContextKey: InjectionKey<DialogDomContext> = Symbol('varo-dialog-dom')
const inertRecords = new WeakMap<HTMLElement, InertRecord>()
const openDialogLayers: symbol[] = []
const provideRuntimeDialogRootContext = createDialogRootProvider(provide)
const useRuntimeDialogRootContext = createDialogRootConsumer(inject)

function callHandler(handler: unknown, event: Event) {
  if (typeof handler === 'function') {
    handler(event)
  }
}

function useDialogDomContext() {
  const context = inject(dialogDomContextKey)
  if (!context) {
    throw new Error('Dialog parts must be used within DialogRoot.')
  }
  return context
}

function acquireInert(element: HTMLElement) {
  const record = inertRecords.get(element)
  if (record) {
    record.count += 1
    return
  }

  inertRecords.set(element, {
    count: 1,
    initiallyInert: element.inert,
  })
  element.inert = true
}

function releaseInert(element: HTMLElement) {
  const record = inertRecords.get(element)
  if (!record) {
    return
  }

  record.count -= 1
  if (record.count > 0) {
    return
  }

  element.inert = record.initiallyInert
  inertRecords.delete(element)
}

function containBackgroundInteraction(content: HTMLElement | null, overlay: HTMLElement | null) {
  const allowed = [content, overlay].filter((element): element is HTMLElement => element !== null)
  const acquired: HTMLElement[] = []

  function visit(parent: HTMLElement) {
    for (const child of parent.children) {
      if (!(child instanceof HTMLElement)) {
        continue
      }

      if (allowed.includes(child)) {
        continue
      }

      if (allowed.some(element => child.contains(element))) {
        visit(child)
        continue
      }

      acquireInert(child)
      acquired.push(child)
    }
  }

  visit(document.body)

  return () => {
    for (const element of acquired) {
      releaseInert(element)
    }
  }
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(element => element.tabIndex >= 0 && element.getAttribute('aria-hidden') !== 'true')
}

export const DialogRoot = defineComponent({
  name: 'DialogRoot',
  props: {
    defaultOpen: Boolean,
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  emits: ['update:open', 'openChange'],
  setup(props, { emit, slots }) {
    const openControlled = usePropPresence('open')
    const dialogId = `varo-dialog-${useId().replaceAll(':', '')}`
    const dialog = useDialogRoot({
      id: dialogId,
      openControlled,
      runtime: vueReactiveRuntime,
      defaultOpen: props.defaultOpen,
      open: toRef(props, 'open'),
      disabled: toRef(props, 'disabled'),
      onOpenChange(open, details) {
        emit('openChange', open, details)
        if (details.canceled) {
          return
        }
        emit('update:open', open)
      },
    })
    const layer = Symbol('varo-dialog-layer')
    let mounted = false
    const dom = {
      content: shallowRef<HTMLElement | null>(null),
      overlay: shallowRef<HTMLElement | null>(null),
      trigger: shallowRef<HTMLElement | null>(null),
    }
    let releaseBackground: (() => void) | undefined
    let restoreTrigger = false

    function focusInside() {
      const content = dom.content.value
      if (!content) {
        return
      }

      const target = getFocusableElements(content)[0] ?? content
      target.focus({ preventScroll: true })
    }

    function handleDocumentFocusin(event: FocusEvent) {
      const content = dom.content.value
      if (
        !dialog.state.open.value
        || openDialogLayers[openDialogLayers.length - 1] !== layer
        || !content
        || content.contains(event.target as Node | null)
      ) {
        return
      }

      focusInside()
    }

    function handleDocumentKeydown(event: KeyboardEvent) {
      if (
        !dialog.state.open.value
        || openDialogLayers[openDialogLayers.length - 1] !== layer
      ) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        dialog.events.onEscapeKeyDown()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const content = dom.content.value
      if (!content) {
        event.preventDefault()
        return
      }

      const focusable = getFocusableElements(content)
      if (focusable.length === 0) {
        event.preventDefault()
        content.focus({ preventScroll: true })
        return
      }

      const activeElement = document.activeElement
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (event.shiftKey && (activeElement === first || !content.contains(activeElement))) {
        event.preventDefault()
        last.focus({ preventScroll: true })
      }
      else if (!event.shiftKey && (activeElement === last || !content.contains(activeElement))) {
        event.preventDefault()
        first.focus({ preventScroll: true })
      }
    }

    function activateDialog(shouldRestoreFocus: boolean) {
      if (!mounted) {
        return
      }
      if (shouldRestoreFocus) {
        restoreTrigger = dom.trigger.value !== null
      }
      if (!openDialogLayers.includes(layer)) {
        openDialogLayers.push(layer)
      }
      void nextTick(() => {
        if (
          !mounted
          || !dialog.state.open.value
          || openDialogLayers[openDialogLayers.length - 1] !== layer
        ) {
          return
        }
        releaseBackground?.()
        releaseBackground = containBackgroundInteraction(dom.content.value, dom.overlay.value)
        focusInside()
      })
    }

    function deactivateDialog(shouldRestoreFocus: boolean) {
      const wasTopLayer = openDialogLayers[openDialogLayers.length - 1] === layer
      const layerIndex = openDialogLayers.lastIndexOf(layer)
      if (layerIndex >= 0) {
        openDialogLayers.splice(layerIndex, 1)
      }
      releaseBackground?.()
      releaseBackground = undefined
      if (shouldRestoreFocus && wasTopLayer && restoreTrigger) {
        restoreTrigger = false
        dom.trigger.value?.focus({ preventScroll: true })
      }
    }

    watch(dialog.state.open, (open, wasOpen) => {
      if (!mounted) {
        return
      }
      if (open) {
        activateDialog(!wasOpen)
        return
      }
      deactivateDialog(Boolean(wasOpen))
    })

    onMounted(() => {
      mounted = true
      document.addEventListener('focusin', handleDocumentFocusin)
      document.addEventListener('keydown', handleDocumentKeydown)
      if (dialog.state.open.value) {
        activateDialog(true)
      }
    })

    onBeforeUnmount(() => {
      deactivateDialog(false)
      mounted = false
      document.removeEventListener('focusin', handleDocumentFocusin)
      document.removeEventListener('keydown', handleDocumentKeydown)
    })

    provideRuntimeDialogRootContext(provideDialogRootContext(dialog))
    provide(dialogDomContextKey, dom)

    return () => h(Fragment, slots.default?.())
  },
})

export const DialogTrigger = defineComponent({
  name: 'DialogTrigger',
  props: {
    as: {
      type: String,
      default: 'button',
    },
  },
  setup(props, { attrs, slots }) {
    const dialog = useDialogRootContext(useRuntimeDialogRootContext())
    const dom = useDialogDomContext()

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...dialog.attrs.trigger,
          disabled: dialog.state.disabled.value,
          ref: (element: unknown) => {
            dom.trigger.value = element instanceof HTMLElement ? element : null
          },
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event)
            dialog.events.toggle()
          },
        },
        slots.default?.(),
      )
  },
})

export const DialogOverlay = defineComponent({
  name: 'DialogOverlay',
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const dialog = useDialogRootContext(useRuntimeDialogRootContext())
    const dom = useDialogDomContext()

    return () => {
      if (!dialog.state.open.value) {
        return null
      }

      return h(
        props.as,
        {
          ...attrs,
          ...dialog.attrs.overlay,
          ref: (element: unknown) => {
            dom.overlay.value = element instanceof HTMLElement ? element : null
          },
          onMousedown: (event: MouseEvent) => {
            callHandler(attrs.onMousedown, event)
            event.preventDefault()
          },
          onClick: (event: MouseEvent) => {
            callHandler(attrs.onClick, event)
            dialog.events.onOverlayClick()
          },
        },
        slots.default?.(),
      )
    }
  },
})

export const DialogContent = defineComponent({
  name: 'DialogContent',
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const dialog = useDialogRootContext(useRuntimeDialogRootContext())
    const dom = useDialogDomContext()

    return () => {
      if (!dialog.state.open.value) {
        dom.content.value = null
        return null
      }

      return h(
        props.as,
        {
          ...attrs,
          ...dialog.attrs.content,
          ref: (element: unknown) => {
            dom.content.value = element instanceof HTMLElement ? element : null
          },
        },
        slots.default?.(),
      )
    }
  },
})

export const DialogClose = defineComponent({
  name: 'DialogClose',
  props: {
    as: {
      type: String,
      default: 'button',
    },
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
          },
        },
        slots.default?.(),
      )
  },
})
