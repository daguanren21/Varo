import type { DrawerPlacement, UseDrawerRootResult } from '@varo-ui/headless'
import type { PropType, ShallowRef } from 'vue'
import { useDrawerRoot } from '@varo-ui/headless'
import { defineComponent, h, inject, nextTick, onBeforeUnmount, onMounted, provide, shallowRef, toRef, useId, watch } from 'vue'
import { useBodyScrollLock } from '../use-body-scroll-lock'
import { callHandler, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export type * from './types'

interface DrawerDomContext {
  content: ShallowRef<HTMLElement | null>
  trigger: ShallowRef<HTMLElement | null>
}

const drawerContextKey = Symbol('varo-drawer-root')
const drawerDomContextKey = Symbol('varo-drawer-dom')

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function useDrawerContext() {
  const context = inject<UseDrawerRootResult | undefined>(drawerContextKey, undefined)
  if (!context) {
    throw new Error('Drawer parts must be used within DrawerRoot.')
  }
  return context
}

function useDrawerDomContext() {
  const context = inject<DrawerDomContext | undefined>(drawerDomContextKey, undefined)
  if (!context) {
    throw new Error('Drawer parts must be used within DrawerRoot.')
  }
  return context
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(element => element.tabIndex >= 0)
}

export const DrawerRoot = defineComponent({
  name: 'DrawerRoot',
  props: {
    defaultOpen: Boolean,
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    placement: {
      type: String as PropType<DrawerPlacement>,
      default: 'right',
    },
    disabled: Boolean,
    closeOnOverlayClick: {
      type: Boolean,
      default: true,
    },
    lockScroll: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:open', 'openChange'],
  setup(props, { attrs, emit, slots }) {
    const openControlled = usePropPresence('open')
    const drawerId = `varo-drawer-${useId().replaceAll(':', '')}`
    const drawer = useDrawerRoot({
      id: drawerId,
      openControlled,
      runtime: vueReactiveRuntime,
      defaultOpen: props.defaultOpen,
      open: toRef(props, 'open'),
      placement: toRef(props, 'placement'),
      disabled: toRef(props, 'disabled'),
      closeOnOverlayClick: toRef(props, 'closeOnOverlayClick'),
      onOpenChange(open, details) {
        emit('openChange', open, details)
        if (!details.canceled) {
          emit('update:open', open)
        }
      },
    })
    const dom = {
      content: shallowRef<HTMLElement | null>(null),
      trigger: shallowRef<HTMLElement | null>(null),
    }
    const scrollLock = useBodyScrollLock(drawer.state.open, toRef(props, 'lockScroll'))
    let mounted = false
    let restoreFocusTarget: HTMLElement | null = null

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
      if (!drawer.state.open.value || !content || content.contains(event.target as Node | null)) {
        return
      }
      focusInside()
    }

    function handleDocumentKeydown(event: KeyboardEvent) {
      if (!drawer.state.open.value) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        drawer.events.onEscapeKeyDown()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const content = dom.content.value
      if (!content) {
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

    function activate(shouldRestoreFocus: boolean) {
      if (!mounted) {
        return
      }
      if (shouldRestoreFocus) {
        restoreFocusTarget = dom.trigger.value
          ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
      }
      void nextTick(() => {
        if (mounted && drawer.state.open.value) {
          focusInside()
        }
      })
    }

    function deactivate(shouldRestoreFocus: boolean) {
      const target = restoreFocusTarget
      restoreFocusTarget = null
      if (shouldRestoreFocus && target?.isConnected) {
        target.focus({ preventScroll: true })
      }
    }

    watch(drawer.state.open, (open, wasOpen) => {
      scrollLock.sync()
      if (!mounted) {
        return
      }
      if (open) {
        activate(!wasOpen)
      }
      else {
        deactivate(Boolean(wasOpen))
      }
    })

    onMounted(() => {
      mounted = true
      document.addEventListener('focusin', handleDocumentFocusin)
      document.addEventListener('keydown', handleDocumentKeydown)
      scrollLock.sync()
      if (drawer.state.open.value) {
        activate(true)
      }
    })
    onBeforeUnmount(() => {
      deactivate(false)
      mounted = false
      scrollLock.dispose()
      document.removeEventListener('focusin', handleDocumentFocusin)
      document.removeEventListener('keydown', handleDocumentKeydown)
    })

    provide(drawerContextKey, drawer)
    provide(drawerDomContextKey, dom)
    return () => h('div', { ...attrs, ...drawer.attrs.root }, slots.default?.())
  },
})

export const DrawerTrigger = defineComponent({
  name: 'DrawerTrigger',
  inheritAttrs: false,
  props: {
    as: {
      type: String,
      default: 'button',
    },
  },
  setup(props, { attrs, slots }) {
    const drawer = useDrawerContext()
    const dom = useDrawerDomContext()

    return () => h(
      props.as,
      {
        ...attrs,
        ...drawer.attrs.trigger,
        disabled: props.as === 'button' ? drawer.state.disabled.value : undefined,
        ref: (element: unknown) => {
          dom.trigger.value = element instanceof HTMLElement ? element : null
        },
        type: props.as === 'button' ? attrs.type ?? 'button' : undefined,
        onClick: (event: MouseEvent) => {
          callHandler(attrs.onClick, event)
          drawer.events.toggle()
        },
      },
      slots.default?.(),
    )
  },
})

export const DrawerOverlay = defineComponent({
  name: 'DrawerOverlay',
  inheritAttrs: false,
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const drawer = useDrawerContext()

    return () => drawer.state.open.value
      ? h(
          props.as,
          {
            ...attrs,
            ...drawer.attrs.overlay,
            onClick: (event: MouseEvent) => {
              callHandler(attrs.onClick, event)
              drawer.events.onOverlayClick()
            },
          },
          slots.default?.(),
        )
      : null
  },
})

export const DrawerContent = defineComponent({
  name: 'DrawerContent',
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const drawer = useDrawerContext()
    const dom = useDrawerDomContext()

    return () => {
      if (!drawer.state.open.value) {
        dom.content.value = null
        return null
      }
      return h(
        props.as,
        {
          ...attrs,
          ...drawer.attrs.content,
          ref: (element: unknown) => {
            dom.content.value = element instanceof HTMLElement ? element : null
          },
        },
        slots.default?.(),
      )
    }
  },
})

export const DrawerClose = defineComponent({
  name: 'DrawerClose',
  inheritAttrs: false,
  props: {
    as: {
      type: String,
      default: 'button',
    },
  },
  setup(props, { attrs, slots }) {
    const drawer = useDrawerContext()
    return () => h(
      props.as,
      {
        ...attrs,
        onClick: (event: MouseEvent) => {
          callHandler(attrs.onClick, event)
          drawer.events.close()
        },
      },
      slots.default?.(),
    )
  },
})

export type DrawerRootContext = UseDrawerRootResult
