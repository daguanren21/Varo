import type { Ref } from 'vue'
import { computed, getCurrentInstance } from 'vue'

const hasOwn = Object.prototype.hasOwnProperty

export function usePropPresence(name: string): Ref<boolean> {
  const instance = getCurrentInstance()

  return computed(() => {
    const props = instance?.vnode.props
    return props ? hasOwn.call(props, name) : false
  })
}

export function callHandler(handler: unknown, event: Event) {
  if (Array.isArray(handler)) {
    handler.forEach(item => callHandler(item, event))
    return
  }

  if (typeof handler === 'function') {
    handler(event)
  }
}

export function runInteractiveClick(
  event: MouseEvent,
  options: {
    action: () => unknown
    handler: unknown
    interactive: boolean
  },
) {
  if (!options.interactive) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation?.()
    return false
  }

  callHandler(options.handler, event)

  if (event.defaultPrevented) {
    return false
  }

  options.action()
  return true
}

export function buttonKeyboardAttrs(as: string, attrs: Record<string, unknown>, interactive: boolean) {
  const native = as === 'button' || (as === 'a' && attrs.href != null)
  if (native) { return {} }

  return {
    role: attrs.role ?? 'button',
    tabindex: interactive ? attrs.tabindex ?? 0 : -1,
    onKeydown: (event: KeyboardEvent) => {
      callHandler(attrs.onKeydown, event)
      if (event.defaultPrevented || event.target !== event.currentTarget || !interactive) { return }
      if (event.key !== 'Enter' && event.key !== ' ') { return }
      event.preventDefault()
      if (!event.repeat) { (event.currentTarget as HTMLElement).click() }
    },
  }
}
